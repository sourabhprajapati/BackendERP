// backend/models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Nested structure matching frontend
  // Nested structure matching frontend
  basic: {
    admissionPrefix: String,
    admissionNo: String,
    anyOtherId: String, // PPP / PEN / Samagra etc.
    academicYear: String,
    class: { type: String, required: true },
    section: { type: String, required: true },
    rollNo: String,
    biometricId: String,
    admissionDate: Date,
    firstName: { type: String, required: true },
    middleName: String,
    lastName: String,
    name: String, // full name
    gender: { type: String, enum: ['Male', 'Female', 'Transgender', 'Other'], required: true },
    dob: Date,
    age: String,
    category: String,
    religion: String,
    caste: String,
    nationality: String,
    motherTongue: String,
    identificationMark: String,
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
    studentStatus: { type: String, enum: ['New', 'Old'], default: 'New' },
    fatherMobile: String,
    pinCode: String,
    isDisability: { type: String, enum: ['Yes', 'No'], default: 'No' },
    isBPL: { type: String, enum: ['Yes', 'No'], default: 'No' },
    residencePhone: String,
    isSingleParent: { type: String, enum: ['Yes', 'No'], default: 'No' },
    isSingleChild: { type: String, enum: ['Yes', 'No'], default: 'No' },
    country: String,
    childLivingWithParents: { type: String, enum: ['Yes', 'No'], default: 'Yes' },
    admissionRemark: String,
  },

  personal: {
    hobby: String,
    familyIncome: String,
    reference: String,
    panNumber: String,
    pen: String,
    srNo: String,
    gstNo: String,
    gstAddress: String,
    shiftTime: String,
    familyMemberDetail: String,
    motherTongue: String,
    lastClass: String,
    lastSchoolName: String,
    lastSchoolMedium: String,
    boardType: String,
    previousMarks: String,
    previousPercentage: String,
    healthIssue: String,
    interviewMarks: String,
    previousSchoolResult: String,
    reasonToLeave: String,
    tcDate: Date,
  },

  // Address details
  address: {
    currentAddress: String,
    permanentAddress: String,
    sameAsCurrent: Boolean,
  },

  // Parents/Guardian details
  parents: {
    father: {
      name: String,
      mobile: String,
      email: String,
      uid: String, // Father's UID
      occupation: String,
      qualification: String,
      annualIncome: String,
      officeContact: String,
      officeAddress: String,
      isSchoolEmployee: { type: String, enum: ['Yes', 'No'], default: 'No' },
      aadhaar: String,
      photo: String,
    },
    mother: {
      name: String,
      mobile: String,
      email: String,
      uid: String, // Mother's UID
      occupation: String,
      qualification: String,
      annualIncome: String,
      officeContact: String,
      officeAddress: String,
      aadhaar: String,
      photo: String,
    },
    guardianDifferent: Boolean,
    guardian: {
      name: String,
      relation: String,
      mobile: String,
      email: String,
      occupation: String,
      aadhaar: String,
      address: String,
      photo: String,
    },
    guardian2: {
      name: String,
      relation: String,
      mobile: String,
      email: String,
      occupation: String,
      aadhaar: String,
      address: String,
      photo: String,
    },
  },

  // Legacy guardians structure (for backward compatibility)
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

  // Previous school details
  previousSchool: {
    name: String,
    lastClass: String,
    medium: { type: String, enum: ['English', 'Hindi', 'Other'] },
    result: String,
    board: String,
    percentage: String,
    reasonToLeave: String,
    tcDate: Date,
    tcNumber: String,
    tcFile: String,
    marksheetFile: String,
  },

  // Transport details
  // transport: {
  //   enabled: Boolean,
  //   route: String,
  //   busStop: String,
  // },

  // Hostel details
  // hostel: {
  //   enabled: Boolean,
  //   hostelName: String,
  //   roomNumber: String,
  // },

  // Health & Emergency
  health: {
    disability: Boolean,
    medical: String,
    height: String,
    weight: String,
    eyes: String,
    bloodGroup: String,
    emergencyName: String,
    emergencyPhone: String,
  },

  // Document checklist
  documentsChecklist: {
    aadhaar: Boolean,
    tc: Boolean,
    birthCertificate: Boolean,
    marksheet: Boolean,
    photos: Boolean,
  },

  // Legacy otherDetails (for backward compatibility)
  otherDetails: {
    currentAddress: String,
    permanentAddress: String,
    feeGroup: String,
    discountList: String,
    discountMonth: String,
    routeList: String,
    busStop: String,
    hostelType: String,
    hostelName: String,
    roomType: String,
    room: String,
    bankAccountNo: String,
    bankName: String,
    branchCode: String,
    ifsc: String,
    rte: String,
    previousSchoolDetails: String,
    note: String,
  },

  documents: [
    {
      title: String,
      fileName: String,
      filePath: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],

  // Status
  status: { type: String, default: 'active' },
}, { timestamps: true });

// Virtual for full name
studentSchema.virtual('fullNameVirtual').get(function () {
  return `${this.basic.firstName} ${this.basic.lastName || ''}`.trim();
});

module.exports = mongoose.model('Studentdetail', studentSchema);