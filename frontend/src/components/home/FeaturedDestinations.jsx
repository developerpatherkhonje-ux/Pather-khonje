import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const destinations = [
  {
    name: "Tea Garden Hills",
    label: "Soft views, heritage corners, sunrise roads",
    path: "/hotels/darjeeling",
    image: "/assets/home-mountain-premium.png",
  },
  {
    name: "Alpine Valleys",
    label: "Monasteries, lakes, mountain roads",
    path: "/hotels/sikkim",
    image: "/assets/home-monastery-road.png",
  },
  {
    name: "Cloud Forests",
    label: "Waterfalls, bridges, rain-lit greens",
    path: "/packages",
    image: "/assets/home-cloud-forest.png",
  },
  {
    name: "Quiet Hill Towns",
    label: "Slow roads, viewpoints, boutique stays",
    path: "/packages",
    image: "/assets/home-hill-resort.png",
  },
  {
    name: "Forest Retreats",
    label: "Forests, rivers, quiet resorts",
    path: "/packages",
    image: "/assets/home-cloud-forest.png",
  },
  {
    name: "River Hideaways",
    label: "Turquoise rivers, bridges, forest stays",
    path: "/packages",
    image: "/assets/home-river-retreat.png",
  },
  {
    name: "Flower Valley Trails",
    label: "Blooming meadows, open skies, ridge walks",
    path: "/packages",
    image: "/assets/home-flower-valley.png",
  },
  {
    name: "Boutique Homestays",
    label: "Warm lights, village lanes, slow evenings",
    path: "/hotels",
    image: "/assets/home-boutique-homestay.png",
  },
];

const FeaturedDestinations = () => {
  return (
    <section className="bg-white px-5 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="himalaya-kicker text-[#0b4a42]">
              Destinations
            </span>
            <h2 className="atelier-display mt-4 max-w-3xl text-5xl leading-[0.96] text-[#071c23] md:text-6xl">
              Familiar names, planned with sharper local judgement.
            </h2>
          </div>
          <Link
            to="/hotels"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0b4a42]"
          >
            Browse hotels <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {destinations.map((destination, index) => (
            <motion.div
              key={destination.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.48 }}
              className={index < 2 ? "lg:col-span-2" : ""}
            >
              <Link
                to={destination.path}
              className="destination-card group block"
            >
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,28,35,0.06),rgba(7,28,35,0.28)_38%,rgba(7,28,35,0.94)_100%)]" />
                <div className="relative z-10 flex h-full min-h-[330px] flex-col justify-end p-6">
                  <div className="border border-white/12 bg-[#071c23]/72 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.32)] backdrop-blur-md">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-soft-gold">
                      {destination.label}
                    </p>
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <h3 className="font-serif text-3xl leading-tight text-white">
                        {destination.name}
                      </h3>
                      <ArrowRight className="h-5 w-5 shrink-0 text-white transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinations;
