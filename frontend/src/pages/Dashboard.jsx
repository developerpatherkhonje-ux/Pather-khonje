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
  Settings,
  ClipboardList,
  UserCog,
  Users,
  Building2,
  MessageCircle,
  Landmark
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardHome from "../components/dashboard/DashboardHome";
import PlaceManagement from "../components/dashboard/PlaceManagement";
import HotelManagement from "../components/dashboard/HotelManagement";
import PackageManagement from "../components/dashboard/PackageManagement";
import InvoiceManagement from "../components/dashboard/InvoiceManagement";
import HotelInvoicePage from "./admin/HotelInvoicePage";
import TourInvoicePage from "./admin/TourInvoicePage";
import CarInvoicePage from "./admin/CarInvoicePage";
import PaymentVouchers from "../components/dashboard/PaymentVouchers";
import PaymentVoucherPage from "./admin/PaymentVoucherPage";
import Analytics from "../components/dashboard/Analytics";
import UserProfile from "../components/dashboard/UserProfile";
import GalleryManagement from "../components/dashboard/GalleryManagement";
import EnquiriesPanel from "../components/dashboard/EnquiriesPanel";
import CMSManager from '../components/dashboard/CMSManager';
import LeadManagement from "../components/dashboard/LeadManagement";
import UserManagement from "../components/dashboard/UserManagement";
import CustomersManagement from "../components/dashboard/CustomersManagement";
import PayeesManagement from "../components/dashboard/PayeesManagement";
import InvoiceSettings from "../components/dashboard/InvoiceSettings";
import WhatsAppWebPanel from "../components/dashboard/WhatsAppWebPanel";
import BranchHrManagement from "../components/dashboard/BranchHrManagement";

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
    { name: "Customers", icon: Users, path: "/dashboard/customers" },
    { name: "Invoices", icon: FileText, path: "/dashboard/invoices" },
    { name: "Payment Vouchers", icon: Receipt, path: "/dashboard/vouchers" },
    { name: "Payees & Vendors", icon: Landmark, path: "/dashboard/payees" },
    { name: "Lead Management", icon: ClipboardList, path: "/dashboard/leads" },
    { name: "Branches & HR", icon: Building2, path: "/dashboard/branches-hr" },
    { name: "User Management", icon: UserCog, path: "/dashboard/users" },
    { name: "WhatsApp Web", icon: MessageCircle, path: "/dashboard/whatsapp" },
    { name: "Enquiries", icon: Mail, path: "/dashboard/enquiries" },
    { name: "Analytics", icon: BarChart3, path: "/dashboard/analytics" },
    { name: "Invoice Settings", icon: Settings, path: "/dashboard/invoice-settings" },
    { name: "CMS Manager", icon: Settings, path: "/dashboard/cms" }, // New CMS Link
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-midnight-ocean text-white flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo/pather-khonje-logo.png" alt="Logo" className="h-8 brightness-0 invert" />
          <span className="font-serif tracking-widest font-bold">Pather Khonje</span>
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
              <img src="/logo/pather-khonje-logo.png" alt="Logo" className="h-20 " />
              <span className="font-serif text-lg tracking-widest font-bold">Pather Khonje</span>
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

              <div className="mt-5 pt-5 border-t border-white/10 space-y-1">
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
            <Route path="/invoices/car" element={<CarInvoicePage />} />
            <Route path="/vouchers" element={<PaymentVouchers />} />
            <Route path="/vouchers/Payment" element={<PaymentVoucherPage />} />
            <Route path="/vouchers/Payment/:id" element={<PaymentVoucherPage />} />
            <Route path="/customers" element={<CustomersManagement />} />
            <Route path="/payees" element={<PayeesManagement />} />
            <Route path="/leads" element={<LeadManagement />} />
            <Route path="/branches-hr" element={<BranchHrManagement />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/whatsapp" element={<WhatsAppWebPanel />} />
            <Route path="/invoice-settings" element={<InvoiceSettings />} />
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
