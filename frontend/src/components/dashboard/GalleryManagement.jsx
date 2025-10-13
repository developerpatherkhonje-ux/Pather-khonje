import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  Upload,
  X,
  Save,
  RotateCcw
} from 'lucide-react';
import apiService from '../../services/api';

function GalleryManagement() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGallery, setEditingGallery] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'destinations',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'destinations', label: 'Destinations' },
    { value: 'hotels', label: 'Hotels' },
    { value: 'activities', label: 'Activities' },
    { value: 'food', label: 'Cuisine' }
  ];

  const categoryOptions = [
    { value: 'destinations', label: 'Destinations' },
    { value: 'hotels', label: 'Hotels' },
    { value: 'activities', label: 'Activities' },
    { value: 'food', label: 'Cuisine' }
  ];

  useEffect(() => {
    fetchGalleries();
  }, [filterCategory, searchTerm]);

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminGalleries({
        category: filterCategory,
        search: searchTerm
      });
      if (response.success) {
        setGalleries(response.data.galleries);
      } else {
        setError('Failed to fetch galleries');
      }
    } catch (err) {
      console.error('Error fetching galleries:', err);
      setError('Failed to fetch galleries');
    } finally {
      setLoading(false);
    }
  };

  // Remove client-side filtering since we're now filtering on the server
  const filteredGalleries = galleries;

  const handleAddGallery = () => {
    setFormData({
      title: '',
      description: '',
      category: 'destinations',
      image: null
    });
    setImagePreview(null);
    setShowAddModal(true);
  };

  const handleEditGallery = (gallery) => {
    setEditingGallery(gallery);
    setFormData({
      title: gallery.title,
      description: gallery.description,
      category: gallery.category,
      image: null
    });
    setImagePreview(gallery.image?.url || null);
    setShowEditModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    if (!showEditModal && !formData.image) {
      setError('Please select an image');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Prepare form data
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      
      // Always append image for new items, conditionally for updates
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      // Debug logging
      console.log('FormData contents:');
      for (let [key, value] of submitData.entries()) {
        console.log(key, value);
      }

      // API call
      const response = showEditModal 
        ? await apiService.updateGallery(editingGallery._id, submitData)
        : await apiService.createGallery(submitData);

      if (response.success) {
        await fetchGalleries();
        resetForm();
      } else {
        setError(response.message || 'Failed to save gallery item');
      }
    } catch (err) {
      console.error('Error saving gallery:', err);
      // More detailed error message
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save gallery item';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setFormData({
      title: '',
      description: '',
      category: 'destinations',
      image: null
    });
    setImagePreview(null);
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gallery item?')) return;

    try {
      const response = await apiService.deleteGallery(id);
      if (response.success) {
        await fetchGalleries();
      } else {
        setError('Failed to delete gallery item');
      }
    } catch (err) {
      console.error('Error deleting gallery:', err);
      setError('Failed to delete gallery item');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await apiService.toggleGalleryStatus(id);
      if (response.success) {
        await fetchGalleries();
      } else {
        setError('Failed to update gallery status');
      }
    } catch (err) {
      console.error('Error toggling gallery status:', err);
      setError('Failed to update gallery status');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
              <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gallery Management</h1>
            <p className="text-gray-600">Manage your gallery items and showcase your content</p>
          </div>
          <button
            onClick={handleAddGallery}
            className="bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Gallery Item
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{galleries.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ImageIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {galleries.filter(g => g.isActive).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {galleries.filter(g => !g.isActive).length}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <EyeOff className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categoryOptions.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <ImageIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search gallery items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            Total: {filteredGalleries.length} items
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-500 hover:text-red-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <AnimatePresence>
          {filteredGalleries.map((gallery, index) => (
            <motion.div
              key={gallery._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-[4/3]">
                <img
                  src={gallery.image?.url || '/gallery/placeholder.jpg'}
                  alt={gallery.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    gallery.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {gallery.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 right-4">
                  <span className="bg-sky-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                    {categoryOptions.find(cat => cat.value === gallery.category)?.label}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="absolute bottom-2 right-2 flex space-x-1">
                  <button
                    onClick={() => handleToggleStatus(gallery._id)}
                    className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
                      gallery.isActive 
                        ? 'bg-red-500/80 text-white hover:bg-red-600/80' 
                        : 'bg-green-500/80 text-white hover:bg-green-600/80'
                    }`}
                    title={gallery.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {gallery.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                  
                  <button
                    onClick={() => handleEditGallery(gallery)}
                    className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-3 w-3 text-gray-600" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteGallery(gallery._id)}
                    className="p-1.5 bg-red-500/80 backdrop-blur-sm rounded-full hover:bg-red-600/80 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">{gallery.title}</h3>
                <p className="text-gray-600 text-xs mb-2 line-clamp-2">{gallery.description}</p>
                  <div className="flex items-center justify-end text-xs text-gray-500">
                    <span>{new Date(gallery.createdAt).toLocaleDateString('en-GB')}</span>
                  </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {showAddModal ? 'Add Gallery Item' : 'Edit Gallery Item'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      placeholder="Enter gallery title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      required
                    >
                      {categoryOptions.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Enter gallery description"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image {showAddModal ? '*' : ''}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      required={showAddModal}
                    />
                  </div>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Preview
                    </label>
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <RotateCcw className="h-4 w-4 animate-spin" />
                        {showAddModal ? 'Adding...' : 'Updating...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {showAddModal ? 'Add Item' : 'Update Item'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GalleryManagement;
