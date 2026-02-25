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
          <i className="ri-loader-4-line animate-spin text-4xl text-orange-600"></i>
        </div>
      </Layout>
    );

  if (!user || user.role !== "shopkeeper")
    return (
      <Layout>
        <div className="bg-white min-h-screen flex items-center justify-center py-20 px-4">
          <div className="brutal-card p-8 md:p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-sm bg-red-50 flex items-center justify-center mx-auto mb-6 border-2 border-red-500">
              <i className="ri-store-2-fill text-3xl text-red-500"></i>
            </div>
            <h2 className="text-2xl font-black text-black tracking-tight mb-2">
              Shopkeeper Access Only
            </h2>
            <p className="text-neutral-500 text-sm font-medium mb-6">
              This page is for registered shopkeepers. Contact us to become a
              shopkeeper partner.
            </p>
            <Link
              to="/"
              className="btn-brutal btn-brutal-secondary w-full py-3 text-[11px]"
            >
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
          <i className="ri-loader-4-line animate-spin text-4xl text-orange-600"></i>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="bg-white min-h-screen py-20 px-4">
        <div className="max-w-[1000px] mx-auto">
          {/* Header */}
          <div className="brutal-card p-6 md:p-8 mb-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left">
              <div className="w-14 h-14 rounded-sm bg-orange-600 flex items-center justify-center text-white text-2xl font-black shrink-0 border-2 border-black">
                <i className="ri-store-2-fill"></i>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-black text-black tracking-tight leading-none mb-1">
                  Shopkeeper Dashboard
                </h1>
                <p className="text-neutral-500 text-sm font-medium">
                  Welcome, {user.name}! Here's how your referrals are doing.
                </p>
              </div>
            </div>

            {/* Referral Code */}
            <div className="mt-6 p-4 bg-neutral-50 border-2 border-black rounded-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                  Your Referral Code
                </p>
                <p className="text-2xl font-black text-black font-mono tracking-widest">
                  {stats?.referralCode || "—"}
                </p>
              </div>
              <button
                onClick={copyReferralCode}
                className="btn-brutal btn-brutal-primary py-2 px-6"
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
                label: "my tags",
                value: stats?.ownTagsCount || 0,
                icon: "ri-price-tag-3-fill",
                color: "text-orange-600",
              },
              {
                label: "referred users",
                value: stats?.totalReferredUsers || 0,
                icon: "ri-team-fill",
                color: "text-blue-600",
              },
              {
                label: `commission (${stats?.commissionRate || 5}%)`,
                value: `₹${stats?.totalCommission || 0}`,
                icon: "ri-wallet-3-fill",
                color: "text-green-600",
              },
              {
                label: "pending payout",
                value: `₹${stats?.pendingCommission || 0}`,
                icon: "ri-time-fill",
                color: "text-purple-600",
              },
            ].map((stat, i) => (
              <div key={i} className="brutal-card p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <i className={`${stat.icon} ${stat.color} text-sm`}></i>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                    {stat.label}
                  </span>
                </div>
                <p className={`text-2xl font-black ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Commission History */}
          <div className="brutal-card overflow-hidden mb-8 animate-fade-in-up">
            <div className="bg-green-600 px-5 py-3 flex items-center justify-between">
              <h3 className="text-white text-[11px] font-black uppercase tracking-widest">
                commission history
              </h3>
              <span className="text-[9px] font-bold text-green-100 uppercase tracking-widest">
                {stats?.commissions?.length || 0} entries
              </span>
            </div>

            {stats?.commissions?.length > 0 ? (
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="bg-neutral-50 border-b-2 border-neutral-100">
                      <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        type
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        tag
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        amount
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        earned
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        status
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        payment info
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.commissions.map((c, i) => (
                      <tr
                        key={c._id}
                        className={`${i % 2 === 0 ? "bg-white" : "bg-neutral-50"} border-b border-neutral-100`}
                      >
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm border-2 border-black ${
                              c.type === "qr_creation"
                                ? "bg-orange-100 text-orange-700"
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
                        <td className="py-3 px-4 text-sm font-bold text-black font-mono">
                          {c.tagId || "—"}
                        </td>
                        <td className="py-3 px-4 text-sm text-neutral-500">
                          ₹{c.amount}
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-green-600">
                          +₹{c.commission}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm ${
                              c.status === "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-neutral-500">
                          {c.paymentNote || "—"}
                        </td>
                        <td className="py-3 px-4 text-sm text-neutral-400">
                          {new Date(c.createdAt).toLocaleDateString()}
                          {c.paidAt && (
                            <span className="block text-green-600 text-[9px] font-bold">
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
                <i className="ri-wallet-3-fill text-4xl text-neutral-200 mb-3 block"></i>
                <p className="text-neutral-400 text-sm font-medium">
                  no commissions yet — create tags or refer users to earn!
                </p>
              </div>
            )}
          </div>

          {/* Referred Users List */}
          <div className="brutal-card overflow-hidden animate-fade-in-up">
            <div className="bg-black px-5 py-3 flex items-center justify-between">
              <h3 className="text-white text-[11px] font-black uppercase tracking-widest">
                Referred Users
              </h3>
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                {stats?.referredUsers?.length || 0} Users
              </span>
            </div>

            {stats?.referredUsers?.length > 0 ? (
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr className="bg-neutral-50 border-b-2 border-neutral-100">
                      <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.referredUsers.map((u, i) => (
                      <tr
                        key={u._id}
                        className={`${i % 2 === 0 ? "bg-white" : "bg-neutral-50"} border-b border-neutral-100`}
                      >
                        <td className="py-3 px-4 text-sm font-bold text-black">
                          {u.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-neutral-500">
                          {u.email}
                        </td>
                        <td className="py-3 px-4 text-sm text-neutral-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <i className="ri-user-add-fill text-4xl text-neutral-200 mb-3 block"></i>
                <p className="text-neutral-400 text-sm font-medium">
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
