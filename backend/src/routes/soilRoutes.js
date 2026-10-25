const express = require('express');
const { body } = require('express-validator');
const {
  getSoilRecords,
  getSoilRecordById,
  createSoilRecord,
  deleteSoilRecord
} = require('../controllers/soilController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

const soilValidation = [
  body('farm').notEmpty().withMessage('Farm ID is required'),
  body('nitrogen').isFloat({ min: 0, max: 600 }).withMessage('Nitrogen must be between 0 and 600 kg/ha'),
  body('phosphorus').isFloat({ min: 0, max: 300 }).withMessage('Phosphorus must be between 0 and 300 kg/ha'),
  body('potassium').isFloat({ min: 0, max: 600 }).withMessage('Potassium must be between 0 and 600 kg/ha'),
  body('phLevel').isFloat({ min: 0, max: 14 }).withMessage('pH level must be between 0 and 14'),
  validate
];

router.use(protect);

router.route('/')
  .get(getSoilRecords)
  .post(soilValidation, createSoilRecord);

router.route('/:id')
  .get(getSoilRecordById)
  .delete(deleteSoilRecord);

module.exports = router;
