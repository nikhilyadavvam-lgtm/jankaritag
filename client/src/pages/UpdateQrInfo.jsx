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
          <i className="ri-loader-4-line animate-spin text-4xl text-orange-600"></i>
        </div>
      </Layout>
    );

  if (!user)
    return (
      <Layout>
        <div className="bg-white min-h-screen flex items-center justify-center py-24 px-6">
          <div className="brutal-card p-10 md:p-14 max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-sm bg-neutral-100 flex items-center justify-center mx-auto mb-8 border-2 border-black">
              <i className="ri-lock-2-fill text-4xl text-orange-600"></i>
            </div>
            <h2 className="text-2xl font-black text-black tracking-tight mb-3">
              access restricted
            </h2>
            <p className="text-neutral-500 text-[13px] font-medium mb-8 leading-relaxed">
              authentication required to modify registered asset information.
            </p>
            <Link
              to="/login"
              className="btn-brutal btn-brutal-primary w-full py-4 text-[11px]"
            >
              authenticate identity <i className="ri-arrow-right-line"></i>
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
            <i className="ri-loader-4-line animate-spin text-4xl text-orange-600"></i>
            <p className="text-neutral-400 font-bold text-[11px] uppercase tracking-widest">
              retrieving asset data...
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
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors mb-6 group"
            >
              <i className="ri-arrow-left-s-line text-lg group-hover:-translate-x-1 transition-transform"></i>{" "}
              return to profile
            </button>
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-sm bg-black flex items-center justify-center text-orange-600 border-2 border-black shadow-[4px_4px_0px_#0D0D0D] shrink-0">
                <i className={`${currentLabels.icon} text-2xl md:text-3xl`}></i>
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-black text-black tracking-tight leading-none mb-2">
                  {currentLabels.title}
                </h1>
                <p className="text-neutral-500 font-medium text-[13px]">
                  editing:{" "}
                  <span className="text-black font-mono font-black">
                    {customId}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-500 text-red-600 px-4 md:px-6 py-4 rounded-sm mb-10 flex items-center gap-4">
              <i className="ri-error-warning-fill text-2xl"></i>
              <span className="text-[11px] font-bold uppercase tracking-widest">
                {error}
              </span>
            </div>
          )}

          {data && (
            <div className="animate-fade-in-up">
              <form onSubmit={handleSubmit}>
                <div className="brutal-card p-6 md:p-12 space-y-8">
                  {/* Category badge */}
                  <div className="flex items-center gap-3 pb-6 border-b-2 border-neutral-100">
                    <div className="w-10 h-10 rounded-sm bg-orange-600 text-white flex items-center justify-center border-2 border-black">
                      <i className={`${currentLabels.icon} text-lg`}></i>
                    </div>
                    <div>
                      <h3 className="font-black text-black text-sm uppercase tracking-widest">
                        {form.category.toLowerCase().replace(/_/g, " ")} details
                      </h3>
                      <p className="text-[10px] text-neutral-400 font-medium">
                        update your{" "}
                        {form.category.toLowerCase().replace(/_/g, " ")} tag
                        information
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                        <i className="ri-user-star-line text-orange-600"></i>{" "}
                        {currentLabels.ownerLabel}
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="input-brutal"
                        placeholder={currentLabels.ownerLabel.toLowerCase()}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                        <i className="ri-map-pin-line text-orange-600"></i>{" "}
                        location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        required
                        className="input-brutal"
                        placeholder="city or area"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                        <i className="ri-phone-line text-orange-600"></i>{" "}
                        contact number
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="input-brutal"
                        placeholder="phone number"
                      />
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                      <i className="ri-file-list-3-line text-orange-600 text-base"></i>{" "}
                      {currentLabels.infoLabel}
                    </label>
                    <textarea
                      name="info"
                      value={form.info}
                      onChange={handleChange}
                      rows={3}
                      className="input-brutal resize-none"
                      placeholder={currentLabels.infoPlaceholder}
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={updating}
                      className="btn-brutal btn-brutal-primary w-full py-4 md:py-5 disabled:opacity-50 cursor-pointer"
                    >
                      {updating ? (
                        <>
                          <i className="ri-loader-line animate-spin text-lg"></i>{" "}
                          processing...
                        </>
                      ) : (
                        <>
                          <i className="ri-shield-flash-line text-lg"></i>{" "}
                          update{" "}
                          {form.category.toLowerCase().replace(/_/g, " ")} tag
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
