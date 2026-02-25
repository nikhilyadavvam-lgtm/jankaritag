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
    const token = localStorage.getItem("admin_token");
    if (token) {
      API.get("/admin/me")
        .then((res) => {
          if (res.data.success) setAdminAuth(true);
          else {
            localStorage.removeItem("admin_token");
            setAdminAuth(false);
          }
        })
        .catch(() => {
          localStorage.removeItem("admin_token");
          setAdminAuth(false);
        });
    }
  }, []);

  // Fetch stats when authenticated
  useEffect(() => {
    if (!adminAuth) {
      setLoading(false);
      return;
    }

    API.get("/admin/stats")
      .then((res) => {
        if (res.data.success) setStats(res.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    API.get("/admin/shopkeepers")
      .then((res) => {
        if (res.data.success) setShopkeepers(res.data.data);
      })
      .catch(() => {});
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
        <div className="bg-white min-h-screen flex items-center justify-center py-20 px-4">
          <div className="brutal-card p-8 md:p-10 max-w-md w-full">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-sm bg-black flex items-center justify-center mx-auto mb-4">
                <i className="ri-admin-fill text-3xl text-orange-600"></i>
              </div>
              <h2 className="text-2xl font-black text-black tracking-tight mb-1">
                Admin Login
              </h2>
              <p className="text-neutral-500 text-sm font-medium">
                Enter your admin credentials
              </p>
            </div>

            {loginError && (
              <div className="bg-red-50 border-2 border-red-500 text-red-600 px-4 py-3 rounded-sm mb-6 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                <i className="ri-error-warning-fill text-lg"></i> {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-2 block">
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
                  className="input-brutal"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-2 block">
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
                  className="input-brutal"
                />
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="btn-brutal btn-brutal-primary w-full py-3 disabled:opacity-50"
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
                className="text-sm font-medium text-neutral-400 hover:text-black transition-colors"
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
          <i className="ri-loader-4-line animate-spin text-4xl text-orange-600"></i>
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
  const stickerOrders = allOrders.filter((o) => o.address !== "Online Service");

  const filteredStickerOrders = stickerOrders.filter(
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
  const stickerRevenue = stickerOrders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((s, o) => s + (o.amount || 0), 0);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
    paid: "bg-green-100 text-green-700 border-green-300",
    failed: "bg-red-100 text-red-700 border-red-300",
    processing: "bg-blue-100 text-blue-700 border-blue-300",
    shipped: "bg-purple-100 text-purple-700 border-purple-300",
    delivered: "bg-green-100 text-green-700 border-green-300",
    cancelled: "bg-red-100 text-red-700 border-red-300",
  };

  return (
    <Layout>
      <div className="bg-white min-h-screen py-20 px-4">
        <div className="max-w-[1400px] mx-auto">
          {/* Top Bar */}
          <div className="border-2 border-black rounded-sm bg-black p-6 md:p-8 mb-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-sm bg-orange-600 flex items-center justify-center text-white shrink-0">
                  <i className="ri-dashboard-fill text-2xl"></i>
                </div>
                <div>
                  <h1 className="text-xl font-black text-white tracking-tight mb-0.5">
                    admin dashboard
                  </h1>
                  <p className="text-[10px] font-bold text-neutral-400 tracking-widest">
                    jankaritag control panel
                  </p>
                </div>
              </div>
              <button
                onClick={handleAdminLogout}
                className="px-4 py-2 bg-white/10 text-white rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 transition-all cursor-pointer border border-white/20 hover:border-red-500"
              >
                <i className="ri-logout-circle-r-fill mr-2"></i> Logout
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                {
                  label: "users",
                  value: stats?.totalUsers || 0,
                  icon: "ri-team-fill",
                  color: "text-yellow-400",
                },
                {
                  label: "tags",
                  value: stats?.totalTags || 0,
                  icon: "ri-price-tag-3-fill",
                  color: "text-orange-600",
                },
                {
                  label: "qr codes",
                  value: stats?.totalQRCodes || 0,
                  icon: "ri-qr-code-fill",
                  color: "text-green-400",
                },
                {
                  label: "stickers",
                  value: stats?.totalStickers || 0,
                  icon: "ri-sticky-note-fill",
                  color: "text-blue-400",
                },
                {
                  label: "sticker orders",
                  value: stickerOrders.length,
                  icon: "ri-shopping-cart-2-fill",
                  color: "text-purple-400",
                },
                {
                  label: "service plans",
                  value: servicePayments.length,
                  icon: "ri-global-fill",
                  color: "text-cyan-400",
                },
                {
                  label: "sticker ₹",
                  value: `₹${stickerRevenue}`,
                  icon: "ri-money-rupee-circle-fill",
                  color: "text-emerald-400",
                },
                {
                  label: "service ₹",
                  value: `₹${serviceRevenue}`,
                  icon: "ri-money-rupee-circle-fill",
                  color: "text-sky-400",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-sm px-4 py-3"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <i className={`${stat.icon} ${stat.color} text-sm`}></i>
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                      {stat.label}
                    </span>
                  </div>
                  <p className={`text-2xl font-black ${stat.color}`}>
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
                { key: "tags", label: "tags", icon: "ri-price-tag-3-fill" },
                {
                  key: "orders",
                  label: "stickers",
                  icon: "ri-shopping-cart-2-fill",
                },
                { key: "services", label: "services", icon: "ri-global-fill" },
                {
                  key: "shopkeepers",
                  label: "shopkeepers",
                  icon: "ri-store-2-fill",
                },
                { key: "users", label: "users", icon: "ri-team-fill" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-sm text-[10px] font-bold tracking-widest border-2 transition-all cursor-pointer ${
                    activeTab === tab.key
                      ? "bg-black text-white border-black"
                      : "bg-white text-neutral-500 border-neutral-200 hover:border-black"
                  }`}
                >
                  <i className={`${tab.icon} text-sm`}></i> {tab.label}
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-xl">
              <i className="ri-search-2-line absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"></i>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="input-brutal pl-12 py-3"
              />
            </div>
            <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest text-neutral-400 border-2 border-neutral-200 rounded-sm">
              {activeTab === "orders"
                ? filteredStickerOrders.length
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
            <div className="brutal-card overflow-hidden animate-fade-in-up">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest">
                        Tag ID
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest">
                        Category
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest">
                        Owner
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest">
                        Location
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest">
                        Created By
                      </th>
                      <th className="text-right py-3 px-4 text-[10px] font-black uppercase tracking-widest">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTags.map((tag, i) => (
                      <tr
                        key={tag._id}
                        className={`${i % 2 === 0 ? "bg-white" : "bg-neutral-50"} border-b border-neutral-100`}
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono font-black text-[11px] text-black">
                            {tag.customId}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-200 rounded-sm text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                            {tag.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[12px] font-bold text-black">
                          {tag.name || "—"}
                        </td>
                        <td className="py-3 px-4 text-[12px] font-medium text-neutral-500 truncate max-w-[180px]">
                          {tag.location || "—"}
                        </td>
                        <td className="py-3 px-4 text-[12px] text-neutral-400 font-medium">
                          {tag.createdBy?.name || "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() =>
                                navigate(`/data?id=${tag.customId}`)
                              }
                              className="w-7 h-7 rounded-sm bg-white border border-neutral-200 text-neutral-400 hover:border-orange-600 hover:text-orange-600 transition-all flex items-center justify-center"
                              title="View"
                            >
                              <i className="ri-eye-line text-xs"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteTag(tag._id)}
                              className="w-7 h-7 rounded-sm bg-white border border-neutral-200 text-neutral-400 hover:border-red-500 hover:text-red-500 transition-all flex items-center justify-center"
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
                  <i className="ri-inbox-2-fill text-4xl text-neutral-200 mb-4 block"></i>
                  <p className="text-neutral-400 text-[11px] font-bold uppercase tracking-widest">
                    No tags found
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Orders Table */}
          {activeTab === "orders" && (
            <div className="brutal-card overflow-hidden animate-fade-in-up">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest">
                        Phone
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest">
                        Address
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest">
                        Pincode
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest">
                        Tag ID
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest">
                        Payment
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStickerOrders.map((order, i) => (
                      <tr
                        key={order._id}
                        className={`${i % 2 === 0 ? "bg-white" : "bg-neutral-50"} border-b border-neutral-100`}
                      >
                        <td className="py-3 px-4 text-[12px] font-bold text-black">
                          {order.name}
                        </td>
                        <td className="py-3 px-4 text-[12px] font-medium text-neutral-600">
                          {order.phone}
                        </td>
                        <td
                          className="py-3 px-4 text-[12px] font-medium text-neutral-500 truncate max-w-[200px]"
                          title={order.address}
                        >
                          {order.address}
                        </td>
                        <td className="py-3 px-4 text-[12px] font-mono font-bold text-black">
                          {order.pincode}
                        </td>
                        <td className="py-3 px-4 text-[12px] font-mono text-neutral-500">
                          {order.tagId}
                        </td>
                        <td className="py-3 px-4 text-[12px] font-black text-black">
                          ₹{order.amount}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border ${statusColors[order.paymentStatus] || ""}`}
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
                            className="text-[10px] font-bold uppercase tracking-widest bg-white border-2 border-neutral-200 rounded-sm px-2 py-1 cursor-pointer"
                          >
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-neutral-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredStickerOrders.length === 0 && (
                <div className="py-16 text-center">
                  <i className="ri-shopping-cart-line text-4xl text-neutral-200 mb-4 block"></i>
                  <p className="text-neutral-400 text-[11px] font-bold uppercase tracking-widest">
                    No orders yet
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Services Tab — ₹120 Plan Payments */}
          {activeTab === "services" && (
            <div className="brutal-card overflow-hidden animate-fade-in-up">
              <div className="bg-black px-5 py-3 flex items-center gap-3">
                <i className="ri-global-fill text-cyan-400"></i>
                <span className="text-[10px] font-bold text-neutral-400 tracking-widest">
                  service payments — ₹120 online tag creation
                </span>
              </div>
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="bg-neutral-50">
                      <th className="text-left py-3 px-4 text-[10px] font-black tracking-widest text-neutral-500">
                        user
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-black tracking-widest text-neutral-500">
                        tag id
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-black tracking-widest text-neutral-500">
                        amount
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-black tracking-widest text-neutral-500">
                        payment
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-black tracking-widest text-neutral-500">
                        date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServicePayments.map((p, i) => (
                      <tr
                        key={p._id}
                        className={`${i % 2 === 0 ? "bg-white" : "bg-neutral-50"} border-b border-neutral-100`}
                      >
                        <td className="py-3 px-4 text-[12px] font-bold text-black">
                          {p.name}
                        </td>
                        <td className="py-3 px-4 text-[12px] font-mono text-neutral-500">
                          {p.tagId}
                        </td>
                        <td className="py-3 px-4 text-[12px] font-black text-black">
                          ₹{p.amount}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-sm text-[9px] font-bold tracking-widest border ${statusColors[p.paymentStatus] || ""}`}
                          >
                            {p.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-neutral-400">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredServicePayments.length === 0 && (
                <div className="py-16 text-center">
                  <i className="ri-global-line text-4xl text-neutral-200 mb-4 block"></i>
                  <p className="text-neutral-400 text-sm font-medium">
                    no service payments yet
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Shopkeepers Tab */}
          {activeTab === "shopkeepers" && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="brutal-card overflow-hidden">
                <div className="bg-black px-5 py-3 flex items-center gap-3">
                  <i className="ri-store-2-fill text-orange-400"></i>
                  <span className="text-[10px] font-bold text-neutral-400 tracking-widest">
                    registered shopkeepers — {shopkeepers.length} total
                  </span>
                </div>

                {shopkeepers.length > 0 ? (
                  <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="bg-neutral-50 border-b-2 border-neutral-100">
                          <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            name
                          </th>
                          <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            email
                          </th>
                          <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            code
                          </th>
                          <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            tags
                          </th>
                          <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            referrals
                          </th>
                          <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            sales
                          </th>
                          <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            earned
                          </th>
                          <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            pending
                          </th>
                          <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {shopkeepers.map((sk, i) => (
                          <tr
                            key={sk._id}
                            className={`${i % 2 === 0 ? "bg-white" : "bg-neutral-50"} border-b border-neutral-100`}
                          >
                            <td className="py-3 px-4 text-[12px] font-bold text-black">
                              {sk.name}
                            </td>
                            <td className="py-3 px-4 text-[12px] text-neutral-500">
                              {sk.email}
                            </td>
                            <td className="py-3 px-4 text-[12px] font-mono font-bold text-orange-600">
                              {sk.referralCode || "—"}
                            </td>
                            <td className="py-3 px-4 text-[12px] font-bold text-black">
                              {sk.tagsCount}
                            </td>
                            <td className="py-3 px-4 text-[12px] font-bold text-blue-600">
                              {sk.referralCount}
                            </td>
                            <td className="py-3 px-4 text-[12px] font-bold text-black">
                              ₹{sk.totalSales}
                            </td>
                            <td className="py-3 px-4 text-[12px] font-bold text-green-600">
                              ₹{sk.totalCommission}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${sk.pendingCommission > 0 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
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
                                className="text-[10px] font-bold uppercase tracking-widest text-orange-600 hover:text-black transition-colors cursor-pointer"
                              >
                                {expandedShopkeeper === sk._id
                                  ? "close"
                                  : "manage"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <i className="ri-store-2-line text-4xl text-neutral-200 mb-4 block"></i>
                    <p className="text-neutral-400 text-[11px] font-bold uppercase tracking-widest">
                      no shopkeepers registered yet
                    </p>
                  </div>
                )}
              </div>

              {/* Expanded Shopkeeper Commissions */}
              {expandedShopkeeper && (
                <div className="brutal-card overflow-hidden animate-fade-in-up">
                  <div className="bg-green-600 px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <i className="ri-wallet-3-fill text-white"></i>
                      <span className="text-[10px] font-bold text-green-100 tracking-widest">
                        commissions —{" "}
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
                      className="text-green-100 hover:text-white text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                    >
                      <i className="ri-close-line text-sm"></i> close
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
                          <tr className="bg-neutral-50 border-b-2 border-neutral-100">
                            <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                              type
                            </th>
                            <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                              tag
                            </th>
                            <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                              amount
                            </th>
                            <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                              earned
                            </th>
                            <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                              status
                            </th>
                            <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                              payment note
                            </th>
                            <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                              date
                            </th>
                            <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                              action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {skCommissions.map((c, i) => (
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
                              <td className="py-3 px-4 text-sm font-mono font-bold text-black">
                                {c.tagId || "—"}
                              </td>
                              <td className="py-3 px-4 text-sm text-neutral-500">
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
                                  className="text-[10px] font-bold uppercase tracking-widest bg-white border-2 border-neutral-200 rounded-sm px-2 py-1 cursor-pointer"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="paid">Paid</option>
                                </select>
                              </td>
                              <td
                                className="py-3 px-4 text-[11px] text-neutral-500 max-w-[150px] truncate"
                                title={c.paymentNote}
                              >
                                {c.paymentNote || "—"}
                              </td>
                              <td className="py-3 px-4 text-[11px] text-neutral-400">
                                {new Date(c.createdAt).toLocaleDateString()}
                                {c.paidAt && (
                                  <span className="block text-green-600 text-[9px]">
                                    paid{" "}
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
                                  className="text-[10px] font-bold text-orange-600 hover:text-black cursor-pointer uppercase tracking-widest"
                                >
                                  <i className="ri-edit-line"></i> note
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-neutral-400 text-sm font-medium">
                        no commission entries for this shopkeeper
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Users Table (simple) */}
          {activeTab === "users" && (
            <div className="brutal-card overflow-hidden animate-fade-in-up">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest">
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
              <div className="py-10 text-center text-neutral-400 text-sm font-medium">
                <p className="font-bold text-lg text-black mb-1">
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
