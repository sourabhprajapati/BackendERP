// models/Schoolinfo.js
const mongoose = require('mongoose');

const schoolinfoSchema = new mongoose.Schema({
  schoolName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, unique: true },
  academicSession: { type: String, required: true },
  website: { type: String },
  decisionMaker: { type: String },
  mobileNo: { type: String, required: true },
  decisionMakerRole: { type: String },
  strength: { type: Number },
  affiliationNumber: { type: String },
  registrationNumber: { type: String },

  address: {
    pincode: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    line1: { type: String },
    line2: { type: String }
  },
 bankDetails: {
    bankName: { type: String, trim: true },
    accountHolderName: { type: String, trim: true },
    branchName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    ifscCode: { type: String, trim: true, uppercase: true },
    isDefault: { type: Boolean, default: true }
  }, // ← THIS COMMA WAS MISSING!

  schoolLogo: { type: String },       // e.g., uploads/schoolLogo-123456789.jpg
  tcHeaderLogo: { type: String },

  securitySettings: {
    otpForFeeDiscount: { type: Boolean, default: false },
    discountOtpMobile: { type: String }
  },

  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Schoolinfo', schoolinfoSchema);