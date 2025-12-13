// routes/schoolinfoRoutes.js
const express = require('express');
const router = express.Router();
const uploadImage = require('../middleware/multerImage'); 
const { createSchoolinfo } = require('../controllers/schoolinfoController');

// const uploadImage = upload.fields([
//   { name: 'schoolLogo', maxCount: 1 },
//   { name: 'tcHeaderLogo', maxCount: 1 }
// ]);

router.post('/create', uploadImage.fields([
  { name: 'schoolLogo', maxCount: 1 },
  { name: 'tcHeaderLogo', maxCount: 1 }
]), createSchoolinfo);

module.exports = router;