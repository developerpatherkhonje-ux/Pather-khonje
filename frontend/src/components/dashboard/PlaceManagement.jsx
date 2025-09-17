import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, MapPin, Star, Upload, X } from 'lucide-react';
import apiService from '../../services/api';

function PlaceManagement() {
  const [places, setPlaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    description: '',
    rating: 4.5
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData({ ...formData, image: '' });
  };

  const uploadImage = async () => {
    if (!selectedFile) return null;
    
    try {
      setUploading(true);
      setError(null);
      const response = await apiService.uploadImage(selectedFile);
      if (response.success) {
        return response.data.url;
      }
      throw new Error(response.message || 'Upload failed');
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(`Failed to upload image: ${err.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const filteredPlaces = places.filter(place =>
    place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPlace = async () => {
    // Validate required fields
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setError(null);
      let imageUrl = formData.image;
      
      // Upload image if file is selected
      if (selectedFile) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          return; // Upload failed, error already set
        }
      }
      
      if (!imageUrl) {
        setError('Please select an image');
        return;
      }
      
      const placeData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: imageUrl,
        rating: parseFloat(formData.rating) || 4.5
      };
      
      const response = await apiService.createPlace(placeData);
      if (response.success) {
        setPlaces([response.data.place, ...places]);
        resetForm();
        setError(null);
      } else {
        setError(response.message || 'Failed to create place');
      }
    } catch (err) {
      console.error('Error creating place:', err);
      setError(err.message || 'Failed to create place');
    }
  };

  const handleEditPlace = (place) => {
    setEditingPlace(place);
    setFormData({
      name: place.name,
      image: place.image,
      description: place.description,
      rating: place.rating
    });
    setSelectedFile(null);
    setImagePreview(place.image);
    setShowAddForm(true);
  };

  const handleUpdatePlace = async () => {
    // Validate required fields
    if (!editingPlace || !formData.name.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setError(null);
      let imageUrl = formData.image;
      
      // Upload new image if file is selected
      if (selectedFile) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          return; // Upload failed, error already set
        }
      }
      
      if (!imageUrl) {
        setError('Please select an image');
        return;
      }
      
      const placeData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: imageUrl,
        rating: parseFloat(formData.rating) || 4.5
      };
      
      const response = await apiService.updatePlace(editingPlace.id, placeData);
      if (response.success) {
        setPlaces(places.map(place => 
          place.id === editingPlace.id 
            ? response.data.place
            : place
        ));
        resetForm();
        setError(null);
      } else {
        setError(response.message || 'Failed to update place');
      }
    } catch (err) {
      console.error('Error updating place:', err);
      setError(err.message || 'Failed to update place');
    }
  };

  const handleDeletePlace = async (id) => {
    if (window.confirm('Are you sure you want to delete this place?')) {
      try {
        const response = await apiService.deletePlace(id);
        if (response.success) {
          setPlaces(places.filter(place => place.id !== id));
        }
      } catch (err) {
        console.error('Error deleting place:', err);
        setError('Failed to delete place');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      image: '',
      description: '',
      rating: 4.5
    });
    setSelectedFile(null);
    setImagePreview(null);
    setShowAddForm(false);
    setEditingPlace(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Place Management</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Place</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search places..."
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
            className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingPlace ? 'Edit Place' : 'Add New Place'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Place Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter place name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Place Image *</label>
                
                {/* File Upload Area */}
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-sky-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload an image or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF, WebP up to 5MB
                      </p>
                    </label>
                  </div>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeSelectedFile}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* Upload Progress */}
                  {uploading && (
                    <div className="text-center">
                      <div className="inline-flex items-center space-x-2 text-sky-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-600"></div>
                        <span className="text-sm">Uploading image...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter place description"
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
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={editingPlace ? handleUpdatePlace : handleAddPlace}
                disabled={uploading}
                className="flex-1 bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : (editingPlace ? 'Update Place' : 'Add Place')}
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

      {/* Places Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
              <div className="h-48 sm:h-60 bg-gray-300"></div>
              <div className="p-6">
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place, index) => (
          <motion.div
            key={place.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <div className="relative h-48 sm:h-60">
              <img
                src={place.image}
                alt={place.name}
                loading='lazy'
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => handleEditPlace(place)}
                  className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                >
                  <Edit className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDeletePlace(place.id)}
                  className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900">{place.name}</h3>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{place.rating}</span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">{place.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{place.hotelsCount} Hotels</span>
                </div>
                <span className="text-sm text-gray-400">Added: {place.createdAt}</span>
              </div>
            </div>
          </motion.div>
        ))}
        </div>
      )}

      {/* No Places Message */}
      {filteredPlaces.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Places Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No places match your search criteria.' : 'Start by adding your first place.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors"
            >
              Add Your First Place
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default PlaceManagement;