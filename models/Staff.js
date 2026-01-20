// models/Staff.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Add this for password hashing

const staffSchema = new mongoose.Schema({
  // BASIC INFO
  employeeName: { type: String, required: true, trim: true },
  employeeUserName: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, // Will be hashed
  fatherName: { type: String },
  dob: { type: String, required: true },
  userType: {
  type: String,
  enum: [
    'Admin',
    'Authority',
    'Principal',
    'Vice Principal',
    'Administrative Officer',
    'Accounts',
    'Teacher',
    'Librarian',
    'Front Office',
    'Office Staff',
    'Transport Manager',
    'Driver',
    'Conductor',
    'Attendant',
    'Security',
    'Book Scanner',
    'Warden',
    'Others'
  ],
  required: true
},

  designation: { type: String, required: true },
  natureOfAppointment: { type: String },
  joiningDate: { type: String },
  leavingDate: { type: String },
  department: { type: String },
  qualification: { type: String },
  experienceYears: { type: String },
  bloodGroup: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  maritalStatus: { 
    type: String, 
    enum: ['Married', 'Unmarried', 'Widowed', 'Divorced', 'Separated'],
    default: 'Unmarried'
  },

  // NEW FIELDS
  kindOfTeacher: { type: String },
  teachingClass: [{ type: String }], // Array: PRT, Secondary, Sr. Secondary

  // CONTACT
  mobile: { type: String, required: true }, // Primary mobile (mobile1)
  mobile2: { type: String }, // Secondary mobile
  email: { type: String, required: true, lowercase: true, trim: true },
  emergencyContact: { type: String },
  address: { type: String, required: true },
  otherComments: { type: String },
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

// Hash password before saving
staffSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

module.exports = mongoose.model('Staff', staffSchema);