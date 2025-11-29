// routes/schoolRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { createSchoolRequest } = require('../controllers/schoolController');

const uploadFields = upload.fields([
  { name: 'consentFile', maxCount: 1 },
  { name: 'loginFile', maxCount: 1 }
]);

router.post('/new', uploadFields, createSchoolRequest);

module.exports = router;