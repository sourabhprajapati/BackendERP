// backend/routes/subjectRoutes.js
const express = require('express');
const router = express.Router();
const { saveSubject, getAllSubjects, deleteSubject } = require('../controllers/subjectController');

router.post('/save', saveSubject);       
router.get('/', getAllSubjects);
router.delete('/:id', deleteSubject);

module.exports = router;