import React from "react";
import { motion } from "framer-motion";

const DestinationCard = ({ image, name, label }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="flex flex-col gap-4 group cursor-pointer"
  >
    <div className="w-full h-[450px] overflow-hidden relative">
      <motion.img
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        src={image}
        alt={name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
    </div>
    <div className="flex flex-col items-start px-2">
      <span className="font-sans text-[10px] font-bold text-soft-gold uppercase tracking-[0.15em] mb-1">
        {label}
      </span>
      <h3 className="font-serif text-2xl text-midnight-ocean group-hover:text-deep-steel-blue transition-colors duration-200">
        {name}
      </h3>
    </div>
  </motion.div>
);

const FeaturedDestinations = () => {
  const destinations = [
    {
      src: "https://images.unsplash.com/photo-1536295243470-d7cba4efab7b?q=80&w=1138&auto=format&fit=crop",
      name: "Ladakh",
      label: "Signature Destination",
    },
    {
      src: "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2076&auto=format&fit=crop",
      name: "Agra",
      label: "Historic Culture",
    },
    {
      src: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2070",
      name: "Manali",
      label: "Mountain Retreat",
    },
    {
      src: "https://images.unsplash.com/photo-1661413499880-d2169a0a7fea?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Andaman Islands",
      label: "Coastal Escape",
    },
    {
      src: "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1854",
      name: "Rajasthan",
      label: "Royal Heritage",
    },
  ];

  return (
    <section className="bg-white py-24">
      <div className="text-center mb-16">
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

      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-thin">
          {destinations.map((dest, idx) => (
            <div
              key={idx}
              className="min-w-[300px] md:min-w-[400px] snap-center"
            >
              <DestinationCard
                image={dest.src}
                name={dest.name}
                label={dest.label}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinations;
