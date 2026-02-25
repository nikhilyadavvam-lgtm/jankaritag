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
              Login to <span className="text-orange-600">JankariTag</span>
            </h1>
            <p className="text-neutral-500 text-sm font-medium">
              Login to your account
            </p>
          </div>

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
            className="brutal-card p-8 md:p-10 space-y-6"
          >
            <div className="space-y-3">
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

            <div className="space-y-3">
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
                placeholder="••••••••"
                className="input-brutal"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-brutal btn-brutal-primary w-full py-4 disabled:opacity-50"
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
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                New user?{" "}
                <Link
                  to="/register"
                  className="text-orange-600 hover:text-black transition-colors underline underline-offset-4 decoration-2"
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
