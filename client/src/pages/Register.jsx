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
      <div className="bg-gradient-to-br from-gray-50 to-yellow-50/30 min-h-screen flex items-center justify-center py-24 px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link
              to="/"
              className="inline-block hover:-translate-y-0.5 transition-all"
            >
              <img
                src="/logo.png"
                alt="JankariTag"
                className="h-10 w-auto mx-auto mb-6"
              />
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              Join <span className="text-yellow-500">JankariTag</span>
            </h1>
            <p className="text-gray-500 text-sm">
              Create your free account to get started
            </p>
          </div>

          {/* User Type Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setIsShopkeeper(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                !isShopkeeper
                  ? "text-white bg-dark-blue shadow-md"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              <i className="ri-user-fill text-sm"></i> Normal User
            </button>
            <button
              type="button"
              onClick={() => setIsShopkeeper(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                isShopkeeper
                  ? "bg-yellow-400 text-gray-900 shadow-md"
                  : "bg-gray-50 text-gray-500 hover:bg-yellow-50"
              }`}
            >
              <i className="ri-store-2-fill text-sm"></i> Shopkeeper
            </button>
          </div>

          {/* Shopkeeper Benefits */}
          {isShopkeeper && (
            <div className="mm-card p-5 mb-6 bg-yellow-50 border-yellow-200 animate-fade-in-up">
              <p className="text-xs font-semibold text-yellow-700 mb-2">
                <i className="ri-information-fill mr-1"></i> Shopkeeper Benefits
              </p>
              <ul className="space-y-1.5 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <i className="ri-checkbox-circle-fill text-yellow-500 text-sm"></i>{" "}
                  49 QR codes per month
                </li>
                <li className="flex items-center gap-2">
                  <i className="ri-checkbox-circle-fill text-yellow-500 text-sm"></i>{" "}
                  Stick JTag on customer vehicles
                </li>
                <li className="flex items-center gap-2">
                  <i className="ri-checkbox-circle-fill text-yellow-500 text-sm"></i>{" "}
                  Earn 5% commission on sales
                </li>
                <li className="flex items-center gap-2">
                  <i className="ri-checkbox-circle-fill text-yellow-500 text-sm"></i>{" "}
                  Save on sticker printing & delivery
                </li>
                <li className="flex items-center gap-2">
                  <i className="ri-checkbox-circle-fill text-yellow-500 text-sm"></i>{" "}
                  Get your unique referral code
                </li>
              </ul>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-3 rounded-xl mb-6 flex items-center gap-3">
              <i className="ri-error-warning-fill text-lg"></i>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mm-card-lg p-8 md:p-10 space-y-5"
          >
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="flex items-center gap-2 text-gray-600 font-medium text-sm"
              >
                <i className="ri-user-line text-yellow-500"></i>{" "}
                {isShopkeeper ? "Shop / Business Name" : "Full Name"}
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={isShopkeeper ? "Your shop name" : "Your full name"}
                className="input-mm"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="flex items-center gap-2 text-gray-600 font-medium text-sm"
              >
                <i className="ri-mail-line text-yellow-500"></i> Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="input-mm"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="flex items-center gap-2 text-gray-600 font-medium text-sm"
              >
                <i className="ri-lock-2-line text-yellow-500"></i> Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Min. 6 characters"
                className="input-mm"
              />
            </div>

            {/* Referral Code */}
            <div className="space-y-2">
              <label
                htmlFor="referral"
                className="flex items-center gap-2 text-gray-600 font-medium text-sm"
              >
                <i className="ri-gift-fill text-yellow-500"></i> Referral Code{" "}
                <span className="text-gray-300">(optional)</span>
              </label>
              <input
                type="text"
                id="referral"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="Enter referral code"
                className="input-mm font-mono"
                maxLength={10}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm disabled:opacity-50 cursor-pointer transition-all ${
                isShopkeeper
                  ? "bg-yellow-400 text-gray-900 hover:bg-yellow-500 shadow-sm"
                  : "btn-mm btn-mm-primary"
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
              <p className="text-sm text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-yellow-600 hover:text-yellow-700 transition-colors font-semibold"
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
