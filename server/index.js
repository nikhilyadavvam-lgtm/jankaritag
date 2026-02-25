const express = require("express");
const path = require("path");
const dotenv = require("dotenv/config");
const cors = require("cors");
const connectDB = require("./connection");

const { generateQR } = require("./controllers/qr.controller");
const Qrinfo = require("./models/qrinfo.models");
const Commission = require("./models/commission.model");
const { verifyToken } = require("./middleware/auth.middleware");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const orderRoutes = require("./routes/order.routes");
const shopkeeperRoutes = require("./routes/shopkeeper.routes");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "http://127.0.0.1:5174",
      "https://www.jankaritag.in",
      "https://jankaritag.vercel.app/",
    ],
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const Admin = require("./models/admin.model");

// DB Connection + seed admin
connectDB(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    // Seed default admin if doesn't exist
    try {
      const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
      const adminPass = (process.env.ADMIN_PASSWORD || "").trim();
      if (adminEmail && adminPass) {
        const admin = await Admin.findOne({ email: adminEmail });
        if (!admin) {
          await Admin.create({
            name: "Admin",
            email: adminEmail,
            password: adminPass,
          });
          console.log("Default admin account created:", adminEmail);
        } else {
          // Ensure password is up to date with .env
          admin.password = adminPass;
          await admin.save();
          console.log("Admin account password verified/updated:", adminEmail);
        }
      }
    } catch (err) {
      console.error("Admin seed error:", err.message);
    }
  })
  .catch((err) => console.error(err));

// Auth & Admin Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/shopkeeper", shopkeeperRoutes);
app.get("/api/config", (req, res) => {
  res.json({
    success: true,
    data: {
      tracks: [
        {
          id: "WATER_COOLER",
          title: "Water Cooler",
          desc: "Track cleaning dates, maintenance, and hygiene records for water coolers. Anyone can scan the QR and see the details instantly.",
          icon: "ri-drop-fill",
          items: ["Cleaning Dates", "Cleaner Name", "Location", "Maintenance"],
        },
        {
          id: "VEHICLE",
          title: "Vehicle",
          desc: "Keep your vehicle safe with a smart QR tag. If someone finds your vehicle, they can scan the QR and contact you immediately.",
          icon: "ri-car-fill",
          items: ["Owner Info", "Contact", "Location", "Vehicle Details"],
        },
      ],
      plans: [
        {
          name: "Normal User",
          price: "₹120",
          period: "/service",
          color: "border-black",
          highlight: false,
          features: [
            "5 QR codes per month",
            "Online service included",
            "Physical sticker: ₹59",
            "Scan & view tag details",
            "Email support",
          ],
          cta: "Get Started",
        },
        {
          name: "Shopkeeper",
          price: "₹120",
          period: "/setup",
          color: "border-orange-600",
          highlight: true,
          features: [
            "49 QR codes per month",
            "Stick JTag on customer vehicles",
            "Earn 5% commission",
            "Save on sticker printing",
            "No delivery charges",
          ],
          cta: "Join as Shopkeeper",
        },
        {
          name: "Institute",
          price: "₹3,000",
          period: "/month",
          color: "border-black",
          highlight: false,
          features: [
            "100 QR codes per month",
            "Cleaning & repair alerts",
            "Asset tracking dashboard",
            "Bulk sticker management",
            "Priority support",
          ],
          cta: "Contact Us",
        },
      ],
    },
  });
});

// API Routes

// Generate QR code (public)
app.get("/api/genqrcode", generateQR);

// Create new QR info — everyone pays ₹120
// Step 1: Initiate payment
app.post("/api/qrinfo/initiate", verifyToken, async (req, res) => {
  try {
    const { customId, category, name, location, phone, info, customerEmail } =
      req.body;
    if (!customId || !location) {
      return res
        .status(400)
        .json({ success: false, message: "Tag ID and location are required." });
    }

    // Check if customId already exists
    const existing = await Qrinfo.findOne({ customId });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "This Tag ID already exists." });
    }

    const isDev = (process.env.DEV_MODE || "").trim().toLowerCase() === "true";

    // ── DEV MODE: Skip payment entirely ──
    if (isDev) {
      console.log("🔧 [DEV] Bypassing payment for tag creation:", customId);
      return res.json({
        success: true,
        devMode: true,
        requiresPayment: false,
        amount: 0,
      });
    }

    // Everyone pays ₹120
    const amount = 120;
    let razorpayOrderId = null;

    try {
      const Razorpay = require("razorpay");
      const rzpKeyId = (process.env.RAZORPAY_KEY_ID || "").trim();
      const rzpKeySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

      if (rzpKeyId && rzpKeySecret) {
        const razorpay = new Razorpay({
          key_id: rzpKeyId,
          key_secret: rzpKeySecret,
        });
        const razorpayOrder = await razorpay.orders.create({
          amount: amount * 100,
          currency: "INR",
          receipt: `tag_${Date.now()}`,
          notes: { customId, userId: req.user._id.toString() },
        });
        razorpayOrderId = razorpayOrder.id;
      }
    } catch (rzpErr) {
      console.error("Razorpay tag payment init error:", rzpErr.message);
    }

    if (!razorpayOrderId) {
      return res.status(500).json({
        success: false,
        message: "Payment gateway unavailable. Please try again.",
      });
    }

    res.json({
      success: true,
      requiresPayment: true,
      amount,
      razorpayOrderId,
      razorpayKeyId: (process.env.RAZORPAY_KEY_ID || "").trim(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to initiate tag creation.",
    });
  }
});

// Step 2: Verify payment and create tag
app.post("/api/qrinfo/verify-and-create", verifyToken, async (req, res) => {
  try {
    const isDev = (process.env.DEV_MODE || "").trim().toLowerCase() === "true";

    // ── DEV MODE: Create tag directly without payment verification ──
    if (isDev) {
      const { tagData } = req.body;
      if (!tagData) {
        return res
          .status(400)
          .json({ success: false, message: "Missing tag details." });
      }

      const tagPayload = {
        ...tagData,
        createdBy: req.user._id,
      };
      if (tagData.customerEmail && req.user.role === "shopkeeper") {
        tagPayload.customerEmail = tagData.customerEmail.trim().toLowerCase();
      }
      const qrinfo = new Qrinfo(tagPayload);
      await qrinfo.save();

      console.log("🔧 [DEV] Tag created without payment:", qrinfo.customId);

      return res.json({
        success: true,
        customId: qrinfo.customId,
        message: "[DEV] Tag created without payment!",
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      tagData,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !tagData
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing payment or tag details." });
    }

    // Verify Razorpay signature
    const crypto = require("crypto");
    const secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed." });
    }

    // Payment verified — create the tag
    const tagPayload = {
      ...tagData,
      createdBy: req.user._id,
    };
    // If shopkeeper created this for a customer, store customerEmail
    if (tagData.customerEmail && req.user.role === "shopkeeper") {
      tagPayload.customerEmail = tagData.customerEmail.trim().toLowerCase();
    }
    const qrinfo = new Qrinfo(tagPayload);
    await qrinfo.save();

    // Save payment record in Order collection
    const Order = require("./models/order.model");
    const paymentRecord = new Order({
      userId: req.user._id,
      tagId: qrinfo.customId,
      name: tagData.name || req.user.name,
      phone: tagData.phone || "N/A",
      address: "Online Service",
      pincode: "000000",
      quantity: 1,
      amount: 120,
      paymentStatus: "paid",
      orderStatus: "delivered",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });
    await paymentRecord.save();

    // ── Award commissions (non-blocking) ──
    try {
      const User = require("./models/user.model");
      const fullUser = await User.findById(req.user._id);
      const commissionRate = 5;
      const commissionAmount = Math.round((120 * commissionRate) / 100);

      console.log(
        "Commission check — user role:",
        fullUser?.role,
        "referredBy:",
        fullUser?.referredBy,
      );

      // If creator is shopkeeper → self-commission on QR creation
      if (fullUser && fullUser.role === "shopkeeper") {
        const c = await new Commission({
          shopkeeperId: fullUser._id,
          type: "qr_creation",
          orderId: paymentRecord._id,
          tagId: qrinfo.customId,
          sourceUserId: fullUser._id,
          amount: 120,
          commission: commissionAmount,
          rate: commissionRate,
        }).save();
        console.log(
          "✅ Shopkeeper self-commission saved:",
          c._id,
          "₹" + commissionAmount,
        );
      }

      // If creator was referred by a shopkeeper → referral commission
      if (fullUser && fullUser.referredBy) {
        const referrer = await User.findById(fullUser.referredBy);
        if (referrer && referrer.role === "shopkeeper") {
          const c = await new Commission({
            shopkeeperId: referrer._id,
            type: "referral_qr",
            orderId: paymentRecord._id,
            tagId: qrinfo.customId,
            sourceUserId: fullUser._id,
            amount: 120,
            commission: commissionAmount,
            rate: commissionRate,
          }).save();
          console.log(
            "✅ Referral commission saved:",
            c._id,
            "for shopkeeper:",
            referrer._id,
          );
        }
      }
    } catch (commErr) {
      console.error(
        "⚠️ Commission save error (non-blocking):",
        commErr.message,
      );
    }

    res.json({
      success: true,
      customId: qrinfo.customId,
      message: "Payment verified and tag created!",
    });
  } catch (err) {
    console.error("Tag verify-and-create error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to create tag.",
    });
  }
});

// Get QR info for updating (requires login + ownership)
app.get("/api/update", verifyToken, async (req, res) => {
  try {
    const customId = req.query.customId;
    const qrinfo = await Qrinfo.findOne({ customId });

    if (!qrinfo) {
      return res
        .status(404)
        .json({ success: false, message: "No record found" });
    }

    // Check ownership: allow createdBy OR customerEmail match
    const isCreator =
      qrinfo.createdBy &&
      qrinfo.createdBy.toString() === req.user._id.toString();
    const isCustomer =
      qrinfo.customerEmail &&
      qrinfo.customerEmail === req.user.email?.toLowerCase();

    // If tag has customerEmail, only the customer can edit (not the shopkeeper who created it)
    if (qrinfo.customerEmail) {
      if (!isCustomer) {
        return res.status(403).json({
          success: false,
          message: "Only the tag owner can edit this tag.",
        });
      }
    } else if (!isCreator) {
      return res
        .status(403)
        .json({ success: false, message: "You can only edit your own tags." });
    }

    res.json({ success: true, data: qrinfo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update QR info (requires login + ownership)
app.post("/api/qrinfo/update/:id", verifyToken, async (req, res) => {
  try {
    const qrinfo = await Qrinfo.findById(req.params.id);

    if (!qrinfo) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    // Check ownership: allow createdBy OR customerEmail match
    const isCreator =
      qrinfo.createdBy &&
      qrinfo.createdBy.toString() === req.user._id.toString();
    const isCustomer =
      qrinfo.customerEmail &&
      qrinfo.customerEmail === req.user.email?.toLowerCase();

    // If tag has customerEmail, only the customer can edit (not the shopkeeper)
    if (qrinfo.customerEmail) {
      if (!isCustomer) {
        return res.status(403).json({
          success: false,
          message: "Only the tag owner can edit this tag.",
        });
      }
    } else if (!isCreator) {
      return res
        .status(403)
        .json({ success: false, message: "You can only edit your own tags." });
    }

    Object.assign(qrinfo, req.body);
    await qrinfo.save();
    res.json({ success: true, customId: qrinfo.customId, data: qrinfo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

// Get user's own tags (requires login)
app.get("/api/my-tags", verifyToken, async (req, res) => {
  try {
    // Return tags the user created + tags a shopkeeper created for them (matched by email)
    const query = {
      $or: [
        { createdBy: req.user._id },
        { customerEmail: req.user.email?.toLowerCase() },
      ],
    };
    const tags = await Qrinfo.find(query)
      .select(
        "customId category name location phone info imgurl createdAt customerEmail",
      )
      .sort({ createdAt: -1 });
    res.json({ success: true, data: tags });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch tags." });
  }
});

// Get QR info data (public — anyone scanning QR can see)
app.get("/api/data", async (req, res) => {
  const id = req.query.id;
  const qrinfos = await Qrinfo.findOne({ customId: id });

  if (!qrinfos) {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  res.json({ success: true, data: qrinfos });
});

// Get shopkeeper's commissions
app.get("/api/my-commissions", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "shopkeeper") {
      return res.status(403).json({
        success: false,
        message: "Only shopkeepers can view commissions.",
      });
    }
    const commissions = await Commission.find({ shopkeeperId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    const totalEarned = commissions.reduce((s, c) => s + c.commission, 0);
    const pendingAmount = commissions
      .filter((c) => c.status === "pending")
      .reduce((s, c) => s + c.commission, 0);
    res.json({
      success: true,
      data: {
        totalEarned,
        pendingAmount,
        paidAmount: totalEarned - pendingAmount,
        commissions,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch commissions." });
  }
});

// Serve React Frontend in Production
// app.use(express.static(path.join(__dirname, "../client", "dist")));
// app.get("/{*splat}", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
// });

app.listen(port, () => console.log("Server is running on port ", port));
