const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");
const Qrinfo = require("../models/qrinfo.models");
const User = require("../models/user.model");
const Order = require("../models/order.model");

const router = express.Router();

// ── Admin JWT helpers ──────────────────────────────────
const generateAdminToken = (admin) => {
  return jwt.sign({ id: admin._id, isAdmin: true }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const verifyAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided." });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Not an admin token." });
    }

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Admin not found." });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
};

// ── Admin Login ────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (!admin) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials." });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials." });
    }

    const token = generateAdminToken(admin);
    res.json({
      success: true,
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ success: false, message: "Login failed." });
  }
});

// ── Admin Stats (Enhanced) ─────────────────────────────
router.get("/stats", verifyAdminToken, async (req, res) => {
  try {
    const [totalTags, totalUsers, totalOrders, orders, tags] =
      await Promise.all([
        Qrinfo.countDocuments(),
        User.countDocuments(),
        Order.countDocuments(),
        Order.find()
          .select(
            "name phone address pincode amount paymentStatus orderStatus quantity tagId createdAt",
          )
          .sort({ createdAt: -1 })
          .lean(),
        Qrinfo.find()
          .select("customId category name location phone createdAt createdBy")
          .sort({ createdAt: -1 })
          .lean(),
      ]);

    const totalQRCodes = await Qrinfo.countDocuments({
      imgurl: { $exists: true, $not: { $regex: /^\// } },
    });

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    const totalStickers = orders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + (o.quantity || 1), 0);

    res.json({
      success: true,
      data: {
        totalTags,
        totalUsers,
        totalOrders,
        totalQRCodes,
        totalRevenue,
        totalStickers,
        tags,
        orders,
      },
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch stats." });
  }
});

// ── Admin: Get All Tags ────────────────────────────────
router.get("/tags", verifyAdminToken, async (req, res) => {
  try {
    const tags = await Qrinfo.find()
      .select(
        "customId category name location phone createdAt createdBy imgurl",
      )
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .lean();
    res.json({ success: true, data: tags });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch tags." });
  }
});

// ── Admin: Get All Users ───────────────────────────────
router.get("/users", verifyAdminToken, async (req, res) => {
  try {
    const users = await User.find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch users." });
  }
});

// ── Admin: Delete Tag ──────────────────────────────────
router.delete("/tags/:id", verifyAdminToken, async (req, res) => {
  try {
    await Qrinfo.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Tag deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete tag." });
  }
});

// ── Admin: Update Order Status ─────────────────────────
router.put("/orders/:id/status", verifyAdminToken, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    if (
      !["processing", "shipped", "delivered", "cancelled"].includes(orderStatus)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status." });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true },
    );
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update order." });
  }
});

// ── Verify admin session ───────────────────────────────
router.get("/me", verifyAdminToken, (req, res) => {
  res.json({
    success: true,
    admin: { id: req.admin._id, name: req.admin.name, email: req.admin.email },
  });
});

// ── Admin: Get All Shopkeepers with Stats ─────────────
router.get("/shopkeepers", verifyAdminToken, async (req, res) => {
  try {
    const Commission = require("../models/commission.model");

    // Get all shopkeeper users
    const shopkeepers = await User.find({ role: "shopkeeper" })
      .select("name email referralCode createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Enrich each shopkeeper with their stats
    const enriched = await Promise.all(
      shopkeepers.map(async (sk) => {
        const [commissions, tagsCount, referralCount, orders] =
          await Promise.all([
            Commission.find({ shopkeeperId: sk._id }).lean(),
            Qrinfo.countDocuments({ createdBy: sk._id }),
            User.countDocuments({ referredBy: sk._id }),
            Order.find({ userId: sk._id, paymentStatus: "paid" }).lean(),
          ]);

        const totalCommission = commissions.reduce(
          (s, c) => s + c.commission,
          0,
        );
        const pendingCommission = commissions
          .filter((c) => c.status === "pending")
          .reduce((s, c) => s + c.commission, 0);
        const totalSales = orders.reduce((s, o) => s + (o.amount || 0), 0);
        const totalStickers = orders.reduce((s, o) => s + (o.quantity || 1), 0);

        return {
          ...sk,
          tagsCount,
          referralCount,
          totalStickers,
          totalSales,
          totalCommission,
          pendingCommission,
          paidCommission: totalCommission - pendingCommission,
          commissionEntries: commissions.length,
        };
      }),
    );

    res.json({ success: true, data: enriched });
  } catch (err) {
    console.error("Admin shopkeepers error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch shopkeepers." });
  }
});

// ── Admin: Get Shopkeeper's Commissions ────────────────
router.get(
  "/shopkeepers/:id/commissions",
  verifyAdminToken,
  async (req, res) => {
    try {
      const Commission = require("../models/commission.model");
      const commissions = await Commission.find({ shopkeeperId: req.params.id })
        .sort({ createdAt: -1 })
        .lean();
      res.json({ success: true, data: commissions });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch commissions." });
    }
  },
);

// ── Admin: Update Commission Payment Status ───────────
router.put("/commissions/:id/status", verifyAdminToken, async (req, res) => {
  try {
    const Commission = require("../models/commission.model");
    const { status, paymentNote } = req.body;

    if (!["pending", "paid"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status." });
    }

    const update = { status, paymentNote: paymentNote || "" };
    if (status === "paid") {
      update.paidAt = new Date();
    } else {
      update.paidAt = null;
    }

    const commission = await Commission.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true },
    );

    if (!commission) {
      return res
        .status(404)
        .json({ success: false, message: "Commission not found." });
    }

    res.json({ success: true, data: commission });
  } catch (err) {
    console.error("Commission status update error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update commission." });
  }
});

module.exports = router;
