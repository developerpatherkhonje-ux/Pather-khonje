import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, ArrowRight, Check } from "lucide-react";

const Packages = () => {
  const [activeCategory, setActiveCategory] = useState("ALL PACKAGES");

  const categories = [
    { id: "ALL PACKAGES", name: "ALL PACKAGES" },
    { id: "HILL STATIONS", name: "HILL STATIONS" },
    { id: "COASTAL & BEACH", name: "COASTAL & BEACH" },
    { id: "HERITAGE TOURS", name: "HERITAGE TOURS" },
    { id: "GROUP SPECIALS", name: "GROUP SPECIALS" },
  ];

  const packages = [
    {
      id: "vizag-araku",
      name: "Vizag Araku Escape",
      price: "₹7,399",
      priceUnit: "(per person)",
      nights: "2 NIGHTS / 3 DAYS",
      tag: "2 NIGHTS / 3 DAYS",
      description: null, // The design doesn't show a description paragraph for this one, just itinerary
      itinerary: [
        { day: "Day 1", text: "Thotlakonda beach and Rushikonda beach." },
        {
          day: "Day 2",
          text: "Araku Valley, Tribal Museum, Padmapuram Gardens, Coffee Museum, Borra Caves.",
        },
        { day: "Day 3", text: "Morning at leisure before departure transfer." },
      ],
      valid: "OCT - MARCH",
      travelers: "Up to 5 Travellers",
      inclusions: ["Base/Standard Room", "Breakfast"],
      image: "/assets/pkg_kerala.png", // Placeholder as original image not provided, assuming Image Right
      imagePosition: "right", // Deduced from content being on left in screenshot
      linkText: "View Details",
    },
    {
      id: "darjeeling-heritage",
      name: "Darjeeling Heritage",
      price: "₹8,499",
      priceUnit: "(per person)",
      nights: "4 NIGHTS / 5 DAYS",
      tag: "4 NIGHTS / 5 DAYS",
      description: null,
      itinerary: [
        {
          day: "Day 1",
          text: "Arrival at NJP/Bagdogra. Transfer to Darjeeling. Evening Mall Road walk.",
        },
        {
          day: "Day 2",
          text: "Tiger Hill sunrise, Batasia Loop, Ghoom Monastery, Himalayan Zoo.",
        },
        {
          day: "Day 3",
          text: "Mirik Lake excursion and Pashupati Market (Nepal Border) visit.",
        },
        { day: "Day 4", text: "Departure transfer to station/airport." },
      ],
      valid: "SEP - JUNE",
      travelers: "Up to 5 Travellers",
      inclusions: ["Super Deluxe Room", "Breakfast & Dinner"],
      image: "/assets/pkg_darjeeling.png",
      imagePosition: "left", // Matches screenshot
      linkText: "View Details",
    },
  ];

  // Animation Variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* 1. HERO SECTION */}
      <section className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1548876995-629f48ad9a6c?fm=jpg&q=60&w=3000')",
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 pt-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-4 shadow-sm">
              Explore Our Packages
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto tracking-wide mb-8">
              Handpicked journeys crafted for memories, comfort, and peace of
              mind
            </p>
            {/* <div className="w-20 h-1 bg-white/60 mx-auto rounded-full" /> */}
          </motion.div>
        </div>
      </section>

      {/* 2. FILTER TABS */}
      <section className="bg-white border-b border-gray-200 sticky top-20 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-8 py-6 no-scrollbar items-center justify-start md:justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-xs tracking-[0.15em] whitespace-nowrap uppercase font-medium transition-colors duration-300 relative group
                  ${
                    activeCategory === cat.id
                      ? "text-midnight-ocean"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                {cat.name}
                <span
                  className={`absolute -bottom-2 left-0 w-full h-0.5 bg-midnight-ocean transform origin-left transition-transform duration-300
                    ${
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

      {/* 3. PACKAGES LIST (Cards) */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto space-y-24">
          <AnimatePresence mode="wait">
            {packages.map((pkg) => (
              <motion.div
                key={pkg.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={containerVariants}
                className="bg-white p-0 md:p-12 shadow-sm border border-gray-100 flex flex-col gap-10"
              >
                <div
                  className={`flex flex-col ${
                    pkg.imagePosition === "right"
                      ? "lg:flex-row"
                      : "lg:flex-row-reverse"
                  } gap-12 lg:gap-20 items-stretch min-h-[500px]`}
                >
                  {/* Content Side */}
                  <div className="w-full lg:w-1/2 flex flex-col py-4">
                    <motion.div
                      variants={itemVariants}
                      className="flex justify-between items-start mb-6"
                    >
                      <div className="space-y-2">
                        <h2 className="text-4xl font-serif text-midnight-ocean">
                          {pkg.name}
                        </h2>
                        <span className="inline-block bg-blue-50 text-midnight-ocean text-xs font-bold px-3 py-1 uppercase tracking-widest">
                          {pkg.nights}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-serif text-midnight-ocean">
                          {pkg.price}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest">
                          {pkg.priceUnit}
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="flex-grow space-y-6 mb-10 border-t border-b border-gray-100 py-8"
                    >
                      {pkg.itinerary.map((item, idx) => (
                        <div key={idx} className="flex gap-6 group">
                          <span className="text-xs font-bold text-midnight-ocean w-12 flex-shrink-0 uppercase tracking-wide pt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                            {item.day}
                          </span>
                          <span className="text-slate-600 text-sm leading-relaxed font-light">
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="grid grid-cols-2 gap-8 mb-10 text-xs tracking-widest uppercase text-gray-400"
                    >
                      <div>
                        <div className="mb-2 font-medium text-gray-300">
                          Valid Between
                        </div>
                        <div className="text-midnight-ocean font-bold">
                          {pkg.valid}
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 font-medium text-gray-300">
                          Group Size
                        </div>
                        <div className="text-midnight-ocean font-bold">
                          {pkg.travelers}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="mb-2 font-medium text-gray-300">
                          Inclusions
                        </div>
                        <div className="flex gap-4 text-midnight-ocean font-bold normal-case tracking-normal">
                          {pkg.inclusions.map((inc) => (
                            <span key={inc} className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-soft-gold" />{" "}
                              {inc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="flex items-center gap-6 mt-auto"
                    >
                      <button className="bg-midnight-ocean text-white px-10 py-4 text-xs font-bold tracking-[0.2em] uppercase hover:bg-deep-steel-blue transition-all duration-300">
                        Book Now
                      </button>
                      <Link
                        to={`/website/package/${pkg.id}`}
                        className="text-xs font-bold tracking-[0.2em] uppercase text-midnight-ocean flex items-center gap-2 group hover:text-soft-gold transition-colors"
                      >
                        {pkg.linkText}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </motion.div>
                  </div>

                  {/* Image Side */}
                  <motion.div
                    variants={itemVariants}
                    className="w-full lg:w-1/2 relative min-h-[400px]"
                  >
                    <div className="absolute inset-0 overflow-hidden shadow-2xl">
                      <img
                        src={pkg.image}
                        alt={pkg.name}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-[1.5s]"
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* 4. DESIGN YOUR OWN JOURNEY */}
      <section className="bg-midnight-ocean py-24 text-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-16">
          <div className="max-w-2xl">
            <h2 className="text-5xl font-serif mb-6">
              Design Your Own Journey
            </h2>
            <p className="text-gray-300 text-lg font-light leading-relaxed mb-10 max-w-xl">
              Don't see exactly what you're looking for? Tell us your
              preferences, dates, and budget, and our travel experts will curate
              a personalized itinerary just for you.
            </p>

            <div className="space-y-3">
              {[
                "Flexible Dates & Duration",
                "Handpicked Hotels & Stays",
                "Private Transfers & Local Guides",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm tracking-widest uppercase text-soft-gold"
                >
                  <div className="w-1 h-1 bg-soft-gold rounded-full" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-md bg-white/5 backdrop-blur-sm border border-white/10 p-10">
            <h3 className="text-2xl font-serif mb-2">Start Planning</h3>
            <p className="text-gray-400 text-sm mb-8">
              Get a free, no-obligation quote within 24 hours.
            </p>
            <Link
              to="/website/contact"
              className="block w-full bg-white text-midnight-ocean text-center py-4 text-xs font-bold tracking-[0.2em] uppercase hover:bg-gray-100 transition-colors"
            >
              Request Custom Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Packages;
