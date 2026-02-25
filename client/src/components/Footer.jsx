import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t-2 border-black">
      {/* Main Footer */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-black rounded-sm flex items-center justify-center transition-all group-hover:-translate-y-px">
                <img
                  src="/logo.png"
                  alt="JankariTag Logo"
                  className="h-9 w-full object-contain"
                />
              </div>
            </Link>
            <p className="text-neutral-500 text-sm font-medium leading-relaxed">
              Smart QR tags for your belongings. Create a tag, print the
              sticker, and stay connected.
            </p>
            <div className="flex gap-2">
              {[
                { icon: "ri-twitter-x-fill", link: "#" },
                { icon: "ri-instagram-fill", link: "#" },
                { icon: "ri-mail-fill", link: "mailto:support@jankaritag.com" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.link}
                  className="w-10 h-10 rounded-sm bg-white hover:bg-orange-600 text-black hover:text-white flex items-center justify-center transition-all border-2 border-black hover:-translate-y-px"
                >
                  <i className={`${social.icon} text-base`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:ml-auto">
            <h4 className="text-black font-bold text-[11px] uppercase tracking-[0.15em] mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-sm text-neutral-500 hover:text-orange-600 transition-colors font-medium"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/qrinfoupload"
                  className="text-sm text-neutral-500 hover:text-orange-600 transition-colors font-medium"
                >
                  Create Tag
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-sm text-neutral-500 hover:text-orange-600 transition-colors font-medium"
                >
                  My Tags
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:ml-auto">
            <h4 className="text-black font-bold text-[11px] uppercase tracking-[0.15em] mb-5">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-neutral-500 hover:text-orange-600 transition-colors font-medium"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-neutral-500 hover:text-orange-600 transition-colors font-medium"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:ml-auto">
            <h4 className="text-black font-bold text-[11px] uppercase tracking-[0.15em] mb-5">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-neutral-500">
                <i className="ri-phone-fill text-orange-600 text-base"></i> +91
                96674 46393
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-500">
                <i className="ri-mail-fill text-orange-600 text-base"></i>{" "}
                support@jankaritag.com
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-500">
                <i className="ri-map-pin-2-fill text-orange-600 text-base"></i>{" "}
                New Delhi, India
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t-2 border-black py-5 bg-black">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} JankariTag • All Rights Reserved
          </p>
          <div className="flex items-center gap-2 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
            Made in <span className="text-white font-black ml-1">India</span>{" "}
            <i className="ri-heart-fill text-orange-600 ml-1"></i>
          </div>
        </div>
      </div>
    </footer>
  );
}
