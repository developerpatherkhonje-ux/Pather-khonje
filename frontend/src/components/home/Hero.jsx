import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative w-full min-h-[90vh] flex flex-col lg:flex-row overflow-hidden bg-[#FFFFFF]">
      {/* Left Content Panel */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center relative z-10 order-2 lg:order-1 bg-white">
        <div className="px-6 md:px-12 lg:px-24 xl:px-32 py-16 lg:py-0">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15, delayChildren: 0.2 },
              },
            }}
            className="flex flex-col gap-8 max-w-xl"
          >
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 0.8, ease: "easeOut" },
                },
              }}
              className="font-serif text-4xl md:text-5xl lg:text-6xl text-midnight-ocean leading-[1.1]"
            >
              Journeys designed with care, comfort, and clarity.
            </motion.h1>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              className="font-sans text-slate-gray text-base leading-relaxed max-w-sm"
            >
              A Kolkata-based boutique travel company curating thoughtful
              journeys across India since{" "}
              <span className="text-soft-gold font-medium">2015</span>.
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 0.6 } },
              }}
              className="flex items-center gap-8 mt-4"
            >
              <button className="px-10 py-5 bg-midnight-ocean text-white font-sans font-bold text-xs tracking-widest uppercase hover:bg-deep-steel-blue transition-colors duration-200 shadow-sm">
                Plan Your Journey
              </button>

              <a
                href="/website/packages"
                className="group flex items-center gap-2 text-midnight-ocean font-sans font-medium text-sm tracking-wide hover:text-horizon-blue transition-colors duration-200"
              >
                View Destinations{" "}
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200"
                />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right Image Panel */}
      <div className="w-full lg:w-[55%] h-[40vh] lg:h-auto relative order-1 lg:order-2 overflow-hidden">
        <motion.div
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop"
            alt="Scenic Travel Journey"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
