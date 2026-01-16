import React from "react";

const WhyPatherKhonje = () => {
  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Left Column */}
          <div className="w-full lg:w-1/3">
            <h2 className="font-serif text-3xl md:text-4xl text-midnight-ocean mb-6 relative inline-block">
              Why travel with <br /> Pather Khonje?
              <span className="absolute bottom-1 left-0 w-full h-[2px] bg-soft-gold/40"></span>
            </h2>
            <a
              href="/website/about"
              className="inline-block mt-4 text-sm font-sans font-bold text-midnight-ocean uppercase tracking-widest border-b border-midnight-ocean pb-1 hover:text-horizon-blue hover:border-horizon-blue transition-colors"
            >
              Learn More
            </a>
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 relative">
            {/* Vertical Rule */}
            <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-midnight-ocean/10 hidden md:block"></div>
            <div className="absolute left-[50%] top-0 bottom-0 w-[1px] bg-midnight-ocean/10 hidden md:block"></div>

            <div className="pl-0 md:pl-8">
              <h4 className="font-serif text-xl text-midnight-ocean mb-3">
                Local and trustworthy
              </h4>
              <p className="font-sans text-slate-gray leading-relaxed text-sm">
                Based in Kolkata with deep roots in every destination we offer.
                We don't just book trips; we craft experiences based on personal
                knowledge.
              </p>
            </div>
            <div className="pl-0 md:pl-8">
              <h4 className="font-serif text-xl text-midnight-ocean mb-3">
                Structured Itineraries
              </h4>
              <p className="font-sans text-slate-gray leading-relaxed text-sm">
                Every day is planned with care—balancing sightseeing, activity,
                and necessary rest. No rushed mornings or chaotic transfers.
              </p>
            </div>
            <div className="pl-0 md:pl-8">
              <h4 className="font-serif text-xl text-midnight-ocean mb-3">
                Comfort Focused
              </h4>
              <p className="font-sans text-slate-gray leading-relaxed text-sm">
                We handpick boutique hotels and reliable transport to ensure
                your journey is as comfortable as it is adventurous.
              </p>
            </div>
            <div className="pl-0 md:pl-8">
              <h4 className="font-serif text-xl text-midnight-ocean mb-3">
                24/7 Personal Support
              </h4>
              <p className="font-sans text-slate-gray leading-relaxed text-sm">
                From the moment you land until you return home, our dedicated
                support team is just a phone call away.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyPatherKhonje;
