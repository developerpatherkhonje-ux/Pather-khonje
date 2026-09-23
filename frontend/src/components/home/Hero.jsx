import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Compass, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

// Indian Mountain Photos: Ladakh, Manali, Sikkim, Darjeeling
const heroImages = [
  "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=2070", // Ladakh (Confirmed working)
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070", // Manali (Epic Snow Mountains)
  "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2070", // Sikkim (Confirmed working)
  "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?q=80&w=2070", // Darjeeling (Mist & Hills)
];
const Hero = () => {
  const [activeImage, setActiveImage] = useState(0);
  const navigate = useNavigate();

  // Auto-slide every 4.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % heroImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full min-h-[92vh] overflow-hidden bg-midnight-ocean">
      {heroImages.map((src, idx) => (
        <motion.div
          key={src}
          initial={false}
          animate={{
            opacity: activeImage === idx ? 1 : 0,
            scale: activeImage === idx ? 1 : 1.08,
          }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{ pointerEvents: activeImage === idx ? "auto" : "none" }}
        >
          <img
            src={src}
            alt={`Curated Himalayan journey ${idx + 1}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 luxury-hero-overlay" />
        </motion.div>
      ))}

      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-midnight-ocean/45 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-6 pb-20 pt-32 md:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="gold-rule"></div>
            <span className="section-kicker">
              Estd. 2015 · Kolkata based travel atelier
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-[0.98] mb-7 drop-shadow-lg">
            A Tour That <br />
            <span className="italic text-soft-gold">Feels Personally Found.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/82 font-light max-w-2xl leading-relaxed mb-10">
            Discover Himalayan stays, coastal escapes, and custom journeys curated with local knowledge, premium comfort, and calm end-to-end planning.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-5"
          >
            <button
              onClick={() => navigate("/packages")}
              className="premium-button px-8 py-4 font-sans font-bold text-xs tracking-widest uppercase"
            >
              Plan Your Journey
            </button>

            <Link
              to="/packages"
              className="group flex items-center gap-2 text-white font-sans font-semibold text-sm tracking-wide hover:text-soft-gold transition-colors duration-200"
            >
              View Destinations{" "}
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>

          <div className="mt-12 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: Compass, label: "Curated Routes" },
              { icon: ShieldCheck, label: "Verified Stays" },
              { icon: Sparkles, label: "Custom Planning" },
            ].map((item) => (
              <div key={item.label} className="premium-panel flex items-center gap-3 rounded-xl px-4 py-3 text-white">
                <item.icon className="h-5 w-5 text-soft-gold" />
                <span className="text-xs font-bold uppercase tracking-[0.18em]">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="absolute bottom-8 left-6 right-6 z-20 flex items-center justify-between md:left-12 md:right-12 lg:left-16 lg:right-16">
          <div className="hidden text-xs font-semibold uppercase tracking-[0.24em] text-white/60 md:block">
            Sikkim · Darjeeling · Araku · Beyond
          </div>
          <div className="flex gap-3">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === activeImage
                  ? "bg-white w-8 shadow-md"
                  : "bg-white/50 hover:bg-white/80 w-2.5"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
