import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Play, Sparkles } from "lucide-react";
import apiService from "../services/api";
import SEO from "../components/SEO";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const tabs = [
  { id: "all", label: "All" },
  { id: "destinations", label: "Places" },
  { id: "hotels", label: "Stays" },
  { id: "activities", label: "Experiences" },
  { id: "food", label: "Food" },
  { id: "videos", label: "Videos" },
];

const fallbackMedia = [
  {
    _id: "local-hero",
    title: "Mountain Sunrise",
    description: "Layered hills, tea slopes and mist-lit roads.",
    category: "destinations",
    mediaType: "image",
    image: { url: "/assets/home-mountain-premium.png" },
  },
  {
    _id: "local-cloud",
    title: "Cloud Forest Trail",
    description: "Waterfalls, rain-washed leaves and quiet walking routes.",
    category: "activities",
    mediaType: "image",
    image: { url: "/assets/home-cloud-forest.png" },
  },
  {
    _id: "local-resort",
    title: "Hill Resort Views",
    description: "Boutique stays with flowers, ridges and balcony mornings.",
    category: "hotels",
    mediaType: "image",
    image: { url: "/assets/home-hill-resort.png" },
  },
  {
    _id: "local-road",
    title: "Prayer Flag Roads",
    description: "Colorful mountain roads shaped for unhurried journeys.",
    category: "destinations",
    mediaType: "image",
    image: { url: "/assets/home-monastery-road.png" },
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const getMediaUrl = (item) => {
  const image = item?.image;
  const url = typeof image === "string" ? image : image?.url || image?.secure_url;
  return apiService.toAbsoluteUrl(url) || "/assets/home-mountain-premium.png";
};

const getMediaType = (item) => {
  if (item?.mediaType) return item.mediaType;
  const url = getMediaUrl(item).toLowerCase();
  return /\.(mp4|mov|webm|m4v)(\?|$)/.test(url) ? "video" : "image";
};

function Gallery() {
  const [activeTab, setActiveTab] = useState("all");
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [galleryResponse, placesResponse] = await Promise.all([
          apiService.getGalleryImages(activeTab),
          apiService.getPlaces(),
        ]);

        const galleryItems = galleryResponse.success
          ? galleryResponse.data.galleries || []
          : [];
        const placesData = placesResponse.success
          ? placesResponse.data.places || []
          : [];

        const placeCards =
          activeTab === "all" || activeTab === "destinations"
            ? placesData.slice(0, 8).map((place) => ({
                _id: `place-${place.id || place._id}`,
                title: place.name,
                description: "Hotel destination",
                category: "destinations",
                mediaType: "image",
                image: {
                  url:
                    place.image ||
                    place.images?.[0]?.url ||
                    place.images?.[0],
                },
              }))
            : [];

        const localItems = fallbackMedia.filter(
          (item) => activeTab === "all" || item.category === activeTab,
        );

        setMedia([...galleryItems, ...placeCards, ...localItems]);
      } catch (error) {
        console.error("Failed to fetch gallery data", error);
        setMedia(fallbackMedia);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#f6fbfa] text-[#071c23]">
      <SEO
        title="Travel Gallery"
        description="Explore Pather Khonje travel moments, premium stays, routes, food and videos."
        keywords="Pather Khonje gallery, travel photos, travel videos, premium hill trips, hotel gallery"
      />

      <section className="relative min-h-[78vh] overflow-hidden bg-[#071c23] px-5 pt-36 text-white sm:px-6 lg:px-12">
        <img
          src="/assets/home-mountain-premium.png"
          alt="Premium mountain gallery"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,20,25,0.96),rgba(5,20,25,0.70)_45%,rgba(5,20,25,0.24)),linear-gradient(180deg,rgba(5,20,25,0.18),rgba(5,20,25,0.82))]" />
        <div className="absolute inset-0 topographic-mask opacity-35" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 pb-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="max-w-3xl"
          >
            <span className="himalaya-kicker text-soft-gold">
              Photo and video journal
            </span>
            <h1 className="atelier-display mt-5 text-6xl leading-[0.92] text-white md:text-8xl">
              Gallery with more color, more movement.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/86">
              A modern visual board for uploaded photos, videos, hotel moments
              and route memories from the journeys Pather Khonje curates.
            </p>
          </motion.div>

        </div>
      </section>

      <section className="px-5 py-14 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-full border px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] transition ${
                  activeTab === tab.id
                    ? "border-[#071c23] bg-[#071c23] text-white shadow-[0_14px_34px_rgba(7,28,35,0.18)]"
                    : "border-[#071c23]/10 bg-white text-slate-600 hover:border-soft-gold hover:text-[#071c23]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-soft-gold" />
            </div>
          ) : (
            <motion.div layout className="grid auto-rows-[240px] grid-cols-1 gap-5 md:grid-cols-3 lg:auto-rows-[260px]">
              <AnimatePresence mode="popLayout">
                {media.map((item, index) => {
                  const mediaType = getMediaType(item);
                  const isLarge = index % 7 === 0 || index % 7 === 4;
                  return (
                    <motion.article
                      key={item._id || `${item.title}-${index}`}
                      layout
                      initial={{ opacity: 0, y: 22 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.45 }}
                      className={`group relative overflow-hidden bg-[#071c23] shadow-[0_24px_70px_rgba(7,28,35,0.12)] ${
                        isLarge ? "md:col-span-2 md:row-span-2" : ""
                      }`}
                    >
                      {mediaType === "video" ? (
                        <video
                          src={getMediaUrl(item)}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          muted
                          loop
                          playsInline
                          controls
                        />
                      ) : (
                        <LazyLoadImage
                          src={getMediaUrl(item)}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          wrapperClassName="h-full w-full"
                          effect="blur"
                        />
                      )}
                      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(7,28,35,0.02),rgba(7,28,35,0.30)_42%,rgba(7,28,35,0.94))]" />
                      {mediaType === "video" && (
                        <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/92 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#071c23]">
                          <Play className="h-3 w-3" />
                          Video
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <div className="border border-white/12 bg-[#071c23]/72 p-5 text-white backdrop-blur-md">
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-soft-gold">
                            <Sparkles className="h-3.5 w-3.5" />
                            {tabs.find((tab) => tab.id === item.category)?.label || "Journey"}
                          </div>
                          <h2 className="mt-3 font-serif text-2xl leading-tight md:text-3xl">
                            {item.title}
                          </h2>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/84">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {!loading && media.length === 0 && (
            <div className="bg-white p-12 text-center shadow-[0_20px_60px_rgba(7,28,35,0.08)]">
              <p className="text-slate-500">No gallery media found in this category.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Gallery;
