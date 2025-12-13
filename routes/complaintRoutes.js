// backend/routes/complaintRoutes.js
const express = require('express');
const router = express.Router();
const { submitComplaint, getAllComplaints } = require('../controllers/complaintController');

// Public routes
router.post('/submit', submitComplaint);
router.get('/', getAllComplaints); // Optional: for admin dashboard later

module.exports = router;