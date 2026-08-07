const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, 'Item description is required'],
      trim: true,
    },
    qty: {
      type: Number,
      required: true,
      min: [0.01, 'Quantity must be greater than 0'],
    },
    rate: {
      type: Number,
      required: true,
      min: [0, 'Rate cannot be negative'],
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const additionalChargeSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    name: { type: String },
    mode: { type: String, enum: ['Fixed Amount', 'Percentage'], required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const discountSchema = new mongoose.Schema(
  {
    mode: { type: String, enum: ['Fixed Amount', 'Percentage'], required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      default: null,
    },
    // Snapshot of client info (in case client is deleted later)
    clientSnapshot: {
      name: String,
      email: String,
      phone: String,
      address: String,
      GSTIN: String,
      country: { type: String, default: 'India' },
    },
    lineItems: {
      type: [lineItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'At least one line item is required',
      },
    },
    additionalCharges: {
      type: [additionalChargeSchema],
      default: [],
    },
    discount: {
      type: discountSchema,
      default: null,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    gstPercent: {
      type: Number,
      enum: [0, 5, 12, 18, 28],
      default: 18,
    },
    gstAmount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ['INR', 'USD', 'EUR', 'GBP', 'AED'],
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'viewed', 'paid', 'overdue'],
      default: 'draft',
      index: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    terms: {
      type: String,
      trim: true,
      maxlength: [1000, 'Terms cannot exceed 1000 characters'],
    },
    paymentLink: {
      type: String,
      trim: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', null],
      default: null,
    },
    pdfUrl: {
      type: String,
      default: null,
    },
    emailSentAt: {
      type: [Date],
      default: [],
    },
  },
  { timestamps: true }
);

// Compound index for efficient user+status queries
invoiceSchema.index({ userId: 1, status: 1 });
invoiceSchema.index({ userId: 1, dueDate: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
