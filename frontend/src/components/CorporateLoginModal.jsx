import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  RefreshCcw,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const createCaptcha = () => {
  const first = Math.floor(Math.random() * 8) + 2;
  const second = Math.floor(Math.random() * 8) + 2;
  return {
    first,
    second,
    answer: first + second,
  };
};

const CorporateLoginModal = ({ isOpen = true, onClose }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [captcha, setCaptcha] = useState(createCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const refreshCaptcha = () => {
    setCaptcha(createCaptcha());
    setCaptchaInput("");
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleLogin = async (event) => {
    event.preventDefault();
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

    if (Number(captchaInput) !== captcha.answer) {
      setError("Captcha is incorrect. Please try again.");
      refreshCaptcha();
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(formData.email.trim(), formData.password);

      if (success) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.role === "admin") {
          onClose?.();
          navigate("/dashboard");
        } else {
          setError("Only authorized corporate users can sign in here.");
          refreshCaptcha();
        }
      } else {
        setError("Invalid email or password");
        refreshCaptcha();
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
      refreshCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#071c23]/76 px-4 py-8 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Corporate Login"
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="relative w-full max-w-xl border border-white/20 bg-white/95 p-6 text-[#071c23] shadow-[0_34px_110px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:p-8"
          >
            <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-soft-gold/70 to-transparent" />
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f6fbfa] text-[#071c23] shadow-sm ring-1 ring-[#071c23]/10 transition hover:bg-white hover:text-[#0b4a42]"
                aria-label="Close corporate login"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            <div className="mb-7 flex items-center gap-4 pr-10">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_14px_36px_rgba(7,28,35,0.12)] ring-1 ring-soft-gold/30">
                <img
                  src="/logo/pather-khonje-logo.png"
                  alt="Pather Khonje Logo"
                  className="h-12 w-12 object-contain"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#0b4a42]">
                  Pather Khonje
                </p>
                <h2 className="font-serif text-4xl leading-none">
                  Corporate Login
                </h2>
              </div>
            </div>

            {error && (
              <div className="mb-6 border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#0b4a42]" />
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-[#071c23]/10 bg-[#f6fbfa] px-4 py-4 pl-12 text-sm font-medium text-[#071c23] outline-none transition focus:border-soft-gold focus:bg-white focus:ring-4 focus:ring-soft-gold/15"
                    placeholder="admin@patherkhonje.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#0b4a42]" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border border-[#071c23]/10 bg-[#f6fbfa] px-4 py-4 pl-12 pr-12 text-sm font-medium text-[#071c23] outline-none transition focus:border-soft-gold focus:bg-white focus:ring-4 focus:ring-soft-gold/15"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#071c23]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Captcha
                </label>
                <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
                  <div className="flex min-h-14 items-center justify-between border border-[#071c23]/10 bg-[#f6fbfa] px-4">
                    <span className="text-sm font-bold text-[#071c23]">
                      What is {captcha.first} + {captcha.second}?
                    </span>
                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      className="ml-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0b4a42] shadow-sm ring-1 ring-[#071c23]/10 transition hover:text-[#071c23]"
                      aria-label="Refresh captcha"
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={captchaInput}
                    onChange={(event) => setCaptchaInput(event.target.value)}
                    className="w-full border border-[#071c23]/10 bg-[#f6fbfa] px-4 py-4 text-sm font-medium text-[#071c23] outline-none transition focus:border-soft-gold focus:bg-white focus:ring-4 focus:ring-soft-gold/15"
                    placeholder="Answer"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="premium-button mt-2 flex w-full items-center justify-center gap-3 px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Signing In..." : "Enter Dashboard"}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-7 border border-[#071c23]/8 bg-[#f6fbfa] p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-[#0b4a42]" />
                <p className="text-sm leading-6 text-slate-600">
                  This portal is reserved for authorized Pather Khonje corporate users.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CorporateLoginModal;
