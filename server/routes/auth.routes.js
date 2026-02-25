const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Register (supports user + shopkeeper roles)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, referralCode } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered." });
    }

    // Determine role
    let userRole = "user";
    let referredBy = null;

    if (email === process.env.ADMIN_EMAIL?.trim()) {
      userRole = "admin";
    } else if (role === "shopkeeper") {
      userRole = "shopkeeper";
    }

    // If a referral code is provided, find the shopkeeper who referred
    if (referralCode && referralCode.trim()) {
      const referrer = await User.findOne({
        referralCode: referralCode.trim().toUpperCase(),
        role: "shopkeeper",
      });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    const user = new User({
      name,
      email,
      password,
      role: userRole,
      referredBy,
    });
    await user.save();

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Registration failed." });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Login failed." });
  }
});

// Get current user
router.get("/me", verifyToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      referralCode: req.user.referralCode || null,
      commissionRate: req.user.commissionRate || 5,
    },
  });
});

module.exports = router;
