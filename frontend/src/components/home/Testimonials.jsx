import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const testimonials = [
  {
    name: "Aditi & Rahul Sharma",
    role: "Family hill trip",
    quote:
      "The route never felt rushed. Hotels were exactly as discussed, the car was reliable and every morning had the right amount of breathing room.",
  },
  {
    name: "Madhumita Sen",
    role: "Custom mountain itinerary",
    quote:
      "They changed the order of our days because of weather and it saved the trip. That local judgement is what made Pather Khonje feel premium.",
  },
  {
    name: "Arindam Basu",
    role: "Cloud trail with parents",
    quote:
      "We wanted waterfalls and views without exhausting our parents. The pacing, stay choices and WhatsApp support were all excellent.",
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5600);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-[#edf6f8] px-5 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="relative min-h-[460px] overflow-hidden shadow-[0_28px_90px_rgba(7,28,35,0.12)]">
          <img
            src="/assets/home-cloud-forest.png"
            alt="Guest travel memory"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,28,35,0.02),rgba(7,28,35,0.22)_36%,rgba(7,28,35,0.88))]" />
          <div className="absolute bottom-6 left-6 right-6 border border-white/12 bg-[#071c23]/72 p-5 text-white backdrop-blur-md">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-soft-gold">
              Real trip notes
            </span>
            <p className="mt-3 text-sm leading-7 text-white/84">
              Families choose Pather Khonje for comfortable pacing, clear
              hotels, reliable cars and human support during the journey.
            </p>
          </div>
        </div>

        <div>
          <span className="himalaya-kicker text-[#0b4a42]">Guest notes</span>
          <h2 className="atelier-display mt-4 text-5xl leading-[0.96] text-[#071c23] md:text-6xl">
            Trips remembered for calm, not chaos.
          </h2>

          <div className="mt-8 border-l-4 border-soft-gold bg-white p-7 shadow-[0_28px_80px_rgba(7,28,35,0.08)] sm:p-10">
            <div className="min-h-[250px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45 }}
                >
                  <p className="atelier-display text-4xl leading-tight text-[#071c23] md:text-5xl">
                    "{testimonials[currentIndex].quote}"
                  </p>
                  <cite className="mt-8 block not-italic">
                    <span className="block text-xs font-bold uppercase tracking-[0.18em] text-[#071c23]">
                      {testimonials[currentIndex].name}
                    </span>
                    <span className="mt-2 block text-sm text-slate-500">
                      {testimonials[currentIndex].role}
                    </span>
                  </cite>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-8 flex gap-2">
              {testimonials.map((item, idx) => (
                <button
                  key={item.name}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 transition-all ${
                    idx === currentIndex
                      ? "w-10 bg-[#0b4a42]"
                      : "w-2.5 bg-[#0b4a42]/20 hover:bg-[#0b4a42]/45"
                  }`}
                  aria-label={`Show testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
