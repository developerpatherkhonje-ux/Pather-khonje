import React from "react";
import { motion } from "framer-motion";

import { useSpring, useTransform, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

const AnimatedNumber = ({ value }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { duration: 2000 });
  const display = useTransform(spring, (current) => Math.floor(current));

  useEffect(() => {
    if (inView) {
      // Parse number from string (e.g. "2000+" -> 2000)
      const numeric = parseInt(value.toString().replace(/\D/g, ""));
      if (!isNaN(numeric)) {
        spring.set(numeric);
      }
    }
  }, [inView, value, spring]);

  return <motion.span ref={ref}>{display}</motion.span>;
};

const MetricItem = ({ value, label, isRating }) => {
  const numericValue = value.toString().replace(/\D/g, "");
  const suffix = value.toString().replace(/[0-9.]/g, "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="flex items-baseline gap-1">
        <div
          className={`font-serif text-4xl lg:text-5xl flex ${
            isRating ? "text-soft-gold" : "text-midnight-ocean"
          }`}
        >
          {isRating ? (
            <span>{value}</span>
          ) : (
            <>
              <AnimatedNumber value={numericValue} />
              <span>{suffix}</span>
            </>
          )}
        </div>
        {isRating && <span className="text-soft-gold text-2xl">★</span>}
      </div>
      <span className="font-sans text-[10px] lg:text-xs font-bold text-slate-gray uppercase tracking-[0.2em] text-center">
        {label}
      </span>
    </motion.div>
  );
};

const TrustMetrics = () => {
  return (
    <section className="bg-white py-14 border border-gray-200/60">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-4 lg:gap-24 items-center max-w-6xl mx-auto px-4 lg:px-0">
          <div className="flex mx-auto py-4">
            <MetricItem value="2000+" label="Happy Travelers" />
          </div>

          <div className="flex mx-auto py-4">
            <MetricItem value="10+" label="Years Experience" />
          </div>

          <div className="flex mx-auto py-4">
            <MetricItem value="50+" label="Unique Destinations" />
          </div>

          <div className="flex mx-auto py-4">
            <MetricItem value="4.9" label="Average Rating" isRating={true} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustMetrics;
