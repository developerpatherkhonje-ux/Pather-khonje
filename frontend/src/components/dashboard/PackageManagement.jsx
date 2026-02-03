import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Star,
  Clock,
  Users,
  Image as ImageIcon,
  Check,
  X,
} from "lucide-react";
import apiService from "../../services/api";

function PackageManagement() {
  const [packages, setPackages] = useState([]);
  const [hotels, setHotels] = useState([]); // Available hotels

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiService.listPackages();
        if (res.success) setPackages(res.data.packages || []);

        const hotelRes = await apiService.getHotels(1, 100); // Fetch enough hotels
        if (hotelRes.success) setHotels(hotelRes.data.hotels || []);
      } catch (_) {}
    };
    load();
  }, []);

  const categories = [
    "adventure",
    "heritage",
    "beach",
    "mountain",
    "spiritual",
    "cultural",
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    price: 0,
    rating: 0,
    highlights: ["", "", "", ""],
    category: "",
    bestTime: "",
    groupSize: "",
    hotels: [], // Array of hotel IDs
  });

  // Image State
  const [selectedCoverFile, setSelectedCoverFile] = useState(null);
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState([]);

  const [existingCoverImage, setExistingCoverImage] = useState("");
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);

  const [uploading, setUploading] = useState(false);

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleGalleryFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedGalleryFiles(files);
  };

  const handleAddPackage = async () => {
    if (
      formData.name &&
      formData.description &&
      formData.duration &&
      String(formData.price).trim() !== "" &&
      formData.category
    ) {
      setUploading(true);
      try {
        let coverImageUrl = existingCoverImage;
        let galleryImages = [...existingGalleryImages];

        // 1. Upload Cover Image
        if (selectedCoverFile) {
          try {
            const up = await apiService.uploadPackageImage(selectedCoverFile);
            if (up.success) coverImageUrl = up.data.relativeUrl || up.data.url;
          } catch (e) {
            console.error("Cover upload failed", e);
          }
        }

        // 2. Upload Gallery Images
        if (selectedGalleryFiles.length > 0) {
          try {
            const up =
              await apiService.uploadPackageImages(selectedGalleryFiles);
            if (up.success && up.data.files) {
              const newImages = up.data.files.map(
                (f) => f.relativeUrl || f.url,
              );
              galleryImages = [...galleryImages, ...newImages];
            }
          } catch (e) {
            console.error("Gallery upload failed", e);
          }
        }

        const payload = {
          ...formData,
          image: coverImageUrl,
          images: galleryImages,
          highlights: formData.highlights.filter((h) => h.trim() !== ""),
        };

        // Normalize
        payload.price = Number(payload.price);
        if (Number.isNaN(payload.price)) payload.price = 0;

        if (payload.rating) {
          payload.rating = Number(payload.rating);
          if (Number.isNaN(payload.rating)) delete payload.rating;
        } else {
          delete payload.rating;
        }

        let res;
        if (editingPackage) {
          res = await apiService.updatePackage(
            editingPackage.id || editingPackage._id,
            payload,
          );
        } else {
          res = await apiService.createPackage(payload);
        }

        if (res.success) {
          // Refresh list
          const listRes = await apiService.listPackages();
          if (listRes.success) setPackages(listRes.data.packages || []);
          resetForm();
          alert(editingPackage ? "Package updated!" : "Package created!");
        } else {
          alert("Failed to save: " + (res.message || "Unknown error"));
        }
      } catch (e) {
        console.error("Create/Update package error:", e);
        alert("Error: " + e.message);
      } finally {
        setUploading(false);
      }
    } else {
      alert(
        "Please fill in required fields (Name, Category, Duration, Price, Description)",
      );
    }
  };

  const handleEditPackage = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      duration: pkg.duration,
      price: pkg.price,
      rating: pkg.rating,
      highlights: [
        ...pkg.highlights,
        ...Array(Math.max(0, 4 - (pkg.highlights?.length || 0))).fill(""),
      ],
      category: pkg.category,
      bestTime: pkg.bestTime,
      groupSize: pkg.groupSize,
      hotels: pkg.hotels
        ? pkg.hotels.map((h) => (typeof h === "object" ? h.id || h._id : h))
        : [],
    });

    setExistingCoverImage(pkg.image || "");
    setExistingGalleryImages(pkg.images || []);

    setShowAddForm(true);
  };

  const handleDeletePackage = async (id) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this package?")) {
      const res = await apiService.deletePackage(id);
      if (res.success)
        setPackages(packages.filter((pkg) => (pkg.id || pkg._id) !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      duration: "",
      price: 0,
      rating: 0,
      highlights: ["", "", "", ""],
      category: "",
      bestTime: "",
      groupSize: "",
      hotels: [],
    });
    setSelectedCoverFile(null);
    setSelectedGalleryFiles([]);
    setExistingCoverImage("");
    setExistingGalleryImages([]);

    setShowAddForm(false);
    setEditingPackage(null);
  };

  const toggleHotelSelection = (hotelId) => {
    setFormData((prev) => {
      const current = prev.hotels || [];
      if (current.includes(hotelId)) {
        return { ...prev, hotels: current.filter((id) => id !== hotelId) };
      } else {
        return { ...prev, hotels: [...current, hotelId] };
      }
    });
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
            className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPackage ? "Edit Package" : "Add New Package"}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Package Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter package name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Images Section */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="font-semibold text-gray-800 border-b pb-2">
                  Package Photos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 1. Cover Photo */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" /> Cover Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedCoverFile(e.target.files[0])}
                      className="text-sm w-full"
                    />
                    {existingCoverImage && !selectedCoverFile && (
                      <div className="mt-2 text-xs text-green-600">
                        <span className="truncate max-w-[200px]">
                          Current: {existingCoverImage.split("/").pop()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 2. Gallery Photos */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" /> Gallery Photos
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryFiles}
                      className="text-sm w-full"
                    />
                    {existingGalleryImages.length > 0 &&
                      selectedGalleryFiles.length === 0 && (
                        <div className="mt-2 text-xs text-green-600">
                          {existingGalleryImages.length} existing photos
                        </div>
                      )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter package description"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration *
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g., 7 Days 6 Nights"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (per person) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter price in rupees"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rating
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rating: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter rating (1-5)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Group Size
                </label>
                <input
                  type="text"
                  value={formData.groupSize}
                  onChange={(e) =>
                    setFormData({ ...formData, groupSize: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g., 6-12 participants"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Best Time to Visit
                </label>
                <input
                  type="text"
                  value={formData.bestTime}
                  onChange={(e) =>
                    setFormData({ ...formData, bestTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g., March to June, September to November"
                />
              </div>

              {/* Hotel Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Included Hotels (Select multiple)
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {hotels.map((hotel) => (
                    <div
                      key={hotel.id || hotel._id}
                      onClick={() =>
                        toggleHotelSelection(hotel.id || hotel._id)
                      }
                      className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        formData.hotels?.includes(hotel.id || hotel._id)
                          ? "bg-sky-100 border border-sky-300"
                          : "hover:bg-white border border-transparent"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center ${
                          formData.hotels?.includes(hotel.id || hotel._id)
                            ? "bg-sky-600 border-sky-600"
                            : "bg-white border-gray-400"
                        }`}
                      >
                        {formData.hotels?.includes(hotel.id || hotel._id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                          {hotel.name}
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {hotel.placeName ||
                            (typeof hotel.placeId === "object"
                              ? hotel.placeId?.name
                              : "")}
                        </div>
                      </div>
                    </div>
                  ))}
                  {hotels.length === 0 && (
                    <div className="text-gray-500 text-sm italic p-2">
                      No hotels available. Add hotels in Hotel Management first.
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Highlights
                </label>
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

            <div className="flex space-x-3 mt-8 pt-6 border-t">
              <button
                onClick={handleAddPackage}
                disabled={uploading}
                className="flex-1 bg-sky-600 text-white py-3 px-4 rounded-xl hover:bg-sky-700 transition-colors font-medium disabled:opacity-50"
              >
                {uploading
                  ? "Processing..."
                  : editingPackage
                  ? "Update Package"
                  : "Create Package"}
              </button>
              <button
                onClick={resetForm}
                disabled={uploading}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium border border-gray-300"
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
            key={pkg.id || pkg._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <div className="relative h-48 group">
              <img
                src={
                  apiService.toAbsoluteUrl(pkg.image) ||
                  "/public/hpackages/kerala.jpg"
                }
                alt={pkg.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>

              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEditPackage(pkg)}
                  className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors shadow-sm"
                >
                  <Edit className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDeletePackage(pkg.id || pkg._id)}
                  className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors shadow-sm"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
              <div className="absolute top-4 left-4">
                <span className="bg-sky-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {pkg.category}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-gray-900">
                        {pkg.rating}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-sky-600 leading-none">
                        ₹{pkg.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                {pkg.name}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                {pkg.description}
              </p>

              <div className="flex items-center justify-between mb-4 pt-2 border-t border-gray-100">
                <div className="flex items-center text-gray-500">
                  <Clock className="h-4 w-4 mr-1.5" />
                  <span className="text-sm font-medium">{pkg.duration}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <Users className="h-4 w-4 mr-1.5" />
                  <span className="text-sm font-medium">
                    {pkg.groupSize || "N/A"}
                  </span>
                </div>
              </div>

              {pkg.hotels && pkg.hotels.length > 0 && (
                <div className="mb-4 flex items-center gap-1.5 text-xs text-sky-600 font-medium bg-sky-50 p-2 rounded-lg">
                  <ImageIcon className="h-3 w-3" />
                  <span>{pkg.hotels.length} Hotel(s) Included</span>
                </div>
              )}

              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {pkg.highlights
                    .slice(0, 3)
                    .map((highlight, highlightIndex) => (
                      <span
                        key={`${pkg.id || pkg._id}-highlight-${highlightIndex}`}
                        className="bg-gray-100 text-gray-700 text-[10px] uppercase font-bold px-2 py-1 rounded"
                      >
                        {highlight}
                      </span>
                    ))}
                  {pkg.highlights.length > 3 && (
                    <span className="text-[10px] text-gray-400 font-medium px-2 py-1">
                      +{pkg.highlights.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Packages Message */}
      {filteredPackages.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-100">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Packages Found
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {searchTerm
              ? "We couldn't find any packages matching your search. Try different keywords."
              : "Get started by adding your first tour package to the system."}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-sky-600 text-white px-8 py-3 rounded-xl hover:bg-sky-700 transition-colors font-medium shadow-md hover:shadow-lg"
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
