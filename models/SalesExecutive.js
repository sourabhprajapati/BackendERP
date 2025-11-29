// models/SalesExecutive.js
const mongoose = require('mongoose');

const salesExecutiveSchema = new mongoose.Schema({
  code: {
    type: String,
   
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SalesExecutive', salesExecutiveSchema);