// models/ClassTeacherAssignment.js
const mongoose = require('mongoose');

const classTeacherAssignmentSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  className: {
    type: String,
    required: true,
    trim: true,
    // enum: [
    //   'Nursery', 'LKG', 'UKG',
    //   '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th',
    //   // Add more classes if needed
    // ],
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff', // Optional: who assigned it (admin)
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Ensure only one teacher per class per school
classTeacherAssignmentSchema.index(
  { schoolId: 1, className: 1 },
  { unique: true }
);

module.exports = mongoose.model('ClassTeacherAssignment', classTeacherAssignmentSchema);