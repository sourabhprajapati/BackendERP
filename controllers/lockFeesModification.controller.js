const LockFeesModification = require("../models/LockFeesModification");

/* ================= CREATE / UPDATE ================= */
exports.lockFees = async (req, res) => {
  try {
    const { schoolId, lockUptoDate } = req.body;

    if (!lockUptoDate) {
      return res.status(400).json({
        success: false,
        message: "Lock date is required",
      });
    }

    const lock = await LockFeesModification.findOneAndUpdate(
      { schoolId },
      { lockUptoDate },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: lock,
      message: "Fees modification locked successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= GET ================= */
exports.getLockFees = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const lock = await LockFeesModification.findOne({ schoolId });

    res.status(200).json({
      success: true,
      data: lock || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= DELETE ================= */
exports.deleteLockFees = async (req, res) => {
  try {
    const { schoolId } = req.params;

    await LockFeesModification.findOneAndDelete({ schoolId });

    res.status(200).json({
      success: true,
      message: "Fees modification unlocked successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
