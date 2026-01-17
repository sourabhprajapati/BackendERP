const LateFeeConfig = require("../models/LateFeeConfig");

/* ================= CREATE / UPDATE ================= */
exports.saveLateFeeConfig = async (req, res) => {
  try {
    const { schoolId, mode, amount, applyAfterDate } = req.body;

    if (!schoolId || !mode || !amount || !applyAfterDate) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const config = await LateFeeConfig.findOneAndUpdate(
      { schoolId },
      {
        mode,
        amount,
        applyAfterDate,
        isActive: true,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: config,
      message: "Late fee configuration saved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= GET ================= */
exports.getLateFeeConfig = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const config = await LateFeeConfig.findOne({ schoolId });

    res.status(200).json({
      success: true,
      data: config || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= DELETE ================= */
exports.deleteLateFeeConfig = async (req, res) => {
  try {
    const { schoolId } = req.params;

    await LateFeeConfig.findOneAndDelete({ schoolId });

    res.status(200).json({
      success: true,
      message: "Late fee configuration removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
