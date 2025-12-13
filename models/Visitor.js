// backend/models/Visitor.js

const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '-',
    },
    phone: {
      type: String,
      trim: true,
    },
    persons: {
      type: Number,
      default: 1,
      min: 1,
    },
    idCard: {
      type: String,
      trim: true,
    },
    date: {
      type: String,           // Stored as DD-MM-YYYY (e.g., 02-12-2025)
      required: true,
    },
    inTime: {
      type: String,           // e.g., "14:30"
      required: true,
    },
    outTime: {
      type: String,
      default: '-',
    },
    attachment: {
      type: String,           // Path like "/uploads/visitor-123456789.jpg"
      default: null,
    },
    note: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: String,
      default: 'Super',
    },
  },
  {
    timestamps: true,         // Automatically adds createdAt & updatedAt
  }
);

// Optional: Index for faster queries (recommended)
visitorSchema.index({ date: -1, createdAt: -1 });

module.exports = mongoose.model('Visitor', visitorSchema);