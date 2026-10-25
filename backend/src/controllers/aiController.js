const { recommendCrop } = require('../services/mlService');
const { getAgriculturalAdvice } = require('../services/aiChatService');

// @desc    Explainable ML Crop Recommendation
// @route   POST /api/ai/recommend-crop
// @access  Public / Private
const getCropRecommendation = async (req, res, next) => {
  try {
    const { n, p, k, temperature, humidity, ph, rainfall } = req.body;

    if (
      n === undefined ||
      p === undefined ||
      k === undefined ||
      temperature === undefined ||
      humidity === undefined ||
      ph === undefined ||
      rainfall === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'All 7 agronomic parameters (N, P, K, temperature, humidity, pH, rainfall) are required.'
      });
    }

    const prediction = recommendCrop({
      n: parseFloat(n),
      p: parseFloat(p),
      k: parseFloat(k),
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      ph: parseFloat(ph),
      rainfall: parseFloat(rainfall)
    });

    res.status(200).json({
      success: true,
      prediction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hindi Agricultural Assistant (Kisan Saathi)
// @route   POST /api/ai/kisan-saathi
// @access  Public / Private
const askKisanSaathi = async (req, res, next) => {
  try {
    const { query, language } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Query cannot be empty.'
      });
    }

    const preferredLang = language || req.user?.preferredLanguage || 'hi';
    const response = await getAgriculturalAdvice(query, preferredLang);

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCropRecommendation,
  askKisanSaathi
};
