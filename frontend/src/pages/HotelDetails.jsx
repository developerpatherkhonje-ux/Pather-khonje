import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Wifi, Car, Coffee, Dumbbell, Users, ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';

function HotelDetails() {
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - in real app, this would come from API based on hotelId
    const mockHotel = {
      id: hotelId || '1',
      name: 'The Grand Mountain Resort',
      images: [
        'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
        'https://images.pexels.com/photos/775219/pexels-photo-775219.jpeg',
        'https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg',
        'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg',
        'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg'
      ],
      rating: 4.8,
      reviews: 142,
      address: 'Hill Top Road, Near Mall Road, Darjeeling - 734101',
      amenities: ['Wi-Fi', 'Parking', 'Restaurant', 'Gym', 'Spa', 'Pool', 'Room Service', 'Laundry'],
      checkIn: '2:00 PM',
      checkOut: '11:00 AM',
      priceRange: '₹5,000 - ₹12,000',
      description: 'Experience luxury amidst the serene mountains at The Grand Mountain Resort. Our hotel offers breathtaking views of the Himalayas, world-class amenities, and exceptional service. Perfect for both leisure and business travelers, we provide an unforgettable stay with comfortable rooms, fine dining, and easy access to local attractions.',
      roomTypes: [
        {
          type: 'Deluxe Room',
          price: 5000,
          features: ['Mountain View', 'King Bed', 'Mini Bar', 'Wi-Fi']
        },
        {
          type: 'Premium Suite',
          price: 8000,
          features: ['Valley View', 'Separate Living Area', 'Jacuzzi', 'Balcony']
        },
        {
          type: 'Royal Suite',
          price: 12000,
          features: ['Panoramic View', '2 Bedrooms', 'Private Terrace', 'Butler Service']
        }
      ]
    };

    setTimeout(() => {
      setHotel(mockHotel);
      setLoading(false);
    }, 1000);
  }, [hotelId]);

  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case 'wi-fi':
        return <Wifi className="h-5 w-5" />;
      case 'parking':
        return <Car className="h-5 w-5" />;
      case 'restaurant':
        return <Coffee className="h-5 w-5" />;
      case 'gym':
        return <Dumbbell className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const nextImage = () => {
    if (hotel) {
      setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length);
    }
  };

  const prevImage = () => {
    if (hotel) {
      setCurrentImageIndex((prev) => (prev - 1 + hotel.images.length) % hotel.images.length);
    }
  };

  const handleWhatsAppBooking = (roomType) => {
    if (!hotel) return;
    
    let message = `Hi! I'm interested in booking "${hotel.name}" at ${hotel.address}.`;
    
    if (roomType) {
      const room = hotel.roomTypes.find(r => r.type === roomType);
      message += ` Room Type: ${roomType} (₹${room?.price.toLocaleString()}/night).`;
    } else {
      message += ` Price range: ${hotel.priceRange}.`;
    }
    
    message += ' Please provide availability and booking details.';
    
    window.open(`https://wa.me/917439857694?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-64 md:h-96 bg-gray-300 rounded-2xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-20 bg-gray-300 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-300 rounded"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Hotel Not Found</h1>
          <p className="text-gray-600">The hotel you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <section className="relative">
        <div className="h-64 md:h-96 relative overflow-hidden">
          <motion.img
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            src={
              hotel.images[currentImageIndex] && hotel.images[currentImageIndex].url
                ? hotel.images[currentImageIndex].url
                : hotel.images[currentImageIndex] || '/hotels/goa-hotel.png'
            }
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
          
          {/* Navigation Buttons */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Image Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {hotel.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Hotel Details */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{hotel.rating}</span>
                        <span className="text-gray-600">({hotel.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-sky-600">{hotel.priceRange}</p>
                    <p className="text-gray-600">per night</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600 mb-6">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{hotel.address}</span>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Hotel</h2>
                <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
              </motion.div>

              {/* Amenities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {hotel.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm border"
                    >
                      <div className="text-sky-600">
                        {getAmenityIcon(amenity)}
                      </div>
                      <span className="text-gray-700 font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Room Types */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Room Types</h2>
                <div className="space-y-4">
                  {hotel.roomTypes.map((room, index) => (
                    <div key={room.type} className="bg-white rounded-lg p-6 shadow-sm border">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">{room.type}</h3>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-sky-600">₹{room.price.toLocaleString()}</p>
                          <p className="text-gray-600 text-sm">per night</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {room.features.map((feature) => (
                          <span
                            key={feature}
                            className="bg-sky-100 text-sky-700 text-sm px-3 py-1 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => handleWhatsAppBooking(room.type)}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300"
                      >
                        Book This Room
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-sky-600" />
                    <div>
                      <p className="font-medium text-gray-900">Check-in</p>
                      <p className="text-gray-600">{hotel.checkIn}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-sky-600" />
                    <div>
                      <p className="font-medium text-gray-900">Check-out</p>
                      <p className="text-gray-600">{hotel.checkOut}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Booking Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-sky-100"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Book This Hotel</h3>
                <div className="mb-6">
                  <p className="text-3xl font-bold text-sky-600 mb-2">{hotel.priceRange}</p>
                  <p className="text-gray-600">Best rates guaranteed</p>
                </div>
                
                <button
                  onClick={() => handleWhatsAppBooking()}
                  className="w-full bg-green-600 text-white py-4 px-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-all duration-300 mb-4"
                >
                  Book on WhatsApp
                </button>
                
                <div className="text-center text-sm text-gray-500">
                  <p>No booking fees</p>
                  <p>Instant confirmation</p>
                </div>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-sky-50 rounded-2xl p-6 border border-sky-200"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700">Call us for instant booking:</p>
                  <p className="font-semibold text-sky-600">+91 7439857694</p>
                  <p className="text-gray-700">Available 24/7</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HotelDetails;