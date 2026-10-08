import React from "react";
import { Headphones, Hotel, Map, TimerReset } from "lucide-react";
import { Link } from "react-router-dom";

const assurances = [
  {
    icon: Map,
    title: "Local hill knowledge",
    text: "We understand the difference between a pretty route and a route that works with traffic, altitude, weather and family energy.",
  },
  {
    icon: TimerReset,
    title: "Paced days",
    text: "Sightseeing is balanced with breathing room, late starts where sensible and transfer days that do not feel punishing.",
  },
  {
    icon: Hotel,
    title: "Verified stays",
    text: "Properties are chosen for location, comfort, view value and practical access, not just brochure language.",
  },
  {
    icon: Headphones,
    title: "WhatsApp support",
    text: "A real planning desk stays reachable before and during the journey for updates, changes and calm coordination.",
  },
];

const WhyPatherKhonje = () => {
  return (
    <section className="relative overflow-hidden bg-[#071c23] px-5 py-20 text-white sm:px-6 lg:py-28">
      <div className="absolute inset-0 topographic-mask opacity-20" />
      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <span className="himalaya-kicker text-soft-gold">
            Why Pather Khonje
          </span>
          <h2 className="atelier-display mt-4 max-w-xl text-5xl leading-[0.95] text-white md:text-6xl">
            Premium travel is mostly what you never have to worry about.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/70">
            The visible part is the mountain. The invisible part is the
            judgement behind route order, stay location, meal breaks,
            confirmation calls and support when plans need adjusting.
          </p>
          <Link
            to="/about"
            className="mt-8 inline-flex border-b border-soft-gold pb-1 text-xs font-bold uppercase tracking-[0.18em] text-soft-gold"
          >
            Know the team
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {assurances.map((item) => (
            <article
              key={item.title}
              className="border border-white/10 bg-white/[0.055] p-6 backdrop-blur-xl"
            >
              <item.icon className="h-7 w-7 text-soft-gold" />
              <h3 className="mt-6 font-serif text-2xl text-white">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/70">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyPatherKhonje;
