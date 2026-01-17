const ClassFeeAllocation = require("../models/ClassFeeAllocation");

/* ================= SAVE / UPDATE ================= */
exports.saveClassFeeAllocation = async (req, res) => {
  try {
    const { schoolId, className, feeData } = req.body;

    await ClassFeeAllocation.deleteMany({ schoolId, className });

    const payload = feeData.map((fee) => ({
      schoolId,
      className,
      feeName: fee.feeName,
      concessions: fee.concessions, // ✅ dynamic
    }));

    await ClassFeeAllocation.insertMany(payload);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


/* ================= GET ================= */
exports.getClassFeeAllocation = async (req, res) => {
  try {
    const { schoolId, className } = req.params;

    const records = await ClassFeeAllocation.find({
      schoolId,
      className,
    });

    const formatted = records.map(doc => ({
      feeName: doc.feeName,
      concessions: doc.concessions
        ? Object.fromEntries(doc.concessions)
        : {}
    }));

    res.json({
      success: true,
      data: formatted
    });
  } catch (err) {
    console.error("GET allocation error:", err);
    res.status(500).json({
      success: false,
      data: [],
      message: err.message
    });
  }
};


