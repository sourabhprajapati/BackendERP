const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

router.get("/students", attendanceController.getStudentsForAttendance);
router.get("/records", attendanceController.getAttendanceRecords);
router.post("/", attendanceController.saveAttendance);
router.post("/holiday-range", attendanceController.markHolidayRange);
router.get("/summary/:admissionNo", attendanceController.getStudentAttendanceSummary);
router.get("/details/:admissionNo", attendanceController.getStudentAttendanceDetails);
router.get("/recent/:admissionNo", attendanceController.getStudentRecentAttendance);
router.get("/calendar/:admissionNo", attendanceController.getStudentAttendanceCalendar);
router.get("/download/:admissionNo", attendanceController.downloadAttendanceReport);

// Dashboard stats
router.get("/stats", attendanceController.getAttendanceStats);

// Report routes
router.get("/reports/:reportId", attendanceController.getAttendanceReport);

module.exports = router;
