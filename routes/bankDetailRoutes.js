// routes/bankDetailRoutes.js
const express = require('express');
const router = express.Router();
const {
  getBankDetails,
  updateBankDetails
} = require('../controllers/bankDetailController');

// GET - Fetch bank details (to pre-fill form)
router.get('/bank-details', getBankDetails);

// POST - Save / Update bank details
router.post('/bank-details', updateBankDetails);

module.exports = router;