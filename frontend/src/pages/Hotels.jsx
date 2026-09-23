import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import apiService from "../services/api"; 
import { Clock, MapPin, ArrowRight, Star, Globe, Shield } from "lucide-react";
import SEO from "../components/SEO";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const Hotels = () => {
  // State for API data
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("ALL DESTINATIONS");

  // FETCH REAL DATA FROM THE DATABASE
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        const response = await apiService.getPlaces();
        if (response.success) {
          // Sort alphabetically
          const sortedPlaces = (response.data.places || []).sort((a, b) =>
            (a.name || "").localeCompare(b.name || "", "en", {
              sensitivity: "base",
            })
          );
          setPlaces(sortedPlaces);
        }
      } catch (err) {
        console.error("Error fetching places:", err);
        setError("Failed to load destinations");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  const categories = [
    { id: "ALL DESTINATIONS", name: "ALL DESTINATIONS" },
    { id: "HILL STATIONS", name: "HILL STATIONS" },
    { id: "BEACHES", name: "BEACHES" },
    { id: "HERITAGE", name: "HERITAGE" },
    { id: "INTERNATIONAL", name: "INTERNATIONAL" },
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

  const filteredPlaces =
    activeCategory === "ALL DESTINATIONS"
      ? places
      : places.filter((place) => place.tag === activeCategory);

  return (
    <div className="premium-page min-h-screen font-sans">
      <SEO
        title="Premium Hotels, Resorts & Homestays"
        description="Find handpicked hotels, resorts and homestays across Sikkim, Darjeeling, Araku and other curated destinations."
        keywords="premium hotels India, Sikkim hotels, Darjeeling resorts, Araku hotels, curated stays, homestays"
      />
      {/* 1. HERO SECTION */}
      <section className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')", // Luxury Hotel/Resort placeholder
          }}
        >
          <div className="absolute inset-0 luxury-hero-overlay" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 pt-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mx-auto mb-5 flex items-center justify-center gap-4">
              <div className="gold-rule" />
              <span className="section-kicker">Handpicked properties</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-4 drop-shadow-lg">
              Premium Stays & Destinations
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto tracking-wide mb-8">
              Handpicked accommodations and curated stays for an unforgettable
              experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. FILTER TABS */}
      <section className="bg-white/90 backdrop-blur-xl border-b border-white/70 sticky top-20 z-20 shadow-[0_16px_34px_rgba(10,46,77,0.06)]">
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

      {/* 3. LIST SECTION (Replaces Grid) */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto space-y-24">
          {loading ? (
            <div className="flex justify-center items-center h-64 text-gray-400 tracking-widest uppercase">
              Loading Destinations...
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-center space-y-4">
              <div className="text-midnight-ocean text-xl font-serif">
                Coming Soon
              </div>
              <div className="text-slate-gray text-sm tracking-widest uppercase">
                We do not have any associate hotels in this category yet.
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {filteredPlaces.map((place, index) => (
                <motion.div
                  key={place.id || index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={containerVariants}
                  className="premium-card p-0 md:p-12 flex flex-col gap-10"
                >
                  {/* Alternating Layout: Even index = Image Right, Odd index = Image Left */}
                  <div
                    className={`flex flex-col ${
                      index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
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
                            {place.name}
                          </h2>
                          <div className="flex items-center gap-2">
                            <span className="inline-block bg-mist-blue text-midnight-ocean text-xs font-bold px-3 py-1 uppercase tracking-widest">
                              {place.hotelsCount || "0"} Stays
                            </span>
                            <div className="flex items-center gap-1 text-soft-gold">
                              <Star className="w-3 h-3 fill-soft-gold" />
                              <span className="text-xs font-bold">
                                {place.rating || "4.5"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="flex-grow space-y-6 mb-10 border-t border-b border-soft-gold/20 py-8"
                      >
                        <p className="text-slate-600 text-lg leading-relaxed font-light">
                          {place.description ||
                            "Ideally situated to explore the region's best attractions. Enjoy premium amenities, guided tours, and authentic local experiences."}
                        </p>

                        {/* Mock Attributes for consistency with design */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            "Premium Hotels",
                            "Guided Tours",
                            "Breakfast Included",
                            "Transfer Service",
                          ].map((attr, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 text-sm text-gray-600 font-light"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-soft-gold" />
                              {attr}
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="flex items-center gap-6 mt-auto"
                      >
                        {/* 🔴 THE FIX: Using place.slug so the URL is beautiful! */}
                        <Link
                          to={`/hotels/${place.slug || place.id}`}
                          className="premium-button px-10 py-4 text-xs font-bold tracking-[0.2em] uppercase text-center"
                        >
                          Explore Hotels
                        </Link>
                      </motion.div>
                    </div>

                    {/* Image Side */}
                    <motion.div
                      variants={itemVariants}
                      className="w-full lg:w-1/2 relative min-h-[400px]"
                    >
                      <div className="image-lift absolute inset-0 group">
                        {/* Pulling the absolute URL from your API */}
                        <LazyLoadImage
                          src={
                            apiService.toAbsoluteUrl(place.image?.url || place.image) ||
                            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                          }
                          alt={place.name}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[1.5s]"
                          effect="blur"
                          wrapperClassName="w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* 4. DESIGN YOUR OWN JOURNEY */}
      <section className="bg-midnight-ocean py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(198,167,94,0.14),transparent_32%,rgba(47,111,237,0.10))]" />
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-16 relative">
          <div className="max-w-2xl">
            <h2 className="text-5xl font-serif mb-6">Need Help Choosing?</h2>
            <p className="text-gray-300 text-lg font-light leading-relaxed mb-10 max-w-xl">
              Our travel experts are here to help you find the perfect stay for
              your vacation. Tell us your requirements and we'll handle the
              rest.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm tracking-widest uppercase text-soft-gold">
                <Shield className="w-4 h-4" />
                <span>Verified Properties</span>
              </div>
              <div className="flex items-center gap-3 text-sm tracking-widest uppercase text-soft-gold">
                <Globe className="w-4 h-4" />
                <span>Best Prices Guaranteed</span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/15 p-10 shadow-2xl">
            <h3 className="text-2xl font-serif mb-2">Speak to an Expert</h3>
            <p className="text-gray-400 text-sm mb-8">
              Get personalized recommendations instantly.
            </p>
            <Link
              to="/contact"
              className="block w-full bg-white text-midnight-ocean text-center py-4 text-xs font-bold tracking-[0.2em] uppercase hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hotels;
