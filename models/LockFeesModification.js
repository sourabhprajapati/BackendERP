const mongoose = require("mongoose");

const lockFeesModificationSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true, // only one lock per school
    },
    lockUptoDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "LockFeesModification",
  lockFeesModificationSchema
);
