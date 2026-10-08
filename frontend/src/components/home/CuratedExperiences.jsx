import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const experiences = [
  {
    title: "Tea ridge mornings",
    eyebrow: "Soft mornings",
    description:
      "A refined hill escape through tea gardens, viewpoints, heritage corners and stays that keep Mall Road within easy reach.",
    image: "/assets/home-mountain-premium.png",
    link: "/hotels/darjeeling",
  },
  {
    title: "Monastery road circuit",
    eyebrow: "Sacred roads",
    description:
      "Monastery stops, alpine lake days and clean transfers paced around weather-aware routing.",
    image: "/assets/home-monastery-road.png",
    link: "/packages",
  },
  {
    title: "Cloud forest trails",
    eyebrow: "Rain-lit greens",
    description:
      "Waterfalls, root bridges, scenic pauses and comfortable family stays planned without rushing.",
    image: "/assets/home-cloud-forest.png",
    link: "/packages",
  },
  {
    title: "Custom family hill trip",
    eyebrow: "Made to measure",
    description:
      "A personal route board for seniors, children, food preferences, hotel comfort and the exact number of slow mornings you need.",
    image: "/assets/home-hill-resort.png",
    link: "/contact",
  },
  {
    title: "Boutique stay circuit",
    eyebrow: "View-led stays",
    description:
      "Premium hill stays matched with route logic, room comfort, food preferences and easy access to key viewpoints.",
    image: "/assets/home-boutique-homestay.png",
    link: "/hotels",
  },
];

const CuratedExperiences = () => {
  return (
    <section className="bg-[#edf6f8] px-5 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <span className="himalaya-kicker text-[#0b4a42]">
              Signature routes
            </span>
            <h2 className="atelier-display mt-4 text-5xl leading-[0.96] text-[#071c23] md:text-6xl">
              The hill collection, edited for real travellers.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-slate-600 lg:ml-auto">
            Instead of generic packages, each route starts with the day rhythm:
            when to drive, where to pause, which stay makes sense and what to
            leave unhurried.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-4">
          {experiences.map((experience, index) => (
            <motion.article
              key={experience.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.05, duration: 0.6 }}
              className={`experience-tile group ${
                index === 0 ? "lg:col-span-2 lg:row-span-2" : ""
              }`}
            >
              <img
                src={experience.image}
                alt={experience.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,23,25,0.10),rgba(6,23,25,0.25)_34%,rgba(6,23,25,0.94)_100%)]" />
              <div className="relative z-10 flex min-h-[360px] flex-col justify-end p-6 sm:p-7">
                <div className="border border-white/12 bg-[#061719]/72 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.32)] backdrop-blur-md">
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-soft-gold">
                    {experience.eyebrow}
                  </span>
                  <h3 className="mt-3 font-serif text-3xl leading-tight text-white">
                    {experience.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/90">
                    {experience.description}
                  </p>
                  <Link
                    to={experience.link}
                    className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white"
                  >
                    View route{" "}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CuratedExperiences;
