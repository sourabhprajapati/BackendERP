const mongoose = require("mongoose");

const amountSchema = new mongoose.Schema(
  {
    new: { type: Number, default: 0 },
    old: { type: Number, default: 0 },
  },
  { _id: false }
);

const classFeeAllocationSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    feeName: {
      type: String,
      required: true,
    },

    // ✅ DYNAMIC CONCESSIONS
    concessions: {
      type: Map,
      of: amountSchema,
      default: {},
    },
  },
  { timestamps: true }
);

/* One fee per class */
classFeeAllocationSchema.index(
  { schoolId: 1, className: 1, feeName: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "ClassFeeAllocation",
  classFeeAllocationSchema
);
