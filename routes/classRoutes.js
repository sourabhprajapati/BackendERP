// backend/routes/classRoutes.js
const express = require('express');
const router = express.Router();
const {
  addClass,
  getAllClasses,
  updateClass,
  deleteClass,
  addSection,
  removeSection
} = require('../controllers/classController');

// Class Routes
router.post('/add', addClass);
router.get('/', getAllClasses);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);

// Section Routes
router.post('/:id/section', addSection);
router.delete('/:id/section/:section', removeSection);

module.exports = router;