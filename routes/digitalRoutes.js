// routes/digitalRoutes.js
const express = require('express');
const router = express.Router();
const { assignDigitalContent } = require('../controllers/digitalContentController');

router.post('/assign', assignDigitalContent);

module.exports = router;