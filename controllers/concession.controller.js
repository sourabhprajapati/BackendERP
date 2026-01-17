const Concession = require("../models/Concession");

/* ================= ADD ================= */
exports.addConcession = async (req, res) => {
  try {
    const { schoolId, categoryName } = req.body;

    if (!schoolId || !categoryName) {
      return res.status(400).json({
        success: false,
        message: "School Id and Category Name are required",
      });
    }

    const concession = new Concession({
      schoolId,
      categoryName,
    });

    await concession.save();

    res.status(201).json({
      success: true,
      message: "Concession category added successfully",
      data: concession,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Concession category already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= GET ================= */
exports.getConcessions = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const concessions = await Concession.find({
      schoolId,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: concessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= UPDATE ================= */
exports.updateConcession = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName } = req.body;

    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const updated = await Concession.findByIdAndUpdate(
      id,
      { categoryName },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Concession category updated successfully",
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
exports.deleteConcession = async (req, res) => {
  try {
    const { id } = req.params;

    await Concession.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Concession category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
