const Subject = require('../models/Subject');

// ADD or UPDATE SUBJECT
const saveSubject = async (req, res) => {
  try {
    const { id, name, classes, area, addInExam, type } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Subject name is required' });
    }

    // UPDATE
    if (id) {
      const updated = await Subject.findByIdAndUpdate(
        id,
        {
          name: name.trim(),
          classes: classes || [],
          area,
          addInExam,
          type
        },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      return res.json({ success: true, subject: updated });
    }

    // CREATE
    const exists = await Subject.findOne({ name: name.trim() });
    if (exists) {
      return res.status(400).json({ message: 'Subject already exists' });
    }

    const subject = new Subject({
      name: name.trim(),
      classes: classes || [],
      area,
      addInExam,
      type
    });

    await subject.save();
    res.status(201).json({ success: true, subject });

  } catch (err) {
    console.error('Subject Save Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET ALL SUBJECTS
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ name: 1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE SUBJECT
const deleteSubject = async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  saveSubject,
  getAllSubjects,
  deleteSubject
};