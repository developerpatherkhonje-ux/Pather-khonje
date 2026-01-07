import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import apiService from "../services/api";
import { Clock, MapPin, ArrowRight, Star } from "lucide-react";

const Packages = () => {
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Packages" },
    { id: "mountain", name: "Hill Stations" },
    { id: "beach", name: "Beach Stays" },
    { id: "heritage", name: "Historical" },
    { id: "adventure", name: "Adventure" },
    { id: "spiritual", name: "Spiritual" },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiService.listPackages();
        if (res.success) {
          const list = Array.isArray(res.data.packages)
            ? res.data.packages
            : [];
          // Deduplicate
          const byId = new Map();
          list.forEach((p) => {
            const key = String(p.id || p._id || "");
            if (key && !byId.has(key)) byId.set(key, p);
          });
          setPackages(Array.from(byId.values()));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredPackages =
    activeCategory === "all"
      ? packages
      : packages.filter((pkg) => {
          const cat = (pkg.category || "").toLowerCase();
          // Simple mapping for the new category names
          if (activeCategory === "mountain" && cat.includes("mountain"))
            return true;
          if (activeCategory === "beach" && cat.includes("beach")) return true;
          if (activeCategory === "heritage" && cat.includes("heritage"))
            return true;
          return cat === activeCategory;
        });

  const handleWhatsAppBooking = (packageData) => {
    const message = `Hi! I'm interested in booking the "${
      packageData.name
    }" package (${
      packageData.duration
    }) for ₹${packageData.price.toLocaleString()}.`;
    window.open(
      `https://wa.me/917439857694?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="bg-white min-h-screen">
      {/* 1. HERO SECTION (1:1 Replica) */}
      <section className="relative">
        {/* Image Part - Top */}
        <div className="h-[50vh] min-h-[400px] w-full relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1548876995-629f48ad9a6c?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
          >
          </div>
        </div>

        {/* Text Part - Bottom (White background) */}
        <div className="bg-white py-16 md:py-20 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl md:text-5xl font-serif text-midnight-ocean mb-6 tracking-wide">
                Curated Travel Packages
              </h1>
              <p className="text-lg text-slate-600 font-sans leading-relaxed mb-8 max-w-2xl">
                Thoughtfully planned journeys designed for comfort, clarity, and
                memorable experiences. Each itinerary is crafted with care,
                ensuring you see the best without the rush.
              </p>
              {/* Separator Line */}
              <div className="w-20 h-0.5 bg-slate-400 opacity-60 rounded-full"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. FILTER BAR */}
      {/* Minimalist tab list as per design */}
      <section className="pt-16 pb-8 bg-white sticky top-0 z-30 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-sm md:text-base tracking-widest uppercase transition-all duration-300 pb-1 border-b-2 ${
                  activeCategory === cat.id
                    ? "text-midnight-ocean border-soft-gold font-semibold"
                    : "text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PACKAGES LIST (Editorial Grid) */}
      <section className="py-12 md:py-20 bg-ice-blue/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-12 h-12 border-4 border-soft-gold border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-500 font-serif tracking-wide">
                Curating your journeys...
              </p>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-32">
              <h3 className="text-3xl font-serif text-gray-800 mb-4">
                No Journeys Found
              </h3>
              <p className="text-gray-500 mb-8">
                We couldn't find any packages in this category at the moment.
              </p>
              <button
                onClick={() => setActiveCategory("all")}
                className="text-soft-gold border-b border-soft-gold pb-1 hover:text-yellow-600 transition-colors"
              >
                View all packages
              </button>
            </div>
          ) : (
            <div className="space-y-24">
              {/* 
                    Using a "Story" layout where cards have alternating layouts or full-width presence.
                    We will map through them and perhaps alternate the layout for visual interest.
                */}
              {filteredPackages.map((pkg, index) => (
                <motion.div
                  key={pkg.id || pkg._id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={fadeIn}
                  className="group"
                >
                  {/* 
                            For the first item, we might use a special full-width layout, 
                            or we can just use a consistent "Split" layout for all consistent with the design image.
                            The design image shows large horizontal cards.
                        */}
                  <div
                    className={`flex flex-col ${
                      index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                    } gap-8 lg:gap-16 items-center`}
                  >
                    {/* Image Side */}
                    <div className="w-full lg:w-3/5 relative overflow-hidden shadow-2xl shadow-gray-200 rounded-sm">
                      <div className="aspect-[16/10] overflow-hidden bg-gray-200">
                        <img
                          src={
                            apiService.toAbsoluteUrl(pkg.image) ||
                            "/public/hpackages/kerala.jpg"
                          }
                          alt={pkg.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      {/* Price Tag Overlay - Optional, minimal */}
                      <div className="absolute bottom-0 left-0 bg-white/95 backdrop-blur px-6 py-3 shadow-sm">
                        <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                          Starting from
                        </p>
                        <p className="text-xl font-bold text-midnight-ocean font-serif">
                          ₹{pkg.price?.toLocaleString?.() || pkg.price}
                        </p>
                      </div>
                    </div>

                    {/* Content Side */}
                    <div className="w-full lg:w-2/5 md:px-4">
                      <div className="mb-4">
                        <span className="text-soft-gold text-xs font-bold tracking-[0.2em] uppercase">
                          {(pkg.category || "Package").toUpperCase()}
                        </span>
                      </div>
                      <h2 className="text-4xl lg:text-5xl font-serif text-midnight-ocean mb-6 leading-tight group-hover:text-deep-steel-blue transition-colors">
                        {pkg.name}
                      </h2>
                      <p className="text-gray-600 text-lg leading-relaxed mb-8 font-light line-clamp-3">
                        {pkg.description}
                      </p>

                      <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8 border-t border-b border-gray-100 py-6">
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-5 h-5 text-soft-gold mr-3" />
                          <span className="text-sm font-medium">
                            {pkg.duration}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          {/* Placeholder for location or other meta */}
                          <MapPin className="w-5 h-5 text-soft-gold mr-3" />
                          <span className="text-sm font-medium">
                            Multiple Destinations
                          </span>
                        </div>
                        {pkg.rating && (
                          <div className="flex items-center text-gray-600">
                            <Star className="w-5 h-5 text-soft-gold mr-3" />
                            <span className="text-sm font-medium">
                              {pkg.rating} (Redefining Luxury)
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleWhatsAppBooking(pkg)}
                          className="bg-midnight-ocean text-white px-8 py-4 rounded-none hover:bg-deep-steel-blue transition-all duration-300 font-medium tracking-wide shadow-lg hover:shadow-xl"
                        >
                          Book This Journey
                        </button>
                        <Link
                          to={`/website/package/${pkg.id}`}
                          className="group/link flex items-center text-midnight-ocean font-medium tracking-wide hover:text-soft-gold transition-colors"
                        >
                          View Itinerary
                          <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
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
