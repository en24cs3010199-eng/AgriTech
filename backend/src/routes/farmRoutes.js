const express = require('express');
const { body } = require('express-validator');
const {
  getFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm
} = require('../controllers/farmController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

const farmValidation = [
  body('name').trim().notEmpty().withMessage('Farm name is required'),
  body('totalArea').isFloat({ min: 0.1 }).withMessage('Total area must be at least 0.1'),
  body('soilType').notEmpty().withMessage('Soil type is required'),
  body('irrigationSource').notEmpty().withMessage('Irrigation source is required'),
  validate
];

router.use(protect);

router.route('/')
  .get(getFarms)
  .post(farmValidation, createFarm);

router.route('/:id')
  .get(getFarmById)
  .put(updateFarm)
  .delete(deleteFarm);

module.exports = router;
