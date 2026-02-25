import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import API from "../api";

export default function Result() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("No ID provided");
        setLoading(false);
        return;
      }
      try {
        const res = await API.get(`/data?id=${encodeURIComponent(id)}`);
        if (res.data.success) setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading)
    return (
      <Layout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <i className="ri-loader-4-line animate-spin text-4xl text-yellow-500"></i>
            <p className="text-gray-500 text-sm">Finding asset details...</p>
          </div>
        </div>
      </Layout>
    );

  if (error || !data)
    return (
      <Layout>
        <div className="min-h-screen bg-white flex items-center justify-center py-24 px-6">
          <div className="mm-card-lg p-10 md:p-14 max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-8">
              <i className="ri-search-eye-line text-4xl text-red-500"></i>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-3">
              Asset Not Found
            </h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              {error ||
                "We couldn't find any asset linked to this QR code. It may have been removed or the link is incorrect."}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/")}
                className="btn-mm btn-mm-secondary w-full py-3.5"
              >
                <i className="ri-home-line text-base"></i> Go to Home
              </button>
              <Link
                to="/register"
                className="btn-mm btn-mm-primary w-full py-3.5 text-center"
              >
                <i className="ri-add-line text-base"></i> Create Your Own
                JankariTag
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );

  const friendlyLabels = {
    WATER_COOLER: {
      label: "Water Cooler",
      icon: "ri-drop-fill",
      color: "bg-blue-50 text-blue-600",
    },
    VEHICLE: {
      label: "Vehicle",
      icon: "ri-car-fill",
      color: "bg-yellow-50 text-yellow-600",
    },
  };

  const categoryInfo = friendlyLabels[data.category] || {
    label: data.category,
    icon: "ri-price-tag-3-fill",
    color: "bg-gray-50 text-gray-600",
  };

  const infoFields = [
    { label: "Asset Name", value: data.name, icon: "ri-user-star-fill" },
    { label: "Location", value: data.location, icon: "ri-map-pin-2-fill" },
    {
      label: "Contact Number",
      value: data.phone,
      icon: "ri-phone-fill",
      isPhone: true,
    },
    { label: "Details", value: data.info, icon: "ri-file-text-fill" },
  ].filter((field) => field.value);

  return (
    <Layout>
      <div className="bg-white min-h-screen py-16 md:py-24 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Verified Badge */}
          <div className="flex items-center justify-center gap-3 mb-10 animate-fade-in-up">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
              <i className="ri-verified-badge-fill text-green-500 text-lg"></i>
              <span className="text-xs font-semibold text-green-700">
                Verified JankariTag Asset
              </span>
            </div>
          </div>

          {/* Main Info Card */}
          <div className="mm-card-lg overflow-hidden animate-fade-in-up">
            {/* Header */}
            <div className="bg-dark-blue px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${categoryInfo.color}`}
                >
                  <i className={`${categoryInfo.icon} text-2xl`}></i>
                </div>
                <div>
                  <h1 className="text-white font-bold text-xl tracking-tight">
                    {categoryInfo.label}
                  </h1>
                  <p className="text-gray-400 text-xs font-medium">
                    ID: {data.customId}
                  </p>
                </div>
              </div>
            </div>

            {/* Info Fields */}
            <div className="p-8">
              {infoFields.length > 0 ? (
                <div className="space-y-1">
                  {infoFields.map((field, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-5 py-5 ${i < infoFields.length - 1 ? "border-b border-gray-100" : ""}`}
                    >
                      <div className="w-10 h-10 min-w-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                        <i className={`${field.icon} text-lg`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 font-medium mb-1.5">
                          {field.label}
                        </p>
                        {field.isPhone ? (
                          <a
                            href={`tel:${field.value}`}
                            className="text-yellow-600 font-semibold text-base hover:underline underline-offset-4"
                          >
                            {field.value}
                          </a>
                        ) : (
                          <p className="text-gray-900 font-semibold text-base wrap-break-word leading-relaxed">
                            {field.value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="ri-information-line text-3xl text-gray-300 mb-3 block"></i>
                  <p className="text-gray-400 text-sm">
                    The owner has chosen to keep the details private.
                  </p>
                </div>
              )}
            </div>

            {/* QR Image */}
            {data.imgurl && (
              <div className="px-8 pb-8">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 flex items-center gap-5">
                  <img
                    src={data.imgurl}
                    alt="QR Code"
                    className="w-20 h-20 rounded-lg border border-gray-200 object-contain"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">
                      QR Identification Card
                    </p>
                    <p className="text-xs text-gray-400">
                      This asset is registered and verified by JankariTag.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Call to Action buttons */}
            <div className="px-8 pb-8 flex flex-col sm:flex-row gap-3">
              {data.phone && (
                <a
                  href={`tel:${data.phone}`}
                  className="btn-mm btn-mm-secondary flex-1 py-3.5 flex items-center justify-center gap-3"
                >
                  <i className="ri-phone-fill text-lg"></i> Call Owner
                </a>
              )}
              <Link
                to={`/buy-sticker?tagId=${data.customId}`}
                className="btn-mm btn-mm-accent flex-1 py-3.5 flex items-center justify-center gap-3"
              >
                <i className="ri-shopping-cart-2-fill text-lg"></i> Order
                Sticker — ₹59
              </Link>
            </div>
          </div>

          {/* Trust & Privacy Statement */}
          <div className="mt-10 border border-gray-100 rounded-2xl p-6 bg-gray-50 animate-fade-in-up">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 min-w-10 rounded-xl bg-white flex items-center justify-center text-green-600 shadow-sm">
                <i className="ri-shield-check-fill text-lg"></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">
                  Your Privacy Matters
                </h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  JankariTag only displays information that the asset owner has
                  chosen to share publicly. No hidden data is exposed. Owners
                  have full control over what details appear on their JankariTag
                  page. We do not track or store any data about people who scan
                  this QR code.
                </p>
              </div>
            </div>
          </div>

          {/* Create Your Own CTA */}
          <div className="mt-8 mm-card-lg p-8 text-center animate-fade-in-up">
            <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center mx-auto mb-5 text-yellow-600 shadow-sm">
              <i className="ri-qr-code-line text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-2">
              Want to protect your own assets?
            </h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              Create your own JankariTag in under 2 minutes. Track water
              coolers, vehicles, and more with smart QR identification.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="btn-mm btn-mm-accent py-3">
                <i className="ri-add-line text-base"></i> Create Your JankariTag
                — Free
              </Link>
              <Link to="/" className="btn-mm btn-mm-secondary py-3">
                <i className="ri-information-line text-base"></i> Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky call bar */}
      {data.phone && (
        <div className="fixed bottom-0 left-0 right-0 bg-dark-blue text-white text-center py-4 border-t border-yellow-400 sm:hidden z-50 shadow-lg">
          <a
            href={`tel:${data.phone}`}
            className="flex items-center justify-center gap-3 font-semibold text-sm"
          >
            <i className="ri-phone-fill text-xl text-yellow-400"></i> Call
            Owner: {data.phone}
          </a>
        </div>
      )}
    </Layout>
  );
}
