import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    name: "Aditi & Rahul Sharma",
    role: "Traveled September 2024",
    quote:
      "This was the most seamless trip I’ve ever had. Everything was perfectly organized, and I could just enjoy the experience without worrying about the details!",
  },
  {
    name: "Rahul Mehta",
    role: "Adventure Enthusiast",
    quote:
      "The team made my dream trekking adventure come true. From safety to local insights, every step of the journey was handled with care.",
  },
  {
    name: "Sophia Lee",
    role: "Family Vacationer",
    quote:
      "Planning a family trip usually feels stressful, but this time it was a breeze. My kids loved every moment, and we created memories for a lifetime.",
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 bg-ice-blue">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <div className="font-serif text-6xl text-soft-gold opacity-60 mb-8">
          “
        </div>

        <div className="min-h-[200px] flex flex-col justify-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <blockquote className="font-serif text-3xl md:text-4xl text-midnight-ocean leading-tight mb-10">
                {testimonials[currentIndex].quote}
              </blockquote>

              <cite className="not-italic flex flex-col items-center gap-1">
                <span className="font-sans font-bold text-sm text-near-black uppercase tracking-widest">
                  {testimonials[currentIndex].name}
                </span>
                <span className="font-sans text-xs text-slate-gray">
                  {testimonials[currentIndex].role}
                </span>
              </cite>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "bg-midnight-ocean w-4"
                  : "bg-midnight-ocean/20 hover:bg-midnight-ocean/40"
              }`}
              aria-label={`Go to testimonial ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
