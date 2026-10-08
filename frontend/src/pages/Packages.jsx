import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  MessageCircle,
  Route,
  Search,
  Users,
} from "lucide-react";
import apiService from "../services/api";
import SEO from "../components/SEO";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const categories = [
  { id: "all", name: "All Packages" },
  { id: "mountain", name: "Mountain" },
  { id: "hill stations", name: "Hill Stations" },
  { id: "beach", name: "Beach" },
  { id: "heritage", name: "Heritage" },
  { id: "family", name: "Family" },
  { id: "custom", name: "Custom" },
];

const fallbackImage = "/assets/hero13.jpg";

const formatPrice = (price) =>
  Number.isFinite(Number(price))
    ? `₹${Number(price).toLocaleString("en-IN")}`
    : "On request";

const normalizeArray = (value, fallback = []) =>
  Array.isArray(value) && value.length > 0 ? value.filter(Boolean) : fallback;

const Packages = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiService.listPackages();
        if (response.success) {
          setPackages(response.data.packages || []);
        } else {
          setError("We could not load packages right now.");
        }
      } catch (err) {
        console.error("Error fetching packages:", err);
        setError("We could not load packages right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const mappedPackages = useMemo(
    () =>
      packages.map((pkg) => ({
        id: pkg.id || pkg._id,
        slug: pkg.slug || pkg.id || pkg._id,
        name: pkg.name || "Curated Journey",
        category: (pkg.category || "general").toLowerCase(),
        description:
          pkg.description ||
          "A thoughtfully planned journey with stays, transfers, and local support arranged by Pather Khonje.",
        duration: pkg.duration || "Flexible",
        price: formatPrice(pkg.price),
        bestTime: pkg.bestTime || "All year",
        groupSize: pkg.groupSize || "Flexible",
        route: pkg.route || "Custom route",
        image: apiService.toAbsoluteUrl(pkg.image) || fallbackImage,
        itinerary: normalizeArray(pkg.itinerary).slice(0, 3),
        inclusions: normalizeArray(
          pkg.inclusions,
          normalizeArray(pkg.highlights, [
            "Stay planning",
            "Local transfers",
            "Trip support",
          ]),
        ).slice(0, 4),
        highlights: normalizeArray(pkg.highlights, [
          "Comfort stays",
          "Curated sightseeing",
          "Local guidance",
        ]).slice(0, 3),
      })),
    [packages],
  );

  const filteredPackages = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return mappedPackages.filter((pkg) => {
      const matchesCategory =
        activeCategory === "all" || pkg.category === activeCategory;
      const matchesSearch =
        !term ||
        [pkg.name, pkg.category, pkg.description, pkg.route].some((value) =>
          String(value).toLowerCase().includes(term),
        );
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, mappedPackages, searchTerm]);

  const handleWhatsAppBooking = (pkg) => {
    const message = `Hi! I'm interested in booking the "${pkg.name}" package. Duration: ${pkg.duration}. Price: ${pkg.price} per person. Please share availability and details.`;
    window.open(
      `https://wa.me/917439857694?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="premium-page min-h-screen font-sans text-midnight-ocean">
      <SEO
        title="Premium Holiday Packages"
        description="Explore curated mountain, hill-station, family, beach, heritage, and custom tour packages across India."
        keywords="holiday packages India, Sikkim package, Darjeeling tour, mountain packages, custom travel packages"
      />

      <section className="relative min-h-[78vh] overflow-hidden bg-midnight-ocean">
        <LazyLoadImage
          src={fallbackImage}
          alt="Mountain valley journey"
          className="absolute inset-0 h-full w-full object-cover"
          effect="blur"
          wrapperClassName="absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,46,77,0.92),rgba(10,46,77,0.62)_44%,rgba(10,46,77,0.20)),linear-gradient(180deg,rgba(10,46,77,0.10),rgba(10,46,77,0.66))]" />
        <div className="absolute inset-0 opacity-[0.13] bg-[radial-gradient(circle_at_18%_22%,#C6A75E_0_1px,transparent_1px),radial-gradient(circle_at_72%_58%,#ffffff_0_1px,transparent_1px)] bg-[length:42px_42px]" />

        <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-6 pb-12 pt-32 md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <div className="mb-5 flex items-center gap-4">
              <div className="gold-rule" />
              <span className="section-kicker">Curated route dossiers</span>
            </div>
            <h1 className="max-w-4xl text-5xl leading-[1.02] text-white md:text-7xl lg:text-8xl font-serif">
              Packages for the hills, coasts, and quiet roads between.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/84 md:text-xl">
              Compare practical, beautiful journeys with route notes, day-wise
              previews, stays, and quick WhatsApp booking.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-3 border border-white/14 bg-white/10 p-3 backdrop-blur-md md:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search route, destination, or travel style"
                className="h-14 w-full bg-white/12 pl-12 pr-4 text-sm font-medium text-white placeholder:text-white/62 outline-none ring-1 ring-white/10 transition focus:ring-soft-gold"
              />
            </label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`h-14 shrink-0 px-4 text-[11px] font-bold uppercase tracking-[0.18em] transition ${
                    activeCategory === cat.id
                      ? "bg-soft-gold text-midnight-ocean"
                      : "bg-white/10 text-white hover:bg-white/18"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="section-kicker">Available journeys</span>
              <h2 className="mt-3 text-4xl font-serif md:text-5xl">
                Choose your next route
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-slate-600">
              Each package keeps the essentials visible: price, pace, route,
              inclusions, and a day-wise preview before you open the full
              dossier.
            </p>
          </div>

          {loading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-[520px] animate-pulse bg-white shadow-[0_20px_60px_rgba(10,46,77,0.08)]"
                />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="border border-red-100 bg-red-50 p-8 text-center text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && filteredPackages.length === 0 && (
            <div className="border border-midnight-ocean/10 bg-white p-12 text-center shadow-[0_20px_60px_rgba(10,46,77,0.06)]">
              <Route className="mx-auto mb-4 h-12 w-12 text-soft-gold" />
              <h3 className="text-2xl font-serif">No matching packages</h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
                Try another category or search term. The team can also tailor a
                route from scratch.
              </p>
            </div>
          )}

          {!loading && !error && filteredPackages.length > 0 && (
            <div className="grid gap-7 lg:grid-cols-3">
              {filteredPackages.map((pkg, index) => (
                <motion.article
                  key={pkg.id}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 0.45,
                    delay: Math.min(index * 0.05, 0.2),
                  }}
                  className="group flex min-h-[560px] flex-col overflow-hidden bg-white shadow-[0_22px_70px_rgba(10,46,77,0.10)] ring-1 ring-midnight-ocean/8 transition hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(10,46,77,0.15)]"
                >
                  <div className="relative h-72 overflow-hidden">
                    <LazyLoadImage
                      src={pkg.image}
                      alt={pkg.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      effect="blur"
                      wrapperClassName="h-full w-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight-ocean/78 via-midnight-ocean/16 to-transparent" />
                    <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-3">
                      <span className="bg-white/90 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-midnight-ocean backdrop-blur">
                        {pkg.category}
                      </span>
                      <span className="bg-midnight-ocean/84 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
                        {pkg.price}
                      </span>
                    </div>
                    <div className="absolute bottom-5 left-5 right-5">
                      <h3 className="text-3xl font-serif leading-tight text-white">
                        {pkg.name}
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-white/88">
                        <span className="flex items-center gap-1 bg-white/14 px-2.5 py-1 backdrop-blur">
                          <Clock className="h-3.5 w-3.5 text-soft-gold" />
                          {pkg.duration}
                        </span>
                        <span className="flex items-center gap-1 bg-white/14 px-2.5 py-1 backdrop-blur">
                          <Users className="h-3.5 w-3.5 text-soft-gold" />
                          {pkg.groupSize}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <p className="line-clamp-3 text-sm leading-7 text-slate-600">
                      {pkg.description}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3 border-y border-midnight-ocean/8 py-4 text-xs">
                      <div>
                        <div className="mb-1 flex items-center gap-1.5 font-bold uppercase tracking-widest text-slate-400">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Best time
                        </div>
                        <div className="font-semibold text-midnight-ocean">
                          {pkg.bestTime}
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center gap-1.5 font-bold uppercase tracking-widest text-slate-400">
                          <MapPin className="h-3.5 w-3.5" />
                          Route
                        </div>
                        <div className="font-semibold text-midnight-ocean line-clamp-1">
                          {pkg.route}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {(pkg.itinerary.length > 0 ? pkg.itinerary : pkg.highlights)
                        .slice(0, 3)
                        .map((item, itemIndex) => (
                          <div
                            key={`${pkg.id}-preview-${itemIndex}`}
                            className="flex gap-3 text-sm"
                          >
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-soft-gold" />
                            <span className="line-clamp-2 text-slate-600">
                              {typeof item === "string"
                                ? item
                                : `${item.day || `Day ${itemIndex + 1}`}: ${
                                    item.title || item.description
                                  }`}
                            </span>
                          </div>
                        ))}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {pkg.inclusions.slice(0, 3).map((item) => (
                        <span
                          key={item}
                          className="flex items-center gap-1.5 bg-ice-blue px-2.5 py-1.5 text-[11px] font-semibold text-midnight-ocean"
                        >
                          <Check className="h-3 w-3 text-soft-gold" />
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center gap-3 pt-6">
                      <button
                        type="button"
                        onClick={() => handleWhatsAppBooking(pkg)}
                        className="premium-button flex flex-1 items-center justify-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.17em]"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Book Now
                      </button>
                      <Link
                        to={`/package/${encodeURIComponent(String(pkg.slug))}`}
                        className="flex h-11 w-11 items-center justify-center border border-midnight-ocean/12 text-midnight-ocean transition hover:border-soft-gold hover:text-soft-gold"
                        aria-label={`View details for ${pkg.name}`}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden bg-midnight-ocean px-6 py-20 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(198,167,94,0.18),transparent_34%,rgba(243,248,252,0.08))]" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <span className="section-kicker">Custom route planning</span>
            <h2 className="mt-4 text-4xl font-serif md:text-5xl">
              Need a journey built around your dates?
            </h2>
            <p className="mt-5 text-base leading-8 text-white/72">
              Share your preferred pace, budget, companions, and must-see
              places. We will shape a route that feels personal without making
              you handle the logistics.
            </p>
          </div>
          <Link
            to="/contact"
            className="bg-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-midnight-ocean transition hover:bg-ice-blue"
          >
            Request Custom Quote
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Packages;
