const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true
    },
    titleHi: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      required: true,
      enum: ['seeds', 'fertilizers', 'pesticides', 'equipment', 'irrigation', 'soil_conditioners']
    },
    description: {
      type: String,
      required: true
    },
    descriptionHi: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      default: 'kg'
    },
    stockQuantity: {
      type: Number,
      default: 100,
      min: 0
    },
    brand: {
      type: String,
      default: 'Kisan Kendra'
    },
    imageUrl: {
      type: String,
      default: ''
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Resource', resourceSchema);
