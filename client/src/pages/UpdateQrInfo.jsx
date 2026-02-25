import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import API from "../api";

export default function UpdateQrInfo() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const customId = searchParams.get("customId");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    category: "",
    name: "",
    location: "",
    phone: "",
    info: "",
  });

  const labels = {
    WATER_COOLER: {
      title: "Update Water Cooler Tag",
      ownerLabel: "Service Provider / Person",
      infoLabel: "Maintenance Notes",
      infoPlaceholder: "Cleaning frequency, last serviced date...",
      icon: "ri-drop-fill",
    },
    VEHICLE: {
      title: "Update Vehicle Tag",
      ownerLabel: "Owner Name",
      infoLabel: "Additional Details",
      infoPlaceholder: "Make, model, registration number...",
      icon: "ri-car-fill",
    },
  };

  const currentLabels = labels[form.category] || labels.VEHICLE;

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;
      if (!user) {
        setLoading(false);
        return;
      }
      if (!customId) {
        setError("No Custom ID provided");
        setLoading(false);
        return;
      }

      try {
        const res = await API.get(
          `/update?customId=${encodeURIComponent(customId)}`,
        );
        if (res.data.success) {
          const asset = res.data.data;
          setData(asset);
          setForm({
            category: asset.category || "VEHICLE",
            name: asset.name || "",
            location: asset.location || "",
            phone: asset.phone || "",
            info: asset.info || "",
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [customId, user, authLoading]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    try {
      const res = await API.post(`/qrinfo/update/${data._id}`, form);
      if (res.data.success) navigate(`/data?id=${res.data.customId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
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

  if (!user)
    return (
      <Layout>
        <div className="bg-gradient-to-br from-gray-50 to-yellow-50/30 min-h-screen flex items-center justify-center py-24 px-6">
          <div className="mm-card-lg p-10 md:p-14 max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-2xl bg-yellow-50 flex items-center justify-center mx-auto mb-8">
              <i className="ri-lock-2-fill text-4xl text-yellow-500"></i>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-3">
              Access Restricted
            </h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Authentication required to modify registered asset information.
            </p>
            <Link
              to="/login"
              className="btn-mm btn-mm-primary w-full py-4 text-sm"
            >
              Login <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
        </div>
      </Layout>
    );

  if (loading)
    return (
      <Layout>
        <div className="min-h-screen bg-white flex items-center justify-center py-24 px-6">
          <div className="flex flex-col items-center gap-4">
            <i className="ri-loader-4-line animate-spin text-4xl text-yellow-500"></i>
            <p className="text-gray-400 font-medium text-sm">
              Retrieving asset data...
            </p>
          </div>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="bg-white min-h-screen py-24 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-12 md:mb-16">
            <button
              onClick={() => navigate("/profile")}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors mb-6 group cursor-pointer"
            >
              <i className="ri-arrow-left-s-line text-lg group-hover:-translate-x-1 transition-transform"></i>{" "}
              Return to Profile
            </button>
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-yellow-100 flex items-center justify-center shadow-sm shrink-0">
                <i
                  className={`${currentLabels.icon} text-2xl md:text-3xl text-yellow-600`}
                ></i>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">
                  {currentLabels.title}
                </h1>
                <p className="text-gray-500 font-medium text-sm">
                  Editing:{" "}
                  <span className="text-gray-900 font-mono font-semibold">
                    {customId}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-3 rounded-xl mb-8 flex items-center gap-3">
              <i className="ri-error-warning-fill text-lg"></i>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {data && (
            <div className="animate-fade-in-up">
              <form onSubmit={handleSubmit}>
                <div className="mm-card-lg p-6 md:p-10 space-y-8">
                  {/* Category badge */}
                  <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
                      <i className={`${currentLabels.icon} text-lg`}></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm capitalize">
                        {form.category.toLowerCase().replace(/_/g, " ")} Details
                      </h3>
                      <p className="text-xs text-gray-400">
                        Update your{" "}
                        {form.category.toLowerCase().replace(/_/g, " ")} tag
                        information
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <i className="ri-user-star-line text-yellow-500"></i>{" "}
                        {currentLabels.ownerLabel}
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="input-mm"
                        placeholder={currentLabels.ownerLabel.toLowerCase()}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <i className="ri-map-pin-line text-yellow-500"></i>{" "}
                        Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        required
                        className="input-mm"
                        placeholder="City or area"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <i className="ri-phone-line text-yellow-500"></i>{" "}
                        Contact Number
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="input-mm"
                        placeholder="Phone number"
                      />
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <i className="ri-file-list-3-line text-yellow-500"></i>{" "}
                      {currentLabels.infoLabel}
                    </label>
                    <textarea
                      name="info"
                      value={form.info}
                      onChange={handleChange}
                      rows={3}
                      className="input-mm resize-none"
                      placeholder={currentLabels.infoPlaceholder}
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={updating}
                      className="btn-mm btn-mm-accent w-full py-4 md:py-5 disabled:opacity-50 cursor-pointer text-base"
                    >
                      {updating ? (
                        <>
                          <i className="ri-loader-line animate-spin text-lg"></i>{" "}
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="ri-shield-flash-line text-lg"></i>{" "}
                          Update{" "}
                          {form.category.toLowerCase().replace(/_/g, " ")} Tag
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
