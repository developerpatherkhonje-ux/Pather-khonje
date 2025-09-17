import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import hero6 from '/assets/hero6.jpg';
import apiService from '../services/api';

function Hotels() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getPlaces();
      if (response.success) {
        setPlaces(response.data.places);
      }
    } catch (err) {
      console.error('Error fetching places:', err);
      setError('Failed to load places');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20">
      {/* Header */}
      <section 
        className="py-20 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: "url('/assets/hero14.jpg')" }}
      >
        {/* Light overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white"
          >
            <div className="flex justify-center items-center space-x-4 mb-6">
              <h1 className="text-5xl md:text-6xl font-bold">Hotels & Destinations</h1>
            </div>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Discover premium accommodations in India's most beautiful destinations
            </p>
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg max-w-md mx-auto">
                <p className="text-red-100 text-sm">{error}</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Places Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="h-64 bg-gray-300"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded mb-4"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-3 bg-gray-300 rounded w-20"></div>
                        <div className="h-3 bg-gray-300 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {places.map((place, index) => (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/website/hotels/${place.id || place._id}`}>
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover-3d group">
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={place.image}
                          alt={place.name}
                          loading='lazy'
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-4 right-4">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{place.rating}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{place.name}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{place.description}</p>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-gray-500">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="text-sm">{place.hotelsCount} Hotels</span>
                          </div>
                          
                          <span className="text-sky-600 font-semibold group-hover:text-sky-700 transition-colors">
                            Explore →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Can't Find Your Destination?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              We're constantly adding new destinations and hotels. Contact us for 
              custom bookings and special requests.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center bg-sky-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-sky-700 transition-all duration-300 hover:transform hover:scale-105"
            >
              Contact Us
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default Hotels;