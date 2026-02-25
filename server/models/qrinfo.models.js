const mongoose = require("mongoose");

const qrinfoSchema = new mongoose.Schema(
  {
    track: {
      type: String,
      enum: ["personal", "institute"],
      default: "personal",
    },
    category: {
      type: String,
      enum: [
        "WATER_COOLER",
        "SCHOOL_ASSET",
        "LAB_EQUIPMENT",
        "AIR_CONDITIONER",
        "BUS", // Institutional
        "PERSONAL_ITEM",
        "VEHICLE",
        "ELECTRONICS",
        "SUITCASE",
        "OTHER", // Personal
      ],
      default: "PERSONAL_ITEM",
    },
    customId: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
    },
    location: {
      type: String,
    },
    phone: {
      type: String,
    },
    info: {
      type: String,
    },

    imgurl: {
      type: String,
      default: "/images/1.jpg",
    },
    onlyqrimg: {
      type: String,
      default: "/images/coverdefault.jpg",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true },
);

const Qrinfo = mongoose.model("qrinfo", qrinfoSchema);

module.exports = Qrinfo;
