import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import apiService from "../services/api";

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
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        const response = await apiService.getPlaces();
        if (response.success) {
          // Map backend data to mega menu structure
          const mappedPlaces = (response.data.places || []).map((place) => ({
            id: place.id,
            name: place.name,
            duration: "Flexible", // Default as backend doesn't have this yet
            price: "View Details", // Default
            location: place.name, // Using name as location for now
            category: CATEGORIES.ALL, // Defaulting to ALL as backend lacks category/tag currently
            tag: place.hotelsCount ? `${place.hotelsCount} Stays` : null,
          }));
          setPlaces(mappedPlaces);
        }
      } catch (err) {
        console.error("Error fetching places for menu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  // Filter logic - Simplify to show all
  const filteredStays = places;

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
            <div className="grid grid-cols-12 gap-8">
              {/* COLUMN 1: INTRO / CONTEXT */}
              <div className="col-span-3 border-r border-gray-100 pr-8">
                <h3
                  className="font-inter font-semibold text-lg mb-4 tracking-tight"
                  style={{ color: COLORS.primary }}
                >
                  Associate Hotels
                </h3>
                <p
                  className="font-inter font-medium text-sm leading-relaxed mb-6"
                  style={{ color: COLORS.secondary }}
                >
                  Our trusted partners providing exceptional hospitality across
                  destinations.
                </p>
                <div
                  className="w-12 h-[1px]"
                  style={{ backgroundColor: COLORS.accent }}
                ></div>
              </div>

              {/* COLUMN 2: HOTEL LIST (PRIMARY) - DYNAMIC - EXPANDED */}
              <div className="col-span-9 pl-4">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
                  <AnimatePresence mode="wait">
                    {filteredStays.length > 0 ? (
                      filteredStays.map((stay) => (
                        <Link
                          key={stay.id}
                          to={`/website/hotels/${stay.id}`}
                          className="group flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:bg-[#F1F6FB]"
                          onClick={onClose}
                        >
                          <div className="flex items-center gap-3 border-l-2 border-transparent group-hover:border-[#3A5F8C] pl-2 transition-all w-full">
                            <div className="w-full">
                              <h4
                                className="font-inter font-medium text-sm group-hover:translate-x-1 transition-transform truncate"
                                style={{ color: COLORS.primary }}
                              >
                                {stay.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span
                                  className="font-inter text-[10px]"
                                  style={{ color: COLORS.secondary }}
                                >
                                  {stay.location}
                                </span>
                              </div>
                            </div>
                            <ArrowRight
                              size={14}
                              className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[#3A5F8C]"
                            />
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="col-span-3 py-10 text-center text-sm text-gray-400 font-inter">
                        No stays found.
                      </div>
                    )}
                  </AnimatePresence>
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
