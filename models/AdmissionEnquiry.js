// backend/models/AdmissionEnquiry.js
const mongoose = require('mongoose');

const admissionEnquirySchema = new mongoose.Schema({
  visitingDate: { type: Date, required: true },
  session: { type: String, required: true },
  admissionClass: { type: String, required: true },
  studentName: { type: String, required: true, trim: true },
  address: { type: String, trim: true },
  source: { type: String, default: 'Other' },
  remark: { type: String, trim: true },

  fatherName: { type: String, required: true, trim: true },
  motherName: { type: String, trim: true },
  gender: { type: String, enum: ['Male', 'Female'], default: 'Male' },
  dob: { type: Date, required: true },
  fatherMobile: { type: String, required: true },
  motherMobile: { type: String },
  email: { type: String, lowercase: true, trim: true },

  status: { type: String, enum: ['New', 'Contacted', 'Visited', 'Admitted'], default: 'New' }
}, {
  timestamps: true
});

admissionEnquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdmissionEnquiry', admissionEnquirySchema);