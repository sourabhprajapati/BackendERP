// backend/models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Nested structure matching frontend
  basic: {
    admissionPrefix: String,
    admissionNo: String,
    class: { type: String, required: true },
    section: { type: String, required: true },
    rollNo: String,
    biometricId: String,
    admissionDate: Date,
    firstName: { type: String, required: true },
    lastName: String,
    name: String, // full name
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    dob: Date,
    category: String,
    religion: String,
    caste: String,
    mobile: String,
    email: String,
    bloodGroup: String,
    house: String,
    height: String,
    weight: String,
    aadhaar: String,
    admittedClass: String,
    asOnDate: Date,
    photo: String, // student photo path
  },

  personal: {
    hobby: String,
    familyIncome: String,
    reference: String,
    panNumber: String,
    pen: String,
    srNo: String,
  },

  guardians: {
    father: {
      name: String,
      phone: String,
      dob: Date,
      occupation: String,
      photo: String,
    },
    mother: {
      name: String,
      phone: String,
      dob: Date,
      occupation: String,
      photo: String,
    },
    guardianIs: { type: String, enum: ['father', 'mother', 'other'] },
    guardian: {
      name: String,
      relation: String,
      email: String,
      phone: String,
      occupation: String,
      address: String,
      photo: String,
    },
    marriageAnniversary: Date,
  },

  documents: [
    {
      title: String,
      filePath: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],

  // Status
  status: { type: String, default: 'active' },
}, { timestamps: true });

// Virtual for full name
studentSchema.virtual('fullNameVirtual').get(function() {
  return `${this.basic.firstName} ${this.basic.lastName || ''}`.trim();
});

module.exports = mongoose.model('Studentdetail', studentSchema);