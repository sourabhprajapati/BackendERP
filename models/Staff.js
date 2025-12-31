// models/Staff.js
const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  // BASIC INFO
  employeeName: { type: String, required: true, trim: true },
  employeeUserName: { type: String, required: true, unique: true, trim: true },
  dob: { type: String, required: true },
  userType: { type: String, enum: ['Admin', 'Teacher', 'Staff'], required: true },
  designation: { type: String, required: true },
  natureOfAppointment: { type: String },
  joiningDate: { type: String },
  department: { type: String },
  qualification: { type: String },
  experienceYears: { type: String },
  bloodGroup: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
 maritalStatus: { 
  type: String, 
  enum: ['Single', 'Married',  'Prefer not to say',''],
  default: null 
},

  // CONTACT
  mobile: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  emergencyContact: { type: String },
  address: { type: String, required: true },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },

  // BANK & ID
  bankName: { type: String },
  accountNumber: { type: String },
  ifscCode: { type: String },
  panNumber: { type: String },
  aadharNumber: { type: String },

  // DOCUMENTS (filenames stored)
  profilePhoto: { type: String },
  panCard: { type: String },
  dl: { type: String },
  pgCert: { type: String },
  policeVerification: { type: String },
  otherDoc: { type: String },
  aadharCard: { type: String },
  voterId: { type: String },
  ugCert: { type: String },
  bedCert: { type: String },
  experienceCert: { type: String },

  // Metadata
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
});

module.exports = mongoose.model('Staff', staffSchema);