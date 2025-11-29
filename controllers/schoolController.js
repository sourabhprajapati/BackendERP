// controllers/schoolController.js
const School = require('../models/School');

const createSchoolRequest = async (req, res) => {
  try {
    const files = req.files;
    if (!files?.consentFile || !files?.loginFile) {
      return res.status(400).json({ success: false, message: "Both files are required" });
    }

    const school = new School({
      ...req.body,
      consentFile: files.consentFile[0].filename,
      loginFile: files.loginFile[0].filename,
      tpg: req.body.tpg === 'true' || req.body.tpg === true,
      talentBox: req.body.talentBox === 'true' || req.body.talentBox === true,
    });

    const savedSchool = await school.save();

    res.status(201).json({
      success: true,
      message: "School created successfully!",
      data: savedSchool
    });
  } catch (error) {
    console.error("School creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createSchoolRequest };