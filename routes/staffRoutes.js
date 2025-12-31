// routes/staffRoutes.js
const express = require('express');
const router = express.Router();
const { createStaff, getStaff,updateStaff } = require('../controllers/staffController');

router.post('/create', createStaff);
router.get('/all', getStaff);
router.put('/update/:id', updateStaff);

module.exports = router;