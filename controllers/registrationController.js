const { validateExcel } = require('../utils/excelValidator');
const fs = require('fs');
const path = require('path');

exports.uploadRegistrationExcel = async (req, res) => {
  try {
    // Debug logging - very important right now
    console.log('─'.repeat(60));
    console.log('Current working directory:', process.cwd());
    console.log('Received file →', req.file ? 'YES' : 'NO - file missing!');
    if (req.file) {
      console.log('Original name:', req.file.originalname);
      console.log('Saved as     :', req.file.filename);
      console.log('Full path    :', req.file.path);
      console.log('Size         :', req.file.size, 'bytes');
    } else {
      console.log('Body received:', req.body);
    }
    console.log('─'.repeat(60));

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { registrationFor, className, section } = req.body;

    if (!registrationFor || !['all', 'classwise'].includes(registrationFor)) {
      return res.status(400).json({ success: false, message: "Invalid registration type" });
    }

    if (registrationFor === 'classwise' && (!className || !section)) {
      return res.status(400).json({ 
        success: false, 
        message: "Class and Section are required for Class Wise registration" 
      });
    }

    const filePath = req.file.path;

    const result = validateExcel(filePath, registrationFor, 
      registrationFor === 'classwise' ? { class: className, section } : null
    );

    // TEMPORARILY comment deletion during debug
    // fs.unlink(filePath, (err) => {
    //   if (err) console.error("Error deleting temp file:", err);
    // });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.errors
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully processed ${result.validCount} student registrations`,
      count: result.validCount,
    });

  } catch (error) {
    console.error('Controller crashed:', error);
    res.status(500).json({ success: false, message: "Server internal error" });
  }
};