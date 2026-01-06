import React from "react";

const FinalCTA = () => {
  return (
    <section className="relative w-full h-[500px] flex items-center justify-center bg-white overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop"
          alt="Mountain Landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-midnight-ocean/80 mix-blend-multiply"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <span className="font-sans text-xs font-bold text-soft-gold uppercase tracking-[0.2em] mb-4 block">
          Start Your Journey
        </span>
        <h2 className="font-serif text-5xl lg:text-6xl text-white mb-10 tracking-wide max-w-3xl mx-auto">
          Let’s plan your next <br /> adventure together.
        </h2>
        <button className="px-12 py-4 bg-white text-midnight-ocean font-sans font-bold text-xs tracking-[0.15em] uppercase hover:bg-slate-100 transition-colors shadow-2xl">
          Start Your Inquiry
        </button>
      </div>
    </section>
  );
};

export default FinalCTA;
