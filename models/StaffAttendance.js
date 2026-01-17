// models/StaffAttendance.js
const mongoose = require('mongoose');

const staffAttendanceSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  date: {
    type: String, // Format: DD-MM-YYYY (same as frontend)
    required: true
  },
  attendance: {
    type: String,
    enum: ['Present', 'Late', 'Absent', 'Half Day', 'Holiday', 'Leave'],
    required: true
  },
  markedBy: {
    type: String, // admin name / user who marked (optional)
  },
  remarks: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

// Compound index to prevent duplicate attendance for same staff on same date
staffAttendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('StaffAttendance', staffAttendanceSchema);