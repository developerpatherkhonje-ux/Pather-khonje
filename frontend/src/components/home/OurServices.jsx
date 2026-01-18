import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const servicesList = [
  // Primary (Top Row)
  {
    category: "Primary",
    items: [
      {
        title: "Hotel Booking",
        desc: "Premium stays at the best rates.",
        image:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
      },
      {
        title: "Tour Packages",
        desc: "Curated domestic and international tours.",
        image:
          "https://images.unsplash.com/photo-1504150558240-0b4fd8946624?q=80&w=1964&auto=format&fit=crop",
      },
      {
        title: "Car Rental",
        desc: "Reliable transport for your journey.",
        image:
          "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop",
      },
      {
        title: "Custom Planning",
        desc: "Itineraries tailored specifically to you.",
        image:
          "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1935&auto=format&fit=crop",
      },
    ],
  },
  // Experience & Corporate (Middle Row)
  {
    category: "Corporate",
    items: [
      {
        title: "Destination Weddings",
        desc: "Picture-perfect celebrations.",
        image:
          "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
      },
      {
        title: "Corporate Tours",
        desc: "Team building retreats and offsites.",
        image:
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
      },
      {
        title: "Office Picnics",
        desc: "Relaxing day trips and excursions.",
        image:
          "/assets/office-picnic.jpg",
      },
      {
        title: "Corporate Meetings",
        desc: "Professional conference setups.",
        image:
          "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop",
      },
    ],
  },
  // Logistics (Bottom Row)
  {
    category: "Logistics",
    items: [
      {
        title: "Event Management",
        desc: "Seamless execution for events.",
        image:
          "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop",
      },
      {
        title: "Train Tickets",
        desc: "Hassle-free rail reservations.",
        image:
          "/assets/train.jpg",
      },
      {
        title: "Flight Booking",
        desc: "Domestic and international flights.",
        image:
          "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop",
      },
      {
        title: "Travel Insurance",
        desc: "Comprehensive coverage plans.",
        image:
          "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop",
      },
    ],
  },
];

const ServiceCard = ({ title, desc, image }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 },
    }}
    className="group bg-white flex flex-col h-full cursor-pointer overflow-hidden"
  >
    {/* Image Container with Overlay Reveal */}
    <div className="w-full h-48 overflow-hidden relative">
      <img src={image} alt={title} className="w-full h-full object-cover" />
      {/* Blue overlay at 8% opacity on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-horizon-blue/10 pointer-events-none"
      />
    </div>

    {/* Content Block */}
    <div className="p-6 flex flex-col gap-3 flex-grow border border-gray-100 border-t-0">
      <div className="flex items-start justify-between">
        <h3 className="font-serif text-xl text-midnight-ocean relative">
          {title}
          {/* Underline Animation */}
          <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-horizon-blue transition-all duration-300 group-hover:w-full"></span>
        </h3>
        <span className="w-1.5 h-1.5 rounded-full bg-soft-gold mt-2 opacity-60"></span>
      </div>

      <p className="font-sans text-sm text-slate-gray leading-relaxed mb-2">
        {desc}
      </p>

      <div className="mt-auto flex items-center gap-2 text-xs font-bold font-sans text-midnight-ocean uppercase tracking-widest group-hover:text-horizon-blue transition-colors">
        Learn more
        <motion.span
          initial={{ x: 0 }}
          className="group-hover:translate-x-1 transition-transform duration-200"
        >
          <ArrowRight size={12} />
        </motion.span>
      </div>
    </div>
  </motion.div>
);

const OurServices = () => {
  return (
    <section className="bg-ice-blue py-24">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="mb-16 max-w-2xl"
        >
          <div className="flex flex-col gap-4">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-midnight-ocean leading-tight">
              Our Travel Services
            </h2>
            <div className="h-[1px] w-24 bg-soft-gold/60"></div>
            <p className="font-sans text-slate-gray text-lg leading-relaxed max-w-xl">
              From planning to execution, we provide end-to-end travel solutions
              designed for comfort, clarity, and peace of mind.
            </p>
          </div>
        </motion.div>

        {/* Services Grid */}
        <div className="flex flex-col gap-16">
          {servicesList.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  show: { transition: { staggerChildren: 0.06 } },
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {row.items.map((service, idx) => (
                  <ServiceCard
                    key={idx}
                    title={service.title}
                    desc={service.desc}
                    image={service.image}
                  />
                ))}
              </motion.div>
              {/* Thin Blue Divider after second row (Corporate) */}
              {rowIndex === 1 && (
                <div className="w-full h-[1px] bg-midnight-ocean/10 my-4"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurServices;
