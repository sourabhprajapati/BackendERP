// models/School.js

const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  // Basic Info
  salesExecutive: {
    type: String,
    required: true,
    trim: true
  },
  schoolName: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  contactNo: {
    type: String,
    required: true
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  selectBoard: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  strength: {
    type: String,
    required: true
  },
  noOfStudents: {
    type: String
  },

  // Product Flags
  tpg: {
    type: Boolean,
    default: false
  },
  talentBox: {
    type: Boolean,
    default: false
  },
  distributor: {
    type: String,
    enum: ['Direct Supply', 'Other Distributor'],
    required: true
  },

  // Files
  consentFile: {
    type: String,     // filename stored
    required: true
  },
  loginFile: {
    type: String,     // filename stored
    required: true
  },

  // Onboarding Status & Credentials
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  username: {
    type: String,
    unique: true,
    sparse: true   // allows null but unique when exists
  },
  password: {
    type: String    // will store hashed password
  },
  plainPassword: String,
  uniqueCode: {
    type: String,
    unique: true,
    sparse: true
  },
  rejectionReason: {
    type: String
  },
  actionDate: {
    type: Date
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries

module.exports = mongoose.model('School', schoolSchema);