import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import API from "../api";

export default function BuySticker() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const tagId = searchParams.get("tagId") || "";

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    pincode: "",
    quantity: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({ ...prev, name: user.name || "" }));
    }
  }, [user]);

  const unitPrice = form.quantity >= 10 ? 49 : 59;
  const totalPrice = unitPrice * form.quantity;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Math.max(1, parseInt(value) || 1) : value,
    }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (
        document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
        )
      ) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create order on backend
      const res = await API.post("/orders/create", {
        tagId,
        name: form.name,
        phone: form.phone,
        address: form.address,
        pincode: form.pincode,
        quantity: form.quantity,
      });

      if (!res.data.success) {
        setError(res.data.message || "Failed to create order");
        setLoading(false);
        return;
      }

      const { razorpayOrderId, razorpayKeyId, amount } = res.data.order;

      // If Razorpay is configured, open payment
      if (razorpayOrderId && razorpayKeyId) {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          setError("Payment gateway failed to load. Please try again.");
          setLoading(false);
          return;
        }

        const options = {
          key: razorpayKeyId,
          amount: amount * 100,
          currency: "INR",
          name: "JankariTag",
          description: `QR Sticker for Tag #${tagId}`,
          order_id: razorpayOrderId,
          handler: async function (response) {
            try {
              await API.post("/orders/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              setSuccess(true);
            } catch {
              setError(
                "Payment was made but verification failed. Please contact support.",
              );
            }
            setLoading(false);
          },
          prefill: {
            name: form.name,
            contact: form.phone,
            email: user?.email || "",
          },
          theme: { color: "#ea580c" },
          modal: {
            ondismiss: () => setLoading(false),
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        // No Razorpay configured — order placed with pending payment
        setSuccess(true);
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  if (authLoading)
    return (
      <Layout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-4xl text-orange-600"></i>
        </div>
      </Layout>
    );

  if (!user)
    return (
      <Layout>
        <div className="bg-white min-h-screen flex items-center justify-center py-20 px-4">
          <div className="brutal-card p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-sm bg-neutral-100 flex items-center justify-center mx-auto mb-6 border-2 border-black">
              <i className="ri-lock-2-fill text-3xl text-orange-600"></i>
            </div>
            <h2 className="text-2xl font-black text-black tracking-tight mb-2">
              Login Required
            </h2>
            <p className="text-neutral-500 text-sm font-medium mb-6">
              Please login to buy stickers.
            </p>
            <Link
              to="/login"
              className="btn-brutal btn-brutal-primary w-full py-3 text-[11px]"
            >
              Login
            </Link>
          </div>
        </div>
      </Layout>
    );

  if (success)
    return (
      <Layout>
        <div className="bg-white min-h-screen flex items-center justify-center py-20 px-4">
          <div className="brutal-card p-8 md:p-10 max-w-md w-full text-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-sm bg-green-100 flex items-center justify-center mx-auto mb-6 border-2 border-green-500">
              <i className="ri-checkbox-circle-fill text-4xl text-green-600"></i>
            </div>
            <h2 className="text-2xl font-black text-black tracking-tight mb-2">
              Order Placed!
            </h2>
            <p className="text-neutral-500 text-sm font-medium mb-4">
              Your sticker order for Tag #{tagId} has been placed successfully.
              {form.quantity > 1 ? ` (${form.quantity} stickers)` : ""}
            </p>
            <p className="text-2xl font-black text-orange-600 mb-6">
              ₹{totalPrice}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/profile")}
                className="btn-brutal btn-brutal-primary w-full py-3"
              >
                Go to My Tags
              </button>
              <button
                onClick={() => navigate("/")}
                className="btn-brutal btn-brutal-secondary w-full py-3"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="bg-white min-h-screen py-20 px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors mb-4 group"
            >
              <i className="ri-arrow-left-s-line text-lg group-hover:-translate-x-1 transition-transform"></i>{" "}
              Back
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-sm bg-orange-600 flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_#0D0D0D] shrink-0">
                <i className="ri-shopping-cart-2-fill text-2xl text-white"></i>
              </div>
              <div>
                <h1 className="text-2xl font-black text-black tracking-tight leading-none mb-1">
                  Buy Sticker
                </h1>
                <p className="text-neutral-500 font-medium text-sm">
                  Get a printed QR sticker for Tag #{tagId}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-500 text-red-600 px-4 py-3 rounded-sm mb-6 flex items-center gap-3">
              <i className="ri-error-warning-fill text-xl"></i>
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}

          {/* Price Info */}
          <div className="brutal-card p-5 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-black mb-0.5">
                  Sticker Price
                </p>
                <p className="text-[11px] text-neutral-400 font-medium">
                  {form.quantity >= 10
                    ? "₹49/sticker (10+ discount)"
                    : "₹59/sticker (₹49 for 10+)"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-orange-600">
                  ₹{totalPrice}
                </p>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                  {form.quantity} × ₹{unitPrice}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="brutal-card p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className="input-brutal"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="10-digit number"
                  className="input-brutal"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                Delivery Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                rows={2}
                placeholder="Full address with landmark"
                className="input-brutal resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                  placeholder="6-digit pincode"
                  maxLength={6}
                  className="input-brutal"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  min={1}
                  className="input-brutal"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-brutal btn-brutal-primary w-full py-4 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <i className="ri-loader-line animate-spin text-lg"></i>{" "}
                  Processing...
                </>
              ) : (
                <>
                  <i className="ri-secure-payment-fill text-lg"></i> Pay ₹
                  {totalPrice}
                </>
              )}
            </button>

            <p className="text-[10px] text-neutral-400 text-center font-medium">
              <i className="ri-shield-check-fill text-green-500 mr-1"></i>
              Payments are secure and processed via Razorpay
            </p>
          </form>
        </div>
      </div>
    </Layout>
  );
}
