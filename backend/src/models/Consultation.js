const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    cropAffected: {
      type: String,
      required: [true, 'Please specify affected crop']
    },
    symptoms: {
      type: String,
      required: [true, 'Please describe symptoms']
    },
    severity: {
      type: String,
      enum: ['Low', 'Moderate', 'Urgent / High'],
      default: 'Moderate'
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'answered', 'closed'],
      default: 'pending'
    },
    expertAdvice: {
      type: String,
      default: ''
    },
    prescription: [
      {
        productOrMeasure: String,
        dosage: String,
        applicationTiming: String
      }
    ],
    answeredAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Consultation', consultationSchema);
