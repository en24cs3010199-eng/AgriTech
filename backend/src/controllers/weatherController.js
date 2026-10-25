const { getAgroWeatherData } = require('../services/weatherService');
const WeatherAlert = require('../models/WeatherAlert');

// @desc    Get real-time agro-weather forecast and advisories
// @route   GET /api/weather/forecast
// @access  Private / Public
const getWeatherForecast = async (req, res, next) => {
  try {
    let lat = req.query.lat ? parseFloat(req.query.lat) : null;
    let lng = req.query.lng ? parseFloat(req.query.lng) : null;
    let district = req.query.district || 'Ludhiana';
    let state = req.query.state || 'Punjab';

    // If coordinates not in query, use user's profile location if logged in
    if ((!lat || !lng) && req.user && req.user.location) {
      lat = req.user.location.latitude || 30.9010;
      lng = req.user.location.longitude || 75.8573;
      district = req.user.location.district || district;
      state = req.user.location.state || state;
    }

    // Default to Ludhiana, Punjab (Indian agricultural center) if still null
    lat = lat || 30.9010;
    lng = lng || 75.8573;

    const weatherData = await getAgroWeatherData(lat, lng, district, state);

    // Also fetch any admin-broadcasted regional pest or emergency alerts
    const dbAlerts = await WeatherAlert.find({
      isActive: true,
      validUntil: { $gte: new Date() }
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      ...weatherData,
      regionalAlerts: dbAlerts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active regional weather/pest alerts
// @route   GET /api/weather/alerts
// @access  Private
const getAlerts = async (req, res, next) => {
  try {
    const alerts = await WeatherAlert.find({
      isActive: true,
      validUntil: { $gte: new Date() }
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Broadcast a new weather/pest alert
// @route   POST /api/weather/alerts
// @access  Private (Admin / Expert)
const createAlert = async (req, res, next) => {
  try {
    const { state, district, alertType, severity, title, titleHi, description, descriptionHi, affectedCrops, recommendedAction, recommendedActionHi, validUntil } = req.body;

    const alert = await WeatherAlert.create({
      state,
      district,
      alertType,
      severity,
      title,
      titleHi: titleHi || '',
      description,
      descriptionHi: descriptionHi || '',
      affectedCrops: Array.isArray(affectedCrops) ? affectedCrops : [affectedCrops],
      recommendedAction,
      recommendedActionHi: recommendedActionHi || '',
      validUntil: validUntil || new Date(Date.now() + 48 * 60 * 60 * 1000)
    });

    res.status(201).json({
      success: true,
      message: 'Weather / Pest Alert broadcasted successfully.',
      alert
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWeatherForecast,
  getAlerts,
  createAlert
};
