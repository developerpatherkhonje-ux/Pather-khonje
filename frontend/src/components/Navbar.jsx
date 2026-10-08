import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Compass,
  Images,
  Mountain,
  Phone,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import HotelsMegaMenu, { DESTINATIONS } from "./HotelsMegaMenu";
import CorporateLoginModal from "./CorporateLoginModal";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isHotelsOpen, setIsHotelsOpen] = useState(false);
  const [mobileHotelsOpen, setMobileHotelsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const closeTimeout = React.useRef(null);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsHotelsOpen(false);
    setMobileHotelsOpen(false);
    setIsOpen(false);
    if (new URLSearchParams(location.search).get("login") === "corporate") {
      setLoginOpen(true);
    }
  }, [location.pathname, location.search]);

  const handleMouseEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
    }
    setIsHotelsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setIsHotelsOpen(false);
    }, 150);
  };

  // Clean URLs - Removed /website prefix
  const navItems = [
    { name: "Home", path: "/", icon: Compass },
    { name: "About", path: "/about", icon: Sparkles },
    { name: "Gallery", path: "/gallery", icon: Images },
    { name: "Hotels", path: null, icon: Mountain },
    { name: "Packages", path: "/packages", icon: Mountain },
    { name: "Contact", path: "/contact", icon: Phone },
  ];

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const openLogin = () => {
    setIsOpen(false);
    setLoginOpen(true);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed left-0 right-0 top-0 z-50 px-3 transition-all duration-500 sm:px-5 ${
          scrolled
            ? "py-3"
            : "py-4"
        }`}
      >
        <div className={`mx-auto max-w-7xl rounded-full border px-4 transition-all duration-500 lg:px-6 ${
          scrolled
            ? "border-white/16 bg-[#071c23]/92 shadow-[0_18px_55px_rgba(7,28,35,0.22)] backdrop-blur-2xl"
            : "border-white/35 bg-white/70 shadow-[0_14px_45px_rgba(7,28,35,0.08)] backdrop-blur-xl"
        }`}>
        <div className="flex h-[72px] items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_10px_30px_rgba(7,28,35,0.12)] ring-1 ring-soft-gold/25">
              <img
                src="/logo/pather-khonje-logo.png"
                alt="Pather Khonje Logo"
                className="h-10 w-10 object-contain"
              />
            </span>
            <span className="leading-none">
              <span className={`block font-serif text-xl font-bold tracking-wide transition-colors duration-500 ${
                scrolled ? "text-white" : "text-midnight-ocean"
              }`}>
                Pather Khonje
              </span>
              <span className={`hidden text-[9px] font-bold uppercase tracking-[0.24em] transition-colors duration-500 sm:block ${
                scrolled
                  ? "text-white"
                  : "text-midnight-ocean"
              }`}>
                A Tour That Never Seen Before
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 rounded-full border border-midnight-ocean/8 bg-white/70 p-1 shadow-inner lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.name === "Hotels") {
                return (
                  <div
                    key={item.name}
                    className="relative h-full flex items-center"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div
                      className={`group relative flex cursor-pointer items-center gap-2 rounded-full px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-300 ${
                        location.pathname.includes("/hotels") ||
                        location.pathname.includes("/hotel/")
                          ? "bg-midnight-ocean text-white shadow-[0_12px_28px_rgba(7,28,35,0.18)]"
                          : "text-slate-600 hover:bg-[#edf6f8] hover:text-midnight-ocean"
                      }`}
                    >
                      <Icon size={14} />
                      {item.name}
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ${
                          isHotelsOpen ? "rotate-180" : ""
                        }`}
                      />
                      {/* Active State Underline */}
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative flex items-center gap-2 rounded-full px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-300 ${
                    location.pathname === item.path
                      ? "bg-midnight-ocean text-white shadow-[0_12px_28px_rgba(7,28,35,0.18)]"
                      : "text-slate-600 hover:bg-[#edf6f8] hover:text-midnight-ocean"
                  }`}
                >
                  <Icon size={14} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-xs font-sans font-bold tracking-widest text-midnight-ocean hover:text-horizon-blue transition-colors">
                  DASHBOARD
                </Link>
                <div className="flex items-center gap-2 text-midnight-ocean font-medium text-sm">
                  <User size={18} />
                  <span>{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-slate-gray hover:text-red-600 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openLogin}
                className="rounded-full bg-midnight-ocean px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-[0_14px_34px_rgba(7,28,35,0.18)] transition hover:bg-[#0b4a42]"
              >
                Corporate Login
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-full border border-midnight-ocean/10 bg-white p-3 text-midnight-ocean shadow-sm lg:hidden"
            aria-label="Toggle Mobile Menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
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
            className="mx-3 mt-2 max-h-[85vh] overflow-y-auto rounded-3xl border border-white/70 bg-white/95 shadow-[0_24px_70px_rgba(7,28,35,0.16)] backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col p-6 space-y-4">
              {navItems.map((item) => {
                if (item.name === "Hotels") {
                  return (
                    <div key={item.name} className="border-b border-gray-100">
                      <button
                        onClick={() => setMobileHotelsOpen(!mobileHotelsOpen)}
                        className="w-full flex justify-between items-center text-sm font-sans font-bold text-midnight-ocean py-3 uppercase tracking-widest"
                        aria-expanded={mobileHotelsOpen}
                      >
                        {item.name}
                        <ChevronDown
                          size={16}
                          className={`transform transition-transform duration-300 ${
                            mobileHotelsOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {mobileHotelsOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-gray-50/50"
                          >
                            <div className="flex flex-col py-3 space-y-3 pl-4">
                              {/* Destination Links */}
                              <div>
                                <span className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 block">
                                  Destinations
                                </span>
                                {DESTINATIONS.map((dest) => (
                                  <Link
                                    key={dest.name}
                                    to={dest.path.replace("/website", "")}
                                    className="text-xs font-medium text-slate-700 block py-1"
                                    onClick={() => setIsOpen(false)}
                                  >
                                    {dest.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-sans font-bold text-midnight-ocean hover:bg-[#edf6f8] uppercase tracking-widest"
                  >
                    {item.name}
                  </Link>
                );
              })}

              {/* Mobile User Actions */}
              <div className="pt-4 space-y-4 border-t border-gray-100">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="text-sm font-sans font-bold text-midnight-ocean uppercase tracking-widest block"
                    >
                      DASHBOARD
                    </Link>
                    <div className="flex items-center gap-2 text-midnight-ocean font-medium">
                      <User size={18} />
                      <span>{user.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-red-600 font-medium w-full text-left"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={openLogin}
                    className="block w-full bg-midnight-ocean text-white text-center py-3 rounded-md text-sm font-bold uppercase tracking-widest hover:bg-deep-steel-blue transition-colors"
                  >
                    Corporate Login
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mega Menu Component */}
      <HotelsMegaMenu
        isOpen={isHotelsOpen}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClose={() => setIsHotelsOpen(false)}
      />
      </motion.nav>

      <CorporateLoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
      />
    </>
  );
}

export default Navbar;
