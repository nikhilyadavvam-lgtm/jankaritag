import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import API from "../api";

export default function QrCodeShow() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id");
  const [imgurls, setImgurls] = useState(null);
  const [customId, setCustomId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("No ID provided");
      setLoading(false);
      return;
    }
    API.get(`/genqrcode?id=${encodeURIComponent(id)}`)
      .then((res) => {
        if (res.data.success) {
          setImgurls(res.data.imgurls);
          setCustomId(res.data.customId);
        }
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to generate QR code"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <Layout>
        <div className="min-h-screen bg-white flex items-center justify-center py-24 px-6">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center animate-pulse">
                <i className="ri-qr-code-line text-4xl text-gray-300"></i>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="ri-loader-4-line animate-spin text-2xl text-yellow-500"></i>
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-1">
                Generating QR Code
              </h2>
              <p className="text-gray-400 text-sm">
                Preparing your digital asset identifier...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );

  if (error || !imgurls)
    return (
      <Layout>
        <div className="min-h-screen bg-white flex items-center justify-center py-24 px-6">
          <div className="mm-card-lg p-10 md:p-14 max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-8">
              <i className="ri-error-warning-fill text-4xl text-red-500"></i>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-3">
              Generation Failed
            </h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              {error || "The QR code could not be generated at this time."}
            </p>
            <button
              onClick={() => navigate("/")}
              className="btn-mm btn-mm-secondary w-full py-3.5"
            >
              <i className="ri-home-line text-base"></i> Return to Home
            </button>
          </div>
        </div>
      </Layout>
    );

  const whatsappText = encodeURIComponent(
    `Hello, I want to order this QR sticker for our asset.\n\nCustom ID: ${customId}\nImage Link: ${imgurls.cardImg}`,
  );

  return (
    <Layout>
      <div className="bg-white min-h-screen py-24 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14 animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <i className="ri-qr-code-line text-3xl text-yellow-600"></i>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">
              QR Code Ready
            </h1>
            <p className="text-gray-400 text-sm">
              Asset Identifier:{" "}
              <span className="text-gray-900 font-mono font-semibold">
                {customId}
              </span>
            </p>
          </div>

          <div className="mm-card-lg overflow-hidden animate-fade-in-up">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <i className="ri-image-line text-yellow-500 text-base"></i>{" "}
                  Asset Preview
                </div>
                <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
              </div>

              <div className="relative group rounded-xl overflow-hidden bg-gray-50 p-6 mb-8 border border-gray-100">
                <img
                  src={imgurls.cardImg}
                  alt="QR Card"
                  className="w-full rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={imgurls.cardImg}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="btn-mm btn-mm-primary py-3.5 flex items-center justify-center gap-2 group"
                >
                  <i className="ri-download-cloud-2-line text-lg group-hover:-translate-y-0.5 transition-transform"></i>{" "}
                  Download
                </a>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://wa.me/919667446393?text=${whatsappText}`}
                  className="flex items-center justify-center gap-2 py-3.5 bg-green-500 hover:bg-green-600 text-white font-semibold text-sm rounded-lg transition-all"
                >
                  <i className="ri-whatsapp-line text-lg"></i> Order • ₹59
                </a>
                <button
                  onClick={() => navigate(`/data?id=${customId}`)}
                  className="sm:col-span-2 btn-mm btn-mm-secondary py-3.5"
                >
                  <i className="ri-eye-line text-base"></i> View Registry Page
                </button>
              </div>
            </div>

            <div className="bg-gray-50 px-8 py-5 border-t border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0">
                  <i className="ri-truck-fill text-lg text-yellow-500"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-900 font-bold mb-0.5">
                    Global Logistics
                  </p>
                  <p className="text-xs text-gray-400">
                    Doorstep delivery across India. Ships within 72 hours of
                    verification.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-700 transition-all group"
            >
              <i className="ri-arrow-left-s-line text-lg group-hover:-translate-x-1 transition-transform"></i>{" "}
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
