// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['SALES', 'ADMIN'],
    default: 'SALES',
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  tempPlainPassword: {
  type: String,
  select: false   // hidden by default, we force-include with +tempPlainPassword
}
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);