const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Please provide a name for this farm/plot'],
      trim: true,
      maxlength: [80, 'Farm name cannot exceed 80 characters']
    },
    totalArea: {
      type: Number,
      required: [true, 'Please specify total farm area'],
      min: [0.1, 'Farm area must be at least 0.1 acres']
    },
    areaUnit: {
      type: String,
      enum: ['Acres', 'Hectares', 'Bigha'],
      default: 'Acres'
    },
    soilType: {
      type: String,
      required: [true, 'Please select a soil type'],
      enum: ['Alluvial', 'Black Soil', 'Red Soil', 'Laterite', 'Sandy Loam', 'Clay Loam', 'Silt Loam']
    },
    irrigationSource: {
      type: String,
      required: [true, 'Please specify primary irrigation source'],
      enum: ['Borewell / Tubewell', 'Canal Irrigation', 'Drip Irrigation', 'Sprinkler System', 'Rainfed']
    },
    location: {
      state: { type: String, required: true },
      district: { type: String, required: true },
      village: { type: String, default: '' },
      latitude: { type: Number, default: 28.6139 },
      longitude: { type: Number, default: 77.2090 }
    },
    notes: {
      type: String,
      maxlength: 500,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Farm', farmSchema);
