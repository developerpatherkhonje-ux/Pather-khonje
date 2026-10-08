import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BedDouble,
  Briefcase,
  Bus,
  CalendarCheck,
  Car,
  FileCheck2,
  HeartHandshake,
  Plane,
  ShieldCheck,
  Sparkles,
  Train,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: BedDouble,
    title: "Hotel Booking",
    desc: "Premium stays at the best rates.",
    link: "/hotels",
  },
  {
    icon: Sparkles,
    title: "Tour Packages",
    desc: "Curated domestic and international tours.",
    link: "/packages",
  },
  {
    icon: Car,
    title: "Car Rental",
    desc: "Reliable transport for your journey.",
    link: "/contact",
  },
  {
    icon: FileCheck2,
    title: "Custom Planning",
    desc: "Itineraries tailored specifically to you.",
    link: "/contact",
  },
  {
    icon: HeartHandshake,
    title: "Destination Weddings",
    desc: "Picture-perfect celebrations.",
    link: "/contact",
  },
  {
    icon: Briefcase,
    title: "Corporate Tours",
    desc: "Team building retreats and offsites.",
    link: "/contact",
  },
  {
    icon: Users,
    title: "Office Picnics",
    desc: "Relaxing day trips and excursions.",
    link: "/contact",
  },
  {
    icon: CalendarCheck,
    title: "Corporate Meetings",
    desc: "Professional conference setups.",
    link: "/contact",
  },
  {
    icon: Bus,
    title: "Event Management",
    desc: "Seamless execution for events.",
    link: "/contact",
  },
  {
    icon: Train,
    title: "Train Tickets",
    desc: "Hassle-free rail reservations.",
    link: "/contact",
  },
  {
    icon: Plane,
    title: "Flight Booking",
    desc: "Domestic and international flights.",
    link: "/contact",
  },
  {
    icon: ShieldCheck,
    title: "Travel Insurance",
    desc: "Comprehensive coverage plans.",
    link: "/contact",
  },
];

const OurServices = () => {
  return (
    <section className="relative overflow-hidden bg-[#f6fbfa] px-5 py-20 text-[#071c23] sm:px-6 lg:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(198,167,94,0.18),transparent_28%),radial-gradient(circle_at_88%_72%,rgba(11,74,66,0.12),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <span className="himalaya-kicker text-[#0b4a42]">
            Our Travel Services
          </span>
          <h2 className="atelier-display mt-4 text-5xl leading-[0.95] text-[#071c23] md:text-6xl">
            From planning to execution, everything stays handled.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600">
            From planning to execution, we provide end-to-end travel solutions
            designed for comfort, clarity, and peace of mind.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(index * 0.035, 0.22), duration: 0.45 }}
              className="group flex min-h-[250px] flex-col border border-[#071c23]/10 bg-white p-6 shadow-[0_22px_70px_rgba(7,28,35,0.08)] transition hover:-translate-y-1 hover:border-soft-gold/55 hover:shadow-[0_30px_90px_rgba(7,28,35,0.13)]"
            >
              <div className="flex h-12 w-12 items-center justify-center bg-[#071c23] text-soft-gold">
                <service.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 font-serif text-2xl text-[#071c23]">
                {service.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {service.desc}
              </p>
              <Link
                to={service.link}
                className="mt-auto inline-flex items-center gap-2 pt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#0b4a42]"
              >
                Learn more
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurServices;
