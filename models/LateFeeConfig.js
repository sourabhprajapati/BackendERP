const mongoose = require("mongoose");

const lateFeeConfigSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true, // one config per school
    },
    mode: {
      type: String,
      enum: ["ONETIME", "PERDAY"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    applyAfterDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LateFeeConfig", lateFeeConfigSchema);
