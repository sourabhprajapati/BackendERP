const Fee = require("../models/Fee");

/* ================= ADD ================= */
exports.addFee = async (req, res) => {
  try {
    const { schoolId, feeName, feeType, paymentType, month } = req.body;

    if (!schoolId || !feeName || !feeType || !paymentType || !month) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const fee = new Fee({
      schoolId,
      feeName,
      feeType,
      paymentType,
      month,
    });

    await fee.save();

    res.status(201).json({
      success: true,
      data: fee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Fee already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= GET ================= */
exports.getFees = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const fees = await Fee.find({ schoolId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: fees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= UPDATE ================= */
exports.updateFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { feeName, feeType, paymentType, month } = req.body;

    const updated = await Fee.findByIdAndUpdate(
      id,
      { feeName, feeType, paymentType, month },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= DELETE ================= */
exports.deleteFee = async (req, res) => {
  try {
    const { id } = req.params;

    await Fee.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Fee deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
