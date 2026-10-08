import React from "react";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FinalCTA = () => {
  const navigate = useNavigate();

  const openWhatsApp = () => {
    const message =
      "Hi Pather Khonje, please help me plan a custom hill trip.";
    window.open(
      `https://wa.me/917439857694?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <section className="relative min-h-[560px] overflow-hidden bg-[#071c23] px-5 py-20 text-white sm:px-6">
      <img
        src="/assets/home-mountain-premium.png"
        alt="Eastern Himalayan mountain route"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[#071c23]/78" />
      <div className="absolute inset-0 topographic-mask opacity-25" />

      <div className="relative z-10 mx-auto flex min-h-[400px] max-w-5xl flex-col items-center justify-center text-center">
        <span className="himalaya-kicker text-soft-gold">
          Start with one conversation
        </span>
        <h2 className="atelier-display mt-5 max-w-4xl text-5xl leading-[0.95] text-white md:text-7xl">
          Tell us the mountain you want. We will shape the road.
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-8 text-white/70">
          Share your dates, travellers and comfort level. The team will suggest
          a route with stays, transfers and practical day-by-day pacing.
        </p>
        <div className="mt-9 flex flex-col gap-4 sm:flex-row">
          <button
            onClick={() => navigate("/contact")}
            className="bg-white px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#071c23] transition hover:bg-soft-gold focus:outline-none focus:ring-2 focus:ring-white/80"
          >
            Send Enquiry
          </button>
          <button
            onClick={openWhatsApp}
            className="inline-flex items-center justify-center gap-3 border border-white/25 bg-white/10 px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white backdrop-blur transition hover:border-soft-gold hover:bg-white/16 focus:outline-none focus:ring-2 focus:ring-soft-gold/70"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
