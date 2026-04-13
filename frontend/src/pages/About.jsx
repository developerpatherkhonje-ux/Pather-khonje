import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, Map, Compass, Users } from "lucide-react";
import SEO from "../components/SEO";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const imageScale = {
  hidden: { scale: 1.1, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 1.5, ease: "easeOut" },
  },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 1, ease: "easeOut" } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 1, ease: "easeOut" } },
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
    name: "Soma Shah",
    role: "Proprietor & Founder",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop",
  },
];

const About = () => {
  return (
    <div className="bg-white overflow-hidden selection:bg-soft-gold selection:text-white">
      <SEO
        title="About Us"
        description="Learn about Pather Khonje, our story, philosophy, and the team dedicated to curating your perfect travel experience."
      />
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full h-[80vh] overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
        </motion.div>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-4xl"
          >
            <span className="font-sans text-[10px] md:text-xs font-bold text-soft-gold uppercase tracking-[0.3em] mb-6 block">
              Our Heritage
            </span>
            <h1 className="font-serif text-6xl md:text-8xl text-white mb-6 leading-tight drop-shadow-lg">
              About Pather Khonje
            </h1>
            <p className="font-sans text-white/90 text-lg md:text-xl max-w-2xl mx-auto tracking-wide font-light">
              Curating journeys that inspire, connect, and transform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. ORIGIN STORY */}
      <section className="py-32 px-6 md:px-12 lg:px-24 bg-ice-blue/20">
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInLeft}
            className="w-full lg:w-1/2 relative"
          >
            {/* Elegant Image Frame */}
            <div className="absolute inset-0 border border-soft-gold/40 translate-x-6 translate-y-6 rounded-sm"></div>
            <div className="relative h-[600px] overflow-hidden rounded-sm shadow-2xl z-10 group">
              <LazyLoadImage
                src="https://images.unsplash.com/photo-1667694138821-ff480ed816d3?q=80&w=1170&auto=format&fit=crop"
                alt="Planning the Journey"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                effect="blur"
                wrapperClassName="w-full h-full"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-midnight-ocean/90 to-transparent p-8">
                <p className="text-white font-serif italic text-2xl leading-relaxed">
                  "Every great journey begins with a map and a leap of faith."
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInRight}
            className="w-full lg:w-1/2 lg:pl-10"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] w-12 bg-soft-gold"></div>
              <span className="font-sans text-xs font-bold text-deep-steel-blue uppercase tracking-[0.2em]">
                Origin Story
              </span>
            </div>
            <h2 className="font-serif text-5xl lg:text-6xl text-midnight-ocean leading-[1.1] mb-8">
              Rooted in Kolkata, <br />
              <span className="italic text-soft-gold">inspired by the journey.</span>
            </h2>
            <div className="space-y-6 text-lg text-slate-gray font-light leading-relaxed">
              <p>
                Founded in 2015, Pather Khonje wasn't just built on business
                plans, but on travel diaries. Our founder, clutching a worn-out
                map and a backpack full of dreams, realized that the best stories
                are found on the road less traveled.
              </p>
              <p>
                From the bustling streets of Kolkata to the serene Himalayas, we
                realized that travel isn't just about sightseeing—it's about the
                soul-stirring feeling of discovery and connection with the world.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. TIMELINE */}
      <section className="py-32 bg-midnight-ocean relative overflow-hidden">
        {/* Subtle background pattern/glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-deep-steel-blue/40 via-midnight-ocean to-midnight-ocean z-0"></div>
        
        <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10">
          <div className="text-center mb-20">
            <span className="font-sans text-xs font-bold text-soft-gold uppercase tracking-[0.2em] mb-4 block">
              Our Evolution
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-white">The Journey So Far</h2>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8"
          >
            {timelineData.map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="relative group"
              >
                {/* Connecting Line (Desktop) */}
                {idx !== timelineData.length - 1 && (
                  <div className="hidden lg:block absolute top-4 left-6 w-full h-[1px] bg-white/10"></div>
                )}
                
                <div className="relative z-10 flex flex-col">
                  <span className="w-8 h-8 rounded-full bg-soft-gold border-4 border-midnight-ocean shadow-lg mb-8 flex-shrink-0 transition-transform duration-300 group-hover:scale-125"></span>
                  <h3 className="font-serif text-4xl text-white mb-3">
                    {item.year}
                  </h3>
                  <h4 className="font-sans font-bold text-sm text-soft-gold uppercase tracking-wider mb-4">
                    {item.title}
                  </h4>
                  <p className="font-sans text-slate-300 text-sm leading-relaxed font-light pr-4">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. PHILOSOPHY */}
      <section className="py-32 px-6 md:px-12 lg:px-24 bg-white">
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInLeft}
            className="w-full lg:w-1/2 h-[650px] overflow-hidden rounded-sm shadow-2xl order-2 lg:order-1 relative group"
          >
            <div className="absolute inset-0 bg-midnight-ocean/10 group-hover:bg-transparent transition-colors duration-700 z-10"></div>
            <LazyLoadImage
              src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop"
              alt="Group Travel Philosophy"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              effect="blur"
              wrapperClassName="w-full h-full"
            />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInRight}
            className="w-full lg:w-1/2 order-1 lg:order-2 lg:pl-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] w-12 bg-soft-gold"></div>
              <span className="font-sans text-xs font-bold text-deep-steel-blue uppercase tracking-[0.2em]">
                Philosophy
              </span>
            </div>
            <h2 className="font-serif text-5xl lg:text-6xl text-midnight-ocean leading-[1.1] mb-12">
              Not just tourists,
              <br /> <span className="text-soft-gold italic">but travelers.</span>
            </h2>

            <div className="space-y-10">
              {[
                { title: "Immersion", desc: "We believe in diving deep. Eating local food, walking local streets, and understanding the heartbeat of a place." },
                { title: "Connection", desc: "Travel is the bridge between cultures. We design itineraries that foster genuine human connections." },
                { title: "Wonder", desc: "We never lose that sense of awe. Every trip is designed to have that one truly breath-taking moment." }
              ].map((phil, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="group cursor-default"
                >
                  <h3 className="font-serif text-2xl text-midnight-ocean mb-3 flex items-center gap-4">
                    <span className="w-12 h-[1px] bg-gray-200 group-hover:bg-soft-gold transition-colors"></span> 
                    {phil.title}
                  </h3>
                  <p className="font-sans text-slate-gray text-base leading-relaxed pl-16 font-light">
                    {phil.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. PROCESS/PILLARS */}
      <section className="py-32 bg-ice-blue">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="text-center mb-20">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-sans text-xs font-bold text-soft-gold uppercase tracking-[0.2em] mb-4 block"
            >
              Our Process
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-serif text-4xl md:text-5xl lg:text-6xl text-midnight-ocean"
            >
              Crafting the Perfect Trip
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "Consult",
                desc: "We listen to your dreams and understand your unique travel style.",
                img: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=2070&auto=format&fit=crop",
              },
              {
                num: "02",
                title: "Curate",
                desc: "We handpick every detail, from boutique stays to local guides.",
                img: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop",
              },
              {
                num: "03",
                title: "Celebrate",
                desc: "You enjoy a seamless, unforgettable journey with 24/7 support.",
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
                className="group bg-white p-8 md:p-10 rounded-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
              >
                <div className="relative mb-8 pb-8 border-b border-gray-100 flex-grow">
                  <span className="absolute -top-4 -right-2 font-serif text-8xl text-ice-blue/50 font-bold z-0 pointer-events-none select-none group-hover:text-mist-blue transition-colors">
                    {item.num}
                  </span>
                  <div className="relative z-10">
                    <h3 className="font-serif text-3xl text-midnight-ocean mb-3">
                      {item.title}
                    </h3>
                    <p className="font-sans text-slate-gray font-light leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <div className="h-64 w-full overflow-hidden rounded-sm mt-auto">
                  <LazyLoadImage
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    effect="blur"
                    wrapperClassName="w-full h-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. STATS COLLAGE */}
      <section className="py-32 bg-white px-6 md:px-12 lg:px-24 overflow-hidden">
        <div className="container mx-auto flex flex-col lg:flex-row gap-20 items-center">
          {/* Stats Left */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="w-full lg:w-1/3 space-y-16"
          >
            <motion.div variants={fadeUp} className="relative">
              <div className="absolute -left-6 top-4 w-1 h-full bg-soft-gold"></div>
              <h2 className="font-serif text-6xl lg:text-7xl text-midnight-ocean leading-none">
                2000<span className="text-soft-gold">+</span>
              </h2>
              <p className="font-sans text-slate-gray text-lg mt-3 flex items-center gap-3 uppercase tracking-widest font-bold text-xs">
                <Users className="w-4 h-4 text-midnight-ocean" /> Happy travelers
              </p>
            </motion.div>
            
            <motion.div variants={fadeUp} className="relative">
              <div className="absolute -left-6 top-4 w-1 h-full bg-soft-gold"></div>
              <h2 className="font-serif text-6xl lg:text-7xl text-midnight-ocean leading-none">
                10<span className="text-soft-gold">+</span>
              </h2>
              <p className="font-sans text-slate-gray text-lg mt-3 flex items-center gap-3 uppercase tracking-widest font-bold text-xs">
                <Star className="w-4 h-4 text-midnight-ocean" /> Years of excellence
              </p>
            </motion.div>
            
            <motion.div variants={fadeUp} className="relative">
              <div className="absolute -left-6 top-4 w-1 h-full bg-soft-gold"></div>
              <h2 className="font-serif text-6xl lg:text-7xl text-midnight-ocean leading-none">
                50<span className="text-soft-gold">+</span>
              </h2>
              <p className="font-sans text-slate-gray text-lg mt-3 flex items-center gap-3 uppercase tracking-widest font-bold text-xs">
                <Map className="w-4 h-4 text-midnight-ocean" /> Global destinations
              </p>
            </motion.div>
          </motion.div>

          {/* Collage Right - High End Editorial Layout */}
          <div className="w-full lg:w-2/3 relative h-[600px] md:h-[700px]">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="absolute top-0 right-0 w-[60%] h-[70%] z-10 border-8 border-white shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=2070&auto=format&fit=crop"
                className="w-full h-full object-cover"
                alt="Traveler Backpack"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute bottom-0 left-0 w-[50%] h-[55%] z-20 border-8 border-white shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=2070&auto=format&fit=crop"
                className="w-full h-full object-cover"
                alt="Hiking"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 }}
              className="absolute bottom-[10%] right-[15%] w-[35%] h-[40%] z-30 border-8 border-white shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=1887&auto=format&fit=crop"
                className="w-full h-full object-cover"
                alt="Cultural Site"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. TEAM / PROPRIETOR SECTION */}
      <section className="py-32 bg-ice-blue/40 px-6 md:px-12 lg:px-24 border-t border-gray-100">
        <div className="container mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-20"
          >
            <span className="font-sans text-xs font-bold text-soft-gold uppercase tracking-[0.2em] mb-4 block">
              Leadership
            </span>
            <h2 className="font-serif text-4xl lg:text-5xl text-midnight-ocean">
              The visionary behind the journey.
            </h2>
          </motion.div>

          <div className="flex justify-center">
            {teamData.map((member, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: 0.2 }}
                className="w-full max-w-5xl bg-white flex flex-col md:flex-row items-center gap-12 p-8 md:p-12 lg:p-16 shadow-2xl rounded-sm relative"
              >
                {/* Gold Accent Bar */}
                <div className="absolute top-0 left-0 w-2 h-full bg-soft-gold"></div>
                
                <div className="w-full md:w-1/3 flex-shrink-0">
                  <div className="w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden mx-auto border-[6px] border-ice-blue shadow-inner relative group">
                    <LazyLoadImage
                      src={member.img}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      effect="blur"
                    />
                  </div>
                </div>

                <div className="w-full md:w-2/3 text-center md:text-left space-y-6">
                  <div>
                    <h3 className="font-serif text-4xl text-midnight-ocean mb-2">
                      {member.name}
                    </h3>
                    <p className="font-sans text-xs font-bold text-soft-gold uppercase tracking-[0.2em]">
                      {member.role}
                    </p>
                  </div>
                  <div className="w-12 h-[1px] bg-gray-200 mx-auto md:mx-0"></div>
                  <p className="font-sans text-slate-gray font-light text-lg leading-relaxed italic">
                    "We don't just sell tour packages; we craft experiences. Every itinerary we build is treated with the same exact care as if we were planning it for our own family. Our goal is to ensure that every traveler returns home with stories they will cherish forever."
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="relative py-40 flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="absolute inset-0 z-0"
        >
          <img
            src="https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1887&auto=format&fit=crop"
            alt="Plane Wing Travel"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-midnight-ocean/70 mix-blend-multiply"></div>
        </motion.div>

        <div className="relative z-10 text-center max-w-3xl px-6">
          <span className="font-sans text-xs font-bold text-soft-gold uppercase tracking-[0.3em] mb-6 block drop-shadow-md">
            Begin Your Next Chapter
          </span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-5xl md:text-6xl lg:text-7xl text-white mb-12 leading-tight drop-shadow-lg"
          >
            Ready to write your <br/> <span className="italic text-soft-gold">travel story?</span>
          </motion.h2>
          <motion.button
            whileHover={{
              scale: 1.05,
              backgroundColor: "#C6A75E",
              color: "#FFFFFF",
              borderColor: "#C6A75E"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/contact'}
            className="px-12 py-5 bg-transparent border border-white text-white font-sans font-bold text-xs tracking-[0.2em] uppercase transition-all duration-300 backdrop-blur-sm"
          >
            Start Your Journey
          </motion.button>
        </div>
      </section>
    </div>
  );
};

export default About;