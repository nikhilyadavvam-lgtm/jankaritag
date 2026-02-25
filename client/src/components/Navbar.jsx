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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="rounded-lg flex items-center justify-center transition-all group-hover:-translate-y-0.5">
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive(link.to)
                  ? "text-white bg-dark-blue"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <i className={`${link.icon} text-base`}></i>
              {link.label}
            </Link>
          ))}

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200 mx-3"></div>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-3 p-1.5 pr-4 bg-gray-50 rounded-xl hover:bg-yellow-50 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-dark-blue flex items-center justify-center text-xs font-bold text-yellow-400 group-hover:bg-yellow-400 group-hover:text-gray-900 transition-all">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-800 leading-none">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-green-600 font-medium mt-0.5">
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
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                title="Logout"
              >
                <i className="ri-logout-circle-r-fill text-lg"></i>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-5 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 transition-all"
              >
                Login
              </Link>
              <Link to="/register" className="btn-mm btn-mm-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-gray-50 text-gray-700 hover:bg-yellow-50 hover:text-gray-900 transition-all cursor-pointer"
        >
          <i
            className={`${mobileOpen ? "ri-close-fill" : "ri-menu-5-fill"} text-xl`}
          ></i>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-5 space-y-4 shadow-lg">
          <div className="grid gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? "text-white bg-dark-blue"
                    : "text-gray-500 bg-gray-50 hover:bg-yellow-50 hover:text-gray-900"
                }`}
              >
                <i className={`${link.icon} text-lg`}></i>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-dark-blue flex items-center justify-center text-sm font-bold text-yellow-400">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm transition-all cursor-pointer hover:bg-red-600"
                >
                  <i className="ri-logout-circle-r-fill text-lg"></i> Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center py-3 rounded-xl bg-gray-50 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center py-3 rounded-xl text-white font-semibold text-sm bg-dark-blue hover:opacity-90 transition-all"
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
