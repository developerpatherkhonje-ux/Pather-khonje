import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import apiService from "../services/api";
import { Clock, MapPin, ArrowRight, Star } from "lucide-react";

const Packages = () => {
  const [packages] = useState([
    {
      id: "darjeeling-legacy",
      name: "The Darjeeling Legacy",
      tag: "SIGNATURE JOURNEY",
      description:
        "Experience the colonial charm and rolling tea gardens of Darjeeling. A timeless journey through the Queen of the Hills.",
      duration: "5 Nights / 6 Days",
      idealFor: "Ideal for Couples",
      image: "/assets/pkg_darjeeling.png",
      linkText: "Explore Journey",
    },
    {
      id: "rockwaters-beaches",
      name: "Backwaters & Beaches",
      tag: "POPULAR",
      description:
        "A serene drift through the backwaters followed by coastal relaxation in God's Own Country. Unwind in bliss.",
      duration: "6 Nights / 7 Days",
      idealFor: "Ideal for Families",
      image: "/assets/pkg_kerala.png",
      linkText: "Explore Journey",
    },
    {
      id: "sikkim-panorama",
      name: "Sikkim Panorama",
      tag: "ADVENTURE",
      description:
        "A comprehensive tour of Gangtok, Pelling, and North Sikkim. Designed for those who want to see it all without rushing.",
      duration: "7 Nights / 8 Days",
      idealFor: "Nature Lovers",
      image: "/assets/pkg_sikkim.png",
      linkText: "View Details",
      isSpecial: true,
    },
    {
      id: "mystical-meghalaya",
      name: "Mystical Meghalaya",
      tag: "HIDDEN GEM",
      description:
        "Explore the abode of clouds, living root bridges, and crystal clear waters with our expert local guides.",
      duration: "5 Nights / 6 Days",
      idealFor: "Adventure & Nature",
      image: "/assets/pkg_meghalaya.png",
      linkText: "View Details",
      isSpecial: true, 
    },
    {
      id: "royal-rajasthan",
      name: "Royal Rajasthan",
      tag: "HERITAGE",
      description:
        "Stay in Heritage Havelis and explore the vibrant culture of Jaipur, Jodhpur, and Udaipur.",
      duration: "6 Nights / 7 Days",
      idealFor: "Heritage Buffs",
      image: "/assets/pkg_rajasthan.png",
      linkText: "View Details",
      isSpecial: true,
    },
  ]);

  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Packages" },
    { id: "mountain", name: "Hill Stations" },
    { id: "family", name: "Family Trips" },
    { id: "honeymoon", name: "Honeymoon" },
    { id: "group", name: "Group Tours" },
    { id: "sustainability", name: "Sustainability" },
  ];

  // --- Animation Variants ---
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for "classy" feel
      },
    },
  };

  const imageRevealVariants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* 1. HERO SECTION */}
      <section className="relative">
        <div className="h-[60vh] min-h-[500px] w-full relative overflow-hidden">
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1548876995-629f48ad9a6c?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            }}
          />
          <div className="absolute inset-0 bg-black/10" />{" "}
          {/* Subtle overlay for text contrast if needed */}
        </div>

        <div className="bg-white py-20 relative z-10 -mt-20 px-4 shadow-[0_-20px_40px_rgba(255,255,255,1)]">
          {/* Negative margin to pull text up slightly or just standard flow */}
          {/* Actually, let's keep the standard split look but cleaner */}
        </div>
        <div className="bg-white pb-20 pt-10 relative z-10 px-4 -mt-24 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-6xl font-serif text-midnight-ocean mb-6 tracking-tight leading-tight">
              Curated Travel <br /> Packages
            </h1>
            <p className="text-lg text-slate-600 font-sans leading-relaxed mb-8 max-w-2xl font-light">
              Thoughtfully planned journeys designed for comfort, clarity, and
              memorable experiences. Each itinerary is crafted with care.
            </p>
            <div className="w-16 h-0.5 bg-soft-gold/60 rounded-full"></div>
          </motion.div>
        </div>
      </section>

      {/* 2. FILTER BAR */}
      <section className="py-6 bg-white sticky top-0 z-30 border-b border-gray-50/50 backdrop-blur-md bg-white/90 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-xs tracking-[0.2em] uppercase transition-all duration-500 relative group py-2 ${
                  activeCategory === cat.id
                    ? "text-midnight-ocean font-bold"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {cat.name}
                {/* Animated Underline */}
                <span
                  className={`absolute bottom-0 left-0 w-full h-[1px] bg-soft-gold transform origin-left transition-transform duration-300 ${
                    activeCategory === cat.id
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-50"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PACKAGES LIST */}
      <section>
        {packages.map((pkg, index) => (
          <div
            key={pkg.id}
            className={`py-32 border-b border-gray-50 last:border-0 ${
              pkg.isSpecial ? "bg-ice-blue/20" : "bg-white"
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
                variants={containerVariants}
                className={`flex flex-col ${
                  pkg.isSpecial ? "lg:flex-row-reverse" : "lg:flex-row"
                } gap-16 lg:gap-28 items-center`}
              >
                {/* Image Side */}
                <motion.div
                  variants={imageRevealVariants}
                  className="w-full lg:w-[55%] relative group cursor-pointer"
                >
                  <div className="aspect-[16/10] overflow-hidden relative shadow-2xl shadow-gray-200/50">
                    <div className="absolute inset-0 bg-midnight-ocean/0 group-hover:bg-midnight-ocean/10 transition-colors duration-700 z-10" />
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-full object-cover transform transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                    />
                  </div>
                </motion.div>

                {/* Content Side */}
                <div className="w-full lg:w-[45%]">
                  <motion.div variants={itemVariants} className="mb-4">
                    <span className="text-soft-gold text-xs font-bold tracking-[0.25em] uppercase inline-block border-b border-soft-gold/30 pb-1">
                      {pkg.tag}
                    </span>
                  </motion.div>

                  <motion.h2
                    variants={itemVariants}
                    className="text-4xl md:text-5xl font-serif text-midnight-ocean mb-6 leading-[1.1]"
                  >
                    {pkg.name}
                  </motion.h2>

                  <motion.p
                    variants={itemVariants}
                    className="text-slate-600 text-lg leading-relaxed mb-10 font-light"
                  >
                    {pkg.description}
                  </motion.p>

                  <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap items-center gap-8 text-xs font-medium text-slate-500 uppercase tracking-widest mb-10"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-soft-gold/80" />
                      <span>{pkg.duration}</span>
                    </div>
                    {pkg.idealFor && (
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span>{pkg.idealFor}</span>
                      </div>
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Link
                      to={`/website/package/${pkg.id}`}
                      className="inline-flex items-center text-midnight-ocean font-medium text-sm tracking-widest group/link"
                    >
                      <span className="border-b border-gray-300 pb-1 transition-colors duration-300 group-hover/link:border-soft-gold group-hover/link:text-soft-gold">
                        {pkg.linkText}
                      </span>
                      <ArrowRight className="ml-3 w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-2 text-soft-gold" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        ))}
      </section>

      {/* 4. CTA: PERSONALIZED */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif text-midnight-ocean mb-6">
              Looking for something more personalised?
            </h2>
            <p className="text-lg text-gray-600 mb-10 font-light leading-relaxed max-w-2xl mx-auto">
              We create bespoke itineraries tailored to your unique tastes,
              budget, and timeline. Let us craft your perfect escape.
            </p>
            <Link
              to="/website/contact"
              className="inline-block border border-midnight-ocean text-midnight-ocean px-10 py-4 hover:bg-midnight-ocean hover:text-white transition-all duration-300 uppercase tracking-widest text-sm font-semibold"
            >
              Get Custom Quote
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Packages;
