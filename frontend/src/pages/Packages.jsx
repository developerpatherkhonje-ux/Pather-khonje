import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import { Calendar, Users, MapPin, Star, Clock } from 'lucide-react';
import hero8 from '/assets/hero8.jpg';



const Packages = () => {
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const categories = [
    { id: 'all', name: 'All Packages' },
    { id: 'adventure', name: 'Adventure' },
    { id: 'heritage', name: 'Heritage' },
    { id: 'beach', name: 'Beach' },
    { id: 'mountain', name: 'Mountain' },
    { id: 'spiritual', name: 'Spiritual' }
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiService.listPackages();
        if (res.success) setPackages(res.data.packages || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredPackages = activeCategory === 'all'
    ? packages
    : packages.filter(pkg => ((pkg.category || '').toLowerCase()) === activeCategory);

  const handleWhatsAppBooking = (packageData) => {
    const message = `Hi! I'm interested in booking the "${packageData.name}" package (${packageData.duration}) for ₹${packageData.price.toLocaleString()}. Please provide more details.`;
    window.open(`https://wa.me/917439857694?text=${encodeURIComponent(message)}`, '_blank');
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
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Tour Packages</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Discover incredible destinations with our carefully crafted tour packages
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sub Navigation (Categories) - matches Gallery style */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-3 md:gap-4"
          >
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm md:text-base font-medium transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-sky-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-sky-100 hover:text-sky-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Packages from admin */}
      <section className="pt-12 pb-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-semibold text-gray-600">Loading packages...</h2>
              </motion.div>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-20">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">No Packages Available</h2>
                <p className="text-gray-600 mb-6">Please check back later.</p>
                <Link to="/website/contact" className="inline-flex items-center bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors">Contact Us</Link>
              </motion.div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredPackages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover-3d"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={apiService.toAbsoluteUrl(pkg.image) || '/public/hpackages/kerala.jpg'}
                      alt={pkg.name}
                      loading='lazy'
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {pkg.category && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-sky-600 font-semibold px-3 py-1 rounded-full text-sm shadow">
                          {(pkg.category || '').charAt(0).toUpperCase() + (pkg.category || '').slice(1)}
                        </span>
                      </div>
                    )}
                    {pkg.rating && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1 shadow">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{pkg.rating}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{pkg.name}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{pkg.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-sm">{pkg.duration}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-sky-600">₹{pkg.price?.toLocaleString?.() || pkg.price}</p>
                        <p className="text-xs text-gray-500">per person</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {pkg.bestTime && (
                        <div>
                          <p className="text-xs text-gray-500">Best Time</p>
                          <p className="text-sm text-gray-700 line-clamp-1">{pkg.bestTime}</p>
                        </div>
                      )}
                      {pkg.groupSize && (
                        <div>
                          <p className="text-xs text-gray-500">Group Size</p>
                          <p className="text-sm text-gray-700">{pkg.groupSize}</p>
                        </div>
                      )}
                    </div>
                    {Array.isArray(pkg.highlights) && pkg.highlights.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Highlights:</p>
                        <div className="flex flex-wrap gap-1">
                          {pkg.highlights.slice(0, 3).map((h) => (
                            <span key={h} className="bg-sky-100 text-sky-700 text-xs px-2 py-1 rounded">{h}</span>
                          ))}
                          {pkg.highlights.length > 3 && (
                            <span className="text-xs text-gray-500 px-2 py-1">+{pkg.highlights.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3 mt-2">
                      <Link
                        to={`/website/package/${pkg.id}`}
                        className="flex-1 bg-gray-100 text-gray-700 text-center py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleWhatsAppBooking(pkg)}
                        className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
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
              Need a Custom Package?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              We can create personalized tour packages based on your preferences, budget, and timeline.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center bg-sky-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-sky-700 transition-all duration-300 hover:transform hover:scale-105"
            >
              Get Custom Quote
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Packages;