import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  MapPin,
  Wifi,
  Car,
  Utensils,
  Calendar,
  Clock,
  Phone,
  Shield,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import SEO from "../components/SEO";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const COLORS = {
  primary: "#0B2545",
  secondary: "#3A5F8C",
  background: "#FAFBFD",
  separator: "#F1F6FB",
  lightBlue: "#E8F0F9",
  accent: "#C7A14A",
};

function HotelDetails() {
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    // Mock data - retaining original data structure but enhancing content for design demo
    const mockHotel = {
      id: hotelId || "1",
      name: "The Grand Mountain Resort",
      images: [
        "https://images.squarespace-cdn.com/content/v1/675176954189cc3a0d973e74/1733392587955-MGMBWZB42PLMPUTDVUO6/Landscape+photography+course+card_2000px-60.jpg", // Editorial landscape
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", // Detail
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", // Interior
      ],
      rating: 4.8,
      reviews: 142,
      location: "Darjeeling, West Bengal",
      amenities: [
        "Free High-Speed Wifi",
        "Private Parking",
        "Gourmet Restaurant",
        "Mountain View Spa",
        "Heated Pool",
        "24/7 Butler",
      ],
      checkIn: "02:00 PM",
      checkOut: "11:00 AM",
      priceRange: "₹5,000 – ₹12,000",
      description:
        "Perched amidst the clouds, The Grand Mountain Resort offers an escape into the sublime. With architecture that whispers of colonial heritage and interiors that embrace modern luxury, every corner is designed for silence, comfort, and awe. Wake up to the Kanchenjunga, dine under the stars, and let the mountain air rejuvenate your soul.",
      roomTypes: [
        {
          type: "Deluxe Valley View",
          price: 5000,
          description:
            "A cozy sanctuary with sweeping views of the valley, featuring warm timber flooring and a private balcony.",
          features: [
            "King Size Bed",
            "Private Balcony",
            "Rain Shower",
            "Work Desk",
          ],
        },
        {
          type: "Premium Mountain Suite",
          price: 8000,
          description:
            "Generous living space designed for indulgence, offering panoramic mountain vistas and a separate lounge area.",
          features: ["Panoramic View", "Separate Lounge", "Bathtub", "Minibar"],
        },
        {
          type: "Royal Heritage Suite",
          price: 12000,
          description:
            "The epitome of luxury. Experience colonial grandeur with a master bedroom, dining area, and personalized butler service.",
          features: [
            "2 Bedrooms",
            "Private Terrace",
            "Dining Area",
            "Butler Service",
          ],
        },
      ],
    };

    setTimeout(() => {
      setHotel(mockHotel);
      setLoading(false);
    }, 800);
  }, [hotelId]);

  const handleWhatsAppBooking = (roomType = null) => {
    if (!hotel) return;
    let message = `Hi! I'm interested in booking "${hotel.name}" at ${hotel.location}.`;
    if (roomType) {
      message += ` I am looking at the ${roomType}.`;
    }
    message += " Please confirm availability and rates.";
    window.open(
      `https://wa.me/917439857694?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFD] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[#0B2545] font-serif text-2xl tracking-wide"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!hotel) return null;

  return (
    <div className="min-h-screen bg-[#FAFBFD] font-sans text-[#0B2545] pb-24">
      <SEO
        title={hotel.name}
        description={`Stay at ${hotel.name}. ${hotel.description.substring(
          0,
          150,
        )}...`}
      />
      {/* 1. IMAGE & TITLE SECTION */}
      <section className="pt-28 pb-12 px-6 lg:px-12 max-w-[1400px] mx-auto">
        {/* Gallery - Calm grid, not carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid grid-cols-12 gap-4 h-[60vh] min-h-[500px] mb-8 rounded-xl overflow-hidden"
        >
          <div className="col-span-8 h-full relative cursor-pointer group">
            <LazyLoadImage
              src={hotel.images[0]}
              alt="Main"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              effect="blur"
              wrapperClassName="w-full h-full"
            />
          </div>
          <div className="col-span-4 flex flex-col gap-4 h-full">
            <div className="h-1/2 relative overflow-hidden cursor-pointer group">
              <LazyLoadImage
                src={hotel.images[1]}
                alt="Detail 1"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                effect="blur"
                wrapperClassName="w-full h-full"
              />
            </div>
            <div className="h-1/2 relative overflow-hidden cursor-pointer group">
              <LazyLoadImage
                src={hotel.images[2]}
                alt="Detail 2"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                effect="blur"
                wrapperClassName="w-full h-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Title Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="border-b border-[#F1F6FB] pb-8"
        >
          <h1 className="font-serif text-5xl md:text-6xl text-[#0B2545] mb-4 tracking-tight">
            {hotel.name}
          </h1>
          <div className="flex items-center gap-6 text-sm font-medium tracking-widest uppercase">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={15}
                    className="text-[#C7A14A]"
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <span className="text-[#3A5F8C] pt-0.5 font-semibold text-xs tracking-wider">
                5.0 (204 REVIEWS)
              </span>
            </div>
            <span className="w-[1px] h-4 bg-gray-300"></span>
            <span className="text-[#3A5F8C] pt-0.5 font-semibold text-xs tracking-wider">
              {hotel.location.toUpperCase()}
            </span>
          </div>
        </motion.div>
      </section>

      {/* 2. MAIN LAYOUT */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* LEFT COLUMN: PRIMARY CONTENT (70%) */}
        <div className="lg:col-span-8 space-y-20">
          {/* 4. ABOUT THIS HOTEL */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="font-serif text-3xl mb-8 text-[#0B2545]">
                The Experience
              </h3>
              <p className="font-inter text-lg leading-loose text-gray-600 font-light max-w-prose">
                {hotel.description}
              </p>
            </motion.div>
          </section>

          {/* 5. AMENITIES */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="font-serif text-3xl mb-8 text-[#0B2545]">
                Amenities
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
                {hotel.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 text-[#3A5F8C] group"
                  >
                    <div className="p-2 rounded-lg border border-gray-100 group-hover:border-[#3A5F8C]/30 transition-colors">
                      <Check size={16} strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-inter font-medium tracking-wide text-[#0B2545] group-hover:text-[#3A5F8C] transition-colors">
                      {amenity}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* 6. ROOM TYPES (EDITORIAL BLOCKS) */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="font-serif text-3xl mb-10 text-[#0B2545]">
                Accommodations
              </h3>
              <div className="flex flex-col border-t border-[#F1F6FB]">
                {hotel.roomTypes.map((room, idx) => (
                  <div
                    key={idx}
                    className="group py-12 border-b border-[#F1F6FB] flex flex-col md:flex-row gap-8 items-start md:items-center justify-between transition-colors hover:bg-white/50"
                  >
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-baseline md:block">
                        <h4 className="font-serif text-2xl text-[#0B2545] mb-2">
                          {room.type}
                        </h4>
                        <span className="md:hidden font-inter font-semibold text-[#3A5F8C]">
                          ₹{room.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed max-w-md font-light">
                        {room.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {room.features.map((f) => (
                          <span
                            key={f}
                            className="text-[10px] uppercase tracking-widest px-3 py-1 bg-[#F1F6FB] text-[#3A5F8C] rounded-sm"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-6 min-w-[180px]">
                      <div className="text-right hidden md:block">
                        <div className="font-serif text-2xl text-[#3A5F8C]">
                          ₹{room.price.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">
                          Per Night
                        </div>
                      </div>
                      <button
                        onClick={() => handleWhatsAppBooking(room.type)}
                        className="group/btn flex items-center gap-3 px-6 py-3 bg-white border border-[#0B2545] text-[#0B2545] text-xs font-bold uppercase tracking-widest hover:bg-[#0B2545] hover:text-white transition-all duration-300 w-full md:w-auto justify-center"
                      >
                        Book Room
                        <ArrowRight
                          size={14}
                          className="group-hover/btn:translate-x-1 transition-transform"
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* 8. CONFIDENCE STRIP */}
          <section className="bg-[#E8F0F9]/30 p-12 rounded-xl text-center space-y-6">
            <Shield
              className="w-8 h-8 text-[#3A5F8C] mx-auto opacity-80"
              strokeWidth={1.5}
            />
            <div className="max-w-xl mx-auto space-y-2">
              <h4 className="font-serif text-xl text-[#0B2545]">
                Concierge Assurance
              </h4>
              <p className="text-sm text-[#3A5F8C] leading-loose">
                Every booking comes with our promise of personalized assistance.
                We work directly with trusted hotel partners to ensure your stay
                is seamless.
              </p>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: STICKY INFO (30%) */}
        <div className="lg:col-span-4 relative hidden lg:block">
          <div className="sticky top-28 space-y-8">
            {/* BOOKING PANEL */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="p-8 border border-[#F1F6FB] bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
            >
              <div className="mb-6">
                <span className="text-xs uppercase tracking-widest text-[#C7A14A] font-bold mb-2 block">
                  Starting From
                </span>
                <div className="font-serif text-4xl text-[#0B2545]">
                  {hotel.priceRange.split("–")[0]}
                  <span className="text-lg text-gray-400 font-sans font-light">
                    {" "}
                    / night
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-8 text-xs text-[#3A5F8C]">
                <Sparkles size={12} />
                <span>Best rates guaranteed direct</span>
              </div>

              <button
                onClick={() => handleWhatsAppBooking()}
                className="w-full py-4 bg-[#0B2545] text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#3A5F8C] transition-colors mb-4 flex items-center justify-center gap-2 group"
              >
                Inquire on WhatsApp
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>

              <div className="flex justify-center gap-6 text-[10px] uppercase tracking-wider text-gray-400">
                <span>No Booking Fees</span>
                <span>Instant Confirmation</span>
              </div>
            </motion.div>

            {/* INFO PANEL */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="bg-[#F1F6FB] p-8 rounded-lg space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                    Check-in
                  </p>
                  <p className="font-serif text-xl text-[#0B2545]">
                    {hotel.checkIn}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                    Check-out
                  </p>
                  <p className="font-serif text-xl text-[#0B2545]">
                    {hotel.checkOut}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-black/5">
                <div className="flex items-start gap-4">
                  <Phone size={18} className="text-[#3A5F8C] mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-[#0B2545] mb-1">
                      Need help?
                    </p>
                    <p className="text-xs text-[#3A5F8C] leading-relaxed">
                      Our experts are available 24/7 to help you plan your stay.
                      <br />
                      <span className="font-bold border-b border-[#3A5F8C] mt-1 inline-block pb-0.5">
                        +91 74398 57694
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM (To ensure usability on small screens) */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 lg:hidden z-40 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div>
          <span className="text-xs text-gray-500 uppercase">Starting from</span>
          <div className="font-serif text-xl text-[#0B2545]">
            {hotel.priceRange.split("–")[0]}
          </div>
        </div>
        <button
          onClick={() => handleWhatsAppBooking()}
          className="px-6 py-3 bg-[#0B2545] text-white text-xs font-bold uppercase tracking-widest"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}

export default HotelDetails;
