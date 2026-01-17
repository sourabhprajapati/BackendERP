// models/Leave.js
const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },

  studentId: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    enum: ["Sick Leave", "Urgent Work", "Family Function", "Other"],
    required: true,
  },

  fromDate: Date,
  toDate: Date,
  isHalfDay: {
    type: Boolean,
    default: false
  },

  days: {
    type: Number,
    required: true,
  },

  reason: {
    type: String,
    maxlength: 500,
    required: true,
  },

  attachment: String,

  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },

  remarks: {
    type: String,
    default: "",
  },

  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Leave", leaveSchema);
