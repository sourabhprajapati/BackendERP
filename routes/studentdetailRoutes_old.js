const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const studentDetailController = require('../controllers/studentDetailController');

/* ================= CREATE STUDENT ================= */
router.post(
  '/',
  upload.fields([
    { name: 'studentPhoto', maxCount: 1 },
    { name: 'fatherPhoto', maxCount: 1 },
    { name: 'motherPhoto', maxCount: 1 },
    { name: 'guardianPhoto', maxCount: 1 },
    { name: 'documents', maxCount: 10 },
  ]),
  studentDetailController.addStudent
);

/* ================= UPDATE STUDENT ================= */
router.put(
  '/:id',
  upload.fields([
    { name: 'studentPhoto', maxCount: 1 },
    { name: 'fatherPhoto', maxCount: 1 },
    { name: 'motherPhoto', maxCount: 1 },
    { name: 'guardianPhoto', maxCount: 1 },
    { name: 'documents', maxCount: 10 },
  ]),
  studentDetailController.updateStudent
);

/* ================= LIST ALL STUDENTS ================= */
router.get('/', studentDetailController.getAllStudents);

/* ================= GET BY ADMISSION NO ================= */
router.get('/by-admission', async (req, res) => {
  const { admissionNo } = req.query;

  if (!admissionNo) {
    return res.status(400).json({ message: 'Admission number required' });
  }

  const student = await require('../models/StudentDetail').findOne({
    'basic.admissionNo': admissionNo,
  });

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  res.json({
    id: student._id,
    name: student.basic.name,
    class: student.basic.class,
    section: student.basic.section,
    admissionNo: student.basic.admissionNo,
    rollNo: student.basic.rollNo,
  });
});

/* ================= TRANSFER ================= */
router.post('/transfer', async (req, res) => {
  const { admissionNo, newClass, newSection } = req.body;
  const Student = require('../models/StudentDetail');

  const student = await Student.findOne({ 'basic.admissionNo': admissionNo });
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  student.basic.class = newClass;
  student.basic.section = newSection;
  await student.save();

  res.json({ message: 'Transfer successful' });
});

/* ================= UPDATE ROLL ================= */
router.post('/update-roll', studentDetailController.updateRollNumber);

/* ================= DELETE DOCUMENT ================= */
router.delete('/:studentId/documents/:documentIndex', studentDetailController.deleteDocument);

/* ================= GET SINGLE STUDENT (LAST) ================= */
router.get('/:id', studentDetailController.getStudentById);

/* ================= GET STUDENTS BY CLASS & SECTION ================= */
router.get('/by-class-section', async (req, res) => {
  try {
    const { className, section } = req.query;

    if (!className || !section) {
      return res.status(400).json({ message: 'className and section are required' });
    }

    const Student = require('../models/Student');
    const students = await Student.find({
      className,
      section,
      isActive: true
    }).select('_id admissionNo studentName fatherName className section').sort('admissionNo');

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});

module.exports = router;
