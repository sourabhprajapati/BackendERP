const express = require('express');
const router = express.Router();
const { submitConcession, getAllConcessions } = require('../controllers/concessionController');

// Test route (remove later)
router.get('/test', (req, res) => res.json({ msg: "Concession routes loaded!" }));

router.post('/submit', submitConcession);
router.get('/', getAllConcessions);

module.exports = router;