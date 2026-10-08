import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck, MapPinned, MessageCircle, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const heroImages = [
  { src: "/assets/home-mountain-premium.png", label: "Premium mountain sunrise route" },
  { src: "/assets/home-monastery-road.png", label: "Colorful mountain road and viewpoint" },
  { src: "/assets/home-hill-resort.png", label: "Boutique hill resort balcony" },
];

const openWhatsApp = () => {
  const message =
    "Hi Pather Khonje, I want help planning a premium Himalayan trip.";
  window.open(
    `https://wa.me/917439857694?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener,noreferrer"
  );
};

const Hero = () => {
  const [activeImage, setActiveImage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % heroImages.length);
    }, 5200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-88px)] overflow-hidden bg-[#071c23] text-white">
      <div className="absolute inset-0">
        {heroImages.map((image, idx) => (
          <motion.img
            key={image.src}
            src={image.src}
            alt={image.label}
            initial={false}
            animate={{
              opacity: activeImage === idx ? 1 : 0,
              scale: activeImage === idx ? 1.03 : 1.1,
            }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ))}
        <div className="absolute inset-0 himalaya-hero-overlay" />
        <div className="absolute inset-0 topographic-mask opacity-45" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-16 pt-24 sm:px-6 md:px-10 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="himalaya-kicker text-soft-gold">
              Premium mountain travel
            </span>
            <span className="hidden h-px w-16 bg-soft-gold/55 sm:block" />
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
              Kolkata based travel atelier
            </span>
          </div>

          <h1 className="atelier-display max-w-5xl text-[3.25rem] font-semibold leading-[0.9] text-white sm:text-7xl lg:text-[5.8rem] xl:text-[6.35rem]">
            The mountains,
            <span className="block italic text-[#e3c879]">
              planned with feeling.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
            Premium hill journeys with handpicked stays, route pacing, local
            insight, and WhatsApp support from the first idea to the return
            drive home.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              onClick={() => navigate("/packages")}
              className="premium-button inline-flex items-center justify-center gap-3 px-7 py-4 text-xs font-bold uppercase tracking-[0.18em]"
            >
              Explore Packages
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={openWhatsApp}
            className="inline-flex items-center justify-center gap-3 border border-white/45 bg-white/15 px-7 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-md transition hover:border-soft-gold hover:bg-white/22 focus:outline-none focus:ring-2 focus:ring-soft-gold/70"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Planner
            </button>
            <Link
              to="/hotels"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white/80 transition hover:text-soft-gold"
            >
              View hotels <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: MapPinned, label: "Local route notes" },
              { icon: ShieldCheck, label: "Verified stays" },
              { icon: CalendarCheck, label: "Paced itinerary" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 border border-white/22 bg-[#071c23]/58 px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl"
              >
                <item.icon className="h-5 w-5 text-soft-gold" />
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/80">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      <div className="absolute bottom-6 left-5 right-5 z-20 flex items-center justify-between sm:left-8 sm:right-8 lg:left-12 lg:right-12">
        <p className="hidden text-[10px] font-bold uppercase tracking-[0.28em] text-white/60 md:block">
          Slow hill roads · Boutique stays · Custom family itineraries
        </p>
        <div className="flex gap-3">
          {heroImages.map((image, idx) => (
            <button
              key={image.src}
              onClick={() => setActiveImage(idx)}
              className={`h-2.5 transition-all duration-300 ${
                idx === activeImage
                  ? "w-10 bg-soft-gold"
                  : "w-2.5 bg-white/48 hover:bg-white"
              }`}
              aria-label={`Show ${image.label}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
