import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Building2, MapPin, MessageCircle, Star } from "lucide-react";
import apiService from "../services/api";

export const CURATED_STAYS = [];

export const DESTINATIONS = [
  { name: "All Hotel Destinations", path: "/hotels" },
];

const getPlaceImage = (place) =>
  apiService.toAbsoluteUrl(
    place?.image?.url ||
      place?.image ||
      place?.images?.[0]?.url ||
      place?.images?.[0],
  ) || "/assets/hero12.jpg";

const HotelsMegaMenu = ({ isOpen, onMouseEnter, onMouseLeave, onClose }) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        const response = await apiService.getPlaces();
        if (response.success) {
          setPlaces(response.data.places || []);
        }
      } catch (err) {
        console.error("Error fetching places for hotel menu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  const featuredPlaces = useMemo(() => places.slice(0, 6), [places]);
  const firstPlace = featuredPlaces[0];

  const handleWhatsApp = () => {
    const message = "Hi! I want premium hotel options. Please share destinations, photos, rates and availability.";
    window.open(
      `https://wa.me/917439857694?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute left-0 top-full z-50 w-full overflow-hidden border-b border-white/70 bg-white/95 shadow-[0_26px_80px_rgba(10,46,77,0.14)] backdrop-blur-xl"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className="container mx-auto grid grid-cols-12 gap-8 px-6 py-8 lg:px-12">
            <div className="col-span-4 overflow-hidden rounded-2xl bg-midnight-ocean text-white">
              <div className="relative h-56">
                <img
                  src={firstPlace ? getPlaceImage(firstPlace) : "/assets/hero13.jpg"}
                  alt=""
                  className="h-full w-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-ocean via-midnight-ocean/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="section-kicker">Stay finder</div>
                  <h3 className="mt-2 font-serif text-3xl">Premium hotels by destination</h3>
                </div>
              </div>
              <div className="space-y-4 p-5">
                <p className="text-sm leading-7 text-white/72">
                  Open a destination to compare hotel photos, amenities, room
                  details, and WhatsApp booking support.
                </p>
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-midnight-ocean transition hover:bg-soft-gold hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  Ask Expert
                </button>
              </div>
            </div>

            <div className="col-span-8">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="section-kicker">Destinations</div>
                  <h3 className="mt-1 font-serif text-2xl text-midnight-ocean">
                    Choose a stay base
                  </h3>
                </div>
                <Link
                  to="/hotels"
                  onClick={onClose}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-midnight-ocean hover:text-soft-gold"
                >
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {featuredPlaces.map((place) => (
                    <Link
                      key={place.id || place._id}
                      to={`/hotels/${place.slug || place.id}`}
                      onClick={onClose}
                      className="group flex gap-4 rounded-2xl border border-slate-100 bg-white p-3 transition hover:-translate-y-0.5 hover:border-soft-gold/50 hover:shadow-[0_18px_40px_rgba(10,46,77,0.09)]"
                    >
                      <img
                        src={getPlaceImage(place)}
                        alt=""
                        className="h-20 w-24 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-semibold text-midnight-ocean group-hover:text-soft-gold">
                          {place.name}
                        </h4>
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <Building2 className="h-3.5 w-3.5 text-soft-gold" />
                          {place.hotelsCount || 0} stays
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <Star className="h-3.5 w-3.5 fill-soft-gold text-soft-gold" />
                          {place.rating || "4.5"}
                        </div>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-soft-gold" />
                    </Link>
                  ))}
                  <Link
                    to="/hotels"
                    onClick={onClose}
                    className="group flex items-center justify-between rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 transition hover:border-soft-gold hover:bg-white"
                  >
                    <div>
                      <div className="font-semibold text-midnight-ocean">All destinations</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />
                        Browse every hotel collection
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-soft-gold" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HotelsMegaMenu;
