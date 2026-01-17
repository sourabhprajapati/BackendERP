const mongoose = require("mongoose");

const promotionHistorySchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    fromClass: {
      type: String,
      required: true,
    },
    toClass: {
      type: String,
      required: true,
    },
    fromSection: {
      type: String,
      required: true,
    },
    toSection: {
      type: String,
      required: true,
    },
    fromSession: {
      type: String,
      required: true,
    },
    toSession: {
      type: String,
      required: true,
    },
    promotedAt: {
      type: Date,
      default: Date.now,
    },
    promotedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "PromotionHistory",
  promotionHistorySchema
);
