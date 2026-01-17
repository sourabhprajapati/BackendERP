const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    feeName: {
      type: String,
      required: true,
      trim: true,
    },
    feeType: {
      type: String,
      enum: ["classWise", "studentWise"],
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["MONTHLY", "QUARTERLY", "HALFYEARLY", "YEARLY"],
      required: true,
    },
    month: {
      type: String, // "Every", "April", etc.
      required: true,
    },
  },
  { timestamps: true }
);

/* Prevent duplicate fee per school */
feeSchema.index(
  { schoolId: 1, feeName: 1 },
  { unique: true }
);

module.exports = mongoose.model("Fee", feeSchema);
