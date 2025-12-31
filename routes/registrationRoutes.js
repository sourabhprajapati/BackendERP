const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/multerConfig'); // ← curly braces = named
const { uploadRegistrationExcel } = require('../controllers/registrationController');

router.post('/upload',
  upload.single('excelFile'),
  uploadRegistrationExcel
);

module.exports = router;