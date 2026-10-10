import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/SEO";

const createCaptcha = () => {
  const first = Math.floor(Math.random() * 8) + 2;
  const second = Math.floor(Math.random() * 8) + 2;
  return {
    first,
    second,
    answer: first + second,
  };
};

const AuthPage = () => {
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

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const refreshCaptcha = () => {
    setCaptcha(createCaptcha());
    setCaptchaInput("");
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
        if (["admin", "super_admin"].includes(user?.role)) {
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
    <div className="relative min-h-screen overflow-hidden bg-[#071c23] px-4 py-24 text-white sm:px-6 lg:px-10">
      <SEO
        title="Corporate Login"
        description="Secure corporate login for Pather Khonje admin dashboard."
        keywords="Pather Khonje corporate login, admin dashboard, travel management login"
      />

      <img
        src="/assets/home-monastery-road.png"
        alt="Pather Khonje corporate access"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(232,184,92,0.28),transparent_30%),linear-gradient(180deg,rgba(5,20,25,0.64),rgba(5,20,25,0.92)),linear-gradient(90deg,rgba(5,20,25,0.94),rgba(7,28,35,0.58),rgba(5,20,25,0.94))]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="w-full max-w-xl"
        >
          <div className="mb-6 text-center">
            <span className="himalaya-kicker text-soft-gold">
              Corporate access
            </span>
            <h1 className="atelier-display mt-4 text-5xl leading-[0.94] md:text-6xl">
              Secure travel control desk.
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-white/78">
              Sign in to manage leads, packages, hotels, gallery media and
              operational travel planning.
            </p>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            {[
              { icon: UserCheck, label: "Team only" },
              { icon: ShieldCheck, label: "Secure session" },
              { icon: Sparkles, label: "Premium control" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="border border-white/14 bg-white/10 p-4 text-center backdrop-blur-md"
              >
                <Icon className="mx-auto mb-3 h-5 w-5 text-soft-gold" />
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/78">
                  {label}
                </div>
              </div>
            ))}
          </div>

          <div className="relative border border-white/18 bg-white/94 p-6 text-[#071c23] shadow-[0_34px_110px_rgba(0,0,0,0.36)] backdrop-blur-2xl sm:p-8">
            <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-soft-gold/70 to-transparent" />
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_14px_36px_rgba(7,28,35,0.12)] ring-1 ring-soft-gold/30">
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
                  Customer enquiries and bookings stay managed inside the
                  dashboard.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
