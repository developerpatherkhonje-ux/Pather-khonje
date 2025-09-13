import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Package, Star, Clock, Users } from 'lucide-react';

function PackageManagement() {
  const [packages, setPackages] = useState([
    {
      id: '1',
      name: 'Himalayan Adventure',
      image: '/hpackages/himalaya.jpg',
      description: 'Experience the thrill of the Himalayas with trekking, camping, and breathtaking mountain views.',
      duration: '7 Days 6 Nights',
      price: 25000,
      rating: 4.9,
      highlights: ['Trekking', 'Mountain Views', 'Camping', 'Adventure Sports'],
      category: 'adventure',
      bestTime: 'March to June, September to November',
      groupSize: '6-12 participants',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Royal Rajasthan',
      image: '/hpackages/rajasthan.jpeg',
      description: 'Discover the royal heritage of Rajasthan with majestic palaces, forts, and cultural experiences.',
      duration: '10 Days 9 Nights',
      price: 35000,
      rating: 4.8,
      highlights: ['Palaces', 'Forts', 'Cultural Shows', 'Heritage Hotels'],
      category: 'heritage',
      bestTime: 'October to March',
      groupSize: '8-15 participants',
      createdAt: '2024-01-12'
    }
  ]);

  const categories = ['adventure', 'heritage', 'beach', 'mountain', 'spiritual', 'cultural'];

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    description: '',
    duration: '',
    price: 0,
    rating: 0,
    highlights: ['', '', '', ''],
    category: '',
    bestTime: '',
    groupSize: ''
  });

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPackage = () => {
    if (formData.name && formData.image && formData.description && formData.duration && formData.price && formData.category) {
      const newPackage = {
        id: Date.now().toString(),
        name: formData.name,
        image: formData.image,
        description: formData.description,
        duration: formData.duration,
        price: formData.price,
        rating: formData.rating || 4.5,
        highlights: formData.highlights.filter(h => h.trim() !== ''),
        category: formData.category,
        bestTime: formData.bestTime,
        groupSize: formData.groupSize,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setPackages([...packages, newPackage]);
      resetForm();
    }
  };

  const handleEditPackage = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      image: pkg.image,
      description: pkg.description,
      duration: pkg.duration,
      price: pkg.price,
      rating: pkg.rating,
      highlights: [...pkg.highlights, ...Array(4 - pkg.highlights.length).fill('')],
      category: pkg.category,
      bestTime: pkg.bestTime,
      groupSize: pkg.groupSize
    });
    setShowAddForm(true);
  };

  const handleUpdatePackage = () => {
    if (editingPackage && formData.name && formData.image && formData.description && formData.duration && formData.price && formData.category) {
      setPackages(packages.map(pkg =>
        pkg.id === editingPackage.id
          ? {
              ...pkg,
              ...formData,
              highlights: formData.highlights.filter(h => h.trim() !== '')
            }
          : pkg
      ));
      resetForm();
    }
  };

  const handleDeletePackage = (id) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      setPackages(packages.filter(pkg => pkg.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      image: '',
      description: '',
      duration: '',
      price: 0,
      rating: 0,
      highlights: ['', '', '', ''],
      category: '',
      bestTime: '',
      groupSize: ''
    });
    setShowAddForm(false);
    setEditingPackage(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Package Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Package</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search packages by name, category, or description..."
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
              {editingPackage ? 'Edit Package' : 'Add New Package'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Package Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter package name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter image URL"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter package description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g., 7 Days 6 Nights"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (per person) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter price in rupees"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Size</label>
                <input
                  type="text"
                  value={formData.groupSize}
                  onChange={(e) => setFormData({ ...formData, groupSize: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g., 6-12 participants"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Best Time to Visit</label>
                <input
                  type="text"
                  value={formData.bestTime}
                  onChange={(e) => setFormData({ ...formData, bestTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g., March to June, September to November"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Highlights</label>
                <div className="grid grid-cols-2 gap-2">
                  {formData.highlights.map((highlight, index) => (
                    <input
                      key={index}
                      type="text"
                      value={highlight}
                      onChange={(e) => {
                        const newHighlights = [...formData.highlights];
                        newHighlights[index] = e.target.value;
                        setFormData({ ...formData, highlights: newHighlights });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                      placeholder={`Highlight ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={editingPackage ? handleUpdatePackage : handleAddPackage}
                className="flex-1 bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors"
              >
                {editingPackage ? 'Update Package' : 'Add Package'}
              </button>
              <button
                onClick={resetForm}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <div className="relative h-48">
              <img
                src={pkg.image}
                alt={pkg.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => handleEditPackage(pkg)}
                  className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                >
                  <Edit className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDeletePackage(pkg.id)}
                  className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
              <div className="absolute top-4 left-4">
                <span className="bg-sky-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                  {pkg.category.charAt(0).toUpperCase() + pkg.category.slice(1)}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{pkg.rating}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-sky-600">₹{pkg.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">per person</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{pkg.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">{pkg.duration}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="text-sm">{pkg.groupSize}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {pkg.highlights.slice(0, 3).map((highlight) => (
                    <span
                      key={highlight}
                      className="bg-sky-100 text-sky-700 text-xs px-2 py-1 rounded"
                    >
                      {highlight}
                    </span>
                  ))}
                  {pkg.highlights.length > 3 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{pkg.highlights.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <p>Best Time: {pkg.bestTime}</p>
                <p>Added: {pkg.createdAt}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Packages Message */}
      {filteredPackages.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Packages Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No packages match your search criteria.' : 'Start by adding your first tour package.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors"
            >
              Add Your First Package
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default PackageManagement;