import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/", label: "Home", icon: "ri-home-fill" },
    { to: "/qrinfoupload", label: "Create Tag", icon: "ri-qr-code-fill" },
    ...(user
      ? [{ to: "/profile", label: "My Tags", icon: "ri-price-tag-3-fill" }]
      : []),
    ...(user && user.role === "shopkeeper"
      ? [{ to: "/shopkeeper", label: "Shopkeeper", icon: "ri-store-2-fill" }]
      : []),
    ...(user && user.role === "admin"
      ? [{ to: "/admin-secret", label: "Admin", icon: "ri-admin-fill" }]
      : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-2 border-black">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-black rounded-sm flex items-center justify-center transition-all group-hover:-translate-y-px">
            <img
              src="/logo.png"
              alt="JankariTag"
              className="h-9 w-full object-contain"
            />
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-all ${
                isActive(link.to)
                  ? "text-white bg-black"
                  : "text-neutral-500 hover:text-black hover:bg-neutral-100"
              }`}
            >
              <i className={`${link.icon} text-base`}></i>
              {link.label}
            </Link>
          ))}

          {/* Auth section */}
          <div className="h-8 w-px bg-black mx-3"></div>
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-3 p-1 pr-4 bg-white rounded-sm border-2 border-black hover:border-orange-600 transition-all group"
              >
                <div className="w-8 h-8 rounded-sm bg-black flex items-center justify-center text-xs font-bold text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-black leading-none">
                    {user.name}
                  </span>
                  <span className="text-[9px] text-green-600 font-bold uppercase tracking-widest mt-0.5">
                    {user.role === "admin"
                      ? "Admin"
                      : user.role === "shopkeeper"
                        ? "Shopkeeper"
                        : "Active"}
                  </span>
                </div>
              </Link>
              <button
                onClick={logout}
                className="w-10 h-10 flex items-center justify-center rounded-sm text-neutral-400 hover:text-red-500 hover:bg-red-50 border-2 border-transparent hover:border-red-500 transition-all cursor-pointer"
                title="Logout"
              >
                <i className="ri-logout-circle-r-fill text-lg"></i>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-5 py-2 rounded-sm text-[11px] font-bold uppercase tracking-widest text-neutral-500 hover:text-black transition-all"
              >
                Login
              </Link>
              <Link to="/register" className="btn-brutal btn-brutal-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-12 h-12 flex items-center justify-center rounded-sm bg-black text-white hover:bg-orange-600 transition-all cursor-pointer border-2 border-black"
        >
          <i
            className={`${mobileOpen ? "ri-close-fill" : "ri-menu-5-fill"} text-xl`}
          ></i>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t-2 border-black p-6 space-y-4">
          <div className="grid gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-all border-2 ${
                  isActive(link.to)
                    ? "bg-black text-white border-black"
                    : "bg-white text-neutral-500 border-neutral-200 hover:border-black"
                }`}
              >
                <i className={`${link.icon} text-lg`}></i>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t-2 border-black">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-white rounded-sm border-2 border-black">
                  <div className="w-10 h-10 rounded-sm bg-black flex items-center justify-center text-xs font-bold text-orange-600">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-black text-sm">{user.name}</p>
                    <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-sm bg-red-500 text-white font-bold text-[11px] uppercase tracking-widest transition-all cursor-pointer border-2 border-red-500 hover:bg-red-600"
                >
                  <i className="ri-logout-circle-r-fill text-lg"></i> Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center py-3.5 rounded-sm bg-white text-black font-bold text-[11px] uppercase tracking-widest border-2 border-black"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center py-3.5 rounded-sm bg-black text-white font-bold text-[11px] uppercase tracking-widest border-2 border-black hover:bg-orange-600 hover:border-orange-600"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
