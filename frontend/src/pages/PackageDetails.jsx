import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Download,
  MapPin,
  MessageCircle,
  Mountain,
  Phone,
  Route,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import apiService from "../services/api";
import SEO from "../components/SEO";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const fallbackImage = "/assets/hero12.jpg";
const formatPrice = (price) =>
  price ? `₹${Number(price).toLocaleString("en-IN")}` : "On request";

const normalizePackage = (pkg) => {
  const itinerary =
    Array.isArray(pkg.itinerary) && pkg.itinerary.length
      ? pkg.itinerary
      : [
          {
            day: "Day 1",
            title: "Arrival and trip briefing",
            description: "Check in, meet your coordinator, and ease into the destination.",
          },
          {
            day: "Day 2",
            title: "Scenic highlights",
            description:
              pkg.description ||
              "Explore signature viewpoints, local food stops, and handpicked experiences.",
          },
        ];
  const images = [
    ...(pkg.image ? [pkg.image] : []),
    ...(Array.isArray(pkg.images) ? pkg.images : []),
  ]
    .filter(Boolean)
    .map((image) => apiService.toAbsoluteUrl(image));

  return {
    id: pkg.id || pkg._id,
    name: pkg.name || "Curated Package",
    category: pkg.category || "mountain",
    description:
      pkg.description ||
      "A premium route planned with scenic stays, practical pacing, and personal travel support.",
    duration: pkg.duration || "Flexible",
    price: pkg.price || 0,
    route: pkg.route || "Custom mountain route",
    bestTime: pkg.bestTime || "All season",
    groupSize: pkg.groupSize || "Private / Group",
    highlights:
      Array.isArray(pkg.highlights) && pkg.highlights.length
        ? pkg.highlights
        : ["Scenic stays", "Comfortable transfers", "Travel assistance"],
    itinerary,
    inclusions:
      Array.isArray(pkg.inclusions) && pkg.inclusions.length
        ? pkg.inclusions
        : ["Accommodation support", "Meals as specified", "Transfers as per plan", "Travel coordination"],
    exclusions:
      Array.isArray(pkg.exclusions) && pkg.exclusions.length
        ? pkg.exclusions
        : ["Airfare or train fare", "Personal expenses", "Travel insurance"],
    images: images.length ? images : [fallbackImage],
  };
};

const PackageDetails = () => {
  const { slug } = useParams();
  const [pkg, setPkg] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        const response = await apiService.getPackage(slug);
        if (response.success && response.data.package) {
          setPkg(normalizePackage(response.data.package));
        } else {
          setError("Package not found");
        }
      } catch (err) {
        console.error("Error fetching package details:", err);
        setError("Failed to load package details");
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchPackage();
  }, [slug]);

  const heroImage = pkg?.images?.[activeImage] || fallbackImage;
  const facts = useMemo(
    () =>
      pkg
        ? [
            { icon: CalendarDays, label: "Duration", value: pkg.duration },
            { icon: Users, label: "Group", value: pkg.groupSize },
            { icon: Mountain, label: "Best Time", value: pkg.bestTime },
            { icon: Route, label: "Route", value: pkg.route },
          ]
        : [],
    [pkg],
  );

  const handleWhatsAppBooking = () => {
    if (!pkg) return;
    const message = `Hi! I'm interested in the "${pkg.name}" package. Price: ${formatPrice(pkg.price)} per person. Duration: ${pkg.duration}. Route: ${pkg.route}. Please share availability and booking details.`;
    window.open(
      `https://wa.me/917439857694?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const downloadItinerary = () => {
    if (!pkg) return;
    const content = [
      "Pather Khonje Itinerary",
      pkg.name,
      "",
      `Duration: ${pkg.duration}`,
      `Route: ${pkg.route}`,
      `Best Time: ${pkg.bestTime}`,
      `Group Size: ${pkg.groupSize}`,
      `Price: ${formatPrice(pkg.price)} per person`,
      "",
      "Overview",
      pkg.description,
      "",
      "Day-wise Itinerary",
      ...pkg.itinerary.flatMap((item, index) => [
        `${item.day || `Day ${index + 1}`}: ${item.title || "Curated experience"}`,
        item.description || "",
        "",
      ]),
      "Inclusions",
      ...pkg.inclusions.map((item) => `- ${item}`),
      "",
      "Exclusions",
      ...pkg.exclusions.map((item) => `- ${item}`),
      "",
      "Contact: +91 7439857694",
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${pkg.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-itinerary.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="premium-page flex min-h-screen items-center justify-center pt-24">
        <div className="premium-panel rounded-2xl px-8 py-6 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
          Loading itinerary...
        </div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="premium-page flex min-h-screen items-center justify-center pt-24">
        <div className="premium-panel rounded-2xl p-8 text-center">
          <h1 className="font-serif text-3xl text-midnight-ocean">{error || "Package not found"}</h1>
          <Link to="/packages" className="mt-5 inline-flex text-soft-gold">
            Back to packages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-page min-h-screen pb-16 pt-20 font-sans text-midnight-ocean">
      <SEO title={pkg.name} description={pkg.description} image={heroImage} />

      <section className="relative min-h-[680px] overflow-hidden">
        <LazyLoadImage
          src={heroImage}
          alt={pkg.name}
          className="absolute inset-0 h-full w-full object-cover"
          wrapperClassName="absolute inset-0 h-full w-full"
          effect="blur"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,37,35,0.92),rgba(10,46,77,0.58),rgba(10,46,77,0.1)),linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.62))]" />
        <div className="relative z-10 mx-auto flex min-h-[680px] max-w-7xl flex-col justify-end px-5 pb-12 pt-24 sm:px-8 lg:px-10">
          <Link
            to="/packages"
            className="mb-8 inline-flex w-fit items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur transition hover:bg-white/22"
          >
            <ArrowLeft className="h-4 w-4" />
            Packages
          </Link>
          <div className="max-w-4xl">
            <div className="mb-5 flex items-center gap-4">
              <div className="gold-rule" />
              <span className="section-kicker">Route dossier</span>
            </div>
            <h1 className="font-serif text-5xl leading-tight text-white sm:text-6xl lg:text-7xl">
              {pkg.name}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/88 sm:text-lg">
              {pkg.description}
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-white/12 bg-white/12 p-4 text-white backdrop-blur-xl">
                <Icon className="mb-3 h-5 w-5 text-soft-gold" />
                <div className="text-sm font-bold">{value}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/55">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_360px] lg:px-10">
        <div className="space-y-10">
          {pkg.images.length > 1 && (
            <section className="grid grid-cols-4 gap-3">
              {pkg.images.slice(0, 8).map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  onClick={() => setActiveImage(index)}
                  className={`h-24 overflow-hidden rounded-2xl border-2 transition ${
                    activeImage === index ? "border-soft-gold" : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </section>
          )}

          <section className="premium-panel rounded-[1.5rem] p-6 sm:p-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <div className="section-kicker">Day-wise trail</div>
                <h2 className="mt-2 font-serif text-4xl">Full Itinerary</h2>
              </div>
              <button
                type="button"
                onClick={downloadItinerary}
                className="hidden items-center gap-2 rounded-full border border-midnight-ocean/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] transition hover:border-soft-gold hover:text-soft-gold sm:flex"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>

            <div className="space-y-6">
              {pkg.itinerary.map((item, index) => (
                <div key={`${item.day}-${index}`} className="grid gap-5 sm:grid-cols-[86px_1fr]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-midnight-ocean text-center text-xs font-bold uppercase tracking-[0.12em] text-white">
                    {item.day || `Day ${index + 1}`}
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <h3 className="font-serif text-2xl text-midnight-ocean">
                      {item.title || "Curated experience"}
                    </h3>
                    <p className="mt-3 leading-8 text-slate-600">
                      {item.description || pkg.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="premium-panel rounded-[1.5rem] p-6 sm:p-8">
              <h2 className="mb-5 font-serif text-3xl">Included</h2>
              <div className="space-y-3">
                {pkg.inclusions.map((item) => (
                  <div key={item} className="flex gap-3 text-slate-600">
                    <Check className="mt-1 h-5 w-5 flex-none text-emerald-700" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="premium-panel rounded-[1.5rem] p-6 sm:p-8">
              <h2 className="mb-5 font-serif text-3xl">Not Included</h2>
              <div className="space-y-3">
                {pkg.exclusions.map((item) => (
                  <div key={item} className="flex gap-3 text-slate-600">
                    <X className="mt-1 h-5 w-5 flex-none text-rose-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="premium-panel rounded-[1.5rem] p-6 sm:p-8">
            <div className="section-kicker">Why travelers choose this</div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {pkg.highlights.map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl bg-white p-4">
                  <ShieldCheck className="mt-1 h-5 w-5 flex-none text-soft-gold" />
                  <span className="text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="premium-panel rounded-[1.5rem] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Starts from</div>
            <div className="mt-2 font-serif text-5xl text-midnight-ocean">{formatPrice(pkg.price)}</div>
            <div className="mt-1 text-sm text-slate-500">per person</div>
            <div className="my-6 h-px bg-slate-200" />
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-soft-gold" />{pkg.route}</div>
              <div className="flex items-center gap-3"><CalendarDays className="h-4 w-4 text-soft-gold" />{pkg.duration}</div>
              <div className="flex items-center gap-3"><Users className="h-4 w-4 text-soft-gold" />{pkg.groupSize}</div>
            </div>
            <div className="mt-7 space-y-3">
              <button
                type="button"
                onClick={handleWhatsAppBooking}
                className="premium-button flex w-full items-center justify-center gap-3 rounded-full px-6 py-4 text-xs font-bold uppercase tracking-[0.18em]"
              >
                <MessageCircle className="h-4 w-4" />
                Book on WhatsApp
              </button>
              <Link
                to="/contact"
                className="flex w-full items-center justify-center gap-3 rounded-full border border-midnight-ocean/15 px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] transition hover:border-soft-gold hover:text-soft-gold"
              >
                <Phone className="h-4 w-4" />
                Request Callback
              </Link>
              <button
                type="button"
                onClick={downloadItinerary}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-slate-100 px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-midnight-ocean transition hover:bg-slate-200"
              >
                <Download className="h-4 w-4" />
                Download Itinerary
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default PackageDetails;
