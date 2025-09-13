import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Hotel, Star, MapPin, Wifi, Car, Coffee, Dumbbell, Upload, X } from 'lucide-react';
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
  const availableAmenities = ['Wi-Fi', 'Parking', 'Restaurant', 'Gym', 'Spa', 'Pool', 'Bar', 'Room Service', 'Laundry', 'Conference Hall'];

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

  const fetchHotels = async () => {
    try {
      const hotelsRes = await apiService.getHotels(1, 50);
      if (hotelsRes.success) {
        setHotels(hotelsRes.data.hotels || []);
      }
    } catch (_) {}
  };

  const handleAddHotel = async () => {
    if (!formData.name || !formData.placeId || !formData.address || !formData.priceRange) return;
    try {
      setUploading(true);
      let imageUrls = [];
      if (selectedFiles.length > 0) {
        const r = await apiService.uploadHotelImages(selectedFiles);
        imageUrls = (r.data?.files || []).map(f => f.relativeUrl || f.url);
      }

      const payload = {
        name: formData.name,
        placeId: formData.placeId,
        description: formData.address || 'NA',
        images: imageUrls,
        address: formData.address,
        rating: formData.rating,
        amenities: formData.amenities,
        priceRange: formData.priceRange,
        roomTypes: []
      };
      const res = await apiService.createHotel(payload);
      if (res.success) {
        setHotels([res.data.hotel, ...hotels]);
        resetForm();
        // Sync from backend to persist across navigations
        fetchHotels();
      }
    } catch (e) {
      console.error('Add hotel error:', e);
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
                    src={apiService.toAbsoluteUrl((hotel.images && hotel.images[0]) || '') || '/hotels/goa-hotel.png'}
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
                    onClick={() => handleDeleteHotel(hotel.id || hotel._id)}
                    className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition-colors"
                  >
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{hotel.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{hotel.rating}</span>
                    </div>
                  </div>
                  <p className="text-sky-600 font-medium">{
                    hotel.placeName || (hotel.placeId && typeof hotel.placeId === 'object' && hotel.placeId.name) || ''
                  }</p>
                </div>
                <div className="flex items-start space-x-1">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600 text-sm">{hotel.address}</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{hotel.priceRange}</p>
                  <p className="text-sm text-gray-500">per night</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {hotel.amenities.slice(0, 3).map((amenity) => (
                    <span
                      key={amenity}
                      className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                    >
                      {amenity}
                    </span>
                  ))}
                  {hotel.amenities.length > 3 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{hotel.amenities.length - 3} more
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  <p>Check-in: {hotel.checkIn}</p>
                  <p>Check-out: {hotel.checkOut}</p>
                  <p>Added: {hotel.createdAt}</p>
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