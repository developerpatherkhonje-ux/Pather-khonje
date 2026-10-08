import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Mountain,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
import SEO from "../components/SEO";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const quickTopics = [
  "Custom package",
  "Hotel booking",
  "Family trip",
  "Group tour",
  "Honeymoon plan",
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Custom package",
    message: "",
    destination: "",
    month: "",
  });

  const [status, setStatus] = useState({
    submitting: false,
    success: false,
    error: null,
  });

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    if (status.success || status.error) {
      setStatus({ submitting: false, success: false, error: null });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ submitting: true, success: false, error: null });

    try {
      const { submitEnquiry } = await import("../services/enquiryService");
      await submitEnquiry(formData);
      setStatus({ submitting: false, success: true, error: null });
      setFormData({
        name: "",
        email: "",
        subject: "Custom package",
        message: "",
        destination: "",
        month: "",
      });
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      setStatus({
        submitting: false,
        success: false,
        error:
          error.response?.data?.message ||
          "Something went wrong. Please try again or message us on WhatsApp.",
      });
    }
  };

  const handleWhatsApp = (topic = formData.subject) => {
    const message = `Hi! I want help with ${topic || "travel planning"}. Destination: ${formData.destination || "not decided yet"}. Travel month: ${formData.month || "flexible"}. Please share options and details.`;
    window.open(
      `https://wa.me/917439857694?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="premium-page min-h-screen font-sans text-midnight-ocean">
      <SEO
        title="Contact Pather Khonje"
        description="Contact Pather Khonje for custom mountain tours, premium hotel bookings, family trips and curated travel planning across India."
        keywords="contact Pather Khonje, custom tour planner Kolkata, travel agency Kolkata, Sikkim travel enquiry, hotel booking assistance"
      />

      <section className="relative min-h-[78vh] overflow-hidden bg-midnight-ocean">
        <LazyLoadImage
          src="/assets/hero12.jpg"
          alt="Mountain route planning"
          className="absolute inset-0 h-full w-full object-cover"
          wrapperClassName="absolute inset-0 h-full w-full"
          effect="blur"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,37,35,0.98),rgba(10,46,77,0.76)_52%,rgba(10,46,77,0.34)),linear-gradient(180deg,rgba(0,0,0,0.22),rgba(0,0,0,0.68))]" />

        <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-6 pb-12 pt-32 md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <div className="mb-5 flex items-center gap-4">
              <div className="gold-rule" />
              <span className="section-kicker">Trip concierge</span>
            </div>
            <h1 className="font-serif text-5xl leading-[1.02] text-white md:text-7xl lg:text-8xl">
              Tell us where the road should begin.
            </h1>
            <p className="mt-6 max-w-2xl rounded-2xl border border-white/12 bg-midnight-ocean/58 p-5 text-base font-medium leading-8 text-white shadow-[0_18px_55px_rgba(0,0,0,0.24)] backdrop-blur-md md:text-xl">
              Share your dates, destination, pace and budget. We will shape a
              clear travel plan with hotels, route notes and WhatsApp support.
            </p>
          </motion.div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => handleWhatsApp("custom travel planning")}
              className="premium-button flex items-center justify-center gap-3 rounded-full px-8 py-4 text-xs font-bold uppercase tracking-[0.18em]"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </button>
            <a
              href="tel:+917439857694"
              className="flex items-center justify-center gap-3 rounded-full border border-white/24 bg-white/10 px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white backdrop-blur transition hover:border-soft-gold hover:text-soft-gold"
            >
              <Phone className="h-4 w-4" />
              Call Now
            </a>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-6">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {[
            {
              icon: Phone,
              title: "Direct Line",
              text: "Speak with our travel concierge for quick route help.",
              value: "+91 7439857694",
              href: "tel:+917439857694",
            },
            {
              icon: Mail,
              title: "Email Us",
              text: "Send detailed itinerary or hotel booking requests.",
              value: "contact@patherkhonje.com",
              href: "mailto:contact@patherkhonje.com",
            },
            {
              icon: MapPin,
              title: "Visit Us",
              text: "64/2/12, Biren Roy Road (East), Behala, Kolkata - 700008",
              value: "Open Maps",
              href: "#map",
            },
          ].map(({ icon: Icon, title, text, value, href }) => (
            <a
              key={title}
              href={href}
              className="premium-panel group rounded-[1.5rem] p-7 transition hover:-translate-y-1"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-midnight-ocean text-white transition group-hover:bg-soft-gold">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-serif text-2xl">{title}</h2>
              <p className="mt-3 min-h-[54px] text-sm leading-7 text-slate-600">
                {text}
              </p>
              <div className="mt-5 flex items-center gap-2 text-sm font-bold text-deep-steel-blue group-hover:text-soft-gold">
                {value}
                <ArrowRight className="h-4 w-4" />
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16 md:px-6 md:pb-24">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[1.75rem] bg-white shadow-[0_26px_80px_rgba(10,46,77,0.12)] ring-1 ring-midnight-ocean/8 lg:grid-cols-[1fr_430px]">
          <div className="bg-mist-blue p-6 md:p-10 lg:p-12">
            <div className="mb-8">
              <span className="section-kicker">Plan request</span>
              <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                Build my trip
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                The more clearly you describe the journey, the faster our team
                can send the right route and hotel options.
              </p>
            </div>

            <div className="mb-7 flex flex-wrap gap-2">
              {quickTopics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setFormData({ ...formData, subject: topic })}
                  className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${
                    formData.subject === topic
                      ? "border-midnight-ocean bg-midnight-ocean text-white"
                      : "border-white bg-white text-slate-500 hover:border-soft-gold hover:text-midnight-ocean"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Your Name">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="contact-input"
                    placeholder="Your full name"
                    required
                  />
                </Field>
                <Field label="Email or Phone">
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="contact-input"
                    placeholder="Phone number or email"
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Destination">
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    className="contact-input"
                    placeholder="Sikkim, Darjeeling, Araku..."
                  />
                </Field>
                <Field label="Travel Month">
                  <input
                    type="text"
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    className="contact-input"
                    placeholder="October, winter, flexible..."
                  />
                </Field>
              </div>

              <Field label="How can we help?">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="contact-input resize-none"
                  placeholder="Group size, budget, preferred hotel type, places you want to cover..."
                  required
                />
              </Field>

              {status.success && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                  Thank you. Your request has been sent successfully.
                </div>
              )}

              {status.error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                  {status.error}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={status.submitting}
                  className="premium-button flex items-center justify-center gap-3 rounded-full px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {status.submitting ? "Sending..." : "Send Request"}
                </button>
                <button
                  type="button"
                  onClick={() => handleWhatsApp()}
                  className="flex items-center justify-center gap-3 rounded-full border border-midnight-ocean/15 bg-white px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-midnight-ocean transition hover:border-soft-gold hover:text-soft-gold"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Instead
                </button>
              </div>
            </form>
          </div>

          <aside className="relative bg-midnight-ocean p-6 text-white md:p-10 lg:p-12">
            <div className="absolute inset-0 opacity-20">
              <LazyLoadImage
                src="/assets/hero13.jpg"
                alt=""
                className="h-full w-full object-cover"
                wrapperClassName="h-full w-full"
                effect="blur"
              />
            </div>
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/12 backdrop-blur">
                  <Mountain className="h-8 w-8 text-soft-gold" />
                </div>
                <h3 className="font-serif text-4xl">What happens next?</h3>
                <div className="mt-8 space-y-5">
                  {[
                    "We understand your route, pace and hotel preference.",
                    "We share suitable options with photos and price range.",
                    "You confirm on WhatsApp, then our team handles the rest.",
                  ].map((item, index) => (
                    <div key={item} className="flex gap-4">
                      <div className="flex h-8 min-w-8 items-center justify-center rounded-full bg-soft-gold text-xs font-bold text-midnight-ocean">
                        {index + 1}
                      </div>
                      <p className="leading-7 text-white/78">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 rounded-3xl border border-white/12 bg-white/10 p-5 backdrop-blur">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-soft-gold" />
                  <span className="text-sm font-bold uppercase tracking-[0.14em]">
                    Trusted planning
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-white/78">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="font-serif text-3xl text-white">10+</div>
                    Years
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="font-serif text-3xl text-white">2k+</div>
                    Travelers
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section id="map" className="px-4 pb-16 md:px-6">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[1.75rem] bg-white shadow-[0_20px_60px_rgba(10,46,77,0.10)] ring-1 ring-midnight-ocean/8 lg:grid-cols-[360px_1fr]">
          <div className="p-8">
            <span className="section-kicker">Kolkata office</span>
            <h2 className="mt-3 font-serif text-3xl">Meet us in Behala</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              64/2/12, Biren Roy Road (East), Behala, Chowrasta, Kolkata -
              700008
            </p>
            <div className="mt-6 flex gap-4 text-slate-400">
              <a
                href="https://www.instagram.com/patherkhonje?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-midnight-ocean"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61577923149985"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-midnight-ocean"
                aria-label="Facebook"
              >
                <Facebook size={24} />
              </a>
            </div>
          </div>
          <iframe
            src="https://maps.google.com/maps?width=100%25&height=100%25&hl=en&q=64/2/12,%20Biren%20Roy%20Road%20(East),%20Behala,%20Chowrasta,%20Kolkata%20-%20700008+(Pather%20Khonje)&t=&z=16&ie=UTF8&iwloc=B&output=embed"
            width="100%"
            height="420"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Pather Khonje Office Location"
          />
        </div>
      </section>
    </div>
  );
};

function Field({ label, children }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

export default Contact;
