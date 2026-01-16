import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  Check,
  X,
  MessageCircle,
  Phone,
  ArrowRight,
} from "lucide-react";
import apiService from "../services/api";

// Dummy Data matching the screenshot exactly
const PACKAGE_DATA = {
  id: "himalayan-sanctuary",
  name: "Himalayan Sanctuary",
  tagline: "5 DAYS / 4 NIGHTS  |  SMALL GROUP (MAX 8)  |  TOUR PACKAGE",
  images: [
    "https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Scenic canyon/mountain image
  ],
  price: "₹18,500",
  priceUnit: "per person",
  description: [
    "Immerse yourself in the quiet majesty of the Himalayas. This journey is designed for those who crave nature, solitude, and a deliberate pause from the hectic pace of modern life. Walk through ancient rhododendron forests, and witness the sunrise over snow-capped peaks in absolute silence.",
    "We combine comfort with exploration, ensuring that every evening brings you back to a warm fire, a cozy mountain lodge, and a hearty meal crafted from locally-sourced organics. This is the Himalayan experience as it should be.",
  ],
  details: {
    bestTime: "Oct - Mar",
    groupSize: "Max 8 Travelers",
    idealFor: "Leisure & Nature",
    route: "Bagdogra -> NJP",
  },
  highlights: [
    "Unrivalled views of Mt. Kanchenjunga",
    "Sunrise hike up to stunning viewpoints",
    "Traditional organic dining experience",
    "Stay in heritage colonial bungalows",
    "Visit to a working high-altitude tea estate",
    "Monastery meditation session",
  ],
  itinerary: [
    {
      day: "01",
      title: "Arrival into the Hills",
      desc: "Arrive at Bagdogra/New Jalpaiguri. Scenic drive up the winding roads. Check in to your heritage stay and enjoy the evening at leisure.",
      sub: "TRANSFER • WELCOME DINNER",
    },
    {
      day: "02",
      title: "Peace & Monasteries",
      desc: "A gentle morning walk through pine forests to visit the oldest local monastery. Afternoon tea tasting session.",
      sub: "TREKKING • CULTURAL TOUR",
    },
    {
      day: "03",
      title: "The High Vantage",
      desc: "Early morning drive to witness the sunrise over the peaks. Picnic lunch by the river, followed by a visit to the local market for crafts.",
      sub: "SIGHTSEEING • LEISURE",
    },
    {
      day: "04",
      title: "Departure",
      desc: "After a relaxed breakfast, we transfer you back to the airport or station for your onward journey.",
      sub: "TRANSFER • BREAKFAST",
    },
  ],
  inclusions: [
    "All boutique accommodation",
    "Breakfast and Dinner daily",
    "Private luxury vehicle",
    "Expert tour guide",
    "All entry permits",
  ],
  exclusions: [
    "Airfare or train tickets",
    "Lunch and extra snacks",
    "Personal insurance",
    "Travel souvenirs",
    "Camera / Video charges",
  ],
};

const PackageDetails = () => {
  const { packageId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        const response = await apiService.getPackageById(packageId);
        if (response.success && response.data.package) {
          const pkg = response.data.package;
          // Flatten/Normalize API data to UI structure
          setData({
            id: pkg.id,
            name: pkg.name,
            tagline: `${pkg.duration || "Flexible"} | ${
              pkg.groupSize || "Flexible"
            } | TOUR PACKAGE`,
            images: pkg.image
              ? [apiService.toAbsoluteUrl(pkg.image)]
              : [
                  "https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=1176&auto=format&fit=crop",
                ],
            price: `₹${pkg.price?.toLocaleString()}`,
            priceUnit: "per person",
            description: pkg.description
              ? [pkg.description]
              : [
                  "Experience the journey of a lifetime with our carefully curated package.",
                ],
            details: {
              bestTime: pkg.bestTime || "All Year",
              groupSize: pkg.groupSize || "Flexible",
              idealFor: pkg.category
                ? pkg.category.toUpperCase()
                : "Leisure & Nature",
              route: "See Itinerary", // Backend doesn't have route field
            },
            highlights: pkg.highlights || [
              "Comfortable accommodation",
              "Sightseeing transfers",
              "Breakfast included",
            ],
            // Fake itinerary derived from description since backend lacks it
            itinerary: [
              {
                day: "Overview",
                title: "Trip Overview",
                desc:
                  pkg.description ||
                  "Detailed itinerary will be provided upon booking.",
                sub: "HIGHLIGHTS",
              },
            ],
            inclusions: [
              "Accommodation",
              "Meals as specified",
              "Transfers",
              "Taxes",
            ],
            exclusions: ["Airfare", "Personal expenses", "Insurance"],
          });
        } else {
          setError("Package not found");
        }
      } catch (err) {
        console.error("Error fetching package details:", err);
        setError("Failed to load package details");
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      fetchPackage();
    }
  }, [packageId]);

  if (loading)
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        Loading...
      </div>
    );
  if (error || !data)
    return (
      <div className="min-h-screen bg-white flex justify-center items-center text-red-500">
        {error || "Package not found"}
      </div>
    );

  return (
    <div className="bg-white min-h-screen font-sans text-midnight-ocean pt-24 pb-20">
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-5xl md:text-6xl font-serif text-midnight-ocean mb-4">
              {data.name}
            </h1>
            <p className="text-xs font-bold tracking-[0.2em] text-soft-gold uppercase mb-8">
              {data.tagline}
            </p>
          </div>
          <div className="hidden md:flex gap-4 text-xs font-bold tracking-widest text-gray-400 uppercase">
            <Link to="/" className="hover:text-midnight-ocean">
              Home
            </Link>{" "}
            /
            <Link to="/website/packages" className="hover:text-midnight-ocean">
              Packages
            </Link>{" "}
            /<span className="text-midnight-ocean">{data.name}</span>
          </div>
        </div>

        {/* HERO IMAGE */}
        <div className="w-full h-[500px] overflow-hidden relative mb-16">
          <img
            src={data.images[0]}
            alt={data.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-16 items-start">
          {/* MAIN CONTENT (LEFT) */}
          <div className="w-full lg:w-2/3">
            {/* THE EXPERIENCE */}
            <div className="mb-16">
              <h2 className="text-3xl font-serif mb-6 text-midnight-ocean">
                The Experience
              </h2>
              <div className="space-y-6 text-slate-600 text-lg font-light leading-relaxed">
                {data.description.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* KEY DETAILS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-t border-b border-gray-100 mb-16">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Best Time
                </div>
                <div className="text-midnight-ocean font-medium">
                  {data.details.bestTime}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Ideal For
                </div>
                <div className="text-midnight-ocean font-medium">
                  {data.details.idealFor}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Group Size
                </div>
                <div className="text-midnight-ocean font-medium">
                  {data.details.groupSize}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Starts / Ends
                </div>
                <div className="text-midnight-ocean font-medium">
                  {data.details.route}
                </div>
              </div>
            </div>

            {/* HIGHLIGHTS */}
            <div className="mb-16">
              <h2 className="text-3xl font-serif mb-8 text-midnight-ocean">
                Highlights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                {data.highlights.map((highlight, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-soft-gold rounded-full mt-2.5 flex-shrink-0" />
                    <span className="text-slate-600 font-light">
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ITINERARY */}
            <div className="mb-16">
              <h2 className="text-3xl font-serif mb-10 text-midnight-ocean">
                Itinerary
              </h2>
              <div className="space-y-12">
                {data.itinerary.map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="text-2xl font-serif text-soft-gold/40 group-hover:text-soft-gold transition-colors font-bold pt-1 w-12 flex-shrink-0">
                      {item.day}
                    </div>
                    <div className="flex-grow pb-12 border-b border-gray-50 last:border-0 last:pb-0">
                      <h3 className="text-xl font-serif text-midnight-ocean mb-3">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 font-light mb-4 leading-relaxed">
                        {item.desc}
                      </p>
                      <div className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                        {item.sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WHAT'S INCLUDED */}
            <div className="flex flex-col md:flex-row gap-12">
              <div className="flex-1">
                <h2 className="text-2xl font-serif mb-6 text-midnight-ocean">
                  What's Included
                </h2>
                <ul className="space-y-3">
                  {data.inclusions.map((inc, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-slate-600 font-light text-sm"
                    >
                      <Check className="w-4 h-4 text-green-600" /> {inc}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-serif mb-6 text-midnight-ocean">
                  Not Included
                </h2>
                <ul className="space-y-3">
                  {data.exclusions.map((exc, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-slate-600 font-light text-sm"
                    >
                      <X className="w-4 h-4 text-red-400" /> {exc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* SIDEBAR (RIGHT) */}
          <div className="w-full lg:w-1/3 relative">
            <div className="sticky top-28 bg-white border border-gray-100 p-8 shadow-2xl shadow-gray-200/50">
              <div className="text-4xl font-serif text-midnight-ocean mb-1">
                {data.price}
              </div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
                {data.priceUnit}
              </div>

              {/* Date Dropdown Mockup */}
              <div className="mb-6 relative">
                <label className="text-xs font-bold text-midnight-ocean uppercase tracking-widest mb-2 block">
                  Select Dates
                </label>
                <select className="w-full p-4 border border-gray-200 text-sm font-medium text-slate-600 focus:outline-none focus:border-midnight-ocean appearance-none bg-transparent rounded-none">
                  <option>4th Oct - 9th Oct</option>
                  <option>11th Oct - 16th Oct</option>
                  <option>18th Oct - 23rd Oct</option>
                </select>
                <div className="absolute right-4 top-[38px] pointer-events-none">
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-midnight-ocean text-white py-4 px-6 text-xs font-bold uppercase tracking-[0.2em] hover:bg-deep-steel-blue transition-colors flex items-center justify-center gap-3">
                  <MessageCircle className="w-4 h-4" /> Book Via WhatsApp
                </button>
                <button className="w-full bg-white border border-gray-200 text-midnight-ocean py-4 px-6 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-50 transition-colors flex items-center justify-center gap-3">
                  <Phone className="w-4 h-4" /> Request Callback
                </button>
              </div>

              <div className="mt-8 text-[10px] text-gray-400 leading-relaxed text-center">
                Prices are subject to availability. <br />
                Free cancellation up to 7 days before departure.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM QUOTE */}
      <div className="bg-ice-blue/30 py-20 text-center px-4 mb-20">
        <p className="text-2xl md:text-3xl font-serif text-midnight-ocean italic max-w-3xl mx-auto leading-normal">
          "We plan every detail so you can focus on the journey."
        </p>
        <div className="w-12 h-1 bg-soft-gold mx-auto mt-8 rounded-full" />
      </div>

      {/* BOTTOM CTA */}
      <div className="text-center pb-10">
        <h2 className="text-3xl font-serif text-midnight-ocean mb-8">
          Ready to explore?
        </h2>
        <div className="flex justify-center gap-6">
          <button className="bg-midnight-ocean text-white px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase hover:bg-deep-steel-blue transition-colors">
            Send An Enquiry
          </button>
          <button className="bg-white border border-gray-200 text-midnight-ocean px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase hover:bg-gray-50 transition-colors flex items-center gap-2">
            <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageDetails;
