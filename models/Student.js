// models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  admissionNo: { type: String, required: true, unique: true },
  studentRegId: String,
  admissionDate: { type: Date, required: true },
  dob: { type: Date, required: true },
  birthPlace: String,

  firstName: { type: String, required: true },
  middleName: String,
  lastName: String,
  fullName: String, // auto-generated
  class: { type: String, required: true },
  section: { type: String, required: true },
  academicYear: { type: String, required: true },
  gender: { type: String, required: true },
  category: { type: String, default: 'General' },
  bloodGroup: String,
  nationality: { type: String, default: 'Indian' },

  fatherPhone: { type: String, required: true },
  alternatePhone: String,
  email: String,
  aadhaar: String,
  rteEligible: { type: String, default: 'No' },

  currentAddress: String,
  permanentAddress: String,

  fatherName: { type: String, required: true },
  motherName: { type: String, required: true },
  fatherOccupation: String,
  motherOccupation: String,
  fatherAadhaar: String,
  motherAadhaar: String,
  emergencyContact: String,

  siblingName: String,
  siblingClass: String,
  siblingAdmissionNo: String,

  previousSchoolName: String,
  previousClass: String,
  previousPercentage: Number,

  height: Number,
  weight: Number,
  medicalCondition: String,
  doctorRemark: String,

  guardianName: String,
  relation: String,
  guardianPhone: String,
  guardianAddress: String,

  transportRequired: { type: String, default: 'No' },
  transportRoute: String,
  additionalNotes: String,
}, { timestamps: true });

// Auto generate fullName before saving
studentSchema.pre('save', function(next) {
  this.fullName = [this.firstName, this.middleName, this.lastName]
    .filter(Boolean)
    .join(' ');
  next();
});

module.exports = mongoose.model('Student', studentSchema);