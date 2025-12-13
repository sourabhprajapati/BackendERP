// controllers/studentController.js  ← REPLACE THIS ENTIRE FILE

const Student = require('../models/Student');

exports.createStudent = async (req, res) => {
  try {
    const exists = await Student.findOne({ admissionNo: req.body.admissionNo });
    if (exists) return res.status(400).json({ success: false, message: 'Admission No already exists' });

    const student = await Student.create(req.body);
    res.status(201).json({ success: true, message: 'Student added!', data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    res.json({ success: true, message: 'Student updated!', data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id); // ← THIS WAS MISSING OR WRONG

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};