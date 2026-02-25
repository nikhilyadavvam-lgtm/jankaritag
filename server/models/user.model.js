const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin", "shopkeeper"],
      default: "user",
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    commissionRate: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true },
);

// Generate referral code for shopkeepers before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password") && !this.isModified("role")) {
    // Only run hooks when password or role changes
    if (this.role === "shopkeeper" && !this.referralCode) {
      this.referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();
    }
    return;
  }

  // Hash password if modified
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // Generate referral code for new shopkeepers
  if (this.role === "shopkeeper" && !this.referralCode) {
    this.referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("user", userSchema);

module.exports = User;
