const express = require('express');
const router = express.Router();
const {
  assignClassTeacher,
  getAssignedClassTeachers,
  updateClassTeacherAssignment,
  deleteClassTeacherAssignment
} = require('../controllers/classTeacherController');

// existing routes
router.post('/assign', assignClassTeacher);
router.get('/assignments', getAssignedClassTeachers);
router.put('/assign/:id', updateClassTeacherAssignment);

// ✅ NEW DELETE
router.delete('/assign/:id', deleteClassTeacherAssignment);

module.exports = router;