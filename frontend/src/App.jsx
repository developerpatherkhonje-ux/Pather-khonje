import React, { useState, useEffect, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import "./App.css";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppFloat from "./components/WhatsAppFloat";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import LoadingScreen from "./components/LoadingScreen";

// Lazy Load Pages
const Home = React.lazy(() => import("./pages/Home"));
const About = React.lazy(() => import("./pages/About"));
const Gallery = React.lazy(() => import("./pages/Gallery"));
const Hotels = React.lazy(() => import("./pages/Hotels"));
const HotelPlace = React.lazy(() => import("./pages/HotelPlace"));
const HotelDetails = React.lazy(() => import("./pages/HotelDetails"));
const Packages = React.lazy(() => import("./pages/Packages"));
const PackageDetails = React.lazy(() => import("./pages/PackageDetails"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Policies = React.lazy(() => import("./pages/Policies")); // NEW UNIFIED POLICIES PAGE
const AuthPage = React.lazy(() => import("./pages/AuthPage"));

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <AnimatePresence mode="wait">
          {loading && <LoadingScreen key="loading" />}
        </AnimatePresence>
        {!loading && (
          <Router>
            <ScrollToTop />
            <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
              <AnimatePresence mode="wait">
                <Suspense fallback={<LoadingScreen />}>
                  <Routes>
                    {/* Authentication Route */}
                    <Route path="/auth" element={<AuthPage />} />

                    {/* Protected Dashboard Route */}
                    <Route
                      path="/dashboard/*"
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Main Public Website Routes */}
                    <Route
                      path="/*"
                      element={
                        <>
                          <Navbar />
                          <main className="relative pt-24">
                            <Routes>
                              <Route index element={<Home />} />
                              <Route path="about" element={<About />} />
                              <Route path="gallery" element={<Gallery />} />
                              <Route path="policies" element={<Policies />} />
                              <Route path="hotels" element={<Hotels />} />
                              <Route
                                path="hotels/:placeId"
                                element={<HotelPlace />}
                              />
                              <Route
                                path="hotel/:hotelId"
                                element={<HotelDetails />}
                              />
                              <Route path="packages" element={<Packages />} />
                              <Route
                                path="package/:packageId"
                                element={<PackageDetails />}
                              />
                              <Route path="contact" element={<Contact />} />
                            </Routes>
                          </main>
                          <Footer />
                          <WhatsAppFloat />
                        </>
                      }
                    />
                  </Routes>
                </Suspense>
              </AnimatePresence>
            </div>
          </Router>
        )}
        <Toaster position="top-right" />
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;