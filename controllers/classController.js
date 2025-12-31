// backend/controllers/classController.js
const Class = require('../models/Class');


const addClass = async (req, res) => {
  try {
    const { baseName } = req.body;   

    if (!baseName || !baseName.trim()) {
      return res.status(400).json({ message: 'Class name is required' });
    }

    const normalized = baseName.trim().toUpperCase();

    const exists = await Class.findOne({ baseName: normalized });
    if (exists) {
      return res.status(400).json({ message: 'Class already exists' });
    }

    const newClass = new Class({
      baseName: normalized,
      sections: []
    });

    await newClass.save();
    res.status(201).json({ success: true, class: newClass });

  } catch (err) {
    console.error("Add Class Error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all classes
const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().sort({ baseName: 1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update class
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { baseName } = req.body;
    if (!baseName?.trim()) return res.status(400).json({ message: 'Name required' });

    const normalized = baseName.trim().toUpperCase();
    const exists = await Class.findOne({ baseName: normalized, _id: { $ne: id } });
    if (exists) return res.status(400).json({ message: 'Class name already taken' });

    const updated = await Class.findByIdAndUpdate(id, { baseName: normalized }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Class not found' });

    res.json({ success: true, class: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete class
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Class.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Class not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add Section
const addSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { section } = req.body;
    if (!section?.trim()) return res.status(400).json({ message: 'Section required' });

    const normalized = section.trim().toUpperCase();
    const updated = await Class.findByIdAndUpdate(
      id,
      { $addToSet: { sections: normalized } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Class not found' });
    res.json({ success: true, class: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove Section
const removeSection = async (req, res) => {
  try {
    const { id, section } = req.params;
    const updated = await Class.findByIdAndUpdate(
      id,
      { $pull: { sections: section } },
      { new: true }
    );
    res.json({ success: true, class: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addClass,
  getAllClasses,
  updateClass,
  deleteClass,
  addSection,
  removeSection
};