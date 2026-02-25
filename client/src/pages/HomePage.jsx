import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function HomePage() {
  const navigate = useNavigate();

  const tracks = [
    {
      id: "WATER_COOLER",
      title: "Water Cooler",
      desc: "Track cleaning dates, maintenance, and hygiene records for water coolers. Anyone can scan the QR and see the details instantly.",
      icon: "ri-drop-fill",
      items: ["Cleaning Dates", "Cleaner Name", "Location", "Maintenance"],
    },
    {
      id: "VEHICLE",
      title: "Vehicle",
      desc: "Keep your vehicle safe with a smart QR tag. If someone finds your vehicle, they can scan the QR and contact you immediately.",
      icon: "ri-car-fill",
      items: ["Owner Info", "Contact", "Location", "Vehicle Details"],
    },
  ];

  const plans = [
    {
      name: "Normal User",
      price: "₹120",
      period: "/service",
      color: "border-black",
      highlight: false,
      features: [
        "5 QR codes per month",
        "Online service included",
        "Physical sticker: ₹59",
        "Scan & view tag details",
        "Email support",
      ],
      cta: "Get Started",
    },
    {
      name: "Shopkeeper",
      price: "₹120",
      period: "/setup",
      color: "border-orange-600",
      highlight: true,
      features: [
        "49 QR codes per month",
        "Stick JTag on customer vehicles",
        "Earn 5% commission",
        "Save on sticker printing",
        "No delivery charges",
      ],
      cta: "Join as Shopkeeper",
    },
    {
      name: "Institute",
      price: "₹3,000",
      period: "/month",
      color: "border-black",
      highlight: false,
      features: [
        "100 QR codes per month",
        "Cleaning & repair alerts",
        "Asset tracking dashboard",
        "Bulk sticker management",
        "Priority support",
      ],
      cta: "Contact Us",
    },
  ];

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 border-b-2 border-black overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl animate-fade-in-up">
              <span className="section-label text-orange-600 mb-4 inline-block">
                Jankari Tag — Smart QR Tags
              </span>
              <h1 className="font-black text-[clamp(44px,7vw,90px)] tracking-[-3px] text-black leading-[0.95] mb-6">
                Track <span className="text-orange-600">Everything.</span>
                <br />
                Lose{" "}
                <span className="underline decoration-yellow-400 decoration-4 underline-offset-4">
                  Nothing.
                </span>
              </h1>
              <p className="text-base text-neutral-500 font-medium max-w-2xl leading-relaxed mb-10">
                Create a QR tag for your belongings — vehicles, coolers, or
                anything important. Anyone can scan it and find the owner's
                details instantly. Simple and safe.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/qrinfoupload")}
                  className="btn-brutal btn-brutal-primary"
                >
                  Create Your Tag{" "}
                  <i className="ri-arrow-right-up-line text-base"></i>
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="btn-brutal btn-brutal-secondary"
                >
                  Sign Up Free <i className="ri-user-add-fill text-base"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Abstract Grid Background */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.04] pointer-events-none">
            <div className="w-full h-full border-l-2 border-b-2 border-black grid grid-cols-10 grid-rows-10">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="border-r border-t border-black"></div>
              ))}
            </div>
          </div>
        </section>

        {/* Ticker Bar */}
        <div className="bg-orange-600 py-3 overflow-hidden border-b-2 border-black select-none">
          <div className="flex animate-ticker whitespace-nowrap">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="text-white text-[11px] font-bold uppercase tracking-[0.3em] px-8"
              >
                JankariTag • Smart QR Tags • Scan & Find •
              </span>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <section className="py-20 bg-white border-b-2 border-black">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12 animate-fade-in-up">
              <div className="max-w-2xl">
                <span className="section-label text-orange-600 mb-3 inline-block">
                  What You Can Track
                </span>
                <h2 className="font-black text-[clamp(26px,4vw,40px)] tracking-tight text-black leading-tight">
                  Choose What to{" "}
                  <span className="text-orange-600">Protect.</span>
                </h2>
                <p className="text-sm font-medium text-neutral-500 leading-relaxed mt-3">
                  Create smart QR tags for your water coolers, vehicles, and
                  more. Simple setup, instant results.
                </p>
              </div>
              <div className="h-0.5 flex-1 bg-black mx-8 hidden lg:block mb-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="brutal-card p-8 flex flex-col cursor-pointer"
                  onClick={() =>
                    navigate("/qrinfoupload", { state: { category: track.id } })
                  }
                >
                  <div className="w-14 h-14 rounded-sm bg-black flex items-center justify-center mb-6 text-orange-600">
                    <i className={`${track.icon} text-2xl`}></i>
                  </div>
                  <h3 className="text-xl font-black text-black tracking-tight mb-2">
                    {track.title}
                  </h3>
                  <p className="text-neutral-500 text-sm font-medium leading-relaxed mb-6">
                    {track.desc}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {track.items.map((item, j) => (
                      <span
                        key={j}
                        className="px-2.5 py-1 bg-white rounded-sm text-[10px] font-bold text-neutral-500 border-2 border-neutral-200 uppercase tracking-widest"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why JankariTag */}
        <section className="py-20 bg-white border-b-2 border-black overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="relative bg-black p-8 rounded-sm border-2 border-black shadow-[8px_8px_0px_#ea580c]">
                  <div className="aspect-square bg-white/5 rounded-sm border-2 border-white/10 flex items-center justify-center overflow-hidden">
                    <i className="ri-qr-scan-2-line text-[10rem] text-orange-600 animate-pulse"></i>
                  </div>
                  <div className="absolute -bottom-5 -right-5 w-36 h-36 bg-yellow-400 rounded-sm border-2 border-black shadow-[4px_4px_0px_#0D0D0D] flex flex-col items-center justify-center">
                    <p className="text-2xl font-black text-black">99.9%</p>
                    <p className="text-[10px] font-bold text-black uppercase tracking-widest mt-1">
                      Uptime
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <span className="section-label text-orange-600 mb-3 inline-block">
                    Why JankariTag
                  </span>
                  <h2 className="font-black text-[clamp(26px,4vw,40px)] tracking-tight text-black leading-tight">
                    Simple, Safe &{" "}
                    <span className="text-orange-600">Reliable.</span>
                  </h2>
                </div>
                <div className="grid gap-5">
                  {[
                    {
                      title: "Safe & Secure",
                      desc: "Your data is stored safely. Only the information you choose is shown when someone scans your QR code.",
                      icon: "ri-shield-check-fill",
                    },
                    {
                      title: "Quick Access",
                      desc: "Scan the QR code with any phone camera and get all the details instantly. No app needed.",
                      icon: "ri-flashlight-fill",
                    },
                    {
                      title: "Easy to Use",
                      desc: "Create a tag in 2 minutes. Print the sticker, stick it on your item, and you're done!",
                      icon: "ri-thumb-up-fill",
                    },
                  ].map((f, i) => (
                    <div key={i} className="flex gap-5">
                      <div className="w-12 h-12 min-w-12 rounded-sm bg-white flex items-center justify-center text-orange-600 border-2 border-black shadow-[3px_3px_0px_#0D0D0D]">
                        <i className={`${f.icon} text-xl`}></i>
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-base font-black text-black tracking-tight mb-1">
                          {f.title}
                        </h4>
                        <p className="text-neutral-500 font-medium text-sm leading-relaxed">
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
        <section className="py-20 bg-neutral-50 border-b-2 border-black">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
            <div className="text-center mb-14 animate-fade-in-up">
              <span className="section-label text-orange-600 mb-3 inline-block">
                Our Plans
              </span>
              <h2 className="font-black text-[clamp(26px,4vw,40px)] tracking-tight text-black leading-tight mb-3">
                Choose Your <span className="text-orange-600">Plan.</span>
              </h2>
              <p className="text-sm text-neutral-500 font-medium max-w-lg mx-auto">
                Get started for free with login via Google or email. Pick the
                plan that works for you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {plans.map((plan, i) => (
                <div
                  key={i}
                  className={`bg-white border-2 ${plan.color} rounded-sm p-6 flex flex-col relative ${plan.highlight ? "shadow-[6px_6px_0px_#ea580c]" : "shadow-[4px_4px_0px_#0D0D0D]"}`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-orange-600 text-white text-[9px] font-black uppercase tracking-widest rounded-sm border-2 border-black">
                      Popular
                    </div>
                  )}
                  <h3 className="text-lg font-black text-black uppercase tracking-tight mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-end gap-1 mb-5">
                    <span className="text-4xl font-black text-black">
                      {plan.price}
                    </span>
                    <span className="text-sm font-bold text-neutral-400 mb-1">
                      {plan.period}
                    </span>
                  </div>
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm font-medium text-neutral-600"
                      >
                        <i className="ri-checkbox-circle-fill text-orange-600 text-base mt-0.5 shrink-0"></i>
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
                    className={`w-full py-3 rounded-sm font-bold text-[11px] uppercase tracking-widest border-2 cursor-pointer transition-all ${
                      plan.highlight
                        ? "bg-orange-600 text-white border-orange-600 hover:bg-black hover:border-black"
                        : "bg-black text-white border-black hover:bg-orange-600 hover:border-orange-600"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>

            {/* Sticker Pricing Note */}
            <div className="brutal-card p-6 text-center animate-fade-in-up">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-orange-600 flex items-center justify-center border-2 border-black">
                    <i className="ri-sticky-note-fill text-white text-lg"></i>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-black">
                      Physical Sticker Price
                    </p>
                    <p className="text-[11px] text-neutral-500 font-medium">
                      Printed QR sticker delivered to your door
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="px-4 py-2 bg-black text-white rounded-sm text-center">
                    <p className="text-lg font-black">₹59</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">
                      1-10 pcs
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-orange-600 text-white rounded-sm text-center">
                    <p className="text-lg font-black">₹49</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">
                      10+ pcs
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Footer */}
        <section className="bg-white py-20 overflow-hidden select-none">
          <div className="flex flex-col items-center">
            <div className="whitespace-nowrap overflow-hidden w-full">
              <div className="flex animate-marquee">
                <h2 className="text-giant text-neutral-100 tracking-tighter px-10">
                  JankariTag
                </h2>
                <h2 className="text-giant text-neutral-100 tracking-tighter px-10">
                  JankariTag
                </h2>
              </div>
            </div>
            <p className="text-[11px] font-bold text-neutral-300 mt-6 mb-0 tracking-[0.5em] uppercase">
              Smart QR Tags for Everyone
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
