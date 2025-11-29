// models/School.js
const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  salesExecutive: { type: String, required: true },
  schoolName: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true },
  contactNo: { type: String, required: true },
  contactPerson: { type: String, required: true },
  selectBoard: { type: String, required: true },
  grade: { type: String, required: true },
  strength: { type: String, required: true },
  tpg: { type: Boolean, default: false },
  talentBox: { type: Boolean, default: false },
  distributor: { type: String, enum: ['Direct Supply', 'Other Distributor'], required: true },
  consentFile: { type: String, required: true }, // file path
  loginFile: { type: String, required: true },   // file path
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('School', schoolSchema);