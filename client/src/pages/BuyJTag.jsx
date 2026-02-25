import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import API from "../api";

export default function BuyJTag() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const tagId = searchParams.get("tagId");
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState("");
  const [imgurls, setImgurls] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    pincode: "",
  });

  useEffect(() => {
    if (!tagId) {
      setError("No tag ID provided");
      setLoading(false);
      return;
    }
    API.get(`/genqrcode?id=${encodeURIComponent(tagId)}`)
      .then((res) => {
        if (res.data.success) setImgurls(res.data.imgurls);
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load tag"),
      )
      .finally(() => setLoading(false));
  }, [tagId]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const unitPrice = quantity >= 10 ? 49 : 59;
  const totalPrice = unitPrice * quantity;

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
    setOrdering(true);
    setError("");

    try {
      const payload = { tagId, quantity, ...form };
      const res = await API.post("/orders/initiate", payload);

      if (res.data.success && res.data.requiresPayment) {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          setError("Failed to load payment.");
          setOrdering(false);
          return;
        }

        const options = {
          key: res.data.razorpayKeyId,
          amount: res.data.amount * 100,
          currency: "INR",
          name: "JankariTag",
          description: `JTag Order — ${quantity} × ₹${unitPrice}`,
          order_id: res.data.razorpayOrderId,
          handler: async (response) => {
            try {
              const verifyRes = await API.post("/orders/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              if (verifyRes.data.success) {
                navigate("/profile");
              } else {
                setError("Payment done but order failed. Contact support.");
                setOrdering(false);
              }
            } catch {
              setError("Payment verification failed. Contact support.");
              setOrdering(false);
            }
          },
          modal: {
            ondismiss: () => {
              setError("Payment cancelled.");
              setOrdering(false);
            },
          },
          prefill: {
            name: form.name || user?.name || "",
            email: user?.email || "",
            contact: form.phone || "",
          },
          theme: { color: "#eab308" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      }

      // ── DEV MODE: Order created without payment ──
      if (res.data.success && res.data.devMode) {
        navigate("/profile");
        return;
      }

      setError("Something went wrong.");
    } catch (err) {
      setError(err.response?.data?.message || "Order failed");
    } finally {
      setOrdering(false);
    }
  };

  const whatsappText = encodeURIComponent(
    `Hello, I want to order ${quantity} QR JTag(s) for Tag ID: ${tagId}.\n\nName: ${form.name}\nPhone: ${form.phone}\nAddress: ${form.address}\nPincode: ${form.pincode}\nQuantity: ${quantity}\nImage: ${imgurls?.cardImg || ""}`,
  );

  if (authLoading || loading)
    return (
      <Layout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-4xl text-yellow-500"></i>
        </div>
      </Layout>
    );

  if (!user)
    return (
      <Layout>
        <div className="bg-gradient-to-br from-gray-50 to-yellow-50/30 min-h-screen flex items-center justify-center py-24 px-6">
          <div className="mm-card-lg p-10 md:p-14 max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-2xl bg-yellow-50 flex items-center justify-center mx-auto mb-8">
              <i className="ri-lock-2-fill text-4xl text-yellow-500"></i>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-3">
              Login Required
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Please login to order JTags
            </p>
            <Link
              to="/login"
              className="btn-mm btn-mm-primary w-full py-3 text-sm"
            >
              Login <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="bg-white min-h-screen py-20 md:py-24 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors mb-6 group cursor-pointer"
            >
              <i className="ri-arrow-left-s-line text-lg group-hover:-translate-x-1 transition-transform"></i>{" "}
              Go Back
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center shadow-sm shrink-0">
                <i className="ri-sticky-note-fill text-2xl text-yellow-600"></i>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-none mb-1">
                  Order JTags
                </h1>
                <p className="text-gray-500 text-xs md:text-sm">
                  Tag ID:{" "}
                  <span className="text-gray-900 font-mono font-semibold">
                    {tagId}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-3 rounded-xl mb-6 flex items-center gap-3">
              <i className="ri-error-warning-fill text-lg"></i>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Preview + Actions */}
            <div className="lg:col-span-2 space-y-4">
              {imgurls?.cardImg && (
                <div className="mm-card-lg p-6">
                  <p className="text-xs font-medium text-gray-400 mb-4">
                    Preview
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <img
                      src={imgurls.cardImg}
                      alt="QR JTag"
                      className="w-full rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <a
                      href={imgurls.cardImg}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="btn-mm btn-mm-primary py-2.5 flex items-center justify-center gap-2 text-xs"
                    >
                      <i className="ri-download-cloud-2-line text-sm"></i>{" "}
                      Download
                    </a>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://wa.me/919667446393?text=${whatsappText}`}
                      className="flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold text-xs rounded-lg transition-all"
                    >
                      <i className="ri-whatsapp-line text-sm"></i> WhatsApp
                    </a>
                  </div>
                </div>
              )}

              {/* Pricing Info */}
              <div className="mm-card p-5 bg-yellow-50 border-yellow-200">
                <p className="text-xs font-bold text-gray-900 mb-3">
                  <i className="ri-price-tag-3-fill text-yellow-600 mr-1"></i>{" "}
                  JTag Pricing
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>1-9 JTags</span>
                    <span className="font-bold text-gray-900">₹59 each</span>
                  </div>
                  <div className="flex justify-between">
                    <span>10+ JTags</span>
                    <span className="font-bold text-yellow-600">₹49 each</span>
                  </div>
                </div>
              </div>

              {/* JTag Features */}
              <div className="mm-card p-5 bg-white border-gray-200">
                <p className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  <i className="ri-information-fill text-yellow-500 mr-2"></i>
                  What's on your JTag?
                </p>
                <div className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0 border border-yellow-100">
                      <span className="font-bold text-yellow-600 text-sm">
                        1
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        Category
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                        Asset type for easy identification
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0 border border-yellow-100">
                      <span className="font-bold text-yellow-600 text-sm">
                        2
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Name</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                        Your name or asset's name
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0 border border-yellow-100">
                      <span className="font-bold text-yellow-600 text-sm">
                        3
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        ID / Reg No.
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                        Unique identifier for validation
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-3 border-t border-gray-50 mt-2 items-start">
                    <div className="w-8 h-8 rounded-lg bg-dark-blue flex items-center justify-center shrink-0">
                      <i className="ri-qr-code-line text-yellow-400 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        Smart QR Code
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                        Scannable by anyone to contact you
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
              <div className="mm-card-lg p-6 md:p-8 space-y-5">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <i className="ri-truck-fill text-yellow-500"></i> Delivery
                  Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                      className="input-mm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      placeholder="Your phone"
                      className="input-mm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    rows={2}
                    placeholder="Full delivery address"
                    className="input-mm resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      required
                      maxLength={6}
                      placeholder="6-digit pincode"
                      className="input-mm font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(parseInt(e.target.value) || 1)
                      }
                      className="input-mm"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mm-card-lg p-6 md:p-8">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-5">
                  <i className="ri-bill-fill text-yellow-500"></i> Order Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>
                      {quantity} JTag{quantity > 1 ? "s" : ""} × ₹{unitPrice}
                    </span>
                    <span className="font-semibold text-gray-900">
                      ₹{totalPrice}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-xl font-extrabold text-gray-900">
                      ₹{totalPrice}
                    </span>
                  </div>
                  {quantity >= 10 && (
                    <p className="text-xs text-green-600 font-semibold">
                      <i className="ri-checkbox-circle-fill mr-1"></i> Bulk
                      discount applied! Saving ₹{quantity * 10}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={ordering}
                  className="btn-mm btn-mm-accent w-full py-4 mt-6 disabled:opacity-50 cursor-pointer text-base"
                >
                  {ordering ? (
                    <>
                      <i className="ri-loader-line animate-spin text-lg"></i>{" "}
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="ri-shopping-cart-2-fill text-lg"></i> Pay ₹
                      {totalPrice} & Order
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  <i className="ri-lock-fill mr-1"></i> Secure payment via
                  Razorpay
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
