const express = require('express');
const router = express.Router();
const {
  assignClassTeacher,
  getAssignedClassTeachers,
    updateClassTeacherAssignment
} = require('../controllers/classTeacherController');

// Assign teacher to class
router.post('/assign', assignClassTeacher);

// Get all current assignments for school
router.get('/assignments', getAssignedClassTeachers);
router.put('/assign/:id', updateClassTeacherAssignment);

module.exports = router;