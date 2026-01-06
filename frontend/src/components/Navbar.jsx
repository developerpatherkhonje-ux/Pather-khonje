import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "HOME", path: "/website/" },
    { name: "ABOUT US", path: "/website/about" },
    { name: "GALLERY", path: "/website/gallery" },
    { name: "HOTELS", path: "/website/hotels" },
    { name: "PACKAGES", path: "/website/packages" },
    { name: "CONTACT", path: "/website/contact" },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
        scrolled ? "shadow-lg" : "py-2 border-b border-gray-100"
      }`}
    >
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between">
          {/* Logo - Text Based with optional gold accent */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo/Pather Khonje Logo.png"
              alt="Pather Khonje Logo"
              className="md:h-24 h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-xs font-sans font-bold tracking-widest transition-colors duration-300 relative group py-1 ${
                  location.pathname === item.path
                    ? "text-midnight-ocean"
                    : "text-slate-gray hover:text-midnight-ocean"
                }`}
              >
                {item.name}
                {/* Active State Underline */}
                {location.pathname === item.path && (
                  <motion.span
                    layoutId="underline"
                    className="absolute bottom-0 left-0 w-full h-[2px] bg-midnight-ocean"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Action & Auth */}
          <div className="hidden lg:flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-midnight-ocean font-medium text-sm">
                  <User size={18} />
                  <span>{user.name}</span>
                </div>
                {user.role === "admin" && (
                  <Link
                    to="/dashboard"
                    className="text-slate-gray hover:text-midnight-ocean transition-colors"
                  >
                    <LayoutDashboard size={18} />
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-slate-gray hover:text-red-600 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link
                  to="/auth"
                  className="text-sm font-sans font-medium text-slate-gray hover:text-midnight-ocean transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/website/contact"
                  className="px-8 py-3 bg-midnight-ocean text-white text-xs font-sans font-bold tracking-widest uppercase hover:bg-deep-steel-blue transition-colors duration-300"
                >
                  Plan Your Trip
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-midnight-ocean"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100"
          >
            <div className="flex flex-col p-6 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-sans font-bold text-midnight-ocean py-3 border-b border-gray-100 uppercase tracking-widest"
                >
                  {item.name}
                </Link>
              ))}

              {user ? (
                <div className="pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-midnight-ocean font-medium">
                    <User size={18} />
                    <span>{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-600 font-medium"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-8 flex flex-col gap-4">
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="text-center text-midnight-ocean font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/website/contact"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center px-8 py-3 bg-midnight-ocean text-white text-xs font-sans font-bold tracking-widest uppercase"
                  >
                    Plan Your Trip
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Navbar;
