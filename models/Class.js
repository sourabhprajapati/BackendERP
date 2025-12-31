// backend/models/Class.js
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  baseName: {
    type: String,
    required: true,
    trim: true
  },
  sections: [{
    type: String,
    uppercase: true,
    trim: true
  }]
}, { timestamps: true });

// Unique index
classSchema.index({ baseName: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);