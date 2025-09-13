import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Hotels from './pages/Hotels';
import HotelPlace from './pages/HotelPlace';
import HotelDetails from './pages/HotelDetails';
import Packages from './pages/Packages';
import PackageDetails from './pages/PackageDetails';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AuthPage from './pages/AuthPage';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppRouter from './components/AppRouter';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
          <AnimatePresence mode="wait">
            <Routes>
              {/* Default route - redirects based on authentication status */}
              <Route path="/" element={<AppRouter />} />
              
              {/* Admin authentication route only */}
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Protected dashboard route - Admin only */}
              <Route path="/dashboard/*" element={
                <ProtectedRoute requireAdmin={true}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Public website routes - accessible without authentication */}
              <Route path="/website/*" element={
                <>
                  <Navbar />
                  <main className="relative">
                    <Routes>
                      <Route index element={<Home />} />
                      <Route path="about" element={<About />} />
                      <Route path="gallery" element={<Gallery />} />
                      <Route path="hotels" element={<Hotels />} />
                      <Route path="hotels/:placeId" element={<HotelPlace />} />
                      <Route path="hotel/:hotelId" element={<HotelDetails />} />
                      <Route path="packages" element={<Packages />} />
                      <Route path="package/:packageId" element={<PackageDetails />} />
                      <Route path="contact" element={<Contact />} />
                      <Route path="privacy-policy" element={<PrivacyPolicy />} />
                    </Routes>
                  </main>
                  <Footer />
                  <WhatsAppFloat />
                </>
              } />
            </Routes>
          </AnimatePresence>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;