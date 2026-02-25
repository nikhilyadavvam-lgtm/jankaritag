import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import API from "../api";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const [activeTab, setActiveTab] = useState("tags");

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const [tagsRes, ordersRes] = await Promise.all([
          API.get("/my-tags"),
          API.get("/orders/my-orders"),
        ]);

        if (tagsRes.data.success) setTags(tagsRes.data.data);
        if (ordersRes.data.success) setOrders(ordersRes.data.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, authLoading]);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const statusIcons = {
    processing: "ri-loader-4-line",
    shipped: "ri-truck-fill",
    delivered: "ri-checkbox-circle-fill",
    cancelled: "ri-close-circle-fill",
  };

  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const planPayments = orders.filter((o) => o.address === "Online Service");
  const JTagOrders = orders.filter((o) => o.address !== "Online Service");
  const totalSpent = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const totalJTags = JTagOrders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + (o.quantity || 1), 0);

  if (authLoading)
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
        <div className="bg-white min-h-screen flex items-center justify-center py-20 px-4">
          <div className="mm-card-lg p-8 md:p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-yellow-50 flex items-center justify-center mx-auto mb-6">
              <i className="ri-lock-2-fill text-3xl text-yellow-500"></i>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
              Login Required
            </h2>
            <p className="text-gray-500 text-sm font-medium mb-6">
              Please login to see your tags and orders.
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
      <div className="bg-gray-50 min-h-screen py-20 px-4">
        <div className="max-w-[1200px] mx-auto">
          {/* Profile Header */}
          <div className="mm-card-lg p-6 md:p-8 mb-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left">
              <div className="w-16 h-16 rounded-2xl bg-dark-blue flex items-center justify-center text-yellow-400 text-2xl font-black shrink-0">
                {user.name?.charAt(0)?.toUpperCase() || "A"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                  <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none">
                    {user.name}
                  </h1>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-semibold">
                      <i className="ri-checkbox-circle-fill"></i> Active
                    </span>
                    {user.role === "shopkeeper" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-semibold">
                        <i className="ri-store-2-fill"></i> Shopkeeper
                      </span>
                    )}
                    {user.role === "admin" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-semibold">
                        <i className="ri-admin-fill"></i> Admin
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-500 text-sm font-medium flex items-center gap-2 justify-center md:justify-start">
                  <i className="ri-mail-fill text-yellow-500"></i> {user.email}
                </p>
              </div>

              <button
                onClick={() => navigate("/qrinfoupload")}
                className="btn-mm btn-mm-accent w-full md:w-auto"
              >
                <i className="ri-add-line text-lg"></i> Create New Tag
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 pt-6 border-t border-gray-100">
              {[
                {
                  label: "Tags",
                  value: tags.length,
                  icon: "ri-price-tag-3-fill",
                  color: "text-yellow-600",
                  bg: "bg-yellow-50",
                },
                {
                  label: "QR Codes",
                  value: tags.filter(
                    (t) => t.imgurl && !t.imgurl.startsWith("/"),
                  ).length,
                  icon: "ri-qr-code-fill",
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                },
                {
                  label: "Orders",
                  value: orders.length,
                  icon: "ri-shopping-cart-2-fill",
                  color: "text-green-600",
                  bg: "bg-green-50",
                },
                {
                  label: "JTags",
                  value: totalJTags,
                  icon: "ri-sticky-note-fill",
                  color: "text-pink-600",
                  bg: "bg-pink-50",
                },
                {
                  label: "Spent",
                  value: `₹${totalSpent}`,
                  icon: "ri-money-rupee-circle-fill",
                  color: "text-purple-600",
                  bg: "bg-purple-50",
                },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}
                  >
                    <i className={`${stat.icon} ${stat.color} text-base`}></i>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {stat.label}
                    </p>
                    <p className={`text-lg font-extrabold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
            {[
              {
                key: "tags",
                label: "My Tags",
                icon: "ri-price-tag-3-fill",
                count: tags.length,
              },
              {
                key: "orders",
                label: "My Orders",
                icon: "ri-shopping-cart-2-fill",
                count: orders.length,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? "text-white bg-dark-blue shadow-md"
                    : "bg-white text-gray-500 hover:bg-gray-100 shadow-sm"
                }`}
              >
                <i className={`${tab.icon} text-sm`}></i> {tab.label}
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${activeTab === tab.key ? "bg-yellow-400 text-gray-900" : "bg-gray-100 text-gray-400"}`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* ────────────────── TAGS TAB ────────────────── */}
          {activeTab === "tags" && (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <i className="ri-loader-4-line animate-spin text-5xl text-yellow-500"></i>
                </div>
              ) : tags.length === 0 ? (
                <div className="mm-card-lg p-12 text-center animate-fade-in-up">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-6">
                    <i className="ri-price-tag-3-line text-3xl text-gray-300"></i>
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
                    No Tags Yet
                  </h2>
                  <p className="text-gray-400 text-sm font-medium max-w-sm mx-auto mb-8">
                    You haven't created any tags. Create your first tag to get
                    started!
                  </p>
                  <button
                    onClick={() => navigate("/qrinfoupload")}
                    className="btn-mm btn-mm-accent"
                  >
                    Create First Tag
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in-up">
                  {tags.map((tag) => (
                    <div
                      key={tag._id}
                      className="mm-card h-full flex flex-col overflow-hidden"
                    >
                      {/* JTag Image */}
                      <div className="relative aspect-16/11 bg-gray-50 overflow-hidden flex items-center justify-center">
                        {tag.imgurl && !tag.imgurl.startsWith("/") ? (
                          <img
                            src={tag.imgurl}
                            alt={tag.customId}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-2 text-gray-300">
                            <i className="ri-qr-code-line text-3xl"></i>
                            <p className="text-[10px] font-semibold text-gray-400">
                              Pending
                            </p>
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <span className="px-2.5 py-1 bg-dark-blue text-yellow-400 text-[9px] font-bold rounded-lg">
                            {tag.category}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="px-2.5 py-1 bg-yellow-400 text-gray-900 text-[9px] font-bold rounded-lg">
                            ₹59
                          </span>
                        </div>
                      </div>

                      {/* Tag Info */}
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="font-bold text-gray-900 text-base leading-tight truncate flex-1">
                            {tag.name || "No Name"}
                          </h3>
                          <span className="text-[9px] font-semibold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-lg border border-gray-100 font-mono shrink-0">
                            #{tag.customId}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4 text-xs text-gray-500">
                          <div className="flex items-center gap-2">
                            <i className="ri-map-pin-2-fill text-yellow-500 text-sm"></i>
                            <span className="truncate">
                              {tag.location || "Not set"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <i className="ri-calendar-fill text-gray-300 text-sm"></i>
                            <span>
                              {new Date(tag.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 mt-auto">
                          <button
                            onClick={() => setSelectedTag(tag)}
                            className="py-2.5 bg-dark-blue text-white rounded-lg text-xs font-semibold cursor-pointer transition-all hover:opacity-90"
                          >
                            View
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/update?customId=${tag.customId}`)
                            }
                            className="py-2.5 bg-white text-gray-600 rounded-lg text-xs font-semibold border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/buy-JTag?tagId=${tag.customId}`)
                            }
                            className="col-span-2 py-2.5 bg-yellow-400 text-gray-900 rounded-lg text-xs font-bold cursor-pointer flex items-center justify-center gap-2 hover:bg-yellow-500 transition-all"
                          >
                            <i className="ri-shopping-cart-2-fill text-sm"></i>{" "}
                            Buy JTag — ₹59
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ────────────────── ORDERS TAB ────────────────── */}
          {activeTab === "orders" && (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <i className="ri-loader-4-line animate-spin text-5xl text-yellow-500"></i>
                </div>
              ) : orders.length === 0 ? (
                <div className="mm-card-lg p-8 md:p-12 text-center animate-fade-in-up">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-6">
                    <i className="ri-shopping-cart-line text-3xl text-gray-300"></i>
                  </div>
                  <h2 className="text-xl font-extrabold text-gray-900 mb-3">
                    No Orders Yet
                  </h2>
                  <p className="text-gray-400 text-sm font-medium max-w-sm mx-auto mb-8">
                    You haven't made any purchases yet. Create a tag or buy
                    JTags!
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="btn-mm btn-mm-primary"
                  >
                    Go to Home
                  </button>
                </div>
              ) : (
                <div className="space-y-8 animate-fade-in-up">
                  {/* ── Plan Payments ₹120 ── */}
                  {planPayments.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <i className="ri-global-fill text-blue-600 text-sm"></i>
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm">
                          Plan Payments — ₹120 Online Service
                        </h3>
                        <span className="ml-auto text-[10px] font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                          {planPayments.length} payments
                        </span>
                      </div>
                      <div className="mm-card-lg overflow-hidden">
                        <div className="overflow-x-auto scrollbar-hide">
                          <table className="w-full min-w-[500px]">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                                  Tag ID
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                                  Amount
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                                  Status
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">
                                  Date
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {planPayments.map((p, i) => (
                                <tr
                                  key={p._id}
                                  className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-gray-50`}
                                >
                                  <td className="py-3 px-4 text-sm font-mono font-semibold text-gray-900">
                                    {p.tagId}
                                  </td>
                                  <td className="py-3 px-4 text-sm font-bold text-gray-900">
                                    ₹{p.amount}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusColors[p.paymentStatus]}`}
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
                      </div>
                    </div>
                  )}

                  {/* ── JTag Orders ── */}
                  {JTagOrders.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                          <i className="ri-shopping-bag-fill text-yellow-600 text-sm"></i>
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm">
                          JTag Orders
                        </h3>
                        <span className="ml-auto text-[10px] font-semibold bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full">
                          {JTagOrders.length} orders
                        </span>
                      </div>
                      <div className="space-y-4">
                        {JTagOrders.map((order) => (
                          <div
                            key={order._id}
                            className="mm-card-lg overflow-hidden"
                          >
                            {/* Order Header */}
                            <div className="bg-dark-blue px-5 py-3 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <i
                                  className={`${order.address === "Online Service" ? "ri-global-fill" : "ri-shopping-bag-fill"} text-yellow-400`}
                                ></i>
                                <span className="text-xs font-medium text-gray-400">
                                  Order #{order._id?.slice(-8)}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                                    order.address === "Online Service"
                                      ? "bg-blue-500 text-white"
                                      : "bg-yellow-400 text-gray-900"
                                  }`}
                                >
                                  {order.address === "Online Service"
                                    ? "Plan ₹120"
                                    : "JTag"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold ${statusColors[order.paymentStatus]}`}
                                >
                                  <i className="ri-bank-card-fill mr-1"></i>
                                  {order.paymentStatus}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold ${statusColors[order.orderStatus]}`}
                                >
                                  <i
                                    className={`${statusIcons[order.orderStatus] || "ri-loader-4-line"} mr-1`}
                                  ></i>
                                  {order.orderStatus}
                                </span>
                              </div>
                            </div>

                            {/* Order Body */}
                            <div className="p-5">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <div>
                                  <p className="text-[10px] font-medium text-gray-400 mb-1">
                                    Tag ID
                                  </p>
                                  <p className="text-sm font-bold text-gray-900 font-mono">
                                    {order.tagId}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-medium text-gray-400 mb-1">
                                    Quantity
                                  </p>
                                  <p className="text-sm font-bold text-gray-900">
                                    {order.quantity || 1} JTag
                                    {(order.quantity || 1) > 1 ? "s" : ""}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-medium text-gray-400 mb-1">
                                    Amount
                                  </p>
                                  <p className="text-sm font-bold text-yellow-600">
                                    ₹{order.amount}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-medium text-gray-400 mb-1">
                                    Date
                                  </p>
                                  <p className="text-sm font-medium text-gray-500">
                                    {new Date(
                                      order.createdAt,
                                    ).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>

                              {/* Delivery Info */}
                              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                                <p className="text-[10px] font-semibold text-gray-400 mb-3 flex items-center gap-1.5">
                                  <i className="ri-truck-fill text-yellow-500 text-sm"></i>{" "}
                                  Delivery Details
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                  <div>
                                    <p className="text-[10px] font-medium text-gray-300 mb-0.5">
                                      Name
                                    </p>
                                    <p className="font-semibold text-gray-900">
                                      {order.name}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-medium text-gray-300 mb-0.5">
                                      Phone
                                    </p>
                                    <p className="font-semibold text-gray-900">
                                      {order.phone}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-medium text-gray-300 mb-0.5">
                                      Pincode
                                    </p>
                                    <p className="font-semibold text-gray-900 font-mono">
                                      {order.pincode}
                                    </p>
                                  </div>
                                  <div className="col-span-2 md:col-span-1">
                                    <p className="text-[10px] font-medium text-gray-300 mb-0.5">
                                      Address
                                    </p>
                                    <p className="font-medium text-gray-600 text-[13px]">
                                      {order.address}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Delivery Tracker */}
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                  {["processing", "shipped", "delivered"].map(
                                    (step, i) => {
                                      const stepOrder = [
                                        "processing",
                                        "shipped",
                                        "delivered",
                                      ];
                                      const currentIdx = stepOrder.indexOf(
                                        order.orderStatus,
                                      );
                                      const isCompleted =
                                        i <= currentIdx &&
                                        order.orderStatus !== "cancelled";
                                      const isCurrent =
                                        step === order.orderStatus;
                                      const isCancelled =
                                        order.orderStatus === "cancelled";

                                      return (
                                        <div
                                          key={step}
                                          className="flex items-center gap-2 flex-1 min-w-0"
                                        >
                                          <div
                                            className={`w-7 h-7 min-w-7 rounded-full flex items-center justify-center text-sm ${
                                              isCancelled
                                                ? "bg-red-50 text-red-400"
                                                : isCompleted
                                                  ? "bg-green-100 text-green-600"
                                                  : isCurrent
                                                    ? "bg-yellow-100 text-yellow-600"
                                                    : "bg-gray-50 text-gray-300"
                                            }`}
                                          >
                                            <i
                                              className={`${
                                                isCancelled
                                                  ? "ri-close-fill"
                                                  : isCompleted
                                                    ? "ri-check-fill"
                                                    : statusIcons[step] ||
                                                      "ri-more-fill"
                                              } text-xs`}
                                            ></i>
                                          </div>
                                          <span
                                            className={`text-[10px] font-semibold whitespace-nowrap capitalize ${
                                              isCancelled
                                                ? "text-red-400"
                                                : isCompleted
                                                  ? "text-green-600"
                                                  : isCurrent
                                                    ? "text-yellow-600"
                                                    : "text-gray-300"
                                            }`}
                                          >
                                            {step}
                                          </span>
                                          {i < 2 && (
                                            <div
                                              className={`h-0.5 flex-1 min-w-4 rounded-full ${
                                                isCancelled
                                                  ? "bg-red-200"
                                                  : i < currentIdx
                                                    ? "bg-green-400"
                                                    : "bg-gray-200"
                                              }`}
                                            ></div>
                                          )}
                                        </div>
                                      );
                                    },
                                  )}
                                </div>
                                {order.orderStatus === "cancelled" && (
                                  <p className="text-red-500 text-xs font-semibold mt-2">
                                    <i className="ri-error-warning-fill mr-1"></i>{" "}
                                    This order was cancelled
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tag Detail Popup */}
      {selectedTag && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up"
          onClick={() => setSelectedTag(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-dark-blue px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center">
                  <i className="ri-price-tag-3-fill text-xl text-gray-900"></i>
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none mb-0.5 capitalize">
                    {selectedTag.category?.toLowerCase().replace(/_/g, " ")}
                  </h3>
                  <p className="text-[10px] font-medium text-gray-400">
                    Tag Details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTag(null)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center cursor-pointer"
              >
                <i className="ri-close-fill text-xl"></i>
              </button>
            </div>

            <div className="p-6">
              {selectedTag.imgurl && !selectedTag.imgurl.startsWith("/") && (
                <div className="mb-6 overflow-hidden rounded-xl bg-gray-50 border border-gray-100 p-3">
                  <img
                    src={selectedTag.imgurl}
                    alt="JTag"
                    className="w-full rounded-lg"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1">
                {[
                  {
                    label: "Tag ID",
                    value: selectedTag.customId,
                    icon: "ri-hashtag",
                  },
                  {
                    label: "Owner Name",
                    value: selectedTag.name,
                    icon: "ri-user-fill",
                  },
                  {
                    label: "Location",
                    value: selectedTag.location,
                    icon: "ri-map-pin-fill",
                  },
                  {
                    label: "Phone",
                    value: selectedTag.phone,
                    icon: "ri-phone-fill",
                  },
                  {
                    label: "Details",
                    value: selectedTag.info,
                    icon: "ri-file-text-fill",
                    full: true,
                  },
                ].map((field, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-4 py-4 border-b border-gray-100 ${field.full ? "md:col-span-2" : ""}`}
                  >
                    <div className="w-9 h-9 min-w-9 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                      <i className={`${field.icon} text-base`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 font-medium mb-1">
                        {field.label}
                      </p>
                      <p className="text-gray-900 font-semibold text-sm wrap-break-word">
                        {field.value || "Not set"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={() => {
                    navigate(`/update?customId=${selectedTag.customId}`);
                    setSelectedTag(null);
                  }}
                  className="btn-mm btn-mm-secondary flex-1 py-3"
                >
                  Edit Tag
                </button>
                <button
                  onClick={() => {
                    navigate(`/buy-JTag?tagId=${selectedTag.customId}`);
                    setSelectedTag(null);
                  }}
                  className="btn-mm btn-mm-accent flex-[1.5] py-3 flex items-center justify-center gap-2"
                >
                  <i className="ri-shopping-cart-2-fill text-lg"></i> Buy
                  JTag — ₹59
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
