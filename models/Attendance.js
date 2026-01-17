const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      set: (d) => {
        const date = new Date(d);
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      }
    },

    // 🔥 IMPORTANT: must match controller (className)
    className: {
      type: String,
      required: true,
      trim: true
    },

    section: {
      type: String,
      required: true,
      trim: true
    },

    records: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'StudentDetail', // ✅ fixed casing
          required: true
        },

        admissionNo: {
          type: String,
          required: true,
          trim: true
        },

        rollNo: {
          type: String,
          trim: true
        },

        name: {
          type: String,
          required: true,
          trim: true
        },

        status: {
          type: String,
          enum: ['Present', 'Absent', 'Leave', 'Holiday'],
          required: true
        },

        inTime: {
          type: String,
          default: ''
        },

        outTime: {
          type: String,
          default: ''
        },

        note: {
          type: String,
          default: ''
        }
      }
    ],

    markedBy: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

// ✅ One attendance per day per class/section
attendanceSchema.index(
  { date: 1, className: 1, section: 1 },
  { unique: true }
);

// ✅ Fast student-wise queries
attendanceSchema.index({ 'records.admissionNo': 1 });
attendanceSchema.index({ 'records.studentId': 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
