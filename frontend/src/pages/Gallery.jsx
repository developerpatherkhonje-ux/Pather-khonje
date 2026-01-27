import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Loader2 } from "lucide-react";
import apiService from "../services/api";
import SEO from "../components/SEO";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

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

// Helper: Get span based on index for masonry layout
const getGridSpan = (index) => {
  const patterns = [
    "col-span-1 md:col-span-2 row-span-2", // Large
    "col-span-1", // Small
    "col-span-1", // Small
    "col-span-1 md:col-span-1", // Landscape
    "col-span-1", // Small
    "col-span-1", // Small
  ];
  return patterns[index % patterns.length];
};

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

// Famous Places from Hotels List (Mapped with images)
const famousPlaces = [
  {
    title: "Vizag – Araku",
    location: "Visakhapatnam",
    img: "https://images.unsplash.com/photo-1622307185698-1b292f72591b?q=80&w=2000",
  },
  {
    title: "Glenburn Tea Estate",
    location: "Darjeeling",
    img: "https://images.unsplash.com/photo-1588661706248-ec824204d80d?q=80&w=2000",
  },
  {
    title: "Kaziranga Wilderness",
    location: "Assam",
    img: "https://images.unsplash.com/photo-1599557766863-71958632617f?q=80&w=2000",
  },
  {
    title: "Mayfair Gangtok",
    location: "Sikkim",
    img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2000",
  },
  {
    title: "Goa Villas",
    location: "Goa",
    img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2000",
  },
  {
    title: "Munnar Misty Hills",
    location: "Kerala",
    img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=2000",
  },
  {
    title: "Shimla Heritage",
    location: "Shimla",
    img: "https://images.unsplash.com/photo-1562649795-3e1ee4e82352?q=80&w=2000",
  },
  {
    title: "Jaipur Palace",
    location: "Rajasthan",
    img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=2000",
  },
  {
    title: "Coorg Plantation",
    location: "Coorg",
    img: "https://images.unsplash.com/photo-1596328325603-5188fd218731?q=80&w=2000",
  },
  {
    title: "Andaman Blue",
    location: "Andaman",
    img: "https://images.unsplash.com/photo-1589901550992-0b81c2be0b4a?q=80&w=2000",
  },
];

function Gallery() {
  const [activeTab, setActiveTab] = useState("all");
  const [images, setImages] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch both Gallery Images and Places in parallel
      const [galleryResponse, placesResponse] = await Promise.all([
        apiService.getGalleryImages(activeTab),
        apiService.getPlaces(),
      ]);

      let combinedImages = [];
      let placesData = [];

      // 1. Handle Gallery Images
      if (galleryResponse.success) {
        combinedImages = [...galleryResponse.data.galleries];
      }

      // 2. Handle Places (Hotels Places)
      if (placesResponse.success) {
        placesData = placesResponse.data.places;
        setPlaces(placesData);

        // Merge places into main grid if tab is 'all' or 'destinations'
        if (activeTab === "all" || activeTab === "destinations") {
          const placesAsImages = placesData.map((place) => ({
            _id: place.id,
            title: place.name,
            description: place.name, // Use name as description/location
            image: {
              url:
                place.image ||
                (place.images && place.images[0]?.url) ||
                place.images?.[0],
            },
            isPlace: true, // Marker to distinguish if needed
          }));

          // Interleave or append? Appending for now.
          combinedImages = [...combinedImages, ...placesAsImages];
        }
      }

      setImages(combinedImages);
    } catch (error) {
      console.error("Failed to fetch gallery data", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "destinations", label: "Destinations" },
    { id: "activities", label: "Experiences" }, // Frontend maps 'activities' to 'Experiences' label
    { id: "hotels", label: "Stays" },
    { id: "food", label: "Cuisine" },
  ];

  return (
    <div className="bg-white">
      <SEO
        title="Gallery"
        description="Explore our travel gallery featuring destinations, stays, and experiences in Sikkim and Darjeeling."
      />
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
      <section className="pb-12 px-6 md:px-12 bg-white min-h-[600px]">
        <div className="container mx-auto">
          {/* Animated Tabs */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={luxuryFadeUp}
            className="flex gap-8 mb-12 border-b border-gray-200 pb-4 text-sm font-sans uppercase tracking-widest text-slate-gray overflow-x-auto"
          >
            {tabs.map((tab) => (
              <span
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`cursor-pointer transition-colors pb-4 -mb-[17px] ${
                  activeTab === tab.id
                    ? "text-midnight-ocean font-bold border-b-2 border-midnight-ocean"
                    : "hover:text-midnight-ocean"
                }`}
              >
                {tab.label}
              </span>
            ))}
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-soft-gold" />
            </div>
          ) : (
            <motion.div
              layout
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[300px]"
            >
              <AnimatePresence mode="popLayout">
                {images.map((img, idx) => (
                  <motion.div
                    key={img._id || idx}
                    layout
                    variants={luxuryFadeUp}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`relative rounded-sm overflow-hidden group ${getGridSpan(
                      idx,
                    )}`}
                  >
                    <LazyLoadImage
                      src={apiService.toAbsoluteUrl(img.image?.url)}
                      alt={img.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      effect="blur"
                      wrapperClassName="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                      <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <span className="text-white font-serif text-xl block">
                          {img.title}
                        </span>
                        <span className="text-white/80 text-sm font-sans mt-1 block">
                          {img.description}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {!loading && images.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <p>No images found in this category.</p>
            </div>
          )}
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
            {places.slice(0, 3).map((dest, idx) => (
              <motion.div
                key={dest.id || idx}
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
                  <LazyLoadImage
                    src={
                      dest.image && typeof dest.image === "string"
                        ? apiService.toAbsoluteUrl(dest.image)
                        : dest.images && dest.images.length > 0
                        ? apiService.toAbsoluteUrl(
                            dest.images[0].url || dest.images[0],
                          )
                        : "https://images.unsplash.com/photo-1544634076-a901606f41b9?q=80&w=2000"
                    }
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    effect="blur"
                    wrapperClassName="w-full h-full"
                  />
                </motion.div>
                <h3 className="font-serif text-2xl text-midnight-ocean mb-1 group-hover:text-soft-gold transition-colors">
                  {dest.name}
                </h3>
                <p className="font-sans text-xs text-slate-gray uppercase tracking-widest">
                  Featured Destination
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
                  <LazyLoadImage
                    src={stay.img}
                    alt={stay.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    effect="blur"
                    wrapperClassName="w-full h-full"
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
                  <LazyLoadImage
                    src={moment.img}
                    alt={moment.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    effect="blur"
                    wrapperClassName="w-full h-full"
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

      {/* 6. FAMOUS PLACES (ASSOCIATE HOTELS) */}
      <section className="py-20 bg-white px-6 md:px-12">
        <div className="container mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={luxuryFadeUp}
            className="font-serif text-3xl md:text-4xl text-midnight-ocean mb-12 text-center"
          >
            Famous Places & Stays
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
          >
            {places.map((place, idx) => (
              <motion.div
                key={place.id || idx}
                variants={luxuryFadeUp}
                whileHover="hover"
                className="group cursor-pointer"
              >
                <motion.div
                  variants={cardHover}
                  className="aspect-square overflow-hidden rounded-sm mb-3 shadow-md relative"
                >
                  <LazyLoadImage
                    src={
                      place.image && typeof place.image === "string"
                        ? apiService.toAbsoluteUrl(place.image)
                        : place.images && place.images.length > 0
                        ? apiService.toAbsoluteUrl(
                            place.images[0].url || place.images[0],
                          )
                        : "https://images.unsplash.com/photo-1544634076-a901606f41b9?q=80&w=2000"
                    }
                    alt={place.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    effect="blur"
                    wrapperClassName="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                </motion.div>
                <div className="text-center">
                  <h3 className="font-serif text-lg text-midnight-ocean mb-1 group-hover:text-soft-gold transition-colors">
                    {place.name}
                  </h3>
                  <p className="font-sans text-[10px] text-slate-gray uppercase tracking-widest">
                    {place.name}
                  </p>
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
