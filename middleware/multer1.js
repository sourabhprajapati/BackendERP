// middleware/multer.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads/staff');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.floor(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + unique + path.extname(file.originalname));
  }
});

const uploadStaffFiles = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, PNG allowed'));
    }
  }
}).fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'dl', maxCount: 1 },
  { name: 'pgCert', maxCount: 1 },
  { name: 'policeVerification', maxCount: 1 },
  { name: 'otherDoc', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 },
  { name: 'voterId', maxCount: 1 },
  { name: 'ugCert', maxCount: 1 },
  { name: 'bedCert', maxCount: 1 },
  { name: 'experienceCert', maxCount: 1 }
]);

module.exports = uploadStaffFiles; // ← This is the key!