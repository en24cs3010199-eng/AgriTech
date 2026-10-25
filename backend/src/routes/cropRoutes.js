const express = require('express');
const { body } = require('express-validator');
const {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  updateTimelineActivity,
  deleteCrop
} = require('../controllers/cropController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

const cropValidation = [
  body('farm').notEmpty().withMessage('Farm ID is required'),
  body('cropName').trim().notEmpty().withMessage('Crop name is required'),
  body('season').isIn(['Kharif', 'Rabi', 'Zaid']).withMessage('Valid season (Kharif, Rabi, Zaid) is required'),
  body('sowingDate').isISO8601().withMessage('Valid sowing date is required'),
  body('areaPlanted').isFloat({ min: 0.1 }).withMessage('Area planted must be at least 0.1'),
  validate
];

router.use(protect);

router.route('/')
  .get(getCrops)
  .post(cropValidation, createCrop);

router.route('/:id')
  .get(getCropById)
  .put(updateCrop)
  .delete(deleteCrop);

router.route('/:id/activity/:activityId')
  .put(updateTimelineActivity);

module.exports = router;
