import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import apiService from "../services/api";
import SEO from "../components/SEO";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const COLORS = {
  primary: "#0B2545", // Deep Midnight Blue
  secondary: "#3A5F8C", // Steel Blue
  background: "#FAFBFD", // Cloud White
  cardBg: "#FFFFFF",
  sectionBg: "#F1F6FB", // Light Blue Tint
  accent: "#C7A14A", // Muted Heritage Gold
};

function formatRupeeRange(range) {
  if (!range || typeof range !== "string") return range;
  const parts = range
    .split("-")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 2) {
    const left = parts[0].startsWith("₹") ? parts[0] : `₹ ${parts[0]}`;
    const right = parts[1].startsWith("₹") ? parts[1] : `₹ ${parts[1]}`;
    return `${left} - ${right}`;
  }
  return range.startsWith("₹") ? range : `₹ ${range}`;
}

// Editorial Image Carousel
function HotelImageCarousel({ images = [], alt }) {
  const [index, setIndex] = useState(0);
  const total = images.length;

  if (!images || total === 0) {
    return (
      <div className="h-full min-h-[280px] bg-gray-100 relative group overflow-hidden">
        <img
          src="/hotels/goa-hotel.png"
          alt={alt}
          className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[280px] bg-gray-100 group overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full h-full absolute inset-0"
        >
          <LazyLoadImage
            src={images[index]}
            alt={alt}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            effect="blur"
            wrapperClassName="w-full h-full"
          />
        </motion.div>
      </AnimatePresence>

      {/* Subtle darkening on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />

      {/* Minimal Dots (Optional) */}
      {total > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.preventDefault();
                setIndex(i);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === index
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HotelPlace() {
  const { placeId } = useParams();
  const [hotels, setHotels] = useState([]);
  const [placeName, setPlaceName] = useState("");
  const [placeImage, setPlaceImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlaceHotels();
  }, [placeId]);

  const fetchPlaceHotels = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getHotelsByPlace(placeId);
      if (
        response.success &&
        response.data.hotels &&
        response.data.hotels.length > 0
      ) {
        const sortedHotels = (response.data.hotels || []).sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", "en", {
            sensitivity: "base",
          }),
        );
        setHotels(sortedHotels);
        setPlaceName(response.data.place?.name || "");

        const place = response.data.place || {};
        const primaryImage =
          place.image && typeof place.image === "string" && place.image.trim()
            ? apiService.toAbsoluteUrl(place.image)
            : place.images && place.images.length > 0
            ? apiService.toAbsoluteUrl(
                place.images[0].url ||
                  place.images[0].secure_url ||
                  place.images[0],
              )
            : "";
        setPlaceImage(primaryImage || "");
      } else {
        // MOCK DATA
        setPlaceName("Darjeeling");
        setPlaceImage(
          "https://images.unsplash.com/photo-1544634076-a901606f41b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
        );
        setHotels([
          {
            id: "1",
            name: "The Elgin, Darjeeling",
            address: "18, H.D. Lama Road, Darjeeling",
            rating: 4.8,
            priceRange: "₹8500 - ₹15000",
            amenities: ["Wi-Fi", "Restaurant", "Spa"],
            images: [
              "https://cf.bstatic.com/xdata/images/hotel/max1024x768/498135804.jpg?k=368b6da120464222dfa61c360662d9876274e797587747806509c25838cc5606&o=&hp=1",
              "https://cf.bstatic.com/xdata/images/hotel/max1024x768/498135804.jpg?k=368b6da120464222dfa61c360662d9876274e797587747806509c25838cc5606&o=&hp=1",
            ],
          },
          {
            id: "2",
            name: "Mayfair Darjeeling",
            address: "Mall Road, Opposite Governor House",
            rating: 4.9,
            priceRange: "₹12000 - ₹25000",
            amenities: ["Wi-Fi", "Parking", "Gym"],
            images: [
              "https://www.mayfairhotels.com/mayfair-darjeeling/images/gallery/exterior/original/5.jpg",
            ],
          },
          {
            id: "3",
            name: "Windamere Hotel",
            address: "Observatory Hill, Darjeeling",
            rating: 4.6,
            priceRange: "₹10000 - ₹18000",
            amenities: ["Wi-Fi", "Restaurant", "Heritage Walk"],
            images: [
              "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/f2/96/6e/windamere-hotel.jpg?w=1200&h=-1&s=1",
            ],
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching place hotels:", err);
      // setError("Failed to load hotels");
      // FALLBACK TO MOCK DATA FOR DEV
      setPlaceName("Darjeeling");
      setPlaceImage(
        "https://images.unsplash.com/photo-1544634076-a901606f41b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      );
      setHotels([
        {
          id: "1",
          name: "The Elgin, Darjeeling",
          address: "18, H.D. Lama Road, Darjeeling",
          rating: 4.8,
          priceRange: "₹8500 - ₹15000",
          amenities: ["Wi-Fi", "Restaurant", "Spa"],
          images: [
            "https://cf.bstatic.com/xdata/images/hotel/max1024x768/498135804.jpg?k=368b6da120464222dfa61c360662d9876274e797587747806509c25838cc5606&o=&hp=1",
            "https://cf.bstatic.com/xdata/images/hotel/max1024x768/498135804.jpg?k=368b6da120464222dfa61c360662d9876274e797587747806509c25838cc5606&o=&hp=1",
          ],
        },
        {
          id: "2",
          name: "Mayfair Darjeeling",
          address: "Mall Road, Opposite Governor House",
          rating: 4.9,
          priceRange: "₹12000 - ₹25000",
          amenities: ["Wi-Fi", "Parking", "Gym"],
          images: [
            "https://www.mayfairhotels.com/mayfair-darjeeling/images/gallery/exterior/original/5.jpg",
          ],
        },
        {
          id: "3",
          name: "Windamere Hotel",
          address: "Observatory Hill, Darjeeling",
          rating: 4.6,
          priceRange: "₹10000 - ₹18000",
          amenities: ["Wi-Fi", "Restaurant", "Heritage Walk"],
          images: [
            "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/f2/96/6e/windamere-hotel.jpg?w=1200&h=-1&s=1",
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case "wi-fi":
        return <Wifi size={14} className="stroke-[1.5]" />;
      case "parking":
        return <Car size={14} className="stroke-[1.5]" />;
      case "restaurant":
        return <Coffee size={14} className="stroke-[1.5]" />;
      case "gym":
        return <Dumbbell size={14} className="stroke-[1.5]" />;
      default:
        return <Sparkles size={14} className="stroke-[1.5]" />;
    }
  };

  const handleWhatsAppBooking = (hotel) => {
    const message = `Hi! I'm interested in booking "${hotel.name}" in ${placeName}. Price range: ${hotel.priceRange}. Please provide availability.`;
    window.open(
      `https://wa.me/917439857694?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFD] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-t border-[#0B2545] rounded-full animate-spin"></div>
          <div className="text-[#0B2545] font-serif text-lg tracking-wide opacity-80">
            Loading...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-[#0B2545] font-sans selection:bg-[#C7A14A]/20">
      <SEO
        title={placeName ? `${placeName} Hotels` : "Luxury Hotels"}
        description={`Explore the best luxury hotels and resorts in ${
          placeName || "Sikkim & Darjeeling"
        }.`}
      />
      {/* 1. IMMERSIVE HERO SECTION */}
      <section className="relative h-[55vh] min-h-[450px] w-full overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black/30 z-10" />

        {placeImage ? (
          <motion.img
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={placeImage}
            alt={placeName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#0B2545]" />
        )}

        {/* Back Navigation */}
        <div className="absolute top-28 left-6 md:left-12 z-20">
          <Link
            to="/website/hotels"
            className="group flex items-center gap-3 text-white/90 hover:text-white transition-colors"
          >
            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 group-hover:bg-white/20 transition-all">
              <ChevronLeft size={16} />
            </div>
            <span className="text-xs font-medium uppercase tracking-[0.15em] opacity-90 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
              Back to Destinations
            </span>
          </Link>
        </div>

        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-4 pt-16">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl space-y-5"
          >
            <div className="flex items-center justify-center gap-4 text-white/90 text-[10px] font-bold uppercase tracking-[0.25em] mb-4">
              <span className="h-[1px] w-8 bg-[#C7A14A]/80"></span>
              <span>Luxury Collection</span>
              <span className="h-[1px] w-8 bg-[#C7A14A]/80"></span>
            </div>

            <h1 className="font-serif text-5xl md:text-7xl text-white leading-[1.1] tracking-tight">
              {placeName}
            </h1>

            <p className="text-white/80 text-lg font-light max-w-xl mx-auto leading-relaxed font-sans antialiased">
              Discover our handpicked selection of premium accommodations, where
              luxury meets the quiet charm of nature.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. HOTEL LISTINGS */}
      <section className="py-20 px-4 md:px-8 lg:px-12 max-w-[1340px] mx-auto">
        <div className="flex items-end justify-between mb-12 border-b border-[#E8F0F9] pb-6">
          <div>
            <h2 className="font-serif text-3xl text-[#0B2545] mb-2">
              Curated Stays
            </h2>
            <p className="text-[#3A5F8C] font-light text-sm tracking-wide">
              {hotels.length} properties in {placeName}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {hotels.map((hotel, index) => (
            <motion.div
              key={hotel.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              whileHover={{ y: -2 }}
              className="group bg-white rounded-lg overflow-hidden flex flex-col md:flex-row shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 border border-[#F1F6FB]"
            >
              {/* LEFT - IMAGE PANEL (40%) */}
              <div className="md:w-[40%] h-[280px] md:h-auto relative overflow-hidden">
                <HotelImageCarousel
                  images={(hotel.images || [])
                    .slice(0, 5)
                    .map((img) => img.url || img.secure_url || img)}
                  alt={hotel.name}
                />
              </div>

              {/* RIGHT - CONTENT PANEL (60%) */}
              <div className="md:w-[60%] p-6 md:p-8 lg:p-10 flex flex-col justify-between relative bg-white">
                <div>
                  {/* 1. Title Row */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-3xl text-[#0B2545] leading-tight relative inline-block">
                      {hotel.name}
                      <span className="block h-[1px] bg-[#0B2545] max-w-0 group-hover:max-w-full transition-all duration-500 ease-in-out mt-1 opacity-20"></span>
                    </h3>
                    <div className="flex items-center gap-1.5 pt-1">
                      <Star
                        size={14}
                        className="fill-[#C7A14A] text-[#C7A14A]"
                      />
                      <span className="font-medium text-[#0B2545] text-sm">
                        {hotel.rating || "4.5"}
                      </span>
                    </div>
                  </div>

                  {/* 2. Location */}
                  <div className="flex items-center gap-2 text-[#3A5F8C] font-light text-sm mb-6">
                    <MapPin size={14} className="opacity-70" />
                    <span>{hotel.address || placeName}</span>
                  </div>

                  {/* 3. Amenities (Minimal) */}
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
                    {(hotel.amenities || []).slice(0, 3).map((amenity, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-[#3A5F8C]/80 text-xs uppercase tracking-wider font-medium"
                      >
                        {getAmenityIcon(amenity)}
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Price & Action Block */}
                <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6 pt-6 border-t border-[#F1F6FB]">
                  {/* Price */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#3A5F8C]/70 mb-1">
                      Starting from
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-2xl text-[#0B2545]">
                        {formatRupeeRange(hotel.priceRange).split(" - ")[0]}
                      </span>
                      <span className="text-xs text-[#3A5F8C] font-light">
                        / head / night{" "}
                        <span className="opacity-60">(with meals)</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 w-full md:w-auto">
                    <button
                      onClick={() => handleWhatsAppBooking(hotel)}
                      className="flex-1 md:flex-none px-6 py-3 bg-[#0B2545] text-white text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-[#153459] transition-all duration-300 shadow-sm flex items-center justify-center gap-2 group/btn rounded-sm"
                    >
                      Book Now
                      <ArrowRight
                        size={14}
                        className="group-hover/btn:translate-x-1 transition-transform duration-300 text-[#C7A14A]"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {hotels.length === 0 && !loading && (
          <div className="text-center py-24 border border-[#F1F6FB] rounded-xl bg-white">
            <Sparkles
              size={40}
              className="text-[#C7A14A] mx-auto mb-6 opacity-60"
            />
            <h3 className="font-serif text-3xl text-[#0B2545] mb-3">
              Curating Excellence
            </h3>
            <p className="text-[#3A5F8C] max-w-md mx-auto mb-8 font-light text-sm leading-relaxed">
              We are currently selecting the finest stays in {placeName}. In the
              meantime, our concierge is available to assist you.
            </p>
            <Link
              to="/website/contact"
              className="inline-block px-8 py-4 bg-[#0B2545] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#1a3b66] transition-colors rounded-sm"
            >
              Contact Concierge
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

export default HotelPlace;
