import React from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const luxuryFadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const imageReveal = {
  hidden: { scale: 1.1, opacity: 0, filter: "blur(5px)" },
  visible: {
    scale: 1,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 1.4, ease: "easeOut" },
  },
};

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.03,
    y: -5,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// --- DATA ---
const masonryImages = [
  // Misty Mountains - Moody, fog-covered peaks
  {
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070",
    span: "col-span-1 md:col-span-2 row-span-2",
    title: "Misty Mountains",
  },
  {
    url: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=2070",
    span: "col-span-1 row-span-2",
    title: "Waterfalls",
  },
  {
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073",
    span: "col-span-1 md:col-span-1",
    title: "Coastal Views",
  },
  {
    url: "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?q=80&w=2071",
    span: "col-span-1",
    title: "Temple Details",
  },
  {
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071",
    span: "col-span-1",
    title: "Forest Trails",
  },
];

const featuredDestinations = [
  // North Sikkim - Dramatic snow peaks
  {
    title: "North Sikkim",
    subtitle: "Mountain Escapades",
    img: "https://images.unsplash.com/photo-1553787931-f70f4728af0e?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Kashmir Valley",
    subtitle: "Alpine Glow",
    img: "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?q=80&w=1887",
  },
  // Historic Hampi - The Stone Chariot (Iconic)
  {
    title: "Historic Hampi",
    subtitle: "Timeless Journey",
    img: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=2070",
  },
];

const staysLines = [
  {
    title: "Luxury & Organic Resorts",
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070",
  },
  {
    title: "Forest Stay Experiences",
    img: "https://images.unsplash.com/photo-1499363536502-87642509e31b?q=80&w=1974",
  },
  {
    title: "Mountain View Dining",
    img: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2070",
  },
];

const moments = [
  {
    title: "Find Joy",
    img: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1883",
  },
  {
    title: "Evening Together",
    img: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069",
  },
  {
    title: "Nature Walks",
    img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070",
  },
  {
    title: "Joyful Locals",
    img: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=2070",
  },
];

function Gallery() {
  return (
    <div className="bg-white">
      {/* 1. HERO HEADER */}
      <section className="relative py-32 bg-ice-blue/30 overflow-hidden">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={imageReveal}
          className="absolute inset-0"
        >
          {/* Gallery Banner - Dramatic Mountains */}
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070"
            className="w-full h-full object-cover opacity-90"
            alt="Gallery Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-white/5"></div>
        </motion.div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={luxuryFadeUp}
            className="max-w-2xl"
          >
            <h1 className="font-serif text-5xl md:text-6xl text-midnight-ocean mb-6 drop-shadow-sm">
              Gallery
            </h1>
            <p className="font-sans text-midnight-ocean/80 text-lg leading-relaxed mix-blend-multiply font-medium">
              A glimpse into the destinations, stays, and experiences we curate.
              Every image tells a story of discovery and beauty.
            </p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 1.2, delay: 0.5, ease: "circOut" }}
              className="h-1 bg-soft-gold mt-8"
            ></motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. MASONRY GRID (Main Gallery) */}
      <section className="pb-12 px-6 md:px-12 bg-white">
        <div className="container mx-auto">
          {/* Animated Tabs */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={luxuryFadeUp}
            className="flex gap-8 mb-12 border-b border-gray-200 pb-4 text-sm font-sans uppercase tracking-widest text-slate-gray overflow-x-auto"
          >
            <span className="text-midnight-ocean font-bold border-b-2 border-midnight-ocean pb-4 -mb-[17px] cursor-pointer">
              All
            </span>
            <span className="cursor-pointer hover:text-midnight-ocean transition-colors">
              Destinations
            </span>
            <span className="cursor-pointer hover:text-midnight-ocean transition-colors">
              Experiences
            </span>
            <span className="cursor-pointer hover:text-midnight-ocean transition-colors">
              Stays
            </span>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[300px]"
          >
            {masonryImages.map((img, idx) => (
              <motion.div
                key={idx}
                variants={luxuryFadeUp}
                className={`relative rounded-sm overflow-hidden group ${img.span}`}
              >
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                  <span className="text-white font-serif text-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {img.title}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. FEATURED DESTINATIONS */}
      <section className="py-20 bg-ice-blue/20 px-6 md:px-12">
        <div className="container mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={luxuryFadeUp}
            className="font-serif text-3xl md:text-4xl text-midnight-ocean mb-10"
          >
            Featured Destinations
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {featuredDestinations.map((dest, idx) => (
              <motion.div
                key={idx}
                variants={luxuryFadeUp}
                whileHover="hover"
                initial="rest"
                animate="rest"
                className="group cursor-pointer"
              >
                <motion.div
                  variants={cardHover}
                  className="h-64 overflow-hidden rounded-sm mb-4 shadow-md"
                >
                  <img
                    src={dest.img}
                    alt={dest.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </motion.div>
                <h3 className="font-serif text-2xl text-midnight-ocean mb-1 group-hover:text-soft-gold transition-colors">
                  {dest.title}
                </h3>
                <p className="font-sans text-xs text-slate-gray uppercase tracking-widest">
                  {dest.subtitle}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. STAYS & COMFORT */}
      <section className="py-20 bg-white px-6 md:px-12">
        <div className="container mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={luxuryFadeUp}
          >
            <h2 className="font-serif text-3xl md:text-4xl text-midnight-ocean mb-4">
              Stays & Comfort
            </h2>
            <p className="font-sans text-slate-gray mb-12 max-w-xl">
              Comfortable camps, exquisite resorts, and cozy homestays selected
              for your delight.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {staysLines.map((stay, idx) => (
              <motion.div
                key={idx}
                variants={luxuryFadeUp}
                whileHover="hover"
                className="group cursor-pointer"
              >
                <motion.div
                  variants={cardHover}
                  className="h-80 overflow-hidden rounded-sm mb-4 relative shadow-lg"
                >
                  <img
                    src={stay.img}
                    alt={stay.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </motion.div>
                <h3 className="font-sans font-bold text-sm text-midnight-ocean uppercase tracking-wider group-hover:text-soft-gold transition-colors">
                  {stay.title}
                </h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. MOMENTS & PEOPLE */}
      <section className="py-20 bg-ice-blue/30 px-6 md:px-12">
        <div className="container mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={luxuryFadeUp}
            className="font-serif text-3xl md:text-4xl text-midnight-ocean mb-12"
          >
            Moments & People
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {moments.map((moment, idx) => (
              <motion.div
                key={idx}
                variants={luxuryFadeUp}
                whileHover="hover"
                className="group cursor-pointer"
              >
                <motion.div
                  variants={cardHover}
                  className="aspect-[3/4] overflow-hidden rounded-sm mb-3 shadow-md"
                >
                  <img
                    src={moment.img}
                    alt={moment.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </motion.div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-soft-gold rounded-full"></div>
                  <span className="font-sans text-xs font-bold text-midnight-ocean uppercase tracking-wider group-hover:text-soft-gold transition-colors">
                    {moment.title}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. BOTTOM CTA */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={imageReveal}
          className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070"
            className="w-full h-full object-cover"
            alt="Footer CTA"
          />
          <div className="absolute inset-0 bg-midnight-ocean/60"></div>
        </motion.div>

        <div className="relative z-10 text-center px-4">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={luxuryFadeUp}
            className="font-serif text-4xl md:text-6xl text-white mb-6"
          >
            Travel experiences,
            <br /> thoughtfully curated.
          </motion.h2>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            whileHover={{ scale: 1.05, backgroundColor: "#C6A75E" }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-midnight-ocean text-white font-sans text-sm font-bold uppercase tracking-widest transition-all duration-300 shadow-xl border border-white/20"
          >
            Plan Your Journey
          </motion.button>
        </div>
      </section>
    </div>
  );
}

export default Gallery;
