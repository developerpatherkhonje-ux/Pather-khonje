import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import HotelsMegaMenu, { CURATED_STAYS, DESTINATIONS } from "./HotelsMegaMenu";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isHotelsOpen, setIsHotelsOpen] = useState(false);
  const [mobileHotelsOpen, setMobileHotelsOpen] = useState(false);
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
  }, [location.pathname]);

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
    { name: "HOME", path: "/" },
    { name: "ABOUT US", path: "/about" },
    { name: "GALLERY", path: "/gallery" },
    { name: "HOTELS", path: null },
    { name: "PACKAGES", path: "/packages" },
    { name: "CONTACT", path: "/contact" },
  ];

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
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
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo/Pather Khonje Logo.png"
              alt="Pather Khonje Logo"
              className="md:h-24 h-12 w-auto object-contain"
            />
            <span className="font-serif text-xl tracking-widest text-midnight-ocean font-bold">
              Pather Khonje
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => {
              if (item.name === "HOTELS") {
                return (
                  <div
                    key={item.name}
                    className="relative h-full flex items-center"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div
                      className={`cursor-pointer text-xs font-sans font-bold tracking-widest transition-colors duration-300 relative group py-4 flex items-center gap-1 ${
                        location.pathname.includes("/hotels") ||
                        location.pathname.includes("/hotel/")
                          ? "text-midnight-ocean"
                          : "text-slate-gray hover:text-midnight-ocean"
                      }`}
                    >
                      {item.name}
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ${
                          isHotelsOpen ? "rotate-180" : ""
                        }`}
                      />
                      {/* Active State Underline */}
                      {(location.pathname.includes("/hotels") ||
                        location.pathname.includes("/hotel/")) && (
                        <motion.span
                          layoutId="underline"
                          className="absolute bottom-2 left-0 w-full h-[2px] bg-midnight-ocean"
                        />
                      )}
                    </div>
                  </div>
                );
              }
              return (
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
              <Link
                to="/auth"
                className="bg-midnight-ocean text-white px-6 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-deep-steel-blue transition-colors shadow-sm"
              >
                Corporate Login
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-midnight-ocean p-2"
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
            className="lg:hidden bg-white border-t border-gray-100 overflow-y-auto max-h-[85vh]"
          >
            <div className="flex flex-col p-6 space-y-4">
              {navItems.map((item) => {
                if (item.name === "HOTELS") {
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
                              {/* Curated Stays Mobile Links */}
                              {CURATED_STAYS.map((stay) => (
                                <Link
                                  key={stay.id}
                                  to={`/hotel/${stay.id}`}
                                  className="text-xs font-medium text-slate-700 block py-1"
                                  onClick={() => setIsOpen(false)}
                                >
                                  {stay.name}
                                </Link>
                              ))}
                              {/* Destination Links */}
                              <div className="pt-2 border-t border-gray-100 mt-2">
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
                    className="text-sm font-sans font-bold text-midnight-ocean py-3 border-b border-gray-100 uppercase tracking-widest"
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
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="block w-full bg-midnight-ocean text-white text-center py-3 rounded-md text-sm font-bold uppercase tracking-widest hover:bg-deep-steel-blue transition-colors"
                  >
                    Corporate Login
                  </Link>
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
  );
}

export default Navbar;