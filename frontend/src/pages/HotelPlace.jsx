import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BedDouble,
  Car,
  Check,
  Coffee,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Utensils,
  Wifi,
} from "lucide-react";
import apiService from "../services/api";
import SEO from "../components/SEO";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const fallbackImage = "/assets/hero12.jpg";

const extractHotelImages = (hotel) => {
  const images = [
    hotel.cardImage,
    hotel.image,
    ...(Array.isArray(hotel.images) ? hotel.images : []).map(
      (image) => image?.url || image?.secure_url || image,
    ),
  ]
    .filter(Boolean)
    .map((image) => apiService.toAbsoluteUrl(image));
  return [...new Set(images)].filter(Boolean);
};

const getAmenityIcon = (amenity = "") => {
  const value = amenity.toLowerCase();
  if (value.includes("wi")) return Wifi;
  if (value.includes("park") || value.includes("car")) return Car;
  if (value.includes("restaurant") || value.includes("meal")) return Utensils;
  if (value.includes("coffee") || value.includes("breakfast")) return Coffee;
  return Sparkles;
};

const formatRupeeRange = (range) => {
  if (!range || typeof range !== "string") return "Ask price";
  return range
    .split("-")
    .map((part) => {
      const value = part.trim();
      return value.startsWith("₹") ? value : `₹${value}`;
    })
    .join(" - ");
};

function AutoPhotoCard({ hotel }) {
  const images = useMemo(() => extractHotelImages(hotel), [hotel]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return undefined;
    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % images.length);
    }, 3600);
    return () => window.clearInterval(interval);
  }, [images.length]);

  const currentImage = images[active] || fallbackImage;

  return (
    <div className="relative h-full min-h-[320px] overflow-hidden bg-slate-100">
      <LazyLoadImage
        key={currentImage}
        src={currentImage}
        alt={hotel.name}
        className="h-full w-full object-cover transition duration-700"
        wrapperClassName="h-full w-full"
        effect="blur"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-midnight-ocean/72 via-midnight-ocean/10 to-transparent" />
      {images.length > 1 && (
        <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
          <div className="flex gap-1.5">
            {images.slice(0, 5).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  setActive(index);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  active === index ? "w-8 bg-white" : "w-2 bg-white/55"
                }`}
                aria-label={`Show hotel photo ${index + 1}`}
              />
            ))}
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-1.5 text-[11px] font-bold text-midnight-ocean backdrop-blur">
            <ImageIcon className="h-3.5 w-3.5" />
            {images.length} photos
          </span>
        </div>
      )}
    </div>
  );
}

function HotelPlace() {
  const { placeId } = useParams();
  const [hotels, setHotels] = useState([]);
  const [place, setPlace] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlaceHotels = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiService.getHotelsByPlace(placeId);
        if (response.success) {
          setPlace(response.data.place || null);
          setHotels(
            (response.data.hotels || []).sort((a, b) =>
              (a.name || "").localeCompare(b.name || "", "en", {
                sensitivity: "base",
              }),
            ),
          );
        } else {
          setError("We could not load hotels right now.");
        }
      } catch (err) {
        console.error("Error fetching place hotels:", err);
        setError("We could not load hotels right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaceHotels();
  }, [placeId]);

  const placeName = place?.name || "Destination";
  const placeImage =
    apiService.toAbsoluteUrl(
      place?.image?.url ||
        place?.image ||
        place?.images?.[0]?.url ||
        place?.images?.[0],
    ) || fallbackImage;

  const filteredHotels = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return hotels;
    return hotels.filter((hotel) =>
      [hotel.name, hotel.address, hotel.description, hotel.priceRange].some(
        (value) => String(value || "").toLowerCase().includes(term),
      ),
    );
  }, [hotels, searchTerm]);

  const handleWhatsAppBooking = (hotel) => {
    const message = `Hi! I'm interested in "${hotel.name}" in ${placeName}. Price range: ${hotel.priceRange || "please share"}. Please send availability, photos, room options and booking details.`;
    window.open(
      `https://wa.me/917439857694?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  if (loading) {
    return (
      <div className="premium-page flex min-h-screen items-center justify-center pt-24">
        <div className="premium-panel rounded-2xl px-8 py-6 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
          Loading stays...
        </div>
      </div>
    );
  }

  return (
    <div className="premium-page min-h-screen font-sans text-midnight-ocean">
      <SEO
        title={`${placeName} Hotels`}
        description={`Explore premium hotels, resorts and homestays in ${placeName}.`}
      />

      <section className="relative min-h-[620px] overflow-hidden bg-midnight-ocean">
        <LazyLoadImage
          src={placeImage}
          alt={placeName}
          className="absolute inset-0 h-full w-full object-cover"
          wrapperClassName="absolute inset-0 h-full w-full"
          effect="blur"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,37,35,0.92),rgba(10,46,77,0.58),rgba(10,46,77,0.10)),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.62))]" />
        <div className="relative z-10 mx-auto flex min-h-[620px] max-w-7xl flex-col justify-end px-6 pb-12 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <div className="mb-5 flex items-center gap-4">
              <div className="gold-rule" />
              <span className="section-kicker">Curated stays</span>
            </div>
            <h1 className="font-serif text-5xl leading-[1.02] text-white md:text-7xl">
              {placeName}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/84 md:text-lg">
              Handpicked hotels with photos, amenities, room details and direct
              WhatsApp enquiry.
            </p>
          </motion.div>
          <div className="mt-10 max-w-2xl border border-white/14 bg-white/10 p-3 backdrop-blur-md">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search hotel, area, or price"
                className="h-14 w-full bg-white/12 pl-12 pr-4 text-sm font-medium text-white placeholder:text-white/62 outline-none ring-1 ring-white/10 transition focus:ring-soft-gold"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="section-kicker">{filteredHotels.length} properties</span>
              <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                Choose your stay
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-slate-600">
              Hotel cards rotate through available photos automatically. Open a
              property to see the full gallery and room details.
            </p>
          </div>

          {error && (
            <div className="border border-red-100 bg-red-50 p-8 text-center text-red-700">
              {error}
            </div>
          )}

          {!error && filteredHotels.length === 0 && (
            <div className="premium-panel rounded-3xl p-12 text-center">
              <BedDouble className="mx-auto mb-4 h-12 w-12 text-soft-gold" />
              <h3 className="font-serif text-3xl">Coming soon</h3>
              <p className="mt-3 text-sm text-slate-600">
                No hotel matched this search. Contact us for custom options.
              </p>
              <Link
                to="/contact"
                className="mt-6 inline-flex rounded-full bg-midnight-ocean px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white"
              >
                Contact Support
              </Link>
            </div>
          )}

          <div className="space-y-8">
            {filteredHotels.map((hotel, index) => (
              <motion.article
                key={hotel.id || hotel._id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.18) }}
                className="grid overflow-hidden bg-white shadow-[0_22px_70px_rgba(10,46,77,0.10)] ring-1 ring-midnight-ocean/8 transition hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(10,46,77,0.15)] lg:grid-cols-[42%_1fr]"
              >
                <AutoPhotoCard hotel={hotel} />
                <div className="flex flex-col p-6 md:p-8">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-serif text-3xl leading-tight text-midnight-ocean md:text-4xl">
                        {hotel.name}
                      </h3>
                      <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="h-4 w-4 text-soft-gold" />
                        {hotel.address || placeName}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-[#fbfcf7] px-3 py-2 text-sm font-bold text-midnight-ocean">
                      <Star className="h-4 w-4 fill-soft-gold text-soft-gold" />
                      {hotel.rating || "4.5"}
                    </div>
                  </div>

                  <p className="mt-5 line-clamp-3 text-sm leading-7 text-slate-600">
                    {hotel.description ||
                      "Premium stay option with easy access to the destination's best routes and experiences."}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {(hotel.amenities || []).slice(0, 5).map((amenity) => {
                      const Icon = getAmenityIcon(amenity);
                      return (
                        <span key={amenity} className="flex items-center gap-2 bg-ice-blue px-3 py-2 text-xs font-semibold text-midnight-ocean">
                          <Icon className="h-3.5 w-3.5 text-soft-gold" />
                          {amenity}
                        </span>
                      );
                    })}
                    {extractHotelImages(hotel).length > 1 && (
                      <span className="flex items-center gap-2 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                        <ImageIcon className="h-3.5 w-3.5" />
                        {extractHotelImages(hotel).length} photos
                      </span>
                    )}
                  </div>

                  <div className="mt-auto flex flex-col gap-4 border-t border-midnight-ocean/8 pt-6 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Starting from
                      </p>
                      <div className="mt-1 font-serif text-2xl text-midnight-ocean">
                        {formatRupeeRange(hotel.priceRange).split(" - ")[0]}
                        <span className="font-sans text-xs text-slate-500"> / night</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        to={`/hotel/${hotel.slug || hotel.id}`}
                        className="flex items-center justify-center gap-2 border border-midnight-ocean/15 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-midnight-ocean transition hover:border-soft-gold hover:text-soft-gold"
                      >
                        Details
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleWhatsAppBooking(hotel)}
                        className="premium-button flex items-center justify-center gap-2 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em]"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Enquire
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {["Verified hotel partners", "Direct WhatsApp support", "Photo-led property details"].map((item) => (
              <div key={item} className="premium-panel flex items-center gap-3 rounded-2xl p-5">
                <ShieldCheck className="h-5 w-5 text-soft-gold" />
                <span className="text-sm font-semibold text-midnight-ocean">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HotelPlace;
