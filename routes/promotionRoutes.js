const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');

// POST /api/students/promotion/promote
router.post('/promote', promotionController.promoteStudents);

module.exports = router;
