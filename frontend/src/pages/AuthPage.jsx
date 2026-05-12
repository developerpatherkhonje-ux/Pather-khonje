import React, { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AuthPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [turnstileToken, setTurnstileToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // --- SMART CAPTCHA BYPASS FOR LOCALHOST ---
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  // Uses Cloudflare's dummy test key locally, and your real key in production
  const captchaSiteKey = isLocalhost 
    ? "1x00000000000000000000AA" 
    : "0x4AAAAAADNvml0wWfk5gqsD";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.email.trim()) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }
    if (!formData.password.trim()) {
      setError("Password is required");
      setIsLoading(false);
      return;
    }
    if (!turnstileToken) {
      setError("Please complete the captcha");
      setIsLoading(false);
      return;
    }

    try {
      // Send email, password, AND token
      const success = await login(
        formData.email.trim(),
        formData.password,
        turnstileToken
      );
      
      if (success) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.role === "admin") {
          navigate("/dashboard");
        } else {
          setError("Only admins can sign in here.");
        }
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <img
                src="/logo/Pather Khonje Logo.png"
                alt="Pather Khonje Logo"
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h1>
            <p className="text-gray-600">Sign in to access the admin dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Turnstile Captcha */}
            <div className="flex justify-center flex-col items-center gap-2">
              <Turnstile
                siteKey={captchaSiteKey}
                onSuccess={(token) => setTurnstileToken(token)}
                onError={() => setError("Captcha validation failed")}
                options={{
                  theme: "light",
                  size: "normal",
                }}
              />
              {isLocalhost && (
                <span className="text-[10px] text-green-600 font-bold tracking-widest uppercase">
                  (Localhost Test Mode Active)
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !turnstileToken}
              className="w-full bg-sky-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-sky-700 transition-all disabled:opacity-50"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;