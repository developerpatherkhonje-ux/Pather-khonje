import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Hotel, Star, MapPin, Wifi, Car, Coffee, Dumbbell, Upload, X, ArrowUpDown } from 'lucide-react';
import apiService from '../../services/api';

function HotelManagement() {
  const [hotels, setHotels] = useState([]);
  const [places, setPlaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    placeId: '',
    description: '',
    images: [],
    rating: 4.5,
    address: '',
    amenities: [],
    checkIn: '2:00 PM',
    checkOut: '11:00 AM',
    priceRange: ''
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const availableAmenities = ['Wi-Fi', 'Parking', 'Restaurant', 'Gym', 'Spa', 'Pool', 'Bar', 'Room Service', 'Laundry', 'Conference Hall', 'Lift'];

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const placesRes = await apiService.getPlaces();
        if (placesRes.success) setPlaces(placesRes.data.places);
        // Load persisted hotels from backend
        const hotelsRes = await apiService.getHotels(1, 50);
        if (hotelsRes.success) {
          setHotels(hotelsRes.data.hotels || []);
        }
      } catch (_) {}
    };
    loadInitial();
  }, []);

  const filteredHotels = hotels.filter(hotel =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (hotel.placeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (hotel.address || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        return <Hotel className="h-4 w-4" />;
    }
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files.slice(0, 5));
  };

  const handleUploadImages = async (hotelId) => {
    if (selectedFiles.length === 0) {
      alert('Please select images to upload');
      return;
    }
    
    try {
      setUploading(true);
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });
      
      console.log('Uploading images to hotel:', hotelId);
      const uploadResult = await apiService.uploadMultipleHotelImages(hotelId, formData);
      console.log('Image upload result:', uploadResult);
      
      if (uploadResult.success && uploadResult.data.uploadedImages) {
        // Update the hotel in the list
        setHotels(hotels.map(h => 
          h.id === hotelId 
            ? { ...h, images: [...(h.images || []), ...uploadResult.data.uploadedImages] }
            : h
        ));
        alert(`${uploadResult.data.uploadedImages.length} image(s) uploaded successfully!`);
        setSelectedFiles([]);
      } else {
        alert('Failed to upload images: ' + (uploadResult.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Error uploading images: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const fetchHotels = async () => {
    try {
      const hotelsRes = await apiService.getHotels(1, 50);
      if (hotelsRes.success) {
        setHotels(hotelsRes.data.hotels || []);
      }
    } catch (_) {}
  };

  const handleAddHotel = async () => {
    if (!formData.name || !formData.placeId || !formData.address || !formData.description || !formData.priceRange) return;
    try {
      setUploading(true);
      
      // Step 1: If images were selected, upload them to Cloudinary first
      let uploaded = { success: false, data: { files: [] } };
      if (selectedFiles.length > 0) {
        try {
          uploaded = await apiService.uploadHotelImages(selectedFiles);
          console.log('Pre-create Cloudinary upload result:', uploaded);
        } catch (uploadFirstErr) {
          console.error('Pre-create image upload error:', uploadFirstErr);
          // Continue without images; backend allows creating without images
        }
      }

      // Step 2: Build payload including Cloudinary images (if any)
      const cloudinaryFiles = uploaded?.data?.files || [];
      const payload = {
        name: formData.name.trim(),
        placeId: formData.placeId,
        description: formData.description || 'A beautiful hotel offering excellent accommodation and services',
        image: cloudinaryFiles[0]?.url || undefined,
        images: cloudinaryFiles, // Persist Cloudinary objects directly
        address: formData.address.trim(),
        rating: formData.rating || 4.0,
        amenities: formData.amenities || [],
        priceRange: formData.priceRange.trim(),
        roomTypes: formData.roomTypes || []
      };
      
      console.log('Sending hotel creation payload:', payload);
      console.log('Payload validation check:');
      console.log('- name length:', payload.name.length, '(min: 2, max: 200)');
      console.log('- description length:', payload.description.length, '(min: 3, max: 2000)');
      console.log('- address length:', payload.address.length, '(min: 3, max: 500)');
      console.log('- priceRange length:', payload.priceRange.length, '(min: 1, max: 100)');
      console.log('- placeId format:', payload.placeId, '(should be MongoDB ObjectId)');
      console.log('- rating value:', payload.rating, '(min: 1, max: 5)');
      console.log('- amenities type:', Array.isArray(payload.amenities), 'length:', payload.amenities.length);
      console.log('- roomTypes type:', Array.isArray(payload.roomTypes), 'length:', payload.roomTypes.length);
      console.log('- images type:', Array.isArray(payload.images), 'length:', payload.images.length);
      
      const res = await apiService.createHotel(payload);
      if (res.success) {
        // If we uploaded images pre-create, the backend already persisted them.
        // Merge the returned hotel with any local image info for immediate UI reflect.
        const created = {
          ...res.data.hotel,
          image: res.data.hotel.image || cloudinaryFiles[0]?.url || '',
          images: res.data.hotel.images && res.data.hotel.images.length > 0 ? res.data.hotel.images : cloudinaryFiles
        };
        setHotels([created, ...hotels]);
        resetForm();
        // Sync from backend to persist across navigations
        fetchHotels();
      }
    } catch (e) {
      console.error('Add hotel error:', e);
      console.error('Error response:', e.response);
      console.error('Error data:', e.response?.data);
      console.error('Error details:', e.response?.data || e.message);
      
      const errorMessage = e.response?.data?.message || e.message || 'Unknown error occurred';
      const validationErrors = e.response?.data?.errors || [];
      
      console.log('Validation errors array:', validationErrors);
      
      if (validationErrors.length > 0) {
        const errorDetails = validationErrors.map(err => `${err.field}: ${err.message}`).join(', ');
        console.log('Validation error details:', errorDetails);
        alert(`Validation failed: ${errorDetails}`);
      } else {
        console.log('No validation errors found, showing generic error');
        alert('Error creating hotel: ' + errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleEditHotel = (hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      placeId: hotel.placeId,
      images: hotel.images || [],
      rating: hotel.rating || 4.5,
      address: hotel.address || '',
      amenities: hotel.amenities || [],
      checkIn: hotel.checkIn || '2:00 PM',
      checkOut: hotel.checkOut || '11:00 AM',
      priceRange: hotel.priceRange || ''
    });
    setShowAddForm(true);
  };

  const handleUpdateHotel = () => {
    if (editingHotel && formData.name && formData.placeId && formData.address && formData.priceRange) {
      const selectedPlace = places.find(p => p.id === formData.placeId);
      setHotels(hotels.map(hotel =>
        hotel.id === editingHotel.id
          ? {
              ...hotel,
              ...formData,
              placeName: selectedPlace ? selectedPlace.name : hotel.placeName,
              images: formData.images.filter(img => img.trim() !== '')
            }
          : hotel
      ));
      resetForm();
    }
  };

  const handleDeleteHotel = async (id) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      try {
        const res = await apiService.deleteHotel(id);
        if (res.success) {
          setHotels(hotels.filter(hotel => (hotel.id || hotel._id) !== id));
          // refresh counts and lists
          await fetchHotels();
        }
      } catch (e) {
        console.error('Delete hotel error:', e);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      placeId: '',
      description: '',
      images: [],
      rating: 4.5,
      address: '',
      amenities: [],
      checkIn: '2:00 PM',
      checkOut: '11:00 AM',
      priceRange: ''
    });
    setSelectedFiles([]);
    setShowAddForm(false);
    setEditingHotel(null);
  };

  const toggleAmenity = (amenity) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenity)
        ? formData.amenities.filter(a => a !== amenity)
        : [...formData.amenities, amenity]
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Hotel Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Hotel</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search hotels by name, place, or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter hotel name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Place *</label>
                <select
                  value={formData.placeId}
                  onChange={(e) => setFormData({ ...formData, placeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Select a place</option>
                  {places.map((place) => (
                    <option key={place.id || place._id} value={place.id || place._id}>{place.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter hotel address"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter hotel description"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter rating (1-5)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range *</label>
                <input
                  type="text"
                  value={formData.priceRange}
                  onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g., ₹5,000 - ₹12,000"
                />
              </div>

              {/* File Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Images *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input type="file" accept="image/*" multiple onChange={handleFiles} />
                  <p className="text-xs text-gray-500 mt-1">Up to 5 images</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableAmenities.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center space-x-2 p-2 rounded-lg border transition-colors ${
                      formData.amenities.includes(amenity)
                        ? 'bg-sky-100 border-sky-300 text-sky-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {getAmenityIcon(amenity)}
                    <span className="text-sm">{amenity}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={editingHotel ? () => {} : handleAddHotel}
                disabled={uploading}
                className="flex-1 bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : (editingHotel ? 'Update Hotel' : 'Add Hotel')}
              </button>
              <button
                onClick={resetForm}
                disabled={uploading}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredHotels.map((hotel, index) => (
          <motion.div
            key={hotel.id || hotel._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              <div className="relative p-2 lg:p-0">
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={
                      hotel.images && hotel.images.length > 0 
                        ? (hotel.images[0].url || hotel.images[0].secure_url || hotel.images[0])
                        : '/hotels/goa-hotel.png'
                    }
                    alt={hotel.name}
                    className="aspect-square w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-4 right-4 lg:top-2 lg:right-2 flex space-x-1">
                  <button
                    onClick={() => handleEditHotel(hotel)}
                    className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition-colors"
                  >
                    <Edit className="h-3 w-3 text-gray-600" />
                  </button>
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.multiple = true;
                      input.onchange = (e) => {
                        const files = Array.from(e.target.files || []);
                        setSelectedFiles(files.slice(0, 5));
                        handleUploadImages(hotel.id || hotel._id);
                      };
                      input.click();
                    }}
                    className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition-colors"
                  >
                    <Upload className="h-3 w-3 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteHotel(hotel.id || hotel._id)}
                    className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition-colors"
                  >
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {/* Hotel Name and Rating */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">{hotel.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-900">{hotel.rating}</span>
                  </div>
                </div>
                
                {/* Location */}
                <div className="space-y-1">
                  <p className="text-sky-600 font-medium text-base">{
                    hotel.placeName || (hotel.placeId && typeof hotel.placeId === 'object' && hotel.placeId.name) || ''
                  }</p>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600 text-sm leading-relaxed">{hotel.address}</p>
                  </div>
                </div>
                
                {/* Price Section */}
                <div className="space-y-1">
                  <p className="text-lg font-bold text-gray-900">{hotel.priceRange}</p>
                  <p className="text-sm text-gray-500">per night</p>
                </div>
                
                {/* Amenities */}
                <div className="flex flex-wrap gap-2">
                  {hotel.amenities.slice(0, 3).map((amenity) => (
                    <span
                      key={amenity}
                      className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                  {hotel.amenities.length > 3 && (
                    <span className="text-xs text-gray-500 px-3 py-1.5">
                      +{hotel.amenities.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Hotels Message */}
      {filteredHotels.length === 0 && (
        <div className="text-center py-12">
          <Hotel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Hotels Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No hotels match your search criteria.' : 'Start by adding your first hotel.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors"
            >
              Add Your First Hotel
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default HotelManagement;