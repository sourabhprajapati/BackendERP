// models/DigitalContent.js
const mongoose = require('mongoose');

const digitalContentSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    unique: true // One assignment per school
  },
  assignments: [
    {
      className: { type: String, required: true },
      bookSeries: [
        {
          series: { type: String, required: true },
          subjects: [{ type: String, required: true }]
        }
      ]
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DigitalContent', digitalContentSchema);