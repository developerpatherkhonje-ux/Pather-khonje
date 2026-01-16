import React from "react";
import Hero from "../components/home/Hero";
import TrustMetrics from "../components/home/TrustMetrics";
import CuratedExperiences from "../components/home/CuratedExperiences";
import FeaturedDestinations from "../components/home/FeaturedDestinations";
import WhyPatherKhonje from "../components/home/WhyPatherKhonje";
import Testimonials from "../components/home/Testimonials";
import FinalCTA from "../components/home/FinalCTA";
import OurServices from "../components/home/OurServices";

const Home = () => {
  return (
    <div className="min-h-screen font-sans bg-white selection:bg-horizon-blue selection:text-white">
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
