const mongoose = require('mongoose');

const rollNumberLockSchema = new mongoose.Schema({
    academicYear: { type: String, required: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    isLocked: { type: Boolean, default: false },
}, { timestamps: true });

// Ensure unique combination
rollNumberLockSchema.index({ academicYear: 1, class: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('RollNumberLock', rollNumberLockSchema);
