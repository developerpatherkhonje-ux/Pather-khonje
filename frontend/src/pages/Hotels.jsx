import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Check,
  MapPin,
  MessageCircle,
  Mountain,
  Search,
  Shield,
  Star,
} from "lucide-react";
import apiService from "../services/api";
import SEO from "../components/SEO";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const fallbackImage = "/assets/hero13.jpg";

const getPlaceImage = (place) =>
  apiService.toAbsoluteUrl(
    place?.image?.url ||
      place?.image ||
      place?.images?.[0]?.url ||
      place?.images?.[0]?.secure_url ||
      place?.images?.[0],
  ) || fallbackImage;

const Hotels = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiService.getPlaces();
        if (response.success) {
          setPlaces(
            (response.data.places || []).sort((a, b) =>
              (a.name || "").localeCompare(b.name || "", "en", {
                sensitivity: "base",
              }),
            ),
          );
        } else {
          setError("We could not load destinations right now.");
        }
      } catch (err) {
        console.error("Error fetching places:", err);
        setError("We could not load destinations right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  const filteredPlaces = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return places;
    return places.filter((place) =>
      [place.name, place.description].some((value) =>
        String(value || "").toLowerCase().includes(term),
      ),
    );
  }, [places, searchTerm]);

  const handleWhatsAppEnquiry = (place = null) => {
    const message = place
      ? `Hi! I want hotel options for ${place.name}. Please share available stays, price range, photos and booking details.`
      : "Hi! I want help choosing a hotel/stay. Please share premium options with photos, price range and availability.";
    window.open(
      `https://wa.me/917439857694?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="premium-page min-h-screen font-sans text-midnight-ocean">
      <SEO
        title="Premium Hotels, Resorts & Homestays"
        description="Find handpicked hotels, resorts and homestays across mountain destinations with premium enquiry support."
        keywords="premium hotels India, mountain hotels, Sikkim hotels, Darjeeling resorts, curated stays, homestays"
      />

      <section className="relative min-h-[76vh] overflow-hidden bg-midnight-ocean">
        <LazyLoadImage
          src={fallbackImage}
          alt="Mountain hotel stays"
          className="absolute inset-0 h-full w-full object-cover"
          wrapperClassName="absolute inset-0 h-full w-full"
          effect="blur"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,37,35,0.92),rgba(10,46,77,0.62)_48%,rgba(10,46,77,0.15)),linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.50))]" />
        <div className="relative z-10 mx-auto flex min-h-[76vh] max-w-7xl flex-col justify-end px-6 pb-12 pt-32 md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <div className="mb-5 flex items-center gap-4">
              <div className="gold-rule" />
              <span className="section-kicker">Handpicked mountain stays</span>
            </div>
            <h1 className="font-serif text-5xl leading-[1.02] text-white md:text-7xl lg:text-8xl">
              Stays chosen for view, comfort, and route convenience.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/84 md:text-xl">
              Browse destination-wise hotels, open real property details, and
              ask our team for WhatsApp availability with photos and rates.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-3 border border-white/14 bg-white/10 p-3 backdrop-blur-md md:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search destination or stay type"
                className="h-14 w-full bg-white/12 pl-12 pr-4 text-sm font-medium text-white placeholder:text-white/62 outline-none ring-1 ring-white/10 transition focus:ring-soft-gold"
              />
            </label>
            <button
              type="button"
              onClick={() => handleWhatsAppEnquiry()}
              className="premium-button flex h-14 items-center justify-center gap-3 px-6 text-xs font-bold uppercase tracking-[0.18em]"
            >
              <MessageCircle className="h-4 w-4" />
              Ask Expert
            </button>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="section-kicker">Stay destinations</span>
              <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                Explore hotel collections
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-slate-600">
              Each destination opens into curated property cards with rotating
              photos, details, and WhatsApp enquiry.
            </p>
          </div>

          {loading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-[470px] animate-pulse bg-white shadow-[0_20px_60px_rgba(10,46,77,0.08)]" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="border border-red-100 bg-red-50 p-8 text-center text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && filteredPlaces.length === 0 && (
            <div className="premium-panel rounded-3xl p-12 text-center">
              <Mountain className="mx-auto mb-4 h-12 w-12 text-soft-gold" />
              <h3 className="font-serif text-3xl">No destinations found</h3>
              <p className="mt-3 text-sm text-slate-600">
                Try another search or ask us on WhatsApp.
              </p>
            </div>
          )}

          {!loading && !error && filteredPlaces.length > 0 && (
            <div className="grid gap-7 lg:grid-cols-3">
              {filteredPlaces.map((place, index) => (
                <motion.article
                  key={place.id || place._id}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.18) }}
                  className="group flex min-h-[500px] flex-col overflow-hidden bg-white shadow-[0_22px_70px_rgba(10,46,77,0.10)] ring-1 ring-midnight-ocean/8 transition hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(10,46,77,0.15)]"
                >
                  <div className="relative h-72 overflow-hidden">
                    <LazyLoadImage
                      src={getPlaceImage(place)}
                      alt={place.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      wrapperClassName="h-full w-full"
                      effect="blur"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight-ocean/82 via-midnight-ocean/16 to-transparent" />
                    <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-3">
                      <span className="bg-white/90 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-midnight-ocean backdrop-blur">
                        {place.hotelsCount || 0} stays
                      </span>
                      <span className="flex items-center gap-1 bg-midnight-ocean/84 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
                        <Star className="h-3 w-3 fill-soft-gold text-soft-gold" />
                        {place.rating || "4.5"}
                      </span>
                    </div>
                    <div className="absolute bottom-5 left-5 right-5">
                      <h3 className="font-serif text-3xl leading-tight text-white">
                        {place.name}
                      </h3>
                      <div className="mt-3 flex items-center gap-2 text-sm text-white/86">
                        <MapPin className="h-4 w-4 text-soft-gold" />
                        Curated hotel collection
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <p className="line-clamp-3 text-sm leading-7 text-slate-600">
                      {place.description ||
                        "A carefully selected stay base for scenic routes, comfortable transfers, and relaxed travel pacing."}
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-3 border-y border-midnight-ocean/8 py-4 text-xs">
                      {[
                        [Building2, `${place.hotelsCount || 0} stays`, "Options"],
                        [Shield, "Verified", "Support"],
                      ].map(([Icon, value, label]) => (
                        <div key={label}>
                          <div className="mb-1 flex items-center gap-1.5 font-bold uppercase tracking-widest text-slate-400">
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                          </div>
                          <div className="font-semibold text-midnight-ocean">{value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {["Photos", "Rates", "Availability"].map((item) => (
                        <span key={item} className="flex items-center gap-1.5 bg-ice-blue px-2.5 py-1.5 text-[11px] font-semibold text-midnight-ocean">
                          <Check className="h-3 w-3 text-soft-gold" />
                          {item}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto flex items-center gap-3 pt-6">
                      <Link
                        to={`/hotels/${place.slug || place.id}`}
                        className="premium-button flex flex-1 items-center justify-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.17em]"
                      >
                        Explore Hotels
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleWhatsAppEnquiry(place)}
                        className="flex h-11 w-11 items-center justify-center border border-midnight-ocean/12 text-midnight-ocean transition hover:border-soft-gold hover:text-soft-gold"
                        aria-label={`WhatsApp enquiry for ${place.name}`}
                      >
                        <MessageCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Hotels;
