import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Instagram,
  Facebook,
  Globe,
} from "lucide-react";
import SEO from "../components/SEO";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", formData);
  };

  return (
    <div className="bg-ice-blue min-h-screen font-sans">
      <SEO
        title="Contact Us"
        description="Get in touch with Pather Khonje to plan your unforgettable journey to Sikkim and Darjeeling."
      />
      {/* SECTION 1: MODERN EDITORIAL HERO */}
      <section className="relative w-full py-4 px-6 md:px-12 bg-ice-blue overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          {/* LEFT: TYPOGRAPHY */}
          <div className="lg:w-1/2 z-10 relative">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="h-[1px] w-12 bg-soft-gold"></div>
                <span className="text-sm font-bold tracking-widest text-deep-steel-blue uppercase">
                  Estd. 2015
                </span>
              </div>
              <h1 className="text-6xl md:text-8xl font-serif text-midnight-ocean leading-[1.1] mb-8">
                Plan the <br />
                <span className="italic text-soft-gold relative inline-block">
                  Unforgettable.
                  <svg
                    className="absolute w-full h-3 -bottom-1 left-0 text-soft-gold/30"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 5 Q 50 10 100 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </span>
              </h1>
              <p className="text-xl text-slate-600 font-light max-w-md leading-relaxed mb-10">
                We craft journeys that match the rhythm of your heart.
                Experience India with clarity, comfort, and character.
              </p>

              <div className="flex items-center gap-6">
                <button
                  onClick={() =>
                    window.scrollTo({ top: 800, behavior: "smooth" })
                  }
                  className="bg-midnight-ocean text-white px-8 py-4 font-medium hover:bg-deep-steel-blue transition-all shadow-lg hover:shadow-xl rounded-sm group"
                >
                  Start Planning{" "}
                  <ArrowRight
                    className="inline ml-2 group-hover:translate-x-1 transition-transform"
                    size={18}
                  />
                </button>
                <div className="flex -space-x-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-full border-2 border-white bg-slate-200 overflow-hidden"
                    >
                      <img
                        src={`https://randomuser.me/api/portraits/thumb/women/${
                          i + 20
                        }.jpg`}
                        alt="Traveler"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-white bg-slate-100 text-xs font-bold text-midnight-ocean">
                    2k+
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: ABSTRACT IMAGE SHAPE */}
          <div className="lg:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="relative"
            >
              <motion.div
                className="absolute w-full h-full border-4 border-soft-gold/30 rounded-[250px_0px_0px_250px] z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              ></motion.div>
              <div className="w-full h-[600px] rounded-[250px_0px_0px_250px] overflow-hidden shadow-2xl relative">
                <img
                  src="/assets/hero12.jpg"
                  alt="Luxury Travel"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-ocean/40 to-transparent"></div>
              </div>

              {/* Floating Badge */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute bottom-10 -left-10 bg-white p-6 shadow-xl max-w-xs hidden md:block border-l-4 border-soft-gold z-10"
              >
                <p className="font-serif text-lg text-midnight-ocean italic">
                  "The journey not the arrival matters."
                </p>
                <p className="text-xs text-slate-400 mt-2 uppercase tracking-wide">
                  — T.S. Eliot
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: FLOATING GLASS CARDS OVER MAP */}
      {/* SECTION 2: CONTACT CARDS */}
      <section className="relative py-12 px-6 md:px-12 bg-ice-blue">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row gap-8 justify-center items-stretch"
          >
            {/* Card 1: Contact Info */}
            <div className="flex-1 bg-white/70 backdrop-blur-xl border border-white/40 p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-sm group">
              <div className="w-12 h-12 bg-midnight-ocean text-white flex items-center justify-center rounded-full mb-8 group-hover:scale-110 transition-transform duration-300">
                <Phone size={20} />
              </div>
              <h3 className="text-2xl font-serif text-midnight-ocean mb-4">
                Direct Line
              </h3>
              <p className="text-slate-600 mb-6 font-light">
                Speak directly with our travel concierge for immediate
                assistance.
              </p>
              <a
                href="tel:+917439857694"
                className="text-lg font-medium text-deep-steel-blue hover:text-soft-gold transition-colors"
              >
                +91 7439857694
              </a>
              <p className="text-sm text-slate-400 mt-2">Mon-Sat, 9am - 7pm</p>
            </div>

            {/* Card 2: Email */}
            <div className="flex-1 bg-white/70 backdrop-blur-xl border border-white/40 p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-sm group">
              <div className="w-12 h-12 bg-midnight-ocean text-white flex items-center justify-center rounded-full mb-8 group-hover:scale-110 transition-transform duration-300">
                <Mail size={20} />
              </div>
              <h3 className="text-2xl font-serif text-midnight-ocean mb-4">
                Email Us
              </h3>
              <p className="text-slate-600 mb-6 font-light">
                Send us your detailed itinerary requests or general inquiries.
              </p>
              <a
                href="mailto:contact@patherkhonje.com"
                className="text-lg font-medium text-deep-steel-blue hover:text-soft-gold transition-colors"
              >
                contact@patherkhonje.com
              </a>
              <p className="text-sm text-slate-400 mt-2">Response within 24h</p>
            </div>

            {/* Card 3: Location */}
            <div className="flex-1 bg-white/70 backdrop-blur-xl border border-white/40 p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-sm group">
              <div className="w-12 h-12 bg-midnight-ocean text-white flex items-center justify-center rounded-full mb-8 group-hover:scale-110 transition-transform duration-300">
                <MapPin size={20} />
              </div>
              <h3 className="text-2xl font-serif text-midnight-ocean mb-4">
                Visit Us
              </h3>
              <p className="text-slate-600 mb-6 font-light">
                Come have a coffee with us at our Kolkata expert center.
              </p>
              <address className="text-base text-deep-steel-blue not-italic font-medium">
                64/2/12, Biren Roy Road (East), <br /> Bohala Chowrasta, Kolkata
                — 700045
              </address>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: REQUEST A CALLBACK FORM */}
      <section className="bg-ice-blue py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto bg-white shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
            {/* LEFT: FORM (Ice/Mist Blue Background) */}
            <div className="lg:col-span-7 bg-mist-blue p-10 md:p-16 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-serif text-midnight-ocean mb-10">
                  Tell us about your trip
                </h2>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-deep-steel-blue/70 uppercase tracking-widest mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-white p-4 text-midnight-ocean focus:outline-none focus:ring-1 focus:ring-horizon-blue transition-all shadow-sm"
                        placeholder="e.g. Anjali Das"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-deep-steel-blue/70 uppercase tracking-widest mb-2">
                        Email or Phone
                      </label>
                      <input
                        type="text"
                        name="email" /* Using email field for contact as per state, label says both */
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-white p-4 text-midnight-ocean focus:outline-none focus:ring-1 focus:ring-horizon-blue transition-all shadow-sm"
                        placeholder="Contact number"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-deep-steel-blue/70 uppercase tracking-widest mb-2">
                        Destination
                      </label>
                      <input
                        type="text"
                        name="destination"
                        /* Note: State might need 'destination' added if not present, sticking to existing state or adding it */
                        onChange={handleChange}
                        className="w-full bg-white p-4 text-midnight-ocean focus:outline-none focus:ring-1 focus:ring-horizon-blue transition-all shadow-sm"
                        placeholder="Select a region"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-deep-steel-blue/70 uppercase tracking-widest mb-2">
                        Travel Month
                      </label>
                      <input
                        type="text"
                        name="month"
                        /* Note: State might need 'month' added if not present */
                        onChange={handleChange}
                        className="w-full bg-white p-4 text-midnight-ocean focus:outline-none focus:ring-1 focus:ring-horizon-blue transition-all shadow-sm"
                        placeholder="e.g. October 2025"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-deep-steel-blue/70 uppercase tracking-widest mb-2">
                      How can we help?
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="4"
                      className="w-full bg-white p-4 text-midnight-ocean focus:outline-none focus:ring-1 focus:ring-horizon-blue transition-all shadow-sm resize-none"
                      placeholder="Tell us about your preferences, group size, or specific requirements..."
                      required
                    />
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
                    <button className="bg-midnight-ocean text-white px-8 py-4 font-medium hover:bg-deep-steel-blue transition-colors duration-300 w-full md:w-auto shadow-lg hover:shadow-xl rounded-sm">
                      Request a Callback
                    </button>
                    <p className="text-sm text-slate-500 italic">
                      We usually respond within one business day.
                    </p>
                  </div>
                </form>
              </motion.div>
            </div>

            {/* RIGHT: TRUST & STORY */}
            <div className="lg:col-span-5 bg-ice-blue/30 p-10 md:p-16 flex flex-col justify-center relative border-l border-white/50">
              <div className="mb-10">
                <LazyLoadImage
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80"
                  alt="Our Team"
                  className="w-full h-64 object-cover mb-8 shadow-md"
                  effect="blur"
                  wrapperClassName="w-full h-64 mb-8"
                />
                <p className="text-lg text-midnight-ocean leading-relaxed mb-6 font-medium">
                  Since <span className="text-soft-gold font-bold">2015</span>,
                  we’ve helped thousands of travelers explore India with comfort
                  and clarity.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center space-x-3 text-slate-600">
                    <span className="text-soft-gold">✓</span>
                    <span>10+ years of local expertise</span>
                  </li>
                  <li className="flex items-center space-x-3 text-slate-600">
                    <span className="text-soft-gold">✓</span>
                    <span>2000+ happy travelers</span>
                  </li>
                  <li className="flex items-center space-x-3 text-slate-600">
                    <span className="text-soft-gold">✓</span>
                    <span>Dedicated trip consultants</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: SOLO MAP COMPONENT */}
      <section className="w-full h-[500px] bg-slate-100 mb-0">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3686.4507468316338!2d88.3166774!3d22.487265499999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a027a73cbb65f43%3A0x93a537633a855e9f!2s64%2F2%2F8%2C%20Biren%20Roy%20Road%20E%2C%20Sukanta%20Pally%2C%20Barisha%2C%20Kolkata%2C%20West%20Bengal%20700008!5e0!3m2!1sen!2sin!4v1767720032563!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          title="Map"
          className="grayscale hover:grayscale-0 transition-all duration-700"
        />
      </section>

      {/* SECTION 4: SOCIAL FOOTER STRIP */}
      <div className="border-t border-slate-100 py-8">
        <div className="flex justify-center gap-8 text-slate-400">
          <a href="#" className="hover:text-midnight-ocean transition-colors">
            <Instagram size={24} />
          </a>
          <a href="#" className="hover:text-midnight-ocean transition-colors">
            <Facebook size={24} />
          </a>
          <a href="#" className="hover:text-midnight-ocean transition-colors">
            <Globe size={24} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
