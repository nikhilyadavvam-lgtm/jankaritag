import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user?.role === "shopkeeper") navigate("/shopkeeper");
        else if (res.user?.role === "admin") navigate("/admin-secret");
        else navigate("/");
      } else setError(res.message);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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
              Login to <span className="text-yellow-500">JankariTag</span>
            </h1>
            <p className="text-gray-500 text-sm">Login to your account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-3 rounded-xl mb-6 flex items-center gap-3">
              <i className="ri-error-warning-fill text-lg"></i>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mm-card-lg p-8 md:p-10 space-y-6"
          >
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
                placeholder="••••••••"
                className="input-mm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-mm btn-mm-primary w-full py-3.5 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <i className="ri-loader-fill animate-spin text-xl"></i>{" "}
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <i className="ri-shield-flash-line text-lg"></i> Sign In
                </span>
              )}
            </button>

            <div className="pt-2 text-center">
              <p className="text-sm text-gray-400">
                New user?{" "}
                <Link
                  to="/register"
                  className="text-yellow-600 hover:text-yellow-700 transition-colors font-semibold"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
