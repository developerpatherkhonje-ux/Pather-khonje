import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Wifi, Car, Coffee, Dumbbell, Users } from 'lucide-react';
import apiService from '../services/api';

function formatRupeeRange(range) {
  if (!range || typeof range !== 'string') return range;
  const parts = range.split('-').map(p => p.trim()).filter(Boolean);
  if (parts.length === 2) {
    const left = parts[0].startsWith('₹') ? parts[0] : `₹ ${parts[0]}`;
    const right = parts[1].startsWith('₹') ? parts[1] : `₹ ${parts[1]}`;
    return `${left} - ${right}`;
  }
  // Single value fallback
  return range.startsWith('₹') ? range : `₹ ${range}`;
}

// Simple image carousel for hotel card
function HotelImageCarousel({ images = [], alt }) {
  const [index, setIndex] = useState(0);
  const total = images.length;

  if (!images || total === 0) {
    return (
      <div className="h-72 md:h-80 rounded-lg overflow-hidden bg-gray-100">
        <img src="/hotels/goa-hotel.png" alt={alt} className="w-full h-full object-cover" />
      </div>
    );
  }

  const goPrev = () => setIndex((prev) => (prev - 1 + total) % total);
  const goNext = () => setIndex((prev) => (prev + 1) % total);

  return (
    <div className="relative h-72 md:h-80 rounded-lg overflow-hidden bg-gray-100">
      <img
        src={images[index]}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-300"
      />

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-1 shadow"
            aria-label="Previous image"
          >
            <img src="/hotels/arrow-left.png" alt="Prev" className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-1 shadow"
            aria-label="Next image"
          >
            <img src="/hotels/arrow-right.png" alt="Next" className="h-6 w-6" />
          </button>
        </>
      )}
    </div>
  );
}

function HotelPlace() {
  const { placeId } = useParams();
  const [hotels, setHotels] = useState([]);
  const [placeName, setPlaceName] = useState('');
  const [placeImage, setPlaceImage] = useState('');
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
        // Sort hotels alphabetically by name
        const sortedHotels = (response.data.hotels || []).sort((a, b) => 
          (a.name || '').localeCompare(b.name || '', 'en', { sensitivity: 'base' })
        );
        setHotels(sortedHotels);
        setPlaceName(response.data.place?.name || '');

        // Derive primary image for the place to use in hero background
        const place = response.data.place || {};
        const primaryImage =
          place.image && typeof place.image === 'string' && place.image.trim()
            ? apiService.toAbsoluteUrl(place.image)
            : (place.images && place.images.length > 0
                ? apiService.toAbsoluteUrl(place.images[0].url || place.images[0].secure_url || place.images[0])
                : '');
        setPlaceImage(primaryImage || '');
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
      {/* Header full-bleed background (edge-to-edge) */}
      <section className="relative text-white overflow-hidden min-h-[25vh] md:min-h-[30vh]">
        {/* Background image filling the area */}
        {placeImage && (
          <img
            src={placeImage}
            alt={placeName}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
          />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 flex flex-col justify-center h-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <nav className="text-sm mb-4 opacity-90">
              <Link to="/hotels" className="hover:underline">Hotels</Link>
              <span className="mx-2">›</span>
              <span>{placeName}</span>
            </nav>
            <div className="text-center mb-3">
              <h1 className="text-4xl md:text-5xl font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                Our Associate Hotels in {placeName}
              </h1>
            </div>
            <p className="text-lg md:text-xl opacity-95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] text-center max-w-3xl mx-auto">
              Discover premium accommodations in this beautiful destination
            </p>
            {error && (
              <div className="mt-4 p-3 bg-red-500/30 border border-red-500/40 rounded-lg max-w-md mx-auto">
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
                  {/* Hotel Images with carousel */}
                  <div className="space-y-4">
                    <HotelImageCarousel
                      images={(hotel.images || []).slice(0, 5).map((img) => (img.url || img.secure_url || img))}
                      alt={hotel.name}
                    />
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
                      <p className="text-2xl font-bold text-sky-600 mb-4">{formatRupeeRange(hotel.priceRange)}</p>
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