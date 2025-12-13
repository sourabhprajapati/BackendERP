// backend/routes/admissionRoutes.js
const express = require('express');
const router = express.Router();
const { submitEnquiry, getAllEnquiries } = require('../controllers/admissionController');

router.post('/submit', submitEnquiry);
router.get('/', getAllEnquiries); // For admin panel

module.exports = router;