const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  stage: {
    type: String,
    required: true
  },
  daysAfterSowing: {
    type: Number,
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ['sowing', 'irrigation', 'fertilizer', 'pesticide', 'weeding', 'harvest'],
    required: true
  },
  taskDescription: {
    type: String,
    required: true
  },
  taskDescriptionHi: {
    type: String,
    default: ''
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  }
});

const cropRecordSchema = new mongoose.Schema(
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
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true
    },
    variety: {
      type: String,
      default: 'Standard'
    },
    season: {
      type: String,
      enum: ['Kharif', 'Rabi', 'Zaid'],
      required: true
    },
    sowingDate: {
      type: Date,
      required: true
    },
    expectedHarvestDate: {
      type: Date,
      required: true
    },
    actualHarvestDate: {
      type: Date
    },
    areaPlanted: {
      type: Number,
      required: true,
      min: 0.1
    },
    status: {
      type: String,
      enum: ['sown', 'vegetative', 'flowering', 'maturity', 'harvested', 'failed'],
      default: 'sown'
    },
    expectedYield: {
      type: Number, // in Quintals
      default: 0
    },
    actualYield: {
      type: Number,
      default: 0
    },
    timeline: [activitySchema],
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('CropRecord', cropRecordSchema);
