// routes/staffLeaveRoutes.js
const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getPendingLeaves,
  getLeaveHistory,
  updateLeaveStatus
} = require('../controllers/staffLeaveController');

// Submit leave application (with file upload)
router.post('/apply', applyLeave);

// Get pending applications (admin/HR view)
router.get('/pending', getPendingLeaves);

// Get leave history (can be filtered by staffId)
router.get('/history', getLeaveHistory);

// Update status (Approve / Reject)
router.patch('/:id/status', updateLeaveStatus);

module.exports = router;