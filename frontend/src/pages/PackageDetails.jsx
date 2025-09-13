import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, Star, Clock, Check, X } from 'lucide-react';

// Package data structure

const PackageDetails = () => {
  const { packageId } = useParams();
  const [packageData, setPackageData] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - in real app, this would come from API based on packageId
    const mockPackage = {
      id: packageId || '1',
      name: 'Himalayan Adventure',
      images: [
        'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg',
        'https://images.pexels.com/photos/1570264/pexels-photo-1570264.jpeg',
        'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg',
        'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg'
      ],
      description: 'Embark on the ultimate Himalayan adventure with our carefully crafted 7-day journey through some of the most spectacular mountain landscapes in the world. This package combines thrilling trekking experiences with comfortable accommodation and authentic local culture immersion.',
      duration: '7 Days 6 Nights',
      price: 25000,
      rating: 4.9,
      highlights: ['Trekking', 'Mountain Views', 'Camping', 'Adventure Sports', 'Local Culture', 'Photography'],
      category: 'adventure',
      itinerary: [
        {
          day: 1,
          title: 'Arrival and Base Camp Setup',
          description: 'Arrive at the base location, meet your guide team, and set up at the base camp.',
          activities: ['Airport pickup', 'Briefing session', 'Equipment check', 'Welcome dinner']
        },
        {
          day: 2,
          title: 'First Trek to Alpine Meadows',
          description: 'Begin your trekking journey with a moderate hike to beautiful alpine meadows.',
          activities: ['Morning breakfast', '6-hour trek', 'Lunch at viewpoint', 'Camp setup', 'Evening bonfire']
        },
        {
          day: 3,
          title: 'High Altitude Lake Visit',
          description: 'Trek to pristine high-altitude lakes with stunning mountain reflections.',
          activities: ['Early morning start', 'Lake photography', 'Picnic lunch', 'Acclimatization', 'Stargazing']
        },
        {
          day: 4,
          title: 'Peak Viewpoint Challenge',
          description: 'Challenge yourself with a trek to the highest viewpoint of the journey.',
          activities: ['Summit attempt', 'Panoramic views', 'Certificate ceremony', 'Celebration dinner']
        },
        {
          day: 5,
          title: 'Adventure Sports Day',
          description: 'Experience thrilling adventure sports including rock climbing and river crossing.',
          activities: ['Rock climbing', 'River rafting', 'Zip lining', 'Team activities', 'Skills training']
        },
        {
          day: 6,
          title: 'Cultural Immersion',
          description: 'Visit local villages and experience authentic mountain culture and traditions.',
          activities: ['Village visit', 'Local cuisine', 'Cultural show', 'Shopping', 'Farewell preparations']
        },
        {
          day: 7,
          title: 'Departure',
          description: 'Final breakfast and departure with unforgettable memories.',
          activities: ['Breakfast', 'Pack up', 'Group photos', 'Certificate distribution', 'Departure transfer']
        }
      ],
      inclusions: [
        'Accommodation in camps and guesthouses',
        'All meals (breakfast, lunch, dinner)',
        'Professional trek guide and support staff',
        'All necessary permits and entry fees',
        'Trekking equipment (tents, sleeping bags)',
        'First aid kit and emergency support',
        'Transportation from meeting point',
        'Certificate of completion'
      ],
      exclusions: [
        'Personal trekking gear (shoes, clothes)',
        'Travel insurance',
        'Alcoholic beverages',
        'Personal expenses and shopping',
        'Tips for guides and staff',
        'Emergency helicopter evacuation',
        'Meals during travel days',
        'Camera fees at certain locations'
      ],
      bestTime: 'March to June, September to November',
      groupSize: '6-12 participants'
    };

    setTimeout(() => {
      setPackageData(mockPackage);
      setLoading(false);
    }, 1000);
  }, [packageId]);

  const handleWhatsAppBooking = () => {
    if (!packageData) return;
    
    const message = `Hi! I'm interested in booking the "${packageData.name}" package (${packageData.duration}) for ₹${packageData.price.toLocaleString()} per person. Please provide availability and booking details. 

Package Details:
- Duration: ${packageData.duration}
- Group Size: ${packageData.groupSize}
- Best Time: ${packageData.bestTime}

Please let me know about. Available dates
2. Group discounts
3. Booking process
4. Payment options`;
    
    window.open(`https://wa.me/917439857694?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-64 md:h-96 bg-gray-300 rounded-2xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                <div className="h-20 bg-gray-300 rounded"></div>
                <div className="h-40 bg-gray-300 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-300 rounded"></div>
                <div className="h-20 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Package Not Found</h1>
          <p className="text-gray-600">The package you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Hero Section with Image Gallery */}
      <section className="relative">
        <div className="h-64 md:h-96 relative overflow-hidden">
          <motion.img
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            src={packageData.images[currentImageIndex]}
            alt={packageData.name}
            className="w-full h-full object-cover"
          />
          
          {/* Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {packageData.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Package Info Overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-end">
            <div className="text-white p-6 md:p-8">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">{packageData.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-lg">
                <div className="flex items-center space-x-1">
                  <Clock className="h-5 w-5" />
                  <span>{packageData.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-5 w-5" />
                  <span>{packageData.groupSize}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span>{packageData.rating}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Package</h2>
                <p className="text-gray-700 leading-relaxed mb-6">{packageData.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Best Time to Visit</p>
                    <p className="text-gray-600">{packageData.bestTime}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Group Size</p>
                    <p className="text-gray-600">{packageData.groupSize}</p>
                  </div>
                </div>

                {/* Highlights */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Highlights</h3>
                  <div className="flex flex-wrap gap-2">
                    {packageData.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Itinerary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Itinerary</h2>
                <div className="space-y-6">
                  {packageData.itinerary.map((day, index) => (
                    <div key={day.day} className="border-l-4 border-sky-600 pl-6 pb-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-sky-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                          {day.day}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{day.title}</h3>
                          <p className="text-gray-700 mb-3">{day.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {day.activities.map((activity, actIndex) => (
                              <span
                                key={actIndex}
                                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                              >
                                {activity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Inclusions & Exclusions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Inclusions */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center">
                    <Check className="h-5 w-5 mr-2" />
                    What's Included
                  </h3>
                  <ul className="space-y-2">
                    {packageData.inclusions.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2 text-gray-700">
                        <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Exclusions */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center">
                    <X className="h-5 w-5 mr-2" />
                    What's Not Included
                  </h3>
                  <ul className="space-y-2">
                    {packageData.exclusions.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2 text-gray-700">
                        <X className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Booking Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-6 shadow-lg sticky top-24"
              >
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-sky-600 mb-2">
                    ₹{packageData.price.toLocaleString()}
                  </div>
                  <p className="text-gray-600">per person</p>
                  <div className="flex items-center justify-center space-x-1 mt-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{packageData.rating}</span>
                    <span className="text-gray-600 text-sm">(Excellent)</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{packageData.duration}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Group Size</span>
                    <span className="font-medium">{packageData.groupSize}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Best Time</span>
                    <span className="font-medium text-sm">{packageData.bestTime}</span>
                  </div>
                </div>

                <button
                  onClick={handleWhatsAppBooking}
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition-all duration-300 mb-4"
                >
                  Book on WhatsApp
                </button>

                <div className="text-center text-sm text-gray-500 space-y-1">
                  <p>✓ Best price guarantee</p>
                  <p>✓ Instant confirmation</p>
                  <p>✓ Free cancellation up to 7 days</p>
                </div>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-sky-50 rounded-2xl p-6 border border-sky-200"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help Planning?</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                    <span>Free consultation with travel experts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                    <span>Customization available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                    <span>24/7 support during trip</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-sky-200">
                  <p className="font-semibold text-sky-600 mb-1">Call us now</p>
                  <p className="text-lg font-bold text-gray-900">+91 7439857694</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PackageDetails;