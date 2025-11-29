// routes/salesExecutiveRoutes.js
const express = require('express');
const router = express.Router();
const {
  addSalesExecutive,
  getSalesExecutives,
  blockExecutive,
  activateExecutive
} = require('../controllers/salesExecutiveController');

router.post('/', addSalesExecutive);
router.get('/', getSalesExecutives);
router.put('/:id/block', blockExecutive);
router.put('/:id/activate', activateExecutive);

module.exports = router;