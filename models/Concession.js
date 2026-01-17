const mongoose = require("mongoose");

const concessionSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/* Prevent duplicate category per school */
concessionSchema.index(
  { schoolId: 1, categoryName: 1 },
  { unique: true }
);

module.exports = mongoose.model("Concession", concessionSchema);
