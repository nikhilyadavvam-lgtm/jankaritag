import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import API from "../api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminAuth, setAdminAuth] = useState(
    !!localStorage.getItem("admin_token"),
  );
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("tags");
  const [shopkeepers, setShopkeepers] = useState([]);
  const [expandedShopkeeper, setExpandedShopkeeper] = useState(null);
  const [skCommissions, setSkCommissions] = useState([]);
  const [skCommLoading, setSkCommLoading] = useState(false);

  // Verify admin session on mount
  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem("admin_token");
      if (token) {
        try {
          const res = await API.get("/admin/me");
          if (res.data.success) setAdminAuth(true);
          else {
            localStorage.removeItem("admin_token");
            setAdminAuth(false);
          }
        } catch {
          localStorage.removeItem("admin_token");
          setAdminAuth(false);
        }
      }
    };
    verifyAdmin();
  }, []);

  // Fetch stats when authenticated
  useEffect(() => {
    const fetchStats = async () => {
      if (!adminAuth) {
        setLoading(false);
        return;
      }
      try {
        const [statsRes, skRes] = await Promise.all([
          API.get("/admin/stats"),
          API.get("/admin/shopkeepers"),
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (skRes.data.success) setShopkeepers(skRes.data.data);
      } catch (err) {
        console.error("Admin fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [adminAuth]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await API.post("/admin/login", loginForm);
      if (res.data.success) {
        localStorage.setItem("admin_token", res.data.token);
        setAdminAuth(true);
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("admin_token");
    setAdminAuth(false);
    setStats(null);
  };

  const handleOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await API.put(`/admin/orders/${orderId}/status`, {
        orderStatus: newStatus,
      });
      if (res.data.success && stats) {
        setStats({
          ...stats,
          orders: stats.orders.map((o) =>
            o._id === orderId ? { ...o, orderStatus: newStatus } : o,
          ),
        });
      }
    } catch {}
  };

  const handleDeleteTag = async (tagId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this tag? This cannot be undone.",
      )
    )
      return;
    try {
      const res = await API.delete(`/admin/tags/${tagId}`);
      if (res.data.success && stats) {
        setStats({
          ...stats,
          tags: stats.tags.filter((t) => t._id !== tagId),
          totalTags: stats.totalTags - 1,
        });
      }
    } catch {}
  };

  // Admin Login Screen
  if (!adminAuth)
    return (
      <Layout>
        <div className="bg-gradient-to-br from-gray-50 to-yellow-50/30 min-h-screen flex items-center justify-center py-20 px-4">
          <div className="mm-card-lg p-8 md:p-10 max-w-md w-full">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-dark-blue flex items-center justify-center mx-auto mb-4 shadow-md">
                <i className="ri-admin-fill text-3xl text-yellow-400"></i>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1">
                Admin Login
              </h2>
              <p className="text-gray-500 text-sm">
                Enter your admin credentials
              </p>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
                <i className="ri-error-warning-fill text-lg"></i> {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                  required
                  placeholder="admin@jankaritag.com"
                  className="input-mm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Password
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  required
                  placeholder="Enter password"
                  className="input-mm"
                />
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="btn-mm btn-mm-primary w-full py-3 disabled:opacity-50"
              >
                {loginLoading ? (
                  <>
                    <i className="ri-loader-line animate-spin"></i> Logging
                    in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
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

  const filteredTags = (stats?.tags || []).filter(
    (t) =>
      (t.customId?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (t.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (t.category?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (t.location?.toLowerCase() || "").includes(search.toLowerCase()),
  );

  const allOrders = stats?.orders || [];
  const servicePayments = allOrders.filter(
    (o) => o.address === "Online Service",
  );
  const JTagOrders = allOrders.filter((o) => o.address !== "Online Service");

  const filteredJTagOrders = JTagOrders.filter(
    (o) =>
      (o.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (o.phone || "").includes(search) ||
      (o.tagId?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (o.pincode || "").includes(search),
  );

  const filteredServicePayments = servicePayments.filter(
    (o) =>
      (o.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (o.tagId?.toLowerCase() || "").includes(search.toLowerCase()),
  );

  const serviceRevenue = servicePayments
    .filter((o) => o.paymentStatus === "paid")
    .reduce((s, o) => s + (o.amount || 0), 0);
  const JTagRevenue = JTagOrders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((s, o) => s + (o.amount || 0), 0);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-20 px-4">
        <div className="max-w-[1400px] mx-auto">
          {/* Top Bar */}
          <div className="rounded-2xl bg-dark-blue p-6 md:p-8 mb-8 animate-fade-in-up shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-400 flex items-center justify-center text-gray-900 shrink-0">
                  <i className="ri-dashboard-fill text-2xl"></i>
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-white tracking-tight mb-0.5">
                    Admin Dashboard
                  </h1>
                  <p className="text-xs font-medium text-gray-400">
                    JankariTag Control Panel
                  </p>
                </div>
              </div>
              <button
                onClick={handleAdminLogout}
                className="px-4 py-2 bg-white/10 text-white rounded-lg text-xs font-semibold hover:bg-red-500 transition-all cursor-pointer"
              >
                <i className="ri-logout-circle-r-fill mr-2"></i> Logout
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                {
                  label: "Users",
                  value: stats?.totalUsers || 0,
                  icon: "ri-team-fill",
                  color: "text-yellow-400",
                },
                {
                  label: "Tags",
                  value: stats?.totalTags || 0,
                  icon: "ri-price-tag-3-fill",
                  color: "text-orange-400",
                },
                {
                  label: "QR Codes",
                  value: stats?.totalQRCodes || 0,
                  icon: "ri-qr-code-fill",
                  color: "text-green-400",
                },
                {
                  label: "JTags",
                  value: stats?.totalJTags || 0,
                  icon: "ri-sticky-note-fill",
                  color: "text-blue-400",
                },
                {
                  label: "JTag Orders",
                  value: JTagOrders.length,
                  icon: "ri-shopping-cart-2-fill",
                  color: "text-purple-400",
                },
                {
                  label: "Service Plans",
                  value: servicePayments.length,
                  icon: "ri-global-fill",
                  color: "text-cyan-400",
                },
                {
                  label: "JTag ₹",
                  value: `₹${JTagRevenue}`,
                  icon: "ri-money-rupee-circle-fill",
                  color: "text-emerald-400",
                },
                {
                  label: "Service ₹",
                  value: `₹${serviceRevenue}`,
                  icon: "ri-money-rupee-circle-fill",
                  color: "text-sky-400",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <i className={`${stat.icon} ${stat.color} text-sm`}></i>
                    <span className="text-[10px] font-medium text-gray-400">
                      {stat.label}
                    </span>
                  </div>
                  <p className={`text-2xl font-extrabold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tab Switcher + Search */}
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6 animate-fade-in-up">
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "tags", label: "Tags", icon: "ri-price-tag-3-fill" },
                {
                  key: "orders",
                  label: "JTags",
                  icon: "ri-shopping-cart-2-fill",
                },
                { key: "services", label: "Services", icon: "ri-global-fill" },
                {
                  key: "shopkeepers",
                  label: "Shopkeepers",
                  icon: "ri-store-2-fill",
                },
                { key: "users", label: "Users", icon: "ri-team-fill" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === tab.key
                      ? "bg-dark-blue text-white shadow-md"
                      : "bg-white text-gray-500 hover:bg-gray-100 shadow-sm"
                  }`}
                >
                  <i className={`${tab.icon} text-sm`}></i> {tab.label}
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-xl">
              <i className="ri-search-2-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="input-mm pl-12 py-3"
              />
            </div>
            <span className="px-3 py-1 text-[10px] font-semibold text-gray-400 bg-white rounded-full shadow-sm">
              {activeTab === "orders"
                ? filteredJTagOrders.length
                : activeTab === "services"
                  ? filteredServicePayments.length
                  : activeTab === "tags"
                    ? filteredTags.length
                    : stats?.totalUsers || 0}{" "}
              records
            </span>
          </div>

          {/* Tags Table */}
          {activeTab === "tags" && (
            <div className="mm-card-lg overflow-hidden animate-fade-in-up">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-dark-blue text-white">
                      <th className="text-left py-3 px-4 text-xs font-semibold">
                        Tag ID
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold">
                        Category
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold">
                        Owner
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold">
                        Location
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold">
                        Created By
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTags.map((tag, i) => (
                      <tr
                        key={tag._id}
                        className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-gray-100`}
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono font-semibold text-sm text-gray-900">
                            {tag.customId}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 bg-gray-100 rounded-full text-[10px] font-semibold text-gray-500 capitalize">
                            {tag.category?.toLowerCase().replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                          {tag.name || "—"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500 truncate max-w-[180px]">
                          {tag.location || "—"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-400">
                          {tag.createdBy?.name || "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() =>
                                navigate(`/data?id=${tag.customId}`)
                              }
                              className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-yellow-600 hover:border-yellow-400 transition-all flex items-center justify-center cursor-pointer"
                              title="View"
                            >
                              <i className="ri-eye-line text-xs"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteTag(tag._id)}
                              className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-500 transition-all flex items-center justify-center cursor-pointer"
                              title="Delete"
                            >
                              <i className="ri-delete-bin-5-line text-xs"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredTags.length === 0 && (
                <div className="py-16 text-center">
                  <i className="ri-inbox-2-fill text-4xl text-gray-200 mb-4 block"></i>
                  <p className="text-gray-400 text-sm font-medium">
                    No tags found
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Orders Table */}
          {activeTab === "orders" && (
            <div className="mm-card-lg overflow-hidden animate-fade-in-up">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="bg-dark-blue text-white">
                      <th className="text-left py-3 px-4 text-xs font-semibold">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold">
                        Phone
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold">
                        Address
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold">
                        Pincode
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold">
                        Tag ID
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold">
                        Payment
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJTagOrders.map((order, i) => (
                      <tr
                        key={order._id}
                        className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-gray-100`}
                      >
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                          {order.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {order.phone}
                        </td>
                        <td
                          className="py-3 px-4 text-sm text-gray-500 truncate max-w-[200px]"
                          title={order.address}
                        >
                          {order.address}
                        </td>
                        <td className="py-3 px-4 text-sm font-mono font-semibold text-gray-900">
                          {order.pincode}
                        </td>
                        <td className="py-3 px-4 text-sm font-mono text-gray-500">
                          {order.tagId}
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-gray-900">
                          ₹{order.amount}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[order.paymentStatus] || ""}`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={order.orderStatus}
                            onChange={(e) =>
                              handleOrderStatus(order._id, e.target.value)
                            }
                            className="text-xs font-medium bg-white border border-gray-200 rounded-lg px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                          >
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredJTagOrders.length === 0 && (
                <div className="py-16 text-center">
                  <i className="ri-shopping-cart-line text-4xl text-gray-200 mb-4 block"></i>
                  <p className="text-gray-400 text-sm font-medium">
                    No orders yet
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Services Tab — ₹120 Plan Payments */}
          {activeTab === "services" && (
            <div className="mm-card-lg overflow-hidden animate-fade-in-up">
              <div className="bg-dark-blue px-5 py-3 flex items-center gap-3 rounded-t-2xl">
                <i className="ri-global-fill text-cyan-400"></i>
                <span className="text-xs font-medium text-gray-400">
                  Service Payments — ₹120 Online Tag Creation
                </span>
              </div>
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                        User
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                        Tag ID
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                        Payment
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServicePayments.map((p, i) => (
                      <tr
                        key={p._id}
                        className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-gray-100`}
                      >
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                          {p.name}
                        </td>
                        <td className="py-3 px-4 text-sm font-mono text-gray-500">
                          {p.tagId}
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-gray-900">
                          ₹{p.amount}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[p.paymentStatus] || ""}`}
                          >
                            {p.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-400">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredServicePayments.length === 0 && (
                <div className="py-16 text-center">
                  <i className="ri-global-line text-4xl text-gray-200 mb-4 block"></i>
                  <p className="text-gray-400 text-sm font-medium">
                    No service payments yet
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Shopkeepers Tab */}
          {activeTab === "shopkeepers" && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="mm-card-lg overflow-hidden">
                <div className="bg-dark-blue px-5 py-3 flex items-center gap-3 rounded-t-2xl">
                  <i className="ri-store-2-fill text-yellow-400"></i>
                  <span className="text-xs font-medium text-gray-400">
                    Registered Shopkeepers — {shopkeepers.length} total
                  </span>
                </div>

                {shopkeepers.length > 0 ? (
                  <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                            Name
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                            Email
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                            Code
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                            Tags
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                            Referrals
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                            Sales
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                            Earned
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                            Pending
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {shopkeepers.map((sk, i) => (
                          <tr
                            key={sk._id}
                            className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-gray-100`}
                          >
                            <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                              {sk.name}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">
                              {sk.email}
                            </td>
                            <td className="py-3 px-4 text-sm font-mono font-bold text-yellow-600">
                              {sk.referralCode || "—"}
                            </td>
                            <td className="py-3 px-4 text-sm font-bold text-gray-900">
                              {sk.tagsCount}
                            </td>
                            <td className="py-3 px-4 text-sm font-bold text-blue-600">
                              {sk.referralCount}
                            </td>
                            <td className="py-3 px-4 text-sm font-bold text-gray-900">
                              ₹{sk.totalSales}
                            </td>
                            <td className="py-3 px-4 text-sm font-bold text-green-600">
                              ₹{sk.totalCommission}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${sk.pendingCommission > 0 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                              >
                                ₹{sk.pendingCommission}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => {
                                  if (expandedShopkeeper === sk._id) {
                                    setExpandedShopkeeper(null);
                                    setSkCommissions([]);
                                  } else {
                                    setExpandedShopkeeper(sk._id);
                                    setSkCommLoading(true);
                                    API.get(
                                      `/admin/shopkeepers/${sk._id}/commissions`,
                                    )
                                      .then((r) => {
                                        if (r.data.success)
                                          setSkCommissions(r.data.data);
                                      })
                                      .catch(() => {})
                                      .finally(() => setSkCommLoading(false));
                                  }
                                }}
                                className="text-xs font-semibold text-yellow-600 hover:text-gray-900 transition-colors cursor-pointer"
                              >
                                {expandedShopkeeper === sk._id
                                  ? "Close"
                                  : "Manage"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <i className="ri-store-2-line text-4xl text-gray-200 mb-4 block"></i>
                    <p className="text-gray-400 text-sm font-medium">
                      No shopkeepers registered yet
                    </p>
                  </div>
                )}
              </div>

              {/* Expanded Shopkeeper Commissions */}
              {expandedShopkeeper && (
                <div className="mm-card-lg overflow-hidden animate-fade-in-up">
                  <div className="bg-green-600 px-5 py-3 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-3">
                      <i className="ri-wallet-3-fill text-white"></i>
                      <span className="text-xs font-medium text-green-100">
                        Commissions —{" "}
                        {
                          shopkeepers.find((s) => s._id === expandedShopkeeper)
                            ?.name
                        }
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setExpandedShopkeeper(null);
                        setSkCommissions([]);
                      }}
                      className="text-green-100 hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      <i className="ri-close-line text-sm"></i> Close
                    </button>
                  </div>

                  {skCommLoading ? (
                    <div className="py-8 text-center">
                      <i className="ri-loader-4-line animate-spin text-2xl text-green-600"></i>
                    </div>
                  ) : skCommissions.length > 0 ? (
                    <div className="overflow-x-auto scrollbar-hide">
                      <table className="w-full min-w-[700px]">
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
                              Payment Note
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                              Date
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {skCommissions.map((c, i) => (
                            <tr
                              key={c._id}
                              className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-gray-100`}
                            >
                              <td className="py-3 px-4">
                                <span
                                  className={`text-[10px] font-semibold capitalize px-2.5 py-1 rounded-full ${
                                    c.type === "qr_creation"
                                      ? "bg-orange-100 text-orange-700"
                                      : c.type === "JTag_order"
                                        ? "bg-blue-100 text-blue-700"
                                        : c.type === "referral_qr"
                                          ? "bg-purple-100 text-purple-700"
                                          : "bg-pink-100 text-pink-700"
                                  }`}
                                >
                                  {c.type.replace(/_/g, " ")}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm font-mono font-semibold text-gray-900">
                                {c.tagId || "—"}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500">
                                ₹{c.amount}
                              </td>
                              <td className="py-3 px-4 text-sm font-bold text-green-600">
                                +₹{c.commission}
                              </td>
                              <td className="py-3 px-4">
                                <select
                                  value={c.status}
                                  onChange={async (e) => {
                                    const newStatus = e.target.value;
                                    const note =
                                      newStatus === "paid"
                                        ? prompt(
                                            "Payment note (e.g. bank transfer, UPI, cash):",
                                            c.paymentNote || "",
                                          )
                                        : "";
                                    if (newStatus === "paid" && note === null)
                                      return;
                                    try {
                                      const res = await API.put(
                                        `/admin/commissions/${c._id}/status`,
                                        {
                                          status: newStatus,
                                          paymentNote: note || "",
                                        },
                                      );
                                      if (res.data.success) {
                                        setSkCommissions((prev) =>
                                          prev.map((x) =>
                                            x._id === c._id
                                              ? {
                                                  ...x,
                                                  status: newStatus,
                                                  paymentNote: note || "",
                                                  paidAt: res.data.data.paidAt,
                                                }
                                              : x,
                                          ),
                                        );
                                        setShopkeepers((prev) =>
                                          prev.map((sk) => {
                                            if (sk._id !== expandedShopkeeper)
                                              return sk;
                                            const delta =
                                              c.commission *
                                              (newStatus === "paid" ? -1 : 1);
                                            return {
                                              ...sk,
                                              pendingCommission:
                                                sk.pendingCommission + delta,
                                              paidCommission:
                                                sk.paidCommission - delta,
                                            };
                                          }),
                                        );
                                      }
                                    } catch {}
                                  }}
                                  className="text-xs font-medium bg-white border border-gray-200 rounded-lg px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="paid">Paid</option>
                                </select>
                              </td>
                              <td
                                className="py-3 px-4 text-sm text-gray-500 max-w-[150px] truncate"
                                title={c.paymentNote}
                              >
                                {c.paymentNote || "—"}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-400">
                                {new Date(c.createdAt).toLocaleDateString()}
                                {c.paidAt && (
                                  <span className="block text-green-600 text-[9px]">
                                    Paid{" "}
                                    {new Date(c.paidAt).toLocaleDateString()}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => {
                                    const note = prompt(
                                      "Update payment note:",
                                      c.paymentNote || "",
                                    );
                                    if (note === null) return;
                                    API.put(
                                      `/admin/commissions/${c._id}/status`,
                                      { status: c.status, paymentNote: note },
                                    )
                                      .then((r) => {
                                        if (r.data.success)
                                          setSkCommissions((prev) =>
                                            prev.map((x) =>
                                              x._id === c._id
                                                ? { ...x, paymentNote: note }
                                                : x,
                                            ),
                                          );
                                      })
                                      .catch(() => {});
                                  }}
                                  className="text-xs font-semibold text-yellow-600 hover:text-gray-900 cursor-pointer"
                                >
                                  <i className="ri-edit-line"></i> Note
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-400 text-sm font-medium">
                        No commission entries for this shopkeeper
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Users Table (simple) */}
          {activeTab === "users" && (
            <div className="mm-card-lg overflow-hidden animate-fade-in-up">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="bg-dark-blue text-white">
                      <th className="text-left py-3 px-4 text-xs font-semibold">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.tags || []).length >
                      0 /* users come from stats separately but let's use a simple approach */ &&
                      null}
                  </tbody>
                </table>
              </div>
              <div className="py-10 text-center text-gray-400 text-sm font-medium">
                <p className="font-extrabold text-lg text-gray-900 mb-1">
                  {stats?.totalUsers || 0} Users
                </p>
                <p>Total registered users on the platform</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
