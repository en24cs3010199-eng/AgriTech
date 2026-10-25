const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    phone: {
      type: String,
      required: [true, 'Please provide a contact phone number'],
      trim: true
    },
    role: {
      type: String,
      enum: ['farmer', 'expert', 'admin'],
      default: 'farmer'
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en'
    },
    location: {
      state: { type: String, default: 'Punjab' },
      district: { type: String, default: 'Ludhiana' },
      village: { type: String, default: '' },
      latitude: { type: Number, default: 30.9010 },
      longitude: { type: Number, default: 75.8573 }
    },
    avatar: {
      type: String,
      default: ''
    },
    isVerifiedExpert: {
      type: Boolean,
      default: false
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
