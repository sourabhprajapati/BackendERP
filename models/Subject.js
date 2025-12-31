const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    area: {
      type: String
    },

    addInExam: {
      type: String
    },

    type: {
      type: String
    },

    classes: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);