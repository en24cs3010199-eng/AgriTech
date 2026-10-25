const mongoose = require('mongoose');

const weatherAlertSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    alertType: {
      type: String,
      enum: ['Heavy Rainfall', 'Heatwave', 'Frost Warning', 'High Pest Risk', 'Disease Outbreak Warning', 'Strong Winds'],
      required: true
    },
    severity: {
      type: String,
      enum: ['Advisory', 'Watch', 'Warning', 'Emergency'],
      default: 'Warning'
    },
    title: {
      type: String,
      required: true
    },
    titleHi: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      required: true
    },
    descriptionHi: {
      type: String,
      default: ''
    },
    affectedCrops: [String],
    recommendedAction: {
      type: String,
      required: true
    },
    recommendedActionHi: {
      type: String,
      default: ''
    },
    validUntil: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('WeatherAlert', weatherAlertSchema);
