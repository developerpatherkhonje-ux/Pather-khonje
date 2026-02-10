import React, { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardHome from "../components/dashboard/DashboardHome";
import PlaceManagement from "../components/dashboard/PlaceManagement";
import HotelManagement from "../components/dashboard/HotelManagement";
import PackageManagement from "../components/dashboard/PackageManagement";
import InvoiceManagement from "../components/dashboard/InvoiceManagement";
import HotelInvoicePage from "../pages/admin/HotelInvoicePage";
import TourInvoicePage from "../pages/admin/TourInvoicePage";
import PaymentVouchers from "../components/dashboard/PaymentVouchers";
import PaymentVoucherPage from "./admin/PaymentVoucherPage";
import Analytics from "../components/dashboard/Analytics";
import UserProfile from "../components/dashboard/UserProfile";
import GalleryManagement from "../components/dashboard/GalleryManagement";
import EnquiriesPanel from "../components/dashboard/EnquiriesPanel";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Places", path: "/dashboard/places", icon: MapPin },
    { name: "Hotels", path: "/dashboard/hotels", icon: Hotel },
    { name: "Packages", path: "/dashboard/packages", icon: Package },
    { name: "Gallery", path: "/dashboard/gallery", icon: Image },
    { name: "Invoices", path: "/dashboard/invoices", icon: FileText },
    { name: "Payment Vouchers", path: "/dashboard/vouchers", icon: Receipt },
    { name: "Analytics", path: "/dashboard/analytics", icon: BarChart3 },
    { name: "Enquiries", path: "/dashboard/enquiries", icon: Mail },
    { name: "Profile", path: "/dashboard/profile", icon: User },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img
              src="/logo/Pather Khonje Logo.png"
              alt="Pather Khonje Logo"
              className="h-10 w-auto object-contain"
            />
            <span className="font-bold text-gray-900">Pather Khonje</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.designation}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-sky-100 text-sky-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 lg:flex lg:items-center lg:justify-between">
            <h1 className="text-2xl font-bold text-gray-900 lg:block hidden">
              {menuItems.find((item) => item.path === location.pathname)
                ?.name || "Dashboard"}
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
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
              <Route
                path="/vouchers/Payment"
                element={<PaymentVoucherPage />}
              />
              <Route
                path="/vouchers/Payment/:id"
                element={<PaymentVoucherPage />}
              />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/enquiries" element={<EnquiriesPanel />} />
              <Route path="/profile" element={<UserProfile />} />
            </Routes>
          </motion.div>
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
