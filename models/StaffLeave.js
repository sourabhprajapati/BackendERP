// models/StaffLeave.js
const mongoose = require('mongoose');

const staffLeaveSchema = new mongoose.Schema({
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
  leaveType: {
    type: String,
    enum: [
      'Casual Leave',
      'Paid Leave',
      'Special Leave',
      'Loss to Pay',
      'Comp-off',
      'Work From Home',
      'On Duty'
    ],
    required: true
  },
  fromDate: { type: String, required: true },          // Format: DD-MM-YYYY
  fromSession: {
    type: String,
    enum: ['Session 1', 'Session 2', 'Full Day'],
    default: 'Full Day'
  },
  toDate: { type: String, required: true },            // Format: DD-MM-YYYY
  toSession: {
    type: String,
    enum: ['Session 1', 'Session 2', 'Full Day'],
    default: 'Full Day'
  },
  days: { type: Number, required: true, min: 0.5 },
  reason: { type: String, trim: true, required: true },
  contactDetails: { type: String, trim: true },
  attachment: { type: String },                        // filename from multer
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Pending'
  },
  appliedBy: { type: String, required: true },         // name of person who applied
  appliedOn: {
    type: String,
    default: () => new Date().toLocaleDateString('en-GB')
  },
  approvedBy: { type: String },
  approvedOn: { type: String },
  remarks: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

// Useful indexes
staffLeaveSchema.index({ staff: 1, status: 1 });
staffLeaveSchema.index({ schoolId: 1, status: 1 });
staffLeaveSchema.index({ fromDate: 1 });

module.exports = mongoose.model('StaffLeave', staffLeaveSchema);