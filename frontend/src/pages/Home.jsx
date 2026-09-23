import React from "react";
import Hero from "../components/home/Hero";
import TrustMetrics from "../components/home/TrustMetrics";
import CuratedExperiences from "../components/home/CuratedExperiences";
import FeaturedDestinations from "../components/home/FeaturedDestinations";
import WhyPatherKhonje from "../components/home/WhyPatherKhonje";
import Testimonials from "../components/home/Testimonials";
import FinalCTA from "../components/home/FinalCTA";
import OurServices from "../components/home/OurServices";

import SEO from "../components/SEO";

const Home = () => {
  return (
    <div className="min-h-screen font-sans bg-white selection:bg-horizon-blue selection:text-white">
      <SEO
        title="Curated Travel Packages, Hotels & Custom Journeys"
        description="Plan premium tours, handpicked hotels, and custom journeys across Sikkim, Darjeeling, Vizag, Araku and beyond with Pather Khonje."
        keywords="Pather Khonje, Sikkim tour packages, Darjeeling hotels, Araku travel, curated travel India, custom tour planner"
      />
      <Hero />
      <TrustMetrics />
      <OurServices />
      <CuratedExperiences />
      <FeaturedDestinations />
      <WhyPatherKhonje />
      <Testimonials />
      <FinalCTA />
    </div>
  );
};

export default Home;
