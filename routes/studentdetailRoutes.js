// backend/routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const Student = require('../models/StudentDetail');
const upload = require('../middleware/multer');

// POST - Create New Student
router.post('/', upload.fields([
  { name: 'studentPhoto', maxCount: 1 },
  { name: 'fatherPhoto', maxCount: 1 },
  { name: 'motherPhoto', maxCount: 1 },
  { name: 'guardianPhoto', maxCount: 1 },
  { name: 'documents', maxCount: 10 }, // Allow up to 10 documents
]), async (req, res) => {
  try {
    // Parse the JSON data from the form
    const structuredData = JSON.parse(req.body.data);

    // Handle photo uploads
    const studentData = {
      basic: {
        ...structuredData.basic,
        photo: req.files['studentPhoto'] ? '/' + req.files['studentPhoto'][0].path.replace(/\\/g, '/') : null,
      },
      personal: structuredData.personal,
      guardians: {
        ...structuredData.guardians,
        father: {
          ...structuredData.guardians.father,
          photo: req.files['fatherPhoto'] ? '/' + req.files['fatherPhoto'][0].path.replace(/\\/g, '/') : null,
        },
        mother: {
          ...structuredData.guardians.mother,
          photo: req.files['motherPhoto'] ? '/' + req.files['motherPhoto'][0].path.replace(/\\/g, '/') : null,
        },
        guardian: {
          ...structuredData.guardians.guardian,
          photo: req.files['guardianPhoto'] ? '/' + req.files['guardianPhoto'][0].path.replace(/\\/g, '/') : null,
        },
      },
      documents: [],
    };

    // Handle document uploads
    if (req.files['documents']) {
      req.files['documents'].forEach((file, index) => {
        const title = structuredData.documents[index]?.title || file.originalname;
        studentData.documents.push({
          title,
          filePath: '/' + file.path.replace(/\\/g, '/'),
        });
      });
    }

    const student = new Student(studentData);
    await student.save();

    res.status(201).json({
      message: "Student admitted successfully!",
      student
    });
  } catch (error) {
    console.error("Error adding student:", error);
    res.status(500).json({
      message: "Failed to admit student",
      error: error.message
    });
  }
});

// GET all students (for list page)
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single student (for edit form)
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT - Update Student
router.put('/:id', upload.fields([
  { name: 'studentPhoto', maxCount: 1 },
  { name: 'fatherPhoto', maxCount: 1 },
  { name: 'motherPhoto', maxCount: 1 },
  { name: 'guardianPhoto', maxCount: 1 },
  { name: 'documents', maxCount: 10 },
]), async (req, res) => {
  try {
    const studentId = req.params.id;
    const structuredData = JSON.parse(req.body.data);

    // Get existing student
    const existingStudent = await Student.findById(studentId);
    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Handle photo uploads (keep existing if not provided)
    const studentData = {
      basic: {
        ...structuredData.basic,
        photo: req.files['studentPhoto'] ? '/' + req.files['studentPhoto'][0].path.replace(/\\/g, '/') : existingStudent.basic.photo,
      },
      personal: structuredData.personal,
      guardians: {
        ...structuredData.guardians,
        father: {
          ...structuredData.guardians.father,
          photo: req.files['fatherPhoto'] ? '/' + req.files['fatherPhoto'][0].path.replace(/\\/g, '/') : existingStudent.guardians.father.photo,
        },
        mother: {
          ...structuredData.guardians.mother,
          photo: req.files['motherPhoto'] ? '/' + req.files['motherPhoto'][0].path.replace(/\\/g, '/') : existingStudent.guardians.mother.photo,
        },
        guardian: {
          ...structuredData.guardians.guardian,
          photo: req.files['guardianPhoto'] ? '/' + req.files['guardianPhoto'][0].path.replace(/\\/g, '/') : existingStudent.guardians.guardian.photo,
        },
      },
      documents: existingStudent.documents, // Keep existing documents
    };

    // Handle new document uploads (append to existing)
    if (req.files['documents']) {
      req.files['documents'].forEach((file, index) => {
        const title = structuredData.documents[index]?.title || file.originalname;
        studentData.documents.push({
          title,
          filePath: '/' + file.path.replace(/\\/g, '/'),
        });
      });
    }

    const updatedStudent = await Student.findByIdAndUpdate(studentId, studentData, { new: true });

    res.status(200).json({
      message: "Student updated successfully!",
      student: updatedStudent
    });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({
      message: "Failed to update student",
      error: error.message
    });
  }
});

module.exports = router;
