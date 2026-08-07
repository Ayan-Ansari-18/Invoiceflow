const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
      select: false, // never returned in queries by default
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
      default: null,
    },
    businessName: {
      type: String,
      trim: true,
      maxlength: [200, 'Business name cannot exceed 200 characters'],
    },
    businessAddress: {
      type: String,
      trim: true,
    },
    businessPhone: {
      type: String,
      trim: true,
    },
    GSTIN: {
      type: String,
      trim: true,
      match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GSTIN'],
      default: null,
    },
    logo: {
      type: String, // URL (Cloudinary / S3)
      default: null,
    },
    signature: {
      type: String, // URL / base64 for signature image
      default: null,
    },
    brandColor: {
      type: String,
      default: '#6366f1', // indigo-500
    },
    invoicePrefix: {
      type: String,
      default: 'INV',
      maxlength: [10, 'Prefix cannot exceed 10 characters'],
    },
    invoiceCounter: {
      type: Number,
      default: 0,
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'business'],
      default: 'free',
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    // Gmail OAuth tokens
    gmailAccessToken: { type: String, default: null, select: false },
    gmailRefreshToken: { type: String, default: null, select: false },
    gmailConnected: { type: Boolean, default: false },
    gmailEmail: { type: String, default: null },
    // Password Reset
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Never return passwordHash in JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
