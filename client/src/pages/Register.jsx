import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isShopkeeper, setIsShopkeeper] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await register(
        name,
        email,
        password,
        isShopkeeper ? "shopkeeper" : "user",
        referralCode,
      );
      if (res.success) {
        navigate(isShopkeeper ? "/shopkeeper" : "/");
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-white min-h-screen flex items-center justify-center py-24 px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link
              to="/"
              className="inline-block hover:-translate-y-px transition-all"
            >
              <img
                src="/logo.png"
                alt="JankariTag"
                className="h-10 w-auto mx-auto mb-6"
              />
            </Link>
            <h1 className="text-3xl font-black text-black tracking-tight mb-2">
              Join <span className="text-orange-600">JankariTag</span>
            </h1>
            <p className="text-neutral-500 text-sm font-medium">
              Create your free account to get started
            </p>
          </div>

          {/* User Type Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setIsShopkeeper(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-sm text-[11px] font-bold uppercase tracking-widest border-2 transition-all cursor-pointer ${
                !isShopkeeper
                  ? "bg-black text-white border-black"
                  : "bg-white text-neutral-500 border-neutral-200 hover:border-black"
              }`}
            >
              <i className="ri-user-fill text-sm"></i> Normal User
            </button>
            <button
              type="button"
              onClick={() => setIsShopkeeper(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-sm text-[11px] font-bold uppercase tracking-widest border-2 transition-all cursor-pointer ${
                isShopkeeper
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-white text-neutral-500 border-neutral-200 hover:border-orange-600"
              }`}
            >
              <i className="ri-store-2-fill text-sm"></i> Shopkeeper
            </button>
          </div>

          {/* Shopkeeper Benefits */}
          {isShopkeeper && (
            <div className="brutal-card p-4 mb-6 bg-orange-50 border-orange-600 animate-fade-in-up">
              <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600 mb-2">
                <i className="ri-information-fill mr-1"></i> Shopkeeper Benefits
              </p>
              <ul className="space-y-1.5 text-[12px] text-neutral-600 font-medium">
                <li className="flex items-center gap-2">
                  <i className="ri-checkbox-circle-fill text-orange-600 text-sm"></i>{" "}
                  49 QR codes per month
                </li>
                <li className="flex items-center gap-2">
                  <i className="ri-checkbox-circle-fill text-orange-600 text-sm"></i>{" "}
                  Stick JTag on customer vehicles
                </li>
                <li className="flex items-center gap-2">
                  <i className="ri-checkbox-circle-fill text-orange-600 text-sm"></i>{" "}
                  Earn 5% commission on sales
                </li>
                <li className="flex items-center gap-2">
                  <i className="ri-checkbox-circle-fill text-orange-600 text-sm"></i>{" "}
                  Save on sticker printing & delivery
                </li>
                <li className="flex items-center gap-2">
                  <i className="ri-checkbox-circle-fill text-orange-600 text-sm"></i>{" "}
                  Get your unique referral code
                </li>
              </ul>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-500 text-red-600 px-6 py-3 rounded-sm mb-6 flex items-center gap-3">
              <i className="ri-error-warning-fill text-lg"></i>
              <span className="text-[11px] font-bold uppercase tracking-widest">
                {error}
              </span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="brutal-card p-8 md:p-10 space-y-5"
          >
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="flex items-center gap-2 text-neutral-500 font-bold text-[11px] uppercase tracking-widest"
              >
                <i className="ri-user-line text-orange-600"></i>{" "}
                {isShopkeeper ? "Shop / Business Name" : "Full Name"}
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={isShopkeeper ? "Your shop name" : "Your full name"}
                className="input-brutal"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="flex items-center gap-2 text-neutral-500 font-bold text-[11px] uppercase tracking-widest"
              >
                <i className="ri-mail-line text-orange-600"></i> Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="input-brutal"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="flex items-center gap-2 text-neutral-500 font-bold text-[11px] uppercase tracking-widest"
              >
                <i className="ri-lock-2-line text-orange-600"></i> Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Min. 6 characters"
                className="input-brutal"
              />
            </div>

            {/* Referral Code (optional, for any user) */}
            <div className="space-y-2">
              <label
                htmlFor="referral"
                className="flex items-center gap-2 text-neutral-500 font-bold text-[11px] uppercase tracking-widest"
              >
                <i className="ri-gift-fill text-orange-600"></i> Referral Code{" "}
                <span className="text-neutral-300 normal-case">(optional)</span>
              </label>
              <input
                type="text"
                id="referral"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="Enter referral code"
                className="input-brutal font-mono"
                maxLength={10}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-sm font-bold text-[11px] uppercase tracking-widest border-2 disabled:opacity-50 cursor-pointer transition-all ${
                isShopkeeper
                  ? "bg-orange-600 text-white border-orange-600 hover:bg-black hover:border-black"
                  : "btn-brutal btn-brutal-primary"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <i className="ri-loader-fill animate-spin text-xl"></i>{" "}
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <i
                    className={`${isShopkeeper ? "ri-store-2-fill" : "ri-shield-check-line"} text-lg`}
                  ></i>
                  {isShopkeeper ? "Register as Shopkeeper" : "Create Account"}
                </span>
              )}
            </button>

            <div className="pt-2 text-center">
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-orange-600 hover:text-black transition-colors underline underline-offset-4 decoration-2"
                >
                  Login Now
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
