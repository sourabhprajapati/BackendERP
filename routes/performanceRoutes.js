const express = require('express');
const router = express.Router();
const {
  getStudentsForPerformance,
  savePerformanceMarks,
  getPerformanceRecords,
  getPerformanceExams,
  getStudentPerformanceSummary,
  togglePublishResults
} = require('../controllers/performanceController');

// Get students for performance entry
router.get('/students', getStudentsForPerformance);

// Get performance records for a specific exam/class/section
router.get('/records', getPerformanceRecords);

// Get all performance exams for a class/section
router.get('/exams', getPerformanceExams);

// Save performance marks
router.post('/marks', savePerformanceMarks);

// Get student performance summary (for student dashboard)
router.get('/student/:admissionNo', getStudentPerformanceSummary);

// Publish/unpublish performance results
router.put('/publish', togglePublishResults);

module.exports = router;
