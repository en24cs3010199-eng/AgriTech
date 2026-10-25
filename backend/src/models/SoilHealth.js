const mongoose = require('mongoose');

const soilHealthSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
      index: true
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sampleDate: {
      type: Date,
      default: Date.now
    },
    nitrogen: {
      type: Number,
      required: [true, 'Nitrogen (N) level is required (kg/ha)'],
      min: 0,
      max: 600
    },
    phosphorus: {
      type: Number,
      required: [true, 'Phosphorus (P) level is required (kg/ha)'],
      min: 0,
      max: 300
    },
    potassium: {
      type: Number,
      required: [true, 'Potassium (K) level is required (kg/ha)'],
      min: 0,
      max: 600
    },
    phLevel: {
      type: Number,
      required: [true, 'pH level is required (0 - 14)'],
      min: 0,
      max: 14
    },
    organicCarbon: {
      type: Number, // Percentage (%)
      default: 0.5
    },
    electricalConductivity: {
      type: Number, // dS/m
      default: 0.35
    },
    moisture: {
      type: Number, // %
      default: 30
    },
    fertilityRating: {
      type: String,
      enum: ['Critical / Depleted', 'Low', 'Medium', 'Optimal / High'],
      default: 'Medium'
    },
    deficiencyAlerts: [
      {
        type: String
      }
    ],
    recommendations: [
      {
        fertilizerName: String,
        dosageKgPerAcre: Number,
        timing: String,
        description: String
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SoilHealth', soilHealthSchema);
