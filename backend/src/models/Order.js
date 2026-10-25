const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true
  },
  title: String,
  unitPrice: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalItemPrice: Number
});

const trackingUpdateSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'dispatched', 'out_for_delivery', 'delivered', 'cancelled'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  notes: String
});

const orderSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true
    },
    shippingAddress: {
      recipientName: { type: String, required: true },
      phone: { type: String, required: true },
      village: { type: String, required: true },
      district: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true }
    },
    paymentMethod: {
      type: String,
      enum: ['Cash on Delivery', 'Kisan Credit / UPI Demo'],
      default: 'Cash on Delivery'
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'dispatched', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed'
    },
    trackingHistory: [trackingUpdateSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);
