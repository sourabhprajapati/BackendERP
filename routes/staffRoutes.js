// routes/staffRoutes.js
const express = require('express');
const router = express.Router();
const { createStaff, getStaff, updateStaff, inactiveStaff } = require('../controllers/staffController');

router.post('/create', createStaff);
router.get('/all', getStaff);
router.put('/update/:id', updateStaff);
router.patch("/status/:id", inactiveStaff);



module.exports = router;