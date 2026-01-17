// routes/staffAttendanceRoutes.js
const express = require('express');
const router = express.Router();
const {
  markStaffAttendance,
  getStaffAttendanceByDate,
  getStaffAttendanceHistory
} = require('../controllers/staffAttendanceController');

// Mark / Update attendance (bulk)
router.post('/mark', markStaffAttendance);

// Get attendance of all staff for a specific date
router.get('/by-date', getStaffAttendanceByDate);

// Optional: Get attendance history of single staff
router.get('/history/:staffId', getStaffAttendanceHistory);

module.exports = router;