import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Wifi, Car, Coffee, Dumbbell, Users, RefreshCw } from 'lucide-react';
import apiService from '../services/api';

function HotelPlace() {
  const { placeId } = useParams();
  const [hotels, setHotels] = useState([]);
  const [placeName, setPlaceName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlaceHotels();
  }, [placeId]);

  const fetchPlaceHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getHotelsByPlace(placeId);
      if (response.success) {
        setHotels(response.data.hotels || []);
        setPlaceName(response.data.place?.name || '');
      }
    } catch (err) {
      console.error('Error fetching place hotels:', err);
      setError('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case 'wi-fi':
        return <Wifi className="h-4 w-4" />;
      case 'parking':
        return <Car className="h-4 w-4" />;
      case 'restaurant':
        return <Coffee className="h-4 w-4" />;
      case 'gym':
        return <Dumbbell className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const handleWhatsAppBooking = (hotel) => {
    const message = `Hi! I'm interested in booking "${hotel.name}" in ${placeName}. Price range: ${hotel.priceRange}. Please provide availability and booking details.`;
    window.open(`https://wa.me/917439857694?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            {[...Array(2)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="h-64 bg-gray-300 rounded"></div>
                  <div className="lg:col-span-2 space-y-4">
                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="flex space-x-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-8 w-16 bg-gray-300 rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Header */}
      <section className="py-12 gradient-bg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <nav className="text-sm mb-4 opacity-80">
              <Link to="/hotels" className="hover:underline">Hotels</Link>
              <span className="mx-2">›</span>
              <span>{placeName}</span>
            </nav>
            <div className="flex justify-center items-center space-x-4 mb-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                Hotels in {placeName}
              </h1>
              <button
                onClick={fetchPlaceHotels}
                disabled={loading}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">Refresh</span>
              </button>
            </div>
            <p className="text-xl opacity-90">
              Discover premium accommodations in this beautiful destination
            </p>
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg max-w-md mx-auto">
                <p className="text-red-100 text-sm">{error}</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Hotels List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {hotels.map((hotel, index) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                  {/* Hotel Images */}
                  <div className="space-y-4">
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <img
                        src={apiService.toAbsoluteUrl(hotel.images[0])}
                        alt={hotel.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {hotel.images.length > 1 && (
                      <div className="grid grid-cols-2 gap-2">
                        {hotel.images.slice(1, 3).map((image, imgIndex) => (
                          <div key={imgIndex} className="aspect-video rounded-lg overflow-hidden">
                            <img
                              src={apiService.toAbsoluteUrl(image)}
                              alt={`${hotel.name} ${imgIndex + 2}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Hotel Details */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">{hotel.name}</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{hotel.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{hotel.address}</span>
                      </div>
                      <p className="text-2xl font-bold text-sky-600 mb-4">{hotel.priceRange}</p>
                    </div>

                    {/* Amenities */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {hotel.amenities.map((amenity) => (
                          <div
                            key={amenity}
                            className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg"
                          >
                            {getAmenityIcon(amenity)}
                            <span className="text-sm text-gray-700">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Check-in/out */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Check-in</h4>
                        <p className="text-gray-600">{hotel.checkIn}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Check-out</h4>
                        <p className="text-gray-600">{hotel.checkOut}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                      <Link
                        to={`/hotel/${hotel.id}`}
                        className="flex-1 bg-gray-100 text-gray-700 text-center py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleWhatsAppBooking(hotel)}
                        className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300"
                      >
                        Book on WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* No Hotels Message */}
      {hotels.length === 0 && !loading && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                No Hotels Available
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                We're working on adding hotels for this destination.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center bg-sky-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-sky-700 transition-all duration-300"
              >
                Contact Us for Recommendations
              </Link>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}

export default HotelPlace;