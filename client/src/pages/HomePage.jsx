import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../api";

export default function HomePage() {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await API.get("/config");
        if (res.data.success) {
          setTracks(res.data.data.tracks);
          setPlans(res.data.data.plans);
        }
      } catch (err) {
        console.error("Failed to fetch config:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Flat design icon colors for track cards
  const trackColors = [
    { bg: "bg-yellow-100", icon: "text-yellow-600" },
    { bg: "bg-green-100", icon: "text-green-600" },
    { bg: "bg-pink-100", icon: "text-pink-600" },
    { bg: "bg-blue-100", icon: "text-blue-600" },
  ];

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 bg-gradient-to-br from-gray-50 via-white to-yellow-50 overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl animate-fade-in-up">
              <span className="section-label text-yellow-600 mb-4 inline-block">
                Jankari Tag — Smart QR Tags
              </span>
              <h1 className="font-black text-[clamp(44px,7vw,90px)] tracking-[-3px] text-gray-900 leading-[0.95] mb-6">
                Track <span className="text-yellow-500">Everything.</span>
                <br />
                Lose{" "}
                <span className="underline decoration-yellow-400 decoration-4 underline-offset-8">
                  Nothing.
                </span>
              </h1>
              <p className="text-base text-gray-500 max-w-2xl leading-relaxed mb-10">
                Create a QR tag for your belongings — vehicles, coolers, or
                anything important. Anyone can scan it and find the owner's
                details instantly. Simple and safe.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/qrinfoupload")}
                  className="btn-mm btn-mm-accent"
                >
                  Create Your Tag{" "}
                  <i className="ri-arrow-right-up-line text-base"></i>
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="btn-mm btn-mm-secondary"
                >
                  Sign Up Free <i className="ri-user-add-fill text-base"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Subtle decorative elements */}
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-yellow-200/20 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 right-40 w-48 h-48 rounded-full bg-blue-200/20 blur-3xl pointer-events-none"></div>
        </section>

        {/* Ticker Bar */}
        <div className="bg-yellow-400 py-3 overflow-hidden select-none">
          <div className="flex animate-ticker whitespace-nowrap">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="text-gray-900 text-xs font-bold tracking-widest px-8"
              >
                JankariTag • Smart QR Tags • Scan & Find •
              </span>
            ))}
          </div>
        </div>

        {/* What You Can Track */}
        <section className="py-20 bg-white">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-14 animate-fade-in-up">
              <div className="max-w-2xl">
                <span className="section-label text-yellow-600 mb-3 inline-block">
                  What You Can Track
                </span>
                <h2 className="font-extrabold text-[clamp(26px,4vw,40px)] tracking-tight text-gray-900 leading-tight">
                  Choose What to{" "}
                  <span className="text-yellow-500">Protect.</span>
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mt-3">
                  Create smart QR tags for your water coolers, vehicles, and
                  more. Simple setup, instant results.
                </p>
              </div>
              <div className="h-px flex-1 bg-gray-200 mx-8 hidden lg:block mb-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                <div className="col-span-full py-20 flex items-center justify-center">
                  <i className="ri-loader-4-line animate-spin text-5xl text-yellow-500"></i>
                </div>
              ) : (
                tracks.map((track, idx) => {
                  const color = trackColors[idx % trackColors.length];
                  return (
                    <div
                      key={track.id}
                      className="mm-card p-8 flex flex-col cursor-pointer hover:shadow-lg group"
                      onClick={() =>
                        navigate("/qrinfoupload", {
                          state: { category: track.id },
                        })
                      }
                    >
                      <div
                        className={`w-14 h-14 rounded-xl ${color.bg} flex items-center justify-center mb-6 ${color.icon} group-hover:scale-105 transition-transform`}
                      >
                        <i className={`${track.icon} text-2xl`}></i>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-2">
                        {track.title}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        {track.desc}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {track.items.map((item, j) => (
                          <span
                            key={j}
                            className="px-3 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-500 border border-gray-100"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Why JankariTag */}
        <section className="py-20 bg-gray-50 overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="relative bg-dark-blue p-8 rounded-2xl shadow-xl">
                  <div className="aspect-square bg-white/5 rounded-xl flex items-center justify-center overflow-hidden">
                    <i className="ri-qr-scan-2-line text-[10rem] text-yellow-400 animate-pulse"></i>
                  </div>
                  <div className="absolute -bottom-5 -right-5 w-36 h-36 bg-yellow-400 rounded-2xl shadow-lg flex flex-col items-center justify-center">
                    <p className="text-2xl font-black text-gray-900">99.9%</p>
                    <p className="text-xs font-semibold text-gray-700 mt-1">
                      Uptime
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <span className="section-label text-yellow-600 mb-3 inline-block">
                    Why JankariTag
                  </span>
                  <h2 className="font-extrabold text-[clamp(26px,4vw,40px)] tracking-tight text-gray-900 leading-tight">
                    Simple, Safe &{" "}
                    <span className="text-yellow-500">Reliable.</span>
                  </h2>
                </div>
                <div className="grid gap-6">
                  {[
                    {
                      title: "Safe & Secure",
                      desc: "Your data is stored safely. Only the information you choose is shown when someone scans your QR code.",
                      icon: "ri-shield-check-fill",
                      color: "bg-green-100 text-green-600",
                    },
                    {
                      title: "Quick Access",
                      desc: "Scan the QR code with any phone camera and get all the details instantly. No app needed.",
                      icon: "ri-flashlight-fill",
                      color: "bg-yellow-100 text-yellow-600",
                    },
                    {
                      title: "Easy to Use",
                      desc: "Create a tag in 2 minutes. Print the sticker, stick it on your item, and you're done!",
                      icon: "ri-thumb-up-fill",
                      color: "bg-pink-100 text-pink-600",
                    },
                  ].map((f, i) => (
                    <div key={i} className="flex gap-5">
                      <div
                        className={`w-12 h-12 min-w-12 rounded-xl ${f.color} flex items-center justify-center shadow-sm`}
                      >
                        <i className={`${f.icon} text-xl`}></i>
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-base font-bold text-gray-900 tracking-tight mb-1">
                          {f.title}
                        </h4>
                        <p className="text-gray-500 text-sm leading-relaxed">
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-20 bg-white">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
            <div className="text-center mb-14 animate-fade-in-up">
              <span className="section-label text-yellow-600 mb-3 inline-block">
                Our Plans
              </span>
              <h2 className="font-extrabold text-[clamp(26px,4vw,40px)] tracking-tight text-gray-900 leading-tight mb-3">
                Choose Your <span className="text-yellow-500">Plan.</span>
              </h2>
              <p className="text-sm text-gray-500 max-w-lg mx-auto">
                Get started for free with login via Google or email. Pick the
                plan that works for you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {loading ? (
                <div className="col-span-full py-20 flex items-center justify-center">
                  <i className="ri-loader-4-line animate-spin text-5xl text-yellow-500"></i>
                </div>
              ) : (
                plans.map((plan, i) => (
                  <div
                    key={i}
                    className={`bg-white rounded-2xl p-6 flex flex-col relative transition-all duration-300 ${
                      plan.highlight
                        ? "shadow-xl ring-2 ring-yellow-400 scale-[1.02]"
                        : "shadow-md border border-gray-100 hover:shadow-lg"
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full shadow-sm">
                        Popular
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-end gap-1 mb-5">
                      <span className="text-4xl font-black text-gray-900">
                        {plan.price}
                      </span>
                      <span className="text-sm font-medium text-gray-400 mb-1">
                        {plan.period}
                      </span>
                    </div>
                    <ul className="space-y-3 mb-6 flex-1">
                      {plan.features.map((feature, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <i className="ri-checkbox-circle-fill text-yellow-500 text-base mt-0.5 shrink-0"></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() =>
                        navigate(
                          i === 1 ? "/register" : i === 2 ? "#" : "/register",
                        )
                      }
                      className={`w-full py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all ${
                        plan.highlight
                          ? "bg-yellow-400 text-gray-900 hover:bg-yellow-500 shadow-sm"
                          : "bg-dark-blue text-white hover:opacity-90"
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Sticker Pricing Note */}
            <div className="mm-card p-6 text-center animate-fade-in-up">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                    <i className="ri-sticky-note-fill text-yellow-600 text-lg"></i>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900">
                      Physical Sticker Price
                    </p>
                    <p className="text-xs text-gray-500">
                      Printed QR sticker delivered to your door
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="px-5 py-2 bg-dark-blue text-white rounded-xl text-center">
                    <p className="text-lg font-black">₹59</p>
                    <p className="text-[10px] font-medium opacity-70">
                      1-10 pcs
                    </p>
                  </div>
                  <div className="px-5 py-2 bg-yellow-400 text-gray-900 rounded-xl text-center">
                    <p className="text-lg font-black">₹49</p>
                    <p className="text-[10px] font-medium opacity-70">
                      10+ pcs
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Footer Marquee */}
        <section className="bg-gray-50 py-20 overflow-hidden select-none">
          <div className="flex flex-col items-center">
            <div className="whitespace-nowrap overflow-hidden w-full">
              <div className="flex animate-marquee">
                <h2 className="text-giant text-gray-100 tracking-tighter px-10">
                  JankariTag
                </h2>
                <h2 className="text-giant text-gray-100 tracking-tighter px-10">
                  JankariTag
                </h2>
              </div>
            </div>
            <p className="text-xs font-medium text-gray-300 mt-6 mb-0 tracking-[0.5em] uppercase">
              Smart QR Tags for Everyone
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
