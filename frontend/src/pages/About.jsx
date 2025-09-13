import React from 'react';
import { motion } from 'framer-motion';
import { Users, Award, Globe, Heart, Target, Eye } from 'lucide-react';
import hero5 from "/assets/hero5.jpeg";
import hero3 from "/assets/hero3.jpeg";

function About() {
  const values = [
    {
      icon: Heart,
      title: 'Passion for Travel',
      description: 'We live and breathe travel, bringing genuine enthusiasm to every journey we plan.'
    },
    {
      icon: Users,
      title: 'Customer First',
      description: 'Your satisfaction is our priority. We go above and beyond to exceed expectations.'
    },
    {
      icon: Award,
      title: 'Quality Service',
      description: 'Excellence in every detail, from planning to execution of your perfect trip.'
    },
    {
      icon: Globe,
      title: 'Global Network',
      description: 'Partnerships worldwide ensure authentic experiences in every destination.'
    }
  ];

  const team = [
    {
      name: 'Soma Shah Mitra',
      position: 'Proprietor',
      experience: 'Pather Khonje',
      speciality: 'Travel & Tourism'
    }
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section 
        className="py-20 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: "url('/assets/hero14.jpg')" }}
      >
        {/* Light overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">About Pather Khonje</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Creating extraordinary travel experiences since 2015. We believe every journey should be 
              "A tour that never seen before."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded in 2015 in the heart of Kolkata, Pather Khonje began with a simple vision: 
                  to create travel experiences that go beyond the ordinary. Our founder, inspired by 
                  the rich cultural heritage of Bengal and the spirit of exploration, set out to 
                  redefine how people experience travel.
                </p>
                <p>
                  What started as a small travel agency has grown into a trusted name in the industry, 
                  serving over 2000 satisfied customers across India and internationally. We specialize 
                  in creating personalized journeys that capture the essence of each destination while 
                  ensuring comfort, safety, and unforgettable memories.
                </p>
                <p>
                  Today, with our main office in Behala and a branch in BBD Bag, we continue to 
                  expand our horizons, always staying true to our core mission of delivering 
                  exceptional travel experiences.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl p-8 text-white">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <h3 className="text-3xl font-bold mb-2">2000+</h3>
                    <p className="text-sm opacity-90">Happy Travelers</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-3xl font-bold mb-2">50+</h3>
                    <p className="text-sm opacity-90">Destinations</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-3xl font-bold mb-2">10+</h3>
                    <p className="text-sm opacity-90">Years Experience</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-3xl font-bold mb-2">4.9⭐</h3>
                    <p className="text-sm opacity-90">Customer Rating</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20"></div>
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-green-400 rounded-full opacity-20"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-6">
                <Target className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide exceptional travel experiences that create lasting memories, 
                foster cultural understanding, and inspire a love for exploration. We are 
                committed to delivering personalized service that exceeds expectations 
                while promoting responsible and sustainable tourism.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-6">
                <Eye className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To become the most trusted and innovative travel company in India, 
                known for creating unique and transformative travel experiences. 
                We envision a world where travel brings people together, breaks down 
                barriers, and creates a more connected and understanding global community.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide every decision we make and every service we provide
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-6 group-hover:bg-sky-200 transition-colors duration-300">
                  <value.icon className="h-8 w-8 text-sky-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Leader</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dedicated to making your travel dreams come true
            </p>
          </motion.div>

          <div className="flex justify-center">
            <div className="w-full max-w-md">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center hover-3d"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-sky-600 font-medium mb-2">{member.position}</p>
                <p className="text-sm text-gray-500">{member.speciality}</p>
              </motion.div>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 gradient-bg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose Pather Khonje?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div>
                <h3 className="text-2xl font-semibold mb-4">Personalized Service</h3>
                <p className="opacity-90">Every package is tailored to your preferences and budget</p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4">24/7 Support</h3>
                <p className="opacity-90">Round-the-clock assistance throughout your journey</p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4">Best Price Guarantee</h3>
                <p className="opacity-90">Competitive pricing without compromising on quality</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
export default About;