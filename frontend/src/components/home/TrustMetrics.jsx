import React, { useEffect, useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle2, MapPinned } from "lucide-react";
import { Link } from "react-router-dom";

const AnimatedNumber = ({ value }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { duration: 1800 });
  const display = useTransform(spring, (current) => Math.floor(current));

  useEffect(() => {
    if (inView) {
      const numeric = parseInt(value.toString().replace(/\D/g, ""), 10);
      if (!Number.isNaN(numeric)) spring.set(numeric);
    }
  }, [inView, spring, value]);

  return <motion.span ref={ref}>{display}</motion.span>;
};

const metrics = [
  { value: "2000+", label: "travellers planned for" },
  { value: "10+", label: "years of route knowledge" },
  { value: "50+", label: "stays and hill partners" },
  { value: "4.9", label: "average guest rating", rating: true },
];

const TrustMetrics = () => {
  return (
    <section className="relative overflow-hidden bg-[#f6fbfa] px-5 py-16 text-[#071c23] sm:px-6 lg:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(198,167,94,0.20),transparent_28%),radial-gradient(circle_at_90%_74%,rgba(43,126,116,0.14),transparent_32%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden shadow-[0_28px_90px_rgba(7,28,35,0.14)]"
        >
          <img
            src="/assets/home-hill-resort.png"
            alt="Premium hill stay and route planning"
            className="h-[520px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,28,35,0.02),rgba(7,28,35,0.18)_40%,rgba(7,28,35,0.86))]" />
          <div className="absolute bottom-6 left-6 right-6 border border-white/14 bg-[#071c23]/72 p-5 text-white backdrop-blur-md">
            <div className="flex items-center gap-3">
              <MapPinned className="h-5 w-5 text-soft-gold" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-soft-gold">
                Route clarity
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/84">
              Hotels, cars, sightseeing and timing are planned together, so the
              trip feels smooth instead of patched together.
            </p>
          </div>
        </motion.div>

        <div>
          <span className="himalaya-kicker text-[#0b4a42]">
            Why travellers trust us
          </span>
          <h2 className="atelier-display mt-4 max-w-2xl text-5xl leading-[0.95] text-[#071c23] md:text-6xl">
            Beautiful trips need strong planning underneath.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
            From first call to final return, the team keeps the itinerary,
            hotels, transport and support aligned with your comfort.
          </p>

          <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric, index) => {
              const numericValue = metric.value.toString().replace(/\D/g, "");
              const suffix = metric.value.toString().replace(/[0-9.]/g, "");

              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06, duration: 0.45 }}
                  className="border border-[#071c23]/10 bg-white p-5 shadow-[0_18px_55px_rgba(7,28,35,0.07)]"
                >
                  <div className="atelier-display flex items-baseline gap-1 text-4xl leading-none text-[#0b4a42]">
                    {metric.rating ? (
                      <span>{metric.value}</span>
                    ) : (
                      <>
                        <AnimatedNumber value={numericValue} />
                        <span>{suffix}</span>
                      </>
                    )}
                  </div>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    {metric.label}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {["Transparent planning", "Fast WhatsApp support"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-semibold text-[#071c23]">
                <CheckCircle2 className="h-5 w-5 text-soft-gold" />
                {item}
              </div>
            ))}
          </div>

          <Link
            to="/contact"
            className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#071c23] px-7 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-[0_18px_44px_rgba(7,28,35,0.20)] transition hover:bg-[#0b4a42]"
          >
            Plan with us
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrustMetrics;
