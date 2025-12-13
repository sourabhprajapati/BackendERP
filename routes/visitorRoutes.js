// routes/visitorRoutes.js  (NO middleware folder needed)
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { addVisitor, getVisitors, getVisitorsWithName } = require('../controllers/visitorController');


// Multer config directly here
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'visitor-' + unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only images & PDF allowed'));
  }
});

router.post('/add', upload.single('attachment'), addVisitor);
router.get('/', getVisitors);
router.get('/all', getVisitorsWithName);         // ← New (for Enquiry page - with name)


module.exports = router;