// controllers/digitalContentController.js
const DigitalContent = require('../models/DigitalContent');

const assignDigitalContent = async (req, res) => {
  try {
    const { schoolId, assignments } = req.body;

    if (!schoolId || !assignments || assignments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "schoolId and assignments are required"
      });
    }

    // Optional: Replace old assignment
    await DigitalContent.findOneAndDelete({ schoolId });

    const digital = new DigitalContent({
      schoolId,
      assignments
    });

    await digital.save();

    res.status(201).json({
      success: true,
      message: "Digital content assigned successfully!",
      data: digital
    });
  } catch (error) {
    console.error("Digital assignment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { assignDigitalContent };