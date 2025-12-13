// routes/staffRoutes.js
const express = require('express');
const router = express.Router();
const { createStaff, getStaff } = require('../controllers/staffController');

router.post('/create', createStaff);
router.get('/all', getStaff);

module.exports = router;