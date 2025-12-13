// backend/controllers/concessionController.js
const Concession = require('../models/Concession');

const submitConcession = async (req, res) => {
  try {
    const { name, classGrade, parentName, reason, siblings, amount } = req.body;

    const concession = new Concession({
      name: name.trim(),
      classGrade,
      parentName: parentName.trim(),
      reason: reason.trim(),
      siblings: siblings.trim(),
      amount: Number(amount)
    });

    await concession.save();

    res.status(201).json({
      success: true,
      message: 'Concession application submitted successfully!',
      concession: {
        id: concession._id,
        name: concession.name,
        classGrade: concession.classGrade,
        amount: concession.amount,
        status: concession.status
      }
    });
  } catch (err) {
    console.error('Concession Submit Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to submit concession application',
      error: err.message
    });
  }
};

// Optional: Get all concessions (for admin panel)
const getAllConcessions = async (req, res) => {
  try {
    const concessions = await Concession.find()
      .sort({ createdAt: -1 })
      .select('name classGrade parentName amount status createdAt');

    res.json(concessions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitConcession, getAllConcessions };