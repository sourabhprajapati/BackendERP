const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  admissionNo: {
    type: Number,
    required: true,
    unique: true
  },
  studentName: {
    type: String,
    required: true
  },
  fatherName: {
    type: String,
    required: true
  },
  className: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  session: {
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

module.exports = mongoose.model('Student', studentSchema);
