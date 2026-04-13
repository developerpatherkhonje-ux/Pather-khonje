import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import "react-lazy-load-image-component/src/effects/blur.css";

const destinations = [
  {
    image: "https://images.unsplash.com/photo-1544634076-a900ce0dcbfb?q=80&w=2070",
    name: "Darjeeling",
    label: "Queen of the Hills",
    path: "/hotels/darjeeling"
  },
  {
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2070",
    name: "Sikkim",
    label: "Mystic Mountains",
    path: "/hotels/sikkim"
  },
  {
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=2070",
    name: "Ladakh",
    label: "High Altitude Desert",
    path: "/hotels/ladakh"
  },
  {
    image: "https://images.unsplash.com/photo-1605649487212-4d48bfceb477?q=80&w=2070",
    name: "Manali",
    label: "Valley of Gods",
    path: "/hotels/manali"
  },
  {
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1974",
    name: "Goa",
    label: "Coastal Paradise",
    path: "/hotels/goa"
  }
];

const DestinationCard = ({ image, name, label, path }) => (
  <Link 
    to={path} 
    className="flex-none w-[85vw] md:w-[400px] flex flex-col gap-4 group cursor-pointer snap-center"
  >
    <div className="w-full h-[450px] overflow-hidden relative">
      <motion.div
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className="w-full h-full"
      >
        <LazyLoadImage
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          effect="blur"
          wrapperClassName="w-full h-full"
        />
      </motion.div>
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500 pointer-events-none" />
    </div>
    <div className="flex flex-col items-start">
      <span className="text-[10px] font-bold text-soft-gold uppercase tracking-[0.2em] mb-1">
        {label}
      </span>
      <h3 className="font-serif text-2xl text-midnight-ocean group-hover:text-horizon-blue transition-colors">
        {name}
      </h3>
    </div>
  </Link>
);

const FeaturedDestinations = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="bg-white py-24 relative">
      <div className="text-center mb-16 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl md:text-4xl lg:text-5xl text-midnight-ocean mb-4"
        >
          Featured Destinations
        </motion.h2>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "64px" }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-[1px] bg-soft-gold mx-auto"
        ></motion.div>
      </div>

      <div className="relative group">
        <button 
          onClick={() => scroll("left")}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm p-4 rounded-full shadow-lg text-midnight-ocean hover:bg-midnight-ocean hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:block"
        >
          <ChevronLeft size={24} />
        </button>

        <div 
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-thin px-6 md:px-12"
        >
          {destinations.map((dest, index) => (
            <DestinationCard key={index} {...dest} />
          ))}
        </div>

        <button 
          onClick={() => scroll("right")}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm p-4 rounded-full shadow-lg text-midnight-ocean hover:bg-midnight-ocean hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:block"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
};

export default FeaturedDestinations;