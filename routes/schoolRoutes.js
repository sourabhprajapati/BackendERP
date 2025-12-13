// routes/schoolRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');

const {
  createSchoolRequest,
  getPendingSchools,
  approveSchool,
  rejectSchool
} = require('../controllers/schoolController');

// File upload fields
const uploadFields = upload.fields([
  { name: 'consentFile', maxCount: 1 },
  { name: 'loginFile', maxCount: 1 }
]);

router.post('/new', uploadFields, createSchoolRequest);
router.get('/pending', getPendingSchools);
router.patch('/approve/:id', approveSchool);        // ← PATCH
router.patch('/reject/:id', rejectSchool);        // ← PATCH + body { rejectionReason }

module.exports = router;