import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
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
    <section className="relative w-full min-h-[90vh] flex flex-col lg:flex-row overflow-hidden bg-white">
      {/* Left Content Panel */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center relative z-10 order-2 lg:order-1 bg-white py-16 lg:py-0 px-6 md:px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-soft-gold"></div>
            <span className="text-xs font-bold tracking-widest text-slate-gray uppercase">
              Estd. 2015
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-midnight-ocean leading-[1.1] mb-6">
            A Tour That <br />
            <span className="italic text-soft-gold">Never Seen Before.</span>
          </h1>

          <p className="text-lg text-slate-gray font-light max-w-md leading-relaxed mb-10">
            Discover the hidden gems of the Himalayas. We craft journeys that 
            match the rhythm of your heart with clarity, comfort, and character.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <button
              onClick={() => navigate("/packages")}
              className="bg-midnight-ocean text-white px-8 py-4 font-sans font-bold text-xs tracking-widest uppercase hover:bg-deep-steel-blue transition-colors duration-200 shadow-lg"
            >
              Plan Your Journey
            </button>

            <Link
              to="/packages"
              className="group flex items-center gap-2 text-midnight-ocean font-sans font-medium text-sm tracking-wide hover:text-horizon-blue transition-colors duration-200"
            >
              View Destinations{" "}
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Image Panel */}
      <div className="w-full lg:w-[55%] h-[50vh] lg:min-h-[90vh] relative order-1 lg:order-2 overflow-hidden bg-gray-100">
        {/* Render all images and animate opacity for a seamless crossfade */}
        {heroImages.map((src, idx) => (
          <motion.div
            key={idx}
            initial={false}
            animate={{
              opacity: activeImage === idx ? 1 : 0,
              scale: activeImage === idx ? 1 : 1.1,
            }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{ pointerEvents: activeImage === idx ? "auto" : "none" }}
          >
            <img
              src={src}
              alt={`Himalayan Destination ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Soft gradient to blend the image edge with the white panel on desktop */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/10 to-transparent lg:w-48 z-10 hidden lg:block"></div>
          </motion.div>
        ))}

        {/* Carousel Indicators (Dots) */}
        <div className="absolute bottom-8 right-12 z-20 flex gap-3">
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
    </section>
  );
};

export default Hero;