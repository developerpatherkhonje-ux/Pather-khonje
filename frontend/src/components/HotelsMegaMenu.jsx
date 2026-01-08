import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Color Constants based on design requirements
const COLORS = {
  primary: "#0B2545", // Deep Midnight Blue
  secondary: "#3A5F8C", // Steel Blue
  background: "#FAFBFD", // Cloud White
  hoverBg: "#F1F6FB", // Soft Blue Tint
  accent: "#C7A14A", // Muted Heritage Gold
};

// Destination IDs
const CATEGORIES = {
  HILLS: "hills",
  HIMALAYA: "himalaya",
  BEACH: "beach",
  CULTURE: "culture",
  FAMILY: "family",
  ALL: "all",
};

// Dummy Data for Curated List
export const CURATED_STAYS = [
  // Trending / Initial
  {
    id: "vizag-araku",
    name: "Vizag – Araku Escape",
    duration: "3 Nights",
    price: "₹18,500",
    location: "Visakhapatnam",
    category: CATEGORIES.BEACH,
    tag: "Trending",
  },
  {
    id: "darjeeling-tea",
    name: "Glenburn Tea Estate",
    duration: "2 Nights",
    price: "₹32,000",
    location: "Darjeeling",
    category: CATEGORIES.HILLS,
    tag: "Luxury",
  },
  {
    id: "kaziranga-wild",
    name: "Kaziranga Wilderness",
    duration: "4 Nights",
    price: "₹24,500",
    location: "Assam",
    category: CATEGORIES.CULTURE,
  },
  {
    id: "gangtok-retreat",
    name: "Mayfair Gangtok Retreat",
    duration: "3 Nights",
    price: "₹45,000",
    location: "Sikkim",
    category: CATEGORIES.HIMALAYA,
  },
  // Additional Entries
  {
    id: "goa-villas",
    name: "Luxury Goa Villas",
    duration: "4 Nights",
    price: "₹55,000",
    location: "Goa",
    category: CATEGORIES.BEACH,
  },
  {
    id: "munnar-mist",
    name: "Munnar Misty Hills",
    duration: "3 Nights",
    price: "₹22,000",
    location: "Kerala",
    category: CATEGORIES.HILLS,
  },
  {
    id: "shimla-homestay",
    name: "Shimla Heritage Stay",
    duration: "3 Nights",
    price: "₹28,000",
    location: "Shimla",
    category: CATEGORIES.HIMALAYA,
  },
  {
    id: "jaipur-palace",
    name: "Jaipur Royal Palace",
    duration: "2 Nights",
    price: "₹42,000",
    location: "Rajasthan",
    category: CATEGORIES.CULTURE,
  },
  {
    id: "coorg-plantation",
    name: "Coorg Coffee Plantation",
    duration: "3 Nights",
    price: "₹26,000",
    location: "Coorg",
    category: CATEGORIES.FAMILY,
  },
  {
    id: "andaman-blue",
    name: "Andaman Blue Waters",
    duration: "5 Nights",
    price: "₹65,000",
    location: "Andaman",
    category: CATEGORIES.BEACH,
  },
];

// Destination Styles
export const DESTINATIONS = [
  { name: "All Destinations", id: CATEGORIES.ALL },
  { name: "Eastern Hills", id: CATEGORIES.HILLS },
  { name: "Himalayan Stays", id: CATEGORIES.HIMALAYA },
  { name: "Beach Destinations", id: CATEGORIES.BEACH },
  { name: "Cultural Circuits", id: CATEGORIES.CULTURE },
  { name: "Family-Friendly Stays", id: CATEGORIES.FAMILY },
];

const HotelsMegaMenu = ({ isOpen, onMouseEnter, onMouseLeave, onClose }) => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES.ALL);

  // Filter logic
  // Filter logic
  const filteredStays = useMemo(() => {
    if (activeCategory === CATEGORIES.ALL) {
      // Return all if ALL, or just mix
      return CURATED_STAYS;
    }
    return CURATED_STAYS.filter((stay) => stay.category === activeCategory);
  }, [activeCategory]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute top-full left-0 w-full bg-[#FAFBFD] border-b border-blue-100 shadow-xl z-50 overflow-hidden"
          style={{ borderBottomColor: "rgba(58, 95, 140, 0.2)" }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className="container mx-auto px-6 lg:px-12 py-8">
            <div className="grid grid-cols-12 gap-12">
              {/* COLUMN 1: INTRO / CONTEXT */}
              <div className="col-span-3 border-r border-gray-100 pr-8">
                <h3
                  className="font-inter font-semibold text-lg mb-4 tracking-tight"
                  style={{ color: COLORS.primary }}
                >
                  Curated Hotel Stays
                </h3>
                <p
                  className="font-inter font-medium text-sm leading-relaxed mb-6"
                  style={{ color: COLORS.secondary }}
                >
                  Carefully selected stays paired with thoughtfully planned
                  itineraries.
                </p>
                <div
                  className="w-12 h-[1px]"
                  style={{ backgroundColor: COLORS.accent }}
                ></div>
              </div>

              {/* COLUMN 2: HOTEL LIST (PRIMARY) - DYNAMIC */}
              <div
                className="col-span-6 border-r border-gray-100 px-8 h-[350px] overflow-y-auto"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#CBD5E1 transparent",
                }}
              >
                <div className="flex flex-col space-y-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCategory}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col space-y-2"
                    >
                      {filteredStays.length > 0 ? (
                        filteredStays.map((stay) => (
                          <Link
                            key={stay.id}
                            to={`/website/hotel/${stay.id}`}
                            className="group flex items-center justify-between p-4 rounded-lg transition-all duration-200"
                            onClick={onClose}
                            style={{
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                COLORS.hoverBg;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }}
                          >
                            <div className="flex items-center gap-4 border-l-2 border-transparent group-hover:border-[#3A5F8C] pl-2 transition-all">
                              <div>
                                <h4
                                  className="font-inter font-medium text-base group-hover:translate-x-1 transition-transform"
                                  style={{ color: COLORS.primary }}
                                >
                                  {stay.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className="font-inter text-xs"
                                    style={{ color: COLORS.secondary }}
                                  >
                                    {stay.duration}
                                  </span>
                                  <span className="text-gray-300">•</span>
                                  <span
                                    className="font-inter text-xs"
                                    style={{ color: COLORS.secondary }}
                                  >
                                    {stay.location}
                                  </span>
                                  <span className="text-gray-300">•</span>
                                  <span
                                    className="font-inter text-xs font-semibold"
                                    style={{ color: COLORS.secondary }}
                                  >
                                    {stay.price}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <ArrowRight
                              size={16}
                              className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[#3A5F8C]"
                            />
                          </Link>
                        ))
                      ) : (
                        <div className="py-10 text-center text-sm text-gray-400 font-inter">
                          No stays found for this category yet.
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* COLUMN 3: DESTINATION GROUPING - FILTER CONTROLS */}
              <div className="col-span-3 pl-4">
                <h4
                  className="font-inter font-semibold text-xs tracking-widest uppercase mb-6 opacity-70"
                  style={{ color: COLORS.primary }}
                >
                  Explore by Destination
                </h4>
                <div className="flex flex-col space-y-3">
                  {DESTINATIONS.map((dest) => (
                    <button
                      key={dest.id}
                      onClick={() => setActiveCategory(dest.id)}
                      className="font-inter text-sm group flex items-start text-left gap-2 w-fit transition-colors relative"
                      style={{
                        color:
                          activeCategory === dest.id
                            ? COLORS.primary
                            : COLORS.secondary,
                        fontWeight: activeCategory === dest.id ? 600 : 400,
                      }}
                    >
                      <span className="relative overflow-hidden hover:text-[#0B2545]">
                        {dest.name}
                        {/* Underline for active state */}
                        {activeCategory === dest.id && (
                          <motion.span
                            layoutId="activeCategory"
                            className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C7A14A]"
                          />
                        )}
                        {/* Underline for hover state (if not active) */}
                        {activeCategory !== dest.id && (
                          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C7A14A] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HotelsMegaMenu;
