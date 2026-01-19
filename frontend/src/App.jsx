import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import { HelmetProvider } from "react-helmet-async";
import { Suspense } from "react";

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
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const AuthPage = React.lazy(() => import("./pages/AuthPage"));
import Footer from "./components/Footer";
import WhatsAppFloat from "./components/WhatsAppFloat";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppRouter from "./components/AppRouter";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/ScrollToTop";
import { useState, useEffect } from "react";
import LoadingScreen from "./components/LoadingScreen";
import "./App.css";

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
                    <Route path="/" element={<AppRouter />} />

                    <Route path="/auth" element={<AuthPage />} />

                    <Route
                      path="/dashboard/*"
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/website/*"
                      element={
                        <>
                          <Navbar />
                          <main className="relative pt-24">
                            <Routes>
                              <Route index element={<Home />} />
                              <Route path="about" element={<About />} />
                              <Route path="gallery" element={<Gallery />} />

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
                              <Route
                                path="privacy-policy"
                                element={<PrivacyPolicy />}
                              />
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
