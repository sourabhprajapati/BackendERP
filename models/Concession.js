// backend/models/Concession.js
const mongoose = require('mongoose');

const concessionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  classGrade: {
    type: String,
    required: true
  },
  parentName: {
    type: String,
    required: true,
    trim: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  siblings: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Concession', concessionSchema);