const express = require('express');
const {
  getWeatherForecast,
  getAlerts,
  createAlert
} = require('../controllers/weatherController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/forecast', protect, getWeatherForecast);
router.get('/alerts', protect, getAlerts);
router.post('/alerts', protect, authorize('admin', 'expert'), createAlert);

module.exports = router;
