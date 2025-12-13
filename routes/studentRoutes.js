// routes/studentRoutes.js  ← REPLACE THIS FILE

const express = require('express');
const router = express.Router();
const {
  createStudent,
  updateStudent,
  getStudent
} = require('../controllers/studentController');

// THESE ORDER MATTERS!
router.post('/', createStudent);
router.get('/:id', getStudent);        // ← MUST come before PUT
router.put('/:id', updateStudent);

module.exports = router;