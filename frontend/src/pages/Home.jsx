import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, MapPin, Calendar, Plane, Camera, Heart, User, 
  Hotel, Car, Train, Briefcase, Building2, Map, Gift, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user } = useAuth();
  
  // Hero slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroImages = [
    '/assets/hero1.jpg',
    '/assets/hero11.jpg', 
    '/assets/hero12.jpg'
  ];

  // Auto-slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);
  
  const stats = [
    { icon: Users, label: 'Happy Travelers', value: '2000+' },
    { icon: MapPin, label: 'Destinations', value: '50+' },
    { icon: Calendar, label: 'Years Experience', value: '10+' },
    { icon: Star, label: 'Customer Rating', value: '4.9' },
  ];

  const features = [
    {
      icon: Plane,
      title: 'Premium Travel Packages',
      description: 'Carefully curated travel experiences with luxury accommodations and personalized service.'
    },
    {
      icon: MapPin,
      title: 'Expert Local Guides',
      description: 'Professional guides who know the hidden gems and best experiences in each destination.'
    },
    {
      icon: Camera,
      title: 'Memorable Experiences',
      description: 'Create lasting memories with unique activities and breathtaking locations.'
    },
    {
      icon: Heart,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to ensure your journey is smooth and worry-free.'
    },
  ];

  const testimonials = [
    {
      icon: User,
      name: "Aditi Sharma",
      position: "Solo Traveler",
      testimonial:
        "This was the most seamless trip I’ve ever had. Everything was perfectly organized, and I could just enjoy the experience without worrying about the details!"
    },
    {
      icon: User,
      name: "Rahul Mehta",
      position: "Adventure Enthusiast",
      testimonial:
        "The team made my dream trekking adventure come true. From safety to local insights, every step of the journey was handled with care."
    },
    {
      icon: User,
      name: "Sophia Lee",
      position: "Family Vacationer",
      testimonial:
        "Planning a family trip usually feels stressful, but this time it was a breeze. My kids loved every moment, and we created memories for a lifetime."
    }
  ];

  const services = [
  {
    icon: Hotel,
    image: "/service/hotel-booking.jpg",
    service: "Hotel Booking",
    description: "Find and book the best hotels worldwide with exclusive deals tailored to your budget."
  },
  {
    icon: Briefcase,
    image: "/service/b2b-tour.jpg",
    service: "B2B Tour Package",
    description: "Customized bulk travel packages for agencies and partners at unbeatable rates."
  },
  {
    icon: Car,
    image: "/service/car-rental.jpg",
    service: "Car Rental",
    description: "Choose from a wide range of vehicles for your trip with flexible rental plans."
  },
  {
    icon: Map,
    image: "/service/tour-planner.jpg",
    service: "Tour Planner",
    description: "Get a personalized itinerary designed for a stress-free and memorable journey."
  },
  {
    icon: Gift,
    image: "/service/dest-wedding.jpg",
    service: "Destination Wedding Planner",
    description: "Turn your dream wedding into reality at the most picturesque destinations."
  },
  {
    icon: Users,
    image: "/service/corp-tours.jpg",
    service: "Corporate Tour",
    description: "We organize engaging and seamless corporate tours for your team and business needs."
  },
  {
    icon: Building2,
    image: "/service/office-picnic.jpg",
    service: "Office Picnic",
    description: "Enjoy a refreshing day out with perfectly planned office getaways and picnics."
  },
  {
    icon: Calendar,
    image: "/service/corp-meeting.jpg",
    service: "Corporate Meetings",
    description: "Professional and hassle-free corporate meeting arrangements across destinations."
  },
  {
    icon: Map,
    image: "/service/event-management.jpg",
    service: "Event Management",
    description: "From small gatherings to large-scale events, we handle every detail flawlessly."
  },
    {
      icon: Train,
      image: "/service/train-booking.jpg",
      service: "Train Ticket Booking",
      description: "Fast and reliable train ticket booking with real-time availability and offers."
    },
    {
      icon: Plane,
      image: "/service/flight-booking.jpg",
      service: "Flight Booking",
      description: "Book domestic and international flights at the best competitive prices."
    },
    {
      icon: Shield,
      image: "/service/travel-insurance.jpg",
      service: "Travel Insurance",
      description: "Comprehensive coverage for medical emergencies, trip cancellations, and lost baggage so you can travel worry-free."
    }
];

  return (
    <div className="pt-16">
      {/* Hero Section with Slideshow */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Slideshow Container */}
        <div className="absolute inset-0 overflow-hidden">
          {heroImages.map((image, index) => (
            <motion.div
              key={index}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${image})` }}
              initial={{ x: '100%' }}
              animate={{ 
                x: currentSlide === index ? '0%' : '100%'
              }}
              transition={{ 
                duration: 0.8, 
                ease: [0.25, 0.1, 0.25, 1],
                type: "tween"
              }}
            />
          ))}
        </div>

        {/* Black transparent overlay */}
        

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Welcome Message */}
            {user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mb-8"
              >
                <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-medium">
                    Welcome, {user.name}!
                  </span>
                </div>
              </motion.div>
            )}
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Pather Khonje
            </h1>
            <p className="text-xl md:text-2xl mb-4 font-light font-bold">
              "A tour that never seen before."
            </p>
            <p className="text-lg md:text-xl mb-12 max-w-3xl mx-auto opacity-90 font-bold">
              Discover extraordinary destinations with our premium travel packages. 
              Experience luxury, adventure, and memories that last a lifetime.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/website/packages"
                className="group bg-white text-sky-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 flex items-center space-x-2 hover:transform hover:scale-105"
              >
                <span>Explore Packages</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/website/hotels"
                className="group border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-sky-600 transition-all duration-300 flex items-center space-x-2 hover:transform hover:scale-105"
              >
                <span>Find Hotels</span>
                <MapPin className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
        >
          <div className="flex flex-col items-center space-y-2">
            <p className="text-sm">Scroll to explore</p>
            <div className="animate-bounce">
              <ArrowRight className="h-4 w-4 rotate-90" />
            </div>
          </div>
        </motion.div>

        {/* Slide Indicators */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-4 group-hover:bg-sky-200 transition-colors duration-300">
                  <stat.icon className="h-8 w-8 text-sky-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Do We Offer</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From planning to execution, we provide all-in-one travel services designed to make your journey effortless and unforgettable.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Service Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.service}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full">
                      <service.icon className="h-5 w-5 text-sky-600" />
                    </div>
                  </div>
                </div>
                
                {/* Service Content */}
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">{service.service}</h4>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to providing exceptional travel experiences that exceed your expectations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover-3d"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-sky-100 rounded-xl mb-6">
                  <feature.icon className="h-6 w-6 text-sky-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Travelers Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from our happy explorers who turned their journeys into unforgettable memories.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 flex items-center justify-center bg-sky-100 rounded-full mr-4">
                    <testimonial.icon className="h-6 w-6 text-sky-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.position}</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed italic">
                  "{testimonial.testimonial}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: "url('/assets/hero13.jpg')" }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-white"
    >
      <h2 className="text-4xl md:text-5xl font-bold mb-6">
        Ready for Your Next Adventure?
      </h2>
      <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
        Let us create an unforgettable journey tailored just for you. 
        Contact us today to start planning your dream vacation.
      </p>
      <Link
        to="/contact"
        className="inline-flex items-center space-x-2 bg-white text-sky-400 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 hover:transform hover:scale-105"
      >
        <span>Get In Touch</span>
        <ArrowRight className="h-5 w-5" />
      </Link>
    </motion.div>
  </div>
</section>
    </div>
  );
}

export default Home;