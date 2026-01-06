import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, Map, Compass, Users } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const imageScale = {
  hidden: { scale: 1.05, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 1.2, ease: "easeOut" },
  },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

// --- DATA ---
const timelineData = [
  {
    year: "2015",
    title: "The Beginning",
    desc: "Started as a small passion project in Kolkata.",
  },
  {
    year: "2018",
    title: "Expanding Horizons",
    desc: "Launched our first international packages.",
  },
  {
    year: "2021",
    title: "Digital Transformation",
    desc: "Introduced seamless online booking experiences.",
  },
  {
    year: "Today",
    title: "Global Presence",
    desc: "Serving travelers across 50+ destinations worldwide.",
  },
];

const teamData = [
  {
    name: "Vikram Das",
    role: "Founder & CEO",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop",
  },
  {
    name: "Soma Shah",
    role: "Head of Operations",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop",
  },
  {
    name: "Arjun Ray",
    role: "Senior Travel Guide",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop",
  },
  {
    name: "Priya Roy",
    role: "Experience Curator",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop",
  },
];

const About = () => {
  return (
    <div className="bg-white overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative w-full h-[70vh] overflow-hidden">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={imageScale}
          className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop"
            alt="Travel Landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </motion.div>

        <div className="absolute inset-0 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-center"
          >
            <h1 className="font-serif text-5xl md:text-7xl text-white mb-4">
              About Pather Khonje
            </h1>
            <p className="font-sans text-white/90 text-lg md:text-xl max-w-2xl mx-auto tracking-wide">
              Curating journeys that inspire, connect, and transform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. ORIGIN STORY */}
      <section className="py-24 px-6 md:px-12 lg:px-24">
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInLeft}
            className="w-full lg:w-1/2"
          >
            <span className="flex items-center gap-2 font-sans text-xs font-bold text-soft-gold uppercase tracking-[0.2em] mb-4">
              <Compass className="h-4 w-4" /> Origin Story
            </span>
            <h2 className="font-serif text-4xl lg:text-5xl text-midnight-ocean leading-tight mb-6">
              Rooted in Kolkata, <br /> inspired by the journey.
            </h2>
            <p className="font-sans text-slate-gray leading-relaxed mb-6">
              Founded in 2015, Pather Khonje wasn't just built on business
              plans, but on travel diaries. Our founder, clutching a worn-out
              map and a backpack full of dreams, realized that the best stories
              are found on the road less traveled.
            </p>
            <p className="font-sans text-slate-gray leading-relaxed">
              From the bustling streets of Kolkata to the serene Himalayas, we
              realized that travel isn't just about sightseeing—it's about the
              soul-stirring feeling of discovery.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInRight}
            className="w-full lg:w-1/2 h-[450px] overflow-hidden rounded-2xl shadow-2xl relative"
          >
            <img
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2073&auto=format&fit=crop"
              alt="Planning the Journey"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <p className="text-white font-serif italic text-lg">
                "Every great journey begins with a map."
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. TIMELINE */}
      <section className="py-20 bg-ice-blue/30">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {timelineData.map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="relative pl-6 border-l-2 border-soft-gold/30"
              >
                <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-soft-gold border-4 border-white"></span>
                <h3 className="font-serif text-3xl text-midnight-ocean mb-2">
                  {item.year}
                </h3>
                <h4 className="font-sans font-bold text-sm text-midnight-ocean uppercase tracking-wider mb-2">
                  {item.title}
                </h4>
                <p className="font-sans text-slate-gray text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. PHILOSOPHY */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-white">
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInLeft}
            className="w-full lg:w-1/2 h-[500px] overflow-hidden rounded-2xl shadow-2xl order-2 lg:order-1 relative group"
          >
            <img
              src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop"
              alt="Group Travel Philosophy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </motion.div>

          {/* Text Right */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInRight}
            className="w-full lg:w-1/2 order-1 lg:order-2"
          >
            <span className="flex items-center gap-2 font-sans text-xs font-bold text-soft-gold uppercase tracking-[0.2em] mb-4">
              <Map className="h-4 w-4" /> Philosophy
            </span>
            <h2 className="font-serif text-4xl lg:text-5xl text-midnight-ocean leading-tight mb-10">
              Not just tourists,
              <br /> but travelers.
            </h2>

            <div className="space-y-8">
              <motion.div
                whileHover={{ x: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="font-serif text-xl text-midnight-ocean mb-2 flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-soft-gold"></span> Immersion
                </h3>
                <p className="font-sans text-slate-gray text-sm leading-relaxed pl-11">
                  We believe in diving deep. Eating local food, walking local
                  streets, and understanding the heartbeat of a place.
                </p>
              </motion.div>
              <motion.div
                whileHover={{ x: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="font-serif text-xl text-midnight-ocean mb-2 flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-soft-gold"></span> Connection
                </h3>
                <p className="font-sans text-slate-gray text-sm leading-relaxed pl-11">
                  Travel is the bridge between cultures. We design itineraries
                  that foster genuine human connections.
                </p>
              </motion.div>
              <motion.div
                whileHover={{ x: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="font-serif text-xl text-midnight-ocean mb-2 flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-soft-gold"></span> Wonder
                </h3>
                <p className="font-sans text-slate-gray text-sm leading-relaxed pl-11">
                  We never lose that sense of awe. Every trip is designed to
                  have that one "breath-taking" moment.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. PROCESS/PILLARS */}
      <section className="py-24 bg-ice-blue">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-sans text-xs font-bold text-soft-gold uppercase tracking-[0.2em] mb-4 block text-center"
          >
            Our Process
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-4xl md:text-5xl text-midnight-ocean text-center mb-16"
          >
            Crafting the Perfect Trip
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "Consult",
                desc: "We listen to your dreams.",
                img: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=2070&auto=format&fit=crop",
              },
              {
                num: "02",
                title: "Curate",
                desc: "We handpick every detail.",
                img: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop",
              },
              {
                num: "03",
                title: "Celebrate",
                desc: "You enjoy the journey.",
                img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: idx * 0.2 }}
                className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="font-serif text-5xl text-soft-gold/20 font-bold group-hover:text-soft-gold/40 transition-colors">
                    {item.num}
                  </span>
                  <div>
                    <h3 className="font-serif text-2xl text-midnight-ocean">
                      {item.title}
                    </h3>
                    <p className="font-sans text-slate-gray text-sm">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <div className="h-56 overflow-hidden rounded-lg">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. STATS COLLAGE */}
      <section className="py-24 bg-white px-6 md:px-12 lg:px-24 overflow-hidden">
        <div className="container mx-auto flex flex-col lg:flex-row gap-16 items-center">
          {/* Stats Left */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="w-full lg:w-1/3 space-y-12"
          >
            <motion.div variants={fadeUp}>
              <h2 className="font-serif text-6xl lg:text-7xl text-midnight-ocean">
                2000+
              </h2>
              <p className="font-sans text-slate-gray text-lg mt-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-soft-gold" /> Happy travelers
              </p>
            </motion.div>
            <motion.div variants={fadeUp}>
              <h2 className="font-serif text-6xl lg:text-7xl text-midnight-ocean">
                10+
              </h2>
              <p className="font-sans text-slate-gray text-lg mt-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-soft-gold" /> Years of excellence
              </p>
            </motion.div>
            <motion.div variants={fadeUp}>
              <h2 className="font-serif text-6xl lg:text-7xl text-midnight-ocean">
                50+
              </h2>
              <p className="font-sans text-slate-gray text-lg mt-2 flex items-center gap-2">
                <Map className="w-5 h-5 text-soft-gold" /> Global destinations
              </p>
            </motion.div>
          </motion.div>

          {/* Collage Right */}
          <div className="w-full lg:w-2/3 grid grid-cols-2 gap-4 h-[500px]">
            <motion.img
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              src="https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=2070&auto=format&fit=crop"
              className="w-full h-full object-cover rounded-lg transform lg:translate-y-12 shadow-xl"
              alt="Traveler Backpack"
            />
            <div className="grid grid-rows-2 gap-4 h-full">
              <motion.img
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=2070&auto=format&fit=crop"
                className="w-full h-full object-cover rounded-lg shadow-xl"
                alt="Hiking"
              />
              <motion.img
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=1887&auto=format&fit=crop"
                className="w-full h-full object-cover rounded-lg shadow-xl"
                alt="Cultural Site"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. TEAM SECTION */}
      <section className="py-24 bg-ice-blue/30 px-6 md:px-12 lg:px-24">
        <div className="container mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="font-sans text-xs font-bold text-soft-gold uppercase tracking-[0.2em] mb-4 block">
              Our Team
            </span>
            <h2 className="font-serif text-4xl lg:text-5xl text-midnight-ocean">
              The experts behind your journey.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamData.map((member, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: idx * 0.15 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-48 h-48 rounded-full overflow-hidden mb-6 border-4 border-white shadow-lg relative">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <h3 className="font-serif text-xl text-midnight-ocean group-hover:text-soft-gold transition-colors">
                  {member.name}
                </h3>
                <p className="font-sans text-xs font-bold text-slate-gray uppercase tracking-widest mt-1">
                  {member.role}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="relative py-32 flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 z-0"
        >
          <img
            src="https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1887&auto=format&fit=crop"
            alt="Plane Wing Travel"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-midnight-ocean/60"></div>
        </motion.div>

        <div className="relative z-10 text-center max-w-3xl px-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-8 leading-tight"
          >
            Ready to write your travel story?
          </motion.h2>
          <motion.button
            whileHover={{
              scale: 1.05,
              backgroundColor: "#C6A75E",
              color: "#FFFFFF",
            }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 bg-white text-midnight-ocean font-sans font-bold text-sm tracking-widest uppercase transition-all duration-300 shadow-xl rounded-sm"
          >
            Start Your Journey
          </motion.button>
        </div>
      </section>
    </div>
  );
};

export default About;
