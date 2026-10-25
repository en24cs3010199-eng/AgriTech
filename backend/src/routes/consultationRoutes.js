const express = require('express');
const { body } = require('express-validator');
const {
  createConsultation,
  getConsultations,
  prescribeAdvice
} = require('../controllers/consultationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

const consultValidation = [
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('cropAffected').trim().notEmpty().withMessage('Crop name is required'),
  body('symptoms').trim().notEmpty().withMessage('Symptoms description is required'),
  validate
];

router.use(protect);

router.route('/')
  .get(getConsultations)
  .post(consultValidation, createConsultation);

router.put('/:id/prescribe', authorize('expert', 'admin'), prescribeAdvice);

module.exports = router;
