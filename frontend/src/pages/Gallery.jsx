import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import hero6 from '/assets/hero7.jpg';

function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'destinations', name: 'Destinations' },
    { id: 'hotels', name: 'Hotels' },
    { id: 'activities', name: 'Activities' },
    { id: 'food', name: 'Cuisine' }
  ];

  const images = [
    {
      id: 1,
      src: '/gallery/darjeeling-hills.jpg',
      category: 'destinations',
      title: 'Darjeeling Hills',
      description: 'Breathtaking mountain views and tea gardens'
    },
    {
      id: 2,
      src: '/gallery/luxury-resort.jpg',
      category: 'hotels',
      title: 'Luxury Resort',
      description: 'Premium accommodations with world-class amenities'
    },
    {
      id: 3,
      src: '/gallery/adventure-sports.jpeg',
      category: 'activities',
      title: 'Adventure Sports',
      description: 'Thrilling activities for adventure enthusiasts'
    },
    {
      id: 4,
      src: '/gallery/food.jpg',
      category: 'food',
      title: 'Local Cuisine',
      description: 'Authentic flavors and traditional dishes'
    },
    {
      id: 5,
      src: '/gallery/beach.jpeg',
      category: 'destinations',
      title: 'Beach Paradise',
      description: 'Crystal clear waters and pristine beaches'
    },
    {
      id: 6,
      src: '/gallery/boutique-hotel.jpg',
      category: 'hotels',
      title: 'Boutique Hotel',
      description: 'Unique design and personalized service'
    },
    {
      id: 7,
      src: '/gallery/cultural-exp.jpeg',
      category: 'activities',
      title: 'Cultural Experience',
      description: 'Immerse in local traditions and heritage'
    },
    {
      id: 8,
      src: '/gallery/street-food.jpg',
      category: 'food',
      title: 'Street Food',
      description: 'Delicious local street food experiences'
    },
    {
      id: 9,
      src: '/gallery/mountain-trek.jpg',
      category: 'destinations',
      title: 'Mountain Trek',
      description: 'Scenic trekking routes and nature walks'
    },
    {
      id: 10,
      src: '/gallery/city-skyline.jpg',
      category: 'destinations',
      title: 'City Skyline',
      description: 'Modern cityscapes and urban adventures'
    },
    {
      id: 11,
      src: '/gallery/heritage-hotel.jpg',
      category: 'hotels',
      title: 'Heritage Hotel',
      description: 'Historic properties with royal treatment'
    },
    {
      id: 12,
      src: '/gallery/wildlife-safari.jpg',
      category: 'activities',
      title: 'Wildlife Safari',
      description: 'Close encounters with exotic wildlife'
    }
  ];

  const filteredImages = activeCategory === 'all' 
    ? images 
    : images.filter(img => img.category === activeCategory);

  const openLightbox = (index) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % filteredImages.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? filteredImages.length - 1 : selectedImage - 1);
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
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Gallery</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Explore our collection of breathtaking destinations, luxurious accommodations, 
              and unforgettable experiences
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="pt-12 pb-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-sky-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-sky-100 hover:text-sky-600'
                }`}
              >
                {category.name}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Image Grid */}
      <section className="pb-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-w-2xl gap-6">
            <AnimatePresence>
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => openLightbox(index)}
                >
                  <div className="aspect-square">
                    <img
                      src={image.src}
                      alt={image.title}
                      loading='lazy'
                      className="w-full h-full object-fit transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-lg font-semibold mb-1">{image.title}</h3>
                      <p className="text-sm opacity-90">{image.description}</p>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-sky-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                      {categories.find(cat => cat.id === image.category)?.name}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <div className="relative top-4 max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute -top-8 md:-top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5 md:h-8 md:w-8" />
              </button>

              {/* Navigation Buttons */}
              <button
                onClick={prevImage}
                className="absolute left-2 lg:left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 md:h-8 md:w-8" />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-2 lg:right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
              >
                <ChevronRight className="h-5 w-5 md:h-8 md:w-8" />
              </button>

              {/* Image */}
              <motion.img
                key={selectedImage}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                src={filteredImages[selectedImage].src}
                alt={filteredImages[selectedImage].title}
                loading='lazy'
                className="max-w-full lg:min-w-[743px] max-h-full object-contain rounded-lg"
              />

              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-6 rounded-b-lg">
                <h3 className="text-lg lg:text-2xl font-semibold mb-1 lg:mb-2">
                  {filteredImages[selectedImage].title}
                </h3>
                <p className="text-[12px] lg:text-[14px] text-gray-300">
                  {filteredImages[selectedImage].description}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default Gallery;