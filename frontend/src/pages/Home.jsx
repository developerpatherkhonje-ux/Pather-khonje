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
    <div className="premium-page min-h-screen font-sans selection:bg-soft-gold selection:text-midnight-ocean">
      <SEO
        title="Premium Mountain Travel Planning"
        description="Plan premium hill journeys, verified hotels and custom family routes with Pather Khonje."
        keywords="Pather Khonje, premium hill travel, mountain tour packages, boutique hotels, curated family trips"
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
