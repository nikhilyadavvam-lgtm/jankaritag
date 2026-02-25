const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema(
  {
    shopkeeperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    type: {
      type: String,
      enum: ["qr_creation", "sticker_order", "referral_qr", "referral_sticker"],
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    tagId: {
      type: String,
    },
    sourceUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    amount: {
      type: Number,
      required: true,
    },
    commission: {
      type: Number,
      required: true,
    },
    rate: {
      type: Number,
      default: 5,
    },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paymentNote: {
      type: String,
      default: "",
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const Commission = mongoose.model("Commission", commissionSchema);

module.exports = Commission;
