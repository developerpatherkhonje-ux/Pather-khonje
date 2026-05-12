import React, { useState } from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  MapPin,
  Hotel,
  Package,
  FileText,
  Receipt,
  BarChart3,
  LogOut,
  Menu,
  X,
  User,
  Image,
  Mail,
  Globe,
  Settings // Added Settings icon for CMS
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardHome from "../components/dashboard/DashboardHome";
import PlaceManagement from "../components/dashboard/PlaceManagement";
import HotelManagement from "../components/dashboard/HotelManagement";
import PackageManagement from "../components/dashboard/PackageManagement";
import InvoiceManagement from "../components/dashboard/InvoiceManagement";
import HotelInvoicePage from "./admin/HotelInvoicePage";
import TourInvoicePage from "./admin/TourInvoicePage";
import PaymentVouchers from "../components/dashboard/PaymentVouchers";
import PaymentVoucherPage from "./admin/PaymentVoucherPage";
import Analytics from "../components/dashboard/Analytics";
import UserProfile from "../components/dashboard/UserProfile";
import GalleryManagement from "../components/dashboard/GalleryManagement";
import EnquiriesPanel from "../components/dashboard/EnquiriesPanel";
import CMSManager from '../components/dashboard/CMSManager';

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  // Added CMS Manager to the navigation array
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Places", icon: MapPin, path: "/dashboard/places" },
    { name: "Hotels", icon: Hotel, path: "/dashboard/hotels" },
    { name: "Packages", icon: Package, path: "/dashboard/packages" },
    { name: "Gallery", icon: Image, path: "/dashboard/gallery" },
    { name: "Invoices", icon: FileText, path: "/dashboard/invoices" },
    { name: "Payment Vouchers", icon: Receipt, path: "/dashboard/vouchers" },
    { name: "Enquiries", icon: Mail, path: "/dashboard/enquiries" },
    { name: "Analytics", icon: BarChart3, path: "/dashboard/analytics" },
    { name: "CMS Manager", icon: Settings, path: "/dashboard/cms" }, // New CMS Link
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-midnight-ocean text-white flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo/Pather Khonje Logo.png" alt="Logo" className="h-8 brightness-0 invert" />
          <span className="font-serif tracking-widest font-bold">PK Corporate</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed lg:static inset-y-0 left-0 w-64 bg-midnight-ocean text-white z-40 flex flex-col h-full shadow-2xl lg:shadow-none mt-16 lg:mt-0"
          >
            <div className="p-6 hidden lg:flex items-center gap-3 border-b border-white/10">
              <img src="/logo/Pather Khonje Logo.png" alt="Logo" className="h-20 " />
              <span className="font-serif text-lg tracking-widest font-bold">Corporate</span>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-thin">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-soft-gold text-midnight-ocean font-bold"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="text-sm tracking-wide">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="p-4 border-t border-white/10 space-y-2 pb-24 lg:pb-4">
              <Link
                to="/"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 transition-colors"
              >
                <Globe size={20} />
                <span className="text-sm tracking-wide">View Website</span>
              </Link>
              <Link
                to="/dashboard/profile"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 transition-colors"
              >
                <User size={20} />
                <span className="text-sm tracking-wide">My Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <LogOut size={20} />
                <span className="text-sm tracking-wide">Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden mt-16"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 pt-16 lg:pt-0">
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/places" element={<PlaceManagement />} />
            <Route path="/hotels" element={<HotelManagement />} />
            <Route path="/packages" element={<PackageManagement />} />
            <Route path="/gallery" element={<GalleryManagement />} />
            <Route path="/invoices" element={<InvoiceManagement />} />
            <Route path="/invoices/hotel" element={<HotelInvoicePage />} />
            <Route path="/invoices/tour" element={<TourInvoicePage />} />
            <Route path="/vouchers" element={<PaymentVouchers />} />
            <Route path="/vouchers/Payment" element={<PaymentVoucherPage />} />
            <Route path="/vouchers/Payment/:id" element={<PaymentVoucherPage />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/enquiries" element={<EnquiriesPanel />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/cms" element={<CMSManager />} /> {/* Moved above the wildcard route! */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;