const express = require("express");
const { verifyToken } = require("../middleware/auth.middleware");
const User = require("../models/user.model");
const Qrinfo = require("../models/qrinfo.models");
const Order = require("../models/order.model");

const router = express.Router();

// Middleware: Verify shopkeeper role
const verifyShopkeeper = async (req, res, next) => {
  if (req.user.role !== "shopkeeper") {
    return res
      .status(403)
      .json({ success: false, message: "Shopkeeper access required." });
  }
  next();
};

// ── Shopkeeper Stats ───────────────────────────────────
router.get("/stats", verifyToken, verifyShopkeeper, async (req, res) => {
  try {
    const Commission = require("../models/commission.model");

    // Find users referred by this shopkeeper
    const referredUsers = await User.find({ referredBy: req.user._id })
      .select("name email createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const referredUserIds = referredUsers.map((u) => u._id);

    // Count tags created by shopkeeper
    const ownTagsCount = await Qrinfo.countDocuments({
      createdBy: req.user._id,
    });

    // Count tags created by referred users
    const referredTagsCount = await Qrinfo.countDocuments({
      createdBy: { $in: referredUserIds },
    });

    // Get orders from referred users (paid only)
    const referredOrders = await Order.find({
      userId: { $in: referredUserIds },
      paymentStatus: "paid",
    })
      .select("amount quantity createdAt")
      .lean();

    const totalRevenue = referredOrders.reduce(
      (sum, o) => sum + (o.amount || 0),
      0,
    );
    const totalStickers = referredOrders.reduce(
      (sum, o) => sum + (o.quantity || 1),
      0,
    );

    // Get actual commission data from Commission model
    const commissions = await Commission.find({ shopkeeperId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const totalCommission = commissions.reduce((s, c) => s + c.commission, 0);
    const pendingCommission = commissions
      .filter((c) => c.status === "pending")
      .reduce((s, c) => s + c.commission, 0);
    const paidCommission = totalCommission - pendingCommission;

    const commissionRate = req.user.commissionRate || 5;

    res.json({
      success: true,
      data: {
        referralCode: req.user.referralCode,
        commissionRate,
        totalReferredUsers: referredUsers.length,
        ownTagsCount,
        referredTagsCount,
        totalStickers,
        totalRevenue,
        totalCommission,
        pendingCommission,
        paidCommission,
        commissions,
        referredUsers,
      },
    });
  } catch (err) {
    console.error("Shopkeeper stats error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch stats." });
  }
});

// ── List Referred Users ────────────────────────────────
router.get("/referrals", verifyToken, verifyShopkeeper, async (req, res) => {
  try {
    const referredUsers = await User.find({ referredBy: req.user._id })
      .select("name email createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: referredUsers });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch referrals." });
  }
});

module.exports = router;
