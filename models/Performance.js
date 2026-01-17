const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  class: { type: String, required: true },
  section: { type: String, required: true },
  examName: { type: String, required: true }, // Test 1, Test 2, Half-Yearly, Annual-Exams
  subjectArea: { type: String, required: true }, // Scholastic, Co-Scholastic, Other Subjects, Additional Subjects
  subject: { type: String, required: true }, // Hindi, English, Mathematics, Science etc.
  academicYear: {
    type: String, default: () => {
      const now = new Date();
      const year = now.getFullYear();
      return `${year}-${year + 1}`;
    }
  },
  records: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Studentdetail', required: true },
    admissionNo: { type: String, required: true },
    rollNo: { type: String },
    studentName: { type: String, required: true },
    marks: { type: Number, min: 0 },
    status: { type: String, enum: ['MARKS', 'AB', 'ML'], default: 'MARKS' }, // MARKS = has marks, AB = Absent, ML = Medical Leave
    grade: { type: String }, // Optional grade
    remarks: { type: String }
  }],
  totalStudents: { type: Number, default: 0 },
  markedBy: { type: String }, // Teacher who entered the marks
  isPublished: { type: Boolean, default: false }, // Whether results are published to students
  publishedAt: { type: Date }
}, { timestamps: true });

// Compound index to ensure unique performance entry per class/section/exam/subjectArea/subject
performanceSchema.index({
  class: 1,
  section: 1,
  examName: 1,
  subjectArea: 1,
  subject: 1,
  academicYear: 1
}, { unique: true });

// Virtual for formatted exam display
performanceSchema.virtual('examDisplay').get(function () {
  return `${this.examName} - ${this.subjectArea}`;
});

module.exports = mongoose.model('Performance', performanceSchema);
