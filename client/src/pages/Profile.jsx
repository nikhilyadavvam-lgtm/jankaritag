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
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    Promise.all([
      API.get("/my-tags")
        .then((res) => {
          if (res.data.success) setTags(res.data.data);
        })
        .catch(() => {}),
      API.get("/orders/my-orders")
        .then((res) => {
          if (res.data.success) setOrders(res.data.data);
        })
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [user, authLoading]);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
    paid: "bg-green-100 text-green-700 border-green-300",
    failed: "bg-red-100 text-red-700 border-red-300",
    processing: "bg-blue-100 text-blue-700 border-blue-300",
    shipped: "bg-purple-100 text-purple-700 border-purple-300",
    delivered: "bg-green-100 text-green-700 border-green-300",
    cancelled: "bg-red-100 text-red-700 border-red-300",
  };

  const statusIcons = {
    processing: "ri-loader-4-line",
    shipped: "ri-truck-fill",
    delivered: "ri-checkbox-circle-fill",
    cancelled: "ri-close-circle-fill",
  };

  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const planPayments = orders.filter((o) => o.address === "Online Service");
  const stickerOrders = orders.filter((o) => o.address !== "Online Service");
  const totalSpent = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const totalStickers = stickerOrders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + (o.quantity || 1), 0);

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
        <div className="bg-white min-h-screen flex items-center justify-center py-20 px-4">
          <div className="brutal-card p-8 md:p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-sm bg-neutral-100 flex items-center justify-center mx-auto mb-6 border-2 border-black">
              <i className="ri-lock-2-fill text-3xl text-orange-600"></i>
            </div>
            <h2 className="text-2xl font-black text-black tracking-tight mb-2">
              Login Required
            </h2>
            <p className="text-neutral-500 text-sm font-medium mb-6">
              Please login to see your tags and orders.
            </p>
            <Link
              to="/login"
              className="btn-brutal btn-brutal-primary w-full py-3 text-[11px]"
            >
              Login <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="bg-white min-h-screen py-20 px-4">
        <div className="max-w-[1200px] mx-auto">
          {/* Profile Header */}
          <div className="brutal-card p-6 md:p-8 mb-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left">
              <div className="w-16 h-16 rounded-sm bg-black flex items-center justify-center text-orange-600 text-2xl font-black shrink-0 border-2 border-black">
                {user.name?.charAt(0)?.toUpperCase() || "A"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                  <h1 className="text-2xl font-black text-black tracking-tight leading-none">
                    {user.name}
                  </h1>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-sm text-[10px] font-bold uppercase tracking-widest border border-green-300">
                      <i className="ri-checkbox-circle-fill"></i> Active
                    </span>
                    {user.role === "shopkeeper" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-sm text-[10px] font-bold uppercase tracking-widest border border-orange-300">
                        <i className="ri-store-2-fill"></i> Shopkeeper
                      </span>
                    )}
                    {user.role === "admin" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-sm text-[10px] font-bold uppercase tracking-widest border border-purple-300">
                        <i className="ri-admin-fill"></i> Admin
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-neutral-500 text-sm font-medium flex items-center gap-2 justify-center md:justify-start">
                  <i className="ri-mail-fill text-orange-600"></i> {user.email}
                </p>
              </div>

              <button
                onClick={() => navigate("/qrinfoupload")}
                className="btn-brutal btn-brutal-primary w-full md:w-auto"
              >
                <i className="ri-add-line text-lg"></i> Create New Tag
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 pt-6 border-t-2 border-black">
              <div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <i className="ri-price-tag-3-fill text-orange-600"></i> Tags
                </p>
                <p className="text-3xl font-black text-black">{tags.length}</p>
              </div>
              <div className="border-l-2 border-black pl-4">
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <i className="ri-qr-code-fill text-orange-600"></i> QR Codes
                </p>
                <p className="text-3xl font-black text-orange-600">
                  {
                    tags.filter((t) => t.imgurl && !t.imgurl.startsWith("/"))
                      .length
                  }
                </p>
              </div>
              <div className="border-l-2 border-black pl-4">
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <i className="ri-shopping-cart-2-fill text-orange-600"></i>{" "}
                  Orders
                </p>
                <p className="text-3xl font-black text-black">
                  {orders.length}
                </p>
              </div>
              <div className="border-l-2 border-black pl-4">
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <i className="ri-sticky-note-fill text-orange-600"></i>{" "}
                  Stickers
                </p>
                <p className="text-3xl font-black text-black">
                  {totalStickers}
                </p>
              </div>
              <div className="border-l-2 border-black pl-4">
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <i className="ri-money-rupee-circle-fill text-orange-600"></i>{" "}
                  Spent
                </p>
                <p className="text-3xl font-black text-green-600">
                  ₹{totalSpent}
                </p>
              </div>
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
                className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-widest border-2 transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-black text-white border-black"
                    : "bg-white text-neutral-500 border-neutral-200 hover:border-black"
                }`}
              >
                <i className={`${tab.icon} text-sm`}></i> {tab.label}
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-sm text-[9px] ${activeTab === tab.key ? "bg-orange-600 text-white" : "bg-neutral-100 text-neutral-400"}`}
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
                  <i className="ri-loader-4-line animate-spin text-5xl text-orange-600"></i>
                </div>
              ) : tags.length === 0 ? (
                <div className="brutal-card p-12 text-center animate-fade-in-up">
                  <div className="w-16 h-16 rounded-sm bg-neutral-100 flex items-center justify-center mx-auto mb-6 border-2 border-neutral-200">
                    <i className="ri-price-tag-3-line text-3xl text-neutral-300"></i>
                  </div>
                  <h2 className="text-2xl font-black text-black mb-3">
                    No Tags Yet
                  </h2>
                  <p className="text-neutral-400 text-sm font-medium max-w-sm mx-auto mb-8">
                    You haven't created any tags. Create your first tag to get
                    started!
                  </p>
                  <button
                    onClick={() => navigate("/qrinfoupload")}
                    className="btn-brutal btn-brutal-primary"
                  >
                    Create First Tag
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in-up">
                  {tags.map((tag) => (
                    <div
                      key={tag._id}
                      className="brutal-card h-full flex flex-col overflow-hidden"
                    >
                      {/* Sticker Image */}
                      <div className="relative aspect-[16/11] bg-neutral-50 overflow-hidden flex items-center justify-center border-b-2 border-black">
                        {tag.imgurl && !tag.imgurl.startsWith("/") ? (
                          <img
                            src={tag.imgurl}
                            alt={tag.customId}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-2 text-neutral-300">
                            <i className="ri-qr-code-line text-3xl"></i>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                              Pending
                            </p>
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 bg-black text-orange-600 text-[8px] font-black uppercase tracking-widest rounded-sm">
                            {tag.category}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-0.5 bg-orange-600 text-white text-[9px] font-black rounded-sm">
                            ₹59
                          </span>
                        </div>
                      </div>

                      {/* Tag Info */}
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="font-black text-black text-base leading-tight truncate flex-1">
                            {tag.name || "No Name"}
                          </h3>
                          <span className="text-[9px] font-black text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-sm border border-neutral-200 font-mono shrink-0">
                            #{tag.customId}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4 text-[10px] font-medium text-neutral-500">
                          <div className="flex items-center gap-2">
                            <i className="ri-map-pin-2-fill text-orange-600 text-sm"></i>
                            <span className="truncate">
                              {tag.location || "Not set"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <i className="ri-calendar-fill text-neutral-300 text-sm"></i>
                            <span>
                              {new Date(tag.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 mt-auto">
                          <button
                            onClick={() => setSelectedTag(tag)}
                            className="py-2.5 bg-black text-white rounded-sm text-[9px] font-black uppercase tracking-widest cursor-pointer border-2 border-black"
                          >
                            View
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/update?customId=${tag.customId}`)
                            }
                            className="py-2.5 bg-white text-neutral-600 rounded-sm text-[9px] font-black uppercase tracking-widest border-2 border-neutral-200 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/buy-sticker?tagId=${tag.customId}`)
                            }
                            className="col-span-2 py-2.5 bg-orange-600 text-white rounded-sm text-[9px] font-black uppercase tracking-widest border-2 border-orange-600 cursor-pointer flex items-center justify-center gap-2"
                          >
                            <i className="ri-shopping-cart-2-fill text-sm"></i>{" "}
                            Buy Sticker — ₹59
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
                  <i className="ri-loader-4-line animate-spin text-5xl text-orange-600"></i>
                </div>
              ) : orders.length === 0 ? (
                <div className="brutal-card p-8 md:p-12 text-center animate-fade-in-up">
                  <div className="w-16 h-16 rounded-sm bg-neutral-100 flex items-center justify-center mx-auto mb-6 border-2 border-neutral-200">
                    <i className="ri-shopping-cart-line text-3xl text-neutral-300"></i>
                  </div>
                  <h2 className="text-xl font-black text-black mb-3">
                    no orders yet
                  </h2>
                  <p className="text-neutral-400 text-sm font-medium max-w-sm mx-auto mb-8">
                    you haven't made any purchases yet. create a tag or buy
                    stickers!
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="btn-brutal btn-brutal-primary"
                  >
                    go to home
                  </button>
                </div>
              ) : (
                <div className="space-y-8 animate-fade-in-up">
                  {/* ── Plan Payments ₹120 ── */}
                  {planPayments.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-sm bg-blue-500 flex items-center justify-center">
                          <i className="ri-global-fill text-white text-sm"></i>
                        </div>
                        <h3 className="font-black text-black text-sm">
                          plan payments — ₹120 online service
                        </h3>
                        <span className="ml-auto text-[9px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-sm">
                          {planPayments.length} payments
                        </span>
                      </div>
                      <div className="brutal-card overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[500px]">
                            <thead>
                              <tr className="bg-neutral-50 border-b-2 border-black">
                                <th className="text-left py-2.5 px-4 text-[10px] font-black text-neutral-500 tracking-wide">
                                  tag id
                                </th>
                                <th className="text-left py-2.5 px-4 text-[10px] font-black text-neutral-500 tracking-wide">
                                  amount
                                </th>
                                <th className="text-left py-2.5 px-4 text-[10px] font-black text-neutral-500 tracking-wide">
                                  status
                                </th>
                                <th className="text-left py-2.5 px-4 text-[10px] font-black text-neutral-500 tracking-wide">
                                  date
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {planPayments.map((p, i) => (
                                <tr
                                  key={p._id}
                                  className={`${i % 2 === 0 ? "bg-white" : "bg-neutral-50"} border-b border-neutral-100`}
                                >
                                  <td className="py-2.5 px-4 text-[12px] font-mono font-bold text-black">
                                    {p.tagId}
                                  </td>
                                  <td className="py-2.5 px-4 text-[12px] font-black text-black">
                                    ₹{p.amount}
                                  </td>
                                  <td className="py-2.5 px-4">
                                    <span
                                      className={`px-2 py-0.5 rounded-sm text-[9px] font-bold tracking-wide border ${statusColors[p.paymentStatus]}`}
                                    >
                                      {p.paymentStatus}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-4 text-[11px] text-neutral-400">
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

                  {/* ── Sticker Orders ── */}
                  {stickerOrders.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-sm bg-orange-600 flex items-center justify-center">
                          <i className="ri-shopping-bag-fill text-white text-sm"></i>
                        </div>
                        <h3 className="font-black text-black text-sm">
                          sticker orders
                        </h3>
                        <span className="ml-auto text-[9px] font-black bg-orange-100 text-orange-700 px-2 py-0.5 rounded-sm">
                          {stickerOrders.length} orders
                        </span>
                      </div>
                      <div className="space-y-4">
                        {stickerOrders.map((order) => (
                          <div
                            key={order._id}
                            className="brutal-card overflow-hidden"
                          >
                            {/* Order Header */}
                            <div className="bg-black px-5 py-3 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <i
                                  className={`${order.address === "Online Service" ? "ri-global-fill" : "ri-shopping-bag-fill"} text-orange-600`}
                                ></i>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                  Order #{order._id?.slice(-8)}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest ${
                                    order.address === "Online Service"
                                      ? "bg-blue-500 text-white"
                                      : "bg-orange-600 text-white"
                                  }`}
                                >
                                  {order.address === "Online Service"
                                    ? "Plan ₹120"
                                    : "Sticker"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border ${statusColors[order.paymentStatus]}`}
                                >
                                  <i className="ri-bank-card-fill mr-1"></i>
                                  {order.paymentStatus}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border ${statusColors[order.orderStatus]}`}
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
                                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                                    Tag ID
                                  </p>
                                  <p className="text-sm font-black text-black font-mono">
                                    {order.tagId}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                                    Quantity
                                  </p>
                                  <p className="text-sm font-black text-black">
                                    {order.quantity || 1} sticker
                                    {(order.quantity || 1) > 1 ? "s" : ""}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                                    Amount
                                  </p>
                                  <p className="text-sm font-black text-orange-600">
                                    ₹{order.amount}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                                    Date
                                  </p>
                                  <p className="text-sm font-bold text-neutral-500">
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
                              <div className="bg-neutral-50 border-2 border-neutral-100 rounded-sm p-4">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-3 flex items-center gap-1.5">
                                  <i className="ri-truck-fill text-orange-600 text-sm"></i>{" "}
                                  Delivery Details
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                  <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-300 mb-0.5">
                                      Name
                                    </p>
                                    <p className="font-bold text-black">
                                      {order.name}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-300 mb-0.5">
                                      Phone
                                    </p>
                                    <p className="font-bold text-black">
                                      {order.phone}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-300 mb-0.5">
                                      Pincode
                                    </p>
                                    <p className="font-bold text-black font-mono">
                                      {order.pincode}
                                    </p>
                                  </div>
                                  <div className="col-span-2 md:col-span-1">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-300 mb-0.5">
                                      Address
                                    </p>
                                    <p className="font-medium text-neutral-600 text-[13px]">
                                      {order.address}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Delivery Tracker */}
                              <div className="mt-4 pt-4 border-t-2 border-neutral-100">
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
                                            className={`w-7 h-7 min-w-7 rounded-sm flex items-center justify-center border-2 text-sm ${
                                              isCancelled
                                                ? "bg-red-50 border-red-300 text-red-400"
                                                : isCompleted
                                                  ? "bg-green-100 border-green-500 text-green-600"
                                                  : isCurrent
                                                    ? "bg-orange-100 border-orange-500 text-orange-600"
                                                    : "bg-neutral-50 border-neutral-200 text-neutral-300"
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
                                            className={`text-[9px] font-bold uppercase tracking-widest whitespace-nowrap ${
                                              isCancelled
                                                ? "text-red-400"
                                                : isCompleted
                                                  ? "text-green-600"
                                                  : isCurrent
                                                    ? "text-orange-600"
                                                    : "text-neutral-300"
                                            }`}
                                          >
                                            {step}
                                          </span>
                                          {i < 2 && (
                                            <div
                                              className={`h-0.5 flex-1 min-w-4 ${
                                                isCancelled
                                                  ? "bg-red-200"
                                                  : i < currentIdx
                                                    ? "bg-green-400"
                                                    : "bg-neutral-200"
                                              }`}
                                            ></div>
                                          )}
                                        </div>
                                      );
                                    },
                                  )}
                                </div>
                                {order.orderStatus === "cancelled" && (
                                  <p className="text-red-500 text-[11px] font-bold mt-2">
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
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in-up"
          onClick={() => setSelectedTag(null)}
        >
          <div
            className="bg-white rounded-sm border-2 border-black shadow-[8px_8px_0px_#0D0D0D] max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-orange-600 px-6 py-4 flex items-center justify-between border-b-2 border-black">
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-sm bg-black flex items-center justify-center">
                  <i className="ri-price-tag-3-fill text-xl text-orange-600"></i>
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-widest text-sm leading-none mb-0.5">
                    {selectedTag.category}
                  </h3>
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">
                    Tag Details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTag(null)}
                className="w-9 h-9 rounded-sm bg-white/20 hover:bg-black text-white hover:text-orange-600 transition-all flex items-center justify-center border-2 border-white/30 hover:border-black"
              >
                <i className="ri-close-fill text-xl font-black"></i>
              </button>
            </div>

            <div className="p-6">
              {selectedTag.imgurl && !selectedTag.imgurl.startsWith("/") && (
                <div className="mb-6 overflow-hidden rounded-sm bg-neutral-50 border-2 border-black p-3">
                  <img
                    src={selectedTag.imgurl}
                    alt="Sticker"
                    className="w-full rounded-sm"
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
                    className={`flex items-start gap-4 py-4 border-b-2 border-neutral-100 ${field.full ? "md:col-span-2" : ""}`}
                  >
                    <div className="w-9 h-9 min-w-9 rounded-sm bg-white flex items-center justify-center text-orange-600 border-2 border-black">
                      <i className={`${field.icon} text-base`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1">
                        {field.label}
                      </p>
                      <p className="text-black font-bold text-sm break-words">
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
                  className="btn-brutal btn-brutal-secondary flex-1 py-3"
                >
                  Edit Tag
                </button>
                <button
                  onClick={() => {
                    navigate(`/buy-sticker?tagId=${selectedTag.customId}`);
                    setSelectedTag(null);
                  }}
                  className="btn-brutal btn-brutal-primary flex-[1.5] py-3 flex items-center justify-center gap-2"
                >
                  <i className="ri-shopping-cart-2-fill text-lg"></i> Buy
                  Sticker — ₹59
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
