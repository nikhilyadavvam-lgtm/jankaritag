import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import API from "../api";

export default function QrInfoUpload() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initialCategory = location.state?.category || "VEHICLE";

  const [form, setForm] = useState({
    category: initialCategory,
    customId: "",
    name: "",
    location: "",
    phone: "",
    info: "",
    customerEmail: "",
  });

  const labels = {
    WATER_COOLER: {
      title: "Water Cooler Tag",
      desc: "Add details for your water cooler and get a QR sticker",
      ownerLabel: "Service Provider / Responsible Person",
      infoLabel: "Maintenance/Cleaning Notes",
      infoPlaceholder: "Cleaning frequency, last serviced date...",
      icon: "ri-drop-fill",
    },
    VEHICLE: {
      title: "Vehicle Tag",
      desc: "Add your vehicle details and get a QR sticker",
      ownerLabel: "Owner Name",
      infoLabel: "Additional Details",
      infoPlaceholder: "Make, model, registration number...",
      icon: "ri-car-fill",
    },
  };

  const currentLabels = labels[form.category] || labels.VEHICLE;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

    // Shopkeeper must provide customer email
    if (user?.role === "shopkeeper" && !form.customerEmail.trim()) {
      setError("Please enter customer's email address");
      setLoading(false);
      return;
    }

    try {
      const payload = { ...form };
      const res = await API.post("/qrinfo/initiate", payload);

      if (res.data.success && res.data.requiresPayment) {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          setError("Failed to load payment. Check your internet.");
          setLoading(false);
          return;
        }

        const options = {
          key: res.data.razorpayKeyId,
          amount: res.data.amount * 100,
          currency: "INR",
          name: "JankariTag",
          description: "Tag creation — ₹120 online service",
          order_id: res.data.razorpayOrderId,
          handler: async (response) => {
            try {
              const verifyRes = await API.post("/qrinfo/verify-and-create", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                tagData: payload,
              });
              if (verifyRes.data.success) {
                navigate(`/genqrcode?id=${verifyRes.data.customId}`);
              } else {
                setError(
                  "Payment done but tag creation failed. Contact support.",
                );
                setLoading(false);
              }
            } catch {
              setError("Payment verification failed. Contact support.");
              setLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              setError("Payment cancelled. Tag was not created.");
              setLoading(false);
            },
          },
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: form.phone || "",
          },
          theme: { color: "#ea580c" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      }

      setError("Something went wrong. Please try again.");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isShopkeeper = user?.role === "shopkeeper";

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
        <div className="bg-white min-h-screen flex items-center justify-center py-24 px-4">
          <div className="brutal-card p-8 md:p-14 max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-sm bg-neutral-100 flex items-center justify-center mx-auto mb-8 border-2 border-black">
              <i className="ri-lock-2-fill text-4xl text-orange-600"></i>
            </div>
            <h2 className="text-2xl font-black text-black tracking-tight mb-3">
              login required
            </h2>
            <p className="text-neutral-500 text-sm font-medium mb-6 leading-relaxed">
              please login to create your QR tag
            </p>
            <Link
              to="/login"
              className="btn-brutal btn-brutal-primary w-full py-3 text-[11px] mb-6"
            >
              login <i className="ri-arrow-right-line"></i>
            </Link>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
              new here?{" "}
              <Link
                to="/register"
                className="text-orange-600 hover:text-black transition-colors underline decoration-2 underline-offset-4"
              >
                sign up
              </Link>
            </p>
          </div>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="bg-white min-h-screen py-20 md:py-24 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-10 md:mb-16">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors mb-6 group cursor-pointer"
            >
              <i className="ri-arrow-left-s-line text-lg group-hover:-translate-x-1 transition-transform"></i>{" "}
              back to home
            </button>
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-sm bg-orange-600 flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_#0D0D0D] shrink-0">
                <i
                  className={`${currentLabels.icon} text-2xl md:text-3xl text-white`}
                ></i>
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-black text-black tracking-tight leading-none mb-1">
                  {currentLabels.title}
                </h1>
                <p className="text-neutral-500 font-medium text-xs md:text-sm">
                  {currentLabels.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Info */}
          <div className="brutal-card p-4 md:p-5 mb-6 bg-orange-50 border-orange-600">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 min-w-10 rounded-sm bg-orange-600 flex items-center justify-center border-2 border-black">
                <i className="ri-money-rupee-circle-fill text-xl md:text-2xl text-white"></i>
              </div>
              <div>
                <p className="font-black text-black text-sm">
                  online service — ₹120 per tag
                </p>
                <p className="text-[11px] text-neutral-500 font-medium">
                  includes QR code + online tracking. payment via razorpay.
                </p>
              </div>
            </div>
          </div>

          {/* Shopkeeper commission info */}
          {isShopkeeper && (
            <div className="brutal-card p-4 md:p-5 mb-6 bg-green-50 border-green-600">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 min-w-10 rounded-sm bg-green-600 flex items-center justify-center border-2 border-black">
                  <i className="ri-percent-fill text-xl md:text-2xl text-white"></i>
                </div>
                <div>
                  <p className="font-black text-black text-sm">
                    shopkeeper — 5% commission
                  </p>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    you earn 5% on every tag you create for customers. up to 49
                    tags/month.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-500 text-red-600 px-4 md:px-6 py-3 rounded-sm mb-6 flex items-center gap-3">
              <i className="ri-error-warning-fill text-lg"></i>
              <span className="text-[11px] font-bold uppercase tracking-widest">
                {error}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="brutal-card p-6 md:p-10 space-y-6">
              {/* Shopkeeper: Customer Email */}
              {isShopkeeper && (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-sm p-4 md:p-5 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="ri-user-received-fill text-yellow-600 text-lg"></i>
                    <span className="font-black text-sm text-black">
                      customer details
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    enter the customer's email so they can login and manage
                    their tag, update details, and order stickers.
                  </p>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-neutral-500 tracking-wide">
                      customer email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={form.customerEmail}
                      onChange={handleChange}
                      required={isShopkeeper}
                      placeholder="customer@email.com"
                      className="input-brutal"
                    />
                  </div>
                </div>
              )}

              {/* Asset Details */}
              <div className="flex items-center gap-3 pb-2">
                <div className="w-10 h-10 rounded-sm bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center">
                  <i
                    className={`${currentLabels.icon} text-orange-600 text-lg`}
                  ></i>
                </div>
                <div>
                  <h3 className="font-black text-black text-sm">
                    {form.category.toLowerCase().replace(/_/g, " ")} details
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-medium">
                    fill in the info for your{" "}
                    {form.category.toLowerCase().replace(/_/g, " ")} tag
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-neutral-500 tracking-wide">
                    tag id <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customId"
                    value={form.customId}
                    onChange={handleChange}
                    required
                    placeholder="e.g. VH-101"
                    className="input-brutal"
                  />
                  <p className="text-[9px] text-neutral-400 font-medium">
                    unique id printed on the physical tag
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-neutral-500 tracking-wide">
                    {currentLabels.ownerLabel}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder={currentLabels.ownerLabel.toLowerCase()}
                    className="input-brutal"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-neutral-500 tracking-wide">
                    location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g. parking lot B"
                    className="input-brutal"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-neutral-500 tracking-wide">
                    contact number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="emergency contact"
                    className="input-brutal"
                  />
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-500 tracking-wide">
                  {currentLabels.infoLabel}
                </label>
                <textarea
                  name="info"
                  value={form.info}
                  onChange={handleChange}
                  rows={3}
                  placeholder={currentLabels.infoPlaceholder}
                  className="input-brutal resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-brutal btn-brutal-primary w-full py-4 md:py-5 disabled:opacity-50 cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <i className="ri-loader-line animate-spin text-lg"></i>{" "}
                        processing...
                      </>
                    ) : (
                      <>
                        <i className="ri-bank-card-fill text-lg"></i> pay ₹120 &
                        create tag
                      </>
                    )}
                  </div>
                </button>
                <p className="text-center text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-3">
                  <i className="ri-lock-fill mr-1"></i> secure payment via
                  razorpay
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
