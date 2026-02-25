const express = require("express");
const crypto = require("crypto");
const Order = require("../models/order.model");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

// ── Initialize Razorpay once at startup ────────────────
let razorpayInstance = null;
const rzpKeyId = (process.env.RAZORPAY_KEY_ID || "").trim();
const rzpKeySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

if (rzpKeyId && rzpKeySecret) {
  try {
    const Razorpay = require("razorpay");
    razorpayInstance = new Razorpay({
      key_id: rzpKeyId,
      key_secret: rzpKeySecret,
    });
    console.log("✅ Razorpay initialized with key:", rzpKeyId);
  } catch (err) {
    console.error("❌ Razorpay init failed:", err.message);
  }
} else {
  console.warn("⚠️ Razorpay keys not found in .env — payment gateway disabled");
}

// ── Helper: Calculate price based on quantity ──────────
const calculatePrice = (qty) => {
  if (qty >= 10) return qty * 49;
  return qty * 59;
};

// ── Create Razorpay Order ──────────────────────────────
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { tagId, name, phone, address, pincode, quantity = 1 } = req.body;

    if (!tagId || !name || !phone || !address || !pincode) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const amount = calculatePrice(quantity);

    // Create Razorpay order if initialized
    let razorpayOrderId = null;
    if (razorpayInstance) {
      try {
        const razorpayOrder = await razorpayInstance.orders.create({
          amount: amount * 100, // Razorpay works in paise
          currency: "INR",
          receipt: `order_${Date.now()}`,
          notes: {
            tagId,
            userId: req.user._id.toString(),
          },
        });
        razorpayOrderId = razorpayOrder.id;
      } catch (rzpErr) {
        console.error("Razorpay order creation error:", rzpErr.message);
      }
    }

    const order = new Order({
      userId: req.user._id,
      tagId,
      name,
      phone,
      address,
      pincode,
      quantity,
      amount,
      razorpayOrderId,
      paymentStatus: razorpayOrderId ? "pending" : "pending",
    });

    await order.save();

    res.json({
      success: true,
      order: {
        id: order._id,
        amount,
        razorpayOrderId,
        razorpayKeyId: rzpKeyId || null,
      },
    });
  } catch (err) {
    console.error("Order create error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to create order." });
  }
});

// ── Verify Razorpay Payment ────────────────────────────
router.post("/verify", verifyToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Missing payment details." });
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (secret) {
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return res
          .status(400)
          .json({ success: false, message: "Payment verification failed." });
      }
    }

    // Update order
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    order.paymentStatus = "paid";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    await order.save();

    // ── Award commissions for sticker orders (non-blocking) ──
    try {
      const Commission = require("../models/commission.model");
      const User = require("../models/user.model");
      const fullUser = await User.findById(req.user._id);
      const commissionRate = 5;
      const commissionAmount = Math.round(
        (order.amount * commissionRate) / 100,
      );

      console.log(
        "Sticker commission check — user role:",
        fullUser?.role,
        "referredBy:",
        fullUser?.referredBy,
      );

      // If buyer is shopkeeper → self-commission on sticker order
      if (fullUser && fullUser.role === "shopkeeper") {
        const c = await new Commission({
          shopkeeperId: fullUser._id,
          type: "sticker_order",
          orderId: order._id,
          tagId: order.tagId,
          sourceUserId: fullUser._id,
          amount: order.amount,
          commission: commissionAmount,
          rate: commissionRate,
        }).save();
        console.log("✅ Shopkeeper sticker commission saved:", c._id);
      }

      // If buyer was referred by a shopkeeper → referral commission
      if (fullUser && fullUser.referredBy) {
        const referrer = await User.findById(fullUser.referredBy);
        if (referrer && referrer.role === "shopkeeper") {
          const c = await new Commission({
            shopkeeperId: referrer._id,
            type: "referral_sticker",
            orderId: order._id,
            tagId: order.tagId,
            sourceUserId: fullUser._id,
            amount: order.amount,
            commission: commissionAmount,
            rate: commissionRate,
          }).save();
          console.log("✅ Referral sticker commission saved:", c._id);
        }
      }
    } catch (commErr) {
      console.error(
        "⚠️ Sticker commission error (non-blocking):",
        commErr.message,
      );
    }

    res.json({ success: true, message: "Payment verified successfully!" });
  } catch (err) {
    console.error("Payment verify error:", err);
    res
      .status(500)
      .json({ success: false, message: "Payment verification failed." });
  }
});

// ── Get User's Own Orders ──────────────────────────────
router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: orders });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch orders." });
  }
});

module.exports = router;
