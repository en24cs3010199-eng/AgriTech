const express = require('express');
const {
  getCropRecommendation,
  askKisanSaathi
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/recommend-crop', getCropRecommendation);
router.post('/kisan-saathi', askKisanSaathi);

module.exports = router;
