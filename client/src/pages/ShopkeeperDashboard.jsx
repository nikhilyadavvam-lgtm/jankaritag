import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import API from "../api";

export default function ShopkeeperDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (authLoading) return;
      if (!user || user.role !== "shopkeeper") {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get("/shopkeeper/stats");
        if (res.data.success) setStats(res.data.data);
      } catch (err) {
        console.error("Shopkeeper stats fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user, authLoading]);

  const copyReferralCode = () => {
    if (stats?.referralCode) {
      navigator.clipboard.writeText(stats.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (authLoading)
    return (
      <Layout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-4xl text-yellow-500"></i>
        </div>
      </Layout>
    );

  if (!user || user.role !== "shopkeeper")
    return (
      <Layout>
        <div className="bg-white min-h-screen flex items-center justify-center py-20 px-4">
          <div className="mm-card-lg p-8 md:p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
              <i className="ri-store-2-fill text-3xl text-red-500"></i>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
              Shopkeeper Access Only
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              This page is for registered shopkeepers. Contact us to become a
              shopkeeper partner.
            </p>
            <Link to="/" className="btn-mm btn-mm-secondary w-full py-3">
              Back to Home
            </Link>
          </div>
        </div>
      </Layout>
    );

  if (loading)
    return (
      <Layout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-4xl text-yellow-500"></i>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-20 px-4">
        <div className="max-w-[1000px] mx-auto">
          {/* Header */}
          <div className="mm-card-lg p-6 md:p-8 mb-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left">
              <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center text-yellow-600 text-2xl shrink-0">
                <i className="ri-store-2-fill"></i>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none mb-1">
                  Shopkeeper Dashboard
                </h1>
                <p className="text-gray-500 text-sm">
                  Welcome, {user.name}! Here's how your referrals are doing.
                </p>
              </div>
            </div>

            {/* Referral Code */}
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">
                  Your Referral Code
                </p>
                <p className="text-2xl font-extrabold text-gray-900 font-mono tracking-widest">
                  {stats?.referralCode || "—"}
                </p>
              </div>
              <button
                onClick={copyReferralCode}
                className="btn-mm btn-mm-accent py-2 px-6"
              >
                <i
                  className={`${copied ? "ri-check-fill" : "ri-file-copy-fill"} text-sm`}
                ></i>
                {copied ? "Copied!" : "Copy Code"}
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up">
            {[
              {
                label: "My Tags",
                value: stats?.ownTagsCount || 0,
                icon: "ri-price-tag-3-fill",
                color: "text-yellow-600",
                bg: "bg-yellow-50",
              },
              {
                label: "Referred Users",
                value: stats?.totalReferredUsers || 0,
                icon: "ri-team-fill",
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: `Commission (${stats?.commissionRate || 5}%)`,
                value: `₹${stats?.totalCommission || 0}`,
                icon: "ri-wallet-3-fill",
                color: "text-green-600",
                bg: "bg-green-50",
              },
              {
                label: "Pending Payout",
                value: `₹${stats?.pendingCommission || 0}`,
                icon: "ri-time-fill",
                color: "text-purple-600",
                bg: "bg-purple-50",
              },
            ].map((stat, i) => (
              <div key={i} className="mm-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}
                  >
                    <i className={`${stat.icon} ${stat.color} text-sm`}></i>
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-400 mb-0.5">
                  {stat.label}
                </p>
                <p className={`text-2xl font-extrabold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Commission History */}
          <div className="mm-card-lg overflow-hidden mb-8 animate-fade-in-up">
            <div className="bg-dark-blue px-5 py-4 flex items-center justify-between">
              <h3 className="text-white text-sm font-bold">
                Commission History
              </h3>
              <span className="text-xs font-medium text-gray-400">
                {stats?.commissions?.length || 0} entries
              </span>
            </div>

            {stats?.commissions?.length > 0 ? (
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                        Tag
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                        Earned
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                        Payment Info
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.commissions.map((c, i) => (
                      <tr
                        key={c._id}
                        className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-gray-50`}
                      >
                        <td className="py-3 px-4">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              c.type === "qr_creation"
                                ? "bg-yellow-100 text-yellow-700"
                                : c.type === "sticker_order"
                                  ? "bg-blue-100 text-blue-700"
                                  : c.type === "referral_qr"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-pink-100 text-pink-700"
                            }`}
                          >
                            {c.type.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900 font-mono">
                          {c.tagId || "—"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          ₹{c.amount}
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-green-600">
                          +₹{c.commission}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              c.status === "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">
                          {c.paymentNote || "—"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-400">
                          {new Date(c.createdAt).toLocaleDateString()}
                          {c.paidAt && (
                            <span className="block text-green-600 text-xs font-medium">
                              paid {new Date(c.paidAt).toLocaleDateString()}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <i className="ri-wallet-3-fill text-4xl text-gray-200 mb-3 block"></i>
                <p className="text-gray-400 text-sm">
                  No commissions yet — create tags or refer users to earn!
                </p>
              </div>
            )}
          </div>

          {/* Referred Users List */}
          <div className="mm-card-lg overflow-hidden animate-fade-in-up">
            <div className="bg-dark-blue px-5 py-4 flex items-center justify-between">
              <h3 className="text-white text-sm font-bold">Referred Users</h3>
              <span className="text-xs font-medium text-gray-400">
                {stats?.referredUsers?.length || 0} Users
              </span>
            </div>

            {stats?.referredUsers?.length > 0 ? (
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.referredUsers.map((u, i) => (
                      <tr
                        key={u._id}
                        className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-gray-50`}
                      >
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                          {u.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {u.email}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <i className="ri-user-add-fill text-4xl text-gray-200 mb-3 block"></i>
                <p className="text-gray-400 text-sm">
                  No referrals yet. Share your code to get started!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
