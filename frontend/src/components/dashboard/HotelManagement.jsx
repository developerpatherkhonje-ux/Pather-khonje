import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Hotel,
  Star,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Upload,
  X,
  ArrowUpDown,
  Image as ImageIcon,
} from "lucide-react";
import apiService from "../../services/api";

function HotelManagement() {
  const [hotels, setHotels] = useState([]);
  const [places, setPlaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    placeId: "",
    description: "",
    rating: 4.5,
    address: "",
    amenities: [],
    checkIn: "2:00 PM",
    checkOut: "11:00 AM",
    priceRange: "",
  });

  // Separate File States
  const [selectedCardFile, setSelectedCardFile] = useState(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState(null);
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState([]);

  const [uploading, setUploading] = useState(false);

  // Existing Images (for display during edit)
  const [existingCardImage, setExistingCardImage] = useState("");
  const [existingCoverImage, setExistingCoverImage] = useState("");
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);

  const availableAmenities = [
    "Wi-Fi",
    "Parking",
    "Restaurant",
    "Gym",
    "Spa",
    "Pool",
    "Bar",
    "Room Service",
    "Laundry",
    "Conference Hall",
    "Lift",
  ];

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const placesRes = await apiService.getPlaces();
        if (placesRes.success) setPlaces(placesRes.data.places);
        fetchHotels();
      } catch (_) {}
    };
    loadInitial();
  }, []);

  const fetchHotels = async () => {
    try {
      const hotelsRes = await apiService.getHotels(1, 50);
      if (hotelsRes.success) {
        setHotels(hotelsRes.data.hotels || []);
      }
    } catch (_) {}
  };

  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hotel.placeName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (hotel.address || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case "wi-fi":
        return <Wifi className="h-4 w-4" />;
      case "parking":
        return <Car className="h-4 w-4" />;
      case "restaurant":
        return <Coffee className="h-4 w-4" />;
      case "gym":
        return <Dumbbell className="h-4 w-4" />;
      default:
        return <Hotel className="h-4 w-4" />;
    }
  };

  const handleGalleryFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedGalleryFiles(files);
  };

  const handleAddHotel = async () => {
    if (
      !formData.name ||
      !formData.placeId ||
      !formData.address ||
      !formData.description ||
      !formData.priceRange
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setUploading(true);

      let cardImageUrl = existingCardImage;
      let coverImageUrl = existingCoverImage;
      let galleryImages = [...existingGalleryImages];

      // 1. Upload Card Image
      if (selectedCardFile) {
        try {
          const res = await apiService.uploadHotelImage(selectedCardFile);
          if (res.success) {
            cardImageUrl = res.data.relativeUrl || res.data.url;
          }
        } catch (e) {
          console.error("Card Image upload failed", e);
        }
      }

      // 2. Upload Cover Image
      if (selectedCoverFile) {
        try {
          const res = await apiService.uploadHotelImage(selectedCoverFile);
          if (res.success) {
            coverImageUrl = res.data.relativeUrl || res.data.url;
          }
        } catch (e) {
          console.error("Cover Image upload failed", e);
        }
      }

      // 3. Upload Gallery Images
      if (selectedGalleryFiles.length > 0) {
        try {
          const res = await apiService.uploadHotelImages(selectedGalleryFiles);
          if (res.success && res.data.files) {
            // Append new images to existing Gallery
            const newImages = res.data.files.map((f) => ({
              url: f.relativeUrl || f.url,
              public_id: f.public_id,
            }));
            galleryImages = [...galleryImages, ...newImages];
          }
        } catch (e) {
          console.error("Gallery upload failed", e);
        }
      }

      const payload = {
        ...formData,
        name: formData.name.trim(),
        address: formData.address.trim(),
        priceRange: formData.priceRange.trim(),
        amenities: formData.amenities,
        roomTypes: [], // Simplify for now
        // Image Fields
        cardImage: cardImageUrl,
        image: coverImageUrl,
        images: galleryImages,
      };

      if (editingHotel) {
        const res = await apiService.updateHotel(
          editingHotel.id || editingHotel._id,
          payload,
        );
        if (res.success) {
          alert("Hotel updated successfully!");
          resetForm();
          fetchHotels();
        }
      } else {
        const res = await apiService.createHotel(payload);
        if (res.success) {
          alert("Hotel created successfully!");
          resetForm();
          fetchHotels();
        }
      }
    } catch (e) {
      console.error("Save hotel error:", e);
      alert("Error saving hotel: " + (e.response?.data?.message || e.message));
    } finally {
      setUploading(false);
    }
  };

  const handleEditHotel = (hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      placeId:
        typeof hotel.placeId === "object" ? hotel.placeId._id : hotel.placeId,
      description: hotel.description || "",
      rating: hotel.rating || 4.5,
      address: hotel.address || "",
      amenities: hotel.amenities || [],
      checkIn: hotel.checkIn || "2:00 PM",
      checkOut: hotel.checkOut || "11:00 AM",
      priceRange: hotel.priceRange || "",
    });

    setExistingCardImage(hotel.cardImage || "");
    setExistingCoverImage(hotel.image || "");
    setExistingGalleryImages(hotel.images || []);

    setShowAddForm(true);
  };

  const handleDeleteHotel = async (id) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this hotel?")) {
      try {
        const res = await apiService.deleteHotel(id);
        if (res.success) {
          fetchHotels();
        }
      } catch (e) {
        console.error("Delete hotel error:", e);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      placeId: "",
      description: "",
      rating: 4.5,
      address: "",
      amenities: [],
      checkIn: "2:00 PM",
      checkOut: "11:00 AM",
      priceRange: "",
    });
    setSelectedCardFile(null);
    setSelectedCoverFile(null);
    setSelectedGalleryFiles([]);
    setExistingCardImage("");
    setExistingCoverImage("");
    setExistingGalleryImages([]);

    setShowAddForm(false);
    setEditingHotel(null);
  };

  const toggleAmenity = (amenity) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenity)
        ? formData.amenities.filter((a) => a !== amenity)
        : [...formData.amenities, amenity],
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
            className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingHotel ? "Edit Hotel" : "Add New Hotel"}
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
                  Hotel Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter hotel name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Place *
                </label>
                <div className="relative">
                  <select
                    value={formData.placeId}
                    onChange={(e) =>
                      setFormData({ ...formData, placeId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 appearance-none bg-white"
                  >
                    <option value="">Select a place</option>
                    {places.map((place) => (
                      <option
                        key={place.id || place._id}
                        value={place.id || place._id}
                      >
                        {place.name}
                      </option>
                    ))}
                  </select>
                  <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter hotel address"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter hotel description"
                  rows="3"
                />
              </div>

              {/* Image Upload Handlers */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="font-semibold text-gray-800 border-b pb-2">
                  Hotel Photos
                </h3>

                {/* Container for uploads */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 1. Main Card Photo */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" /> Main Card Photo
                    </label>
                    <div className="text-xs text-gray-500 mb-2">
                      This photo appears on the hotel card.
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedCardFile(e.target.files[0])}
                      className="text-sm w-full"
                    />
                    {existingCardImage && !selectedCardFile && (
                      <div className="mt-2 text-xs text-green-600 flex items-center">
                        <span className="truncate max-w-[150px]">
                          Current: {existingCardImage.split("/").pop()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 2. Cover Photo */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" /> Cover Photo
                    </label>
                    <div className="text-xs text-gray-500 mb-2">
                      Banner image for hotel details.
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedCoverFile(e.target.files[0])}
                      className="text-sm w-full"
                    />
                    {existingCoverImage && !selectedCoverFile && (
                      <div className="mt-2 text-xs text-green-600">
                        <span className="truncate max-w-[150px]">
                          Current: {existingCoverImage.split("/").pop()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 3. Gallery Photos */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" /> Gallery Photos
                    </label>
                    <div className="text-xs text-gray-500 mb-2">
                      Multiple photos for gallery.
                    </div>
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
                  Price Range *
                </label>
                <input
                  type="text"
                  value={formData.priceRange}
                  onChange={(e) =>
                    setFormData({ ...formData, priceRange: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g., ₹5,000 - ₹12,000"
                />
              </div>
            </div>

            {/* Amenities */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amenities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableAmenities.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center space-x-2 p-2 rounded-lg border transition-colors ${
                      formData.amenities.includes(amenity)
                        ? "bg-sky-100 border-sky-300 text-sky-700"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {getAmenityIcon(amenity)}
                    <span className="text-sm">{amenity}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 mt-8 pt-6 border-t">
              <button
                onClick={handleAddHotel}
                disabled={uploading}
                className="flex-1 bg-sky-600 text-white py-3 px-4 rounded-xl hover:bg-sky-700 transition-colors disabled:opacity-50 font-medium"
              >
                {uploading
                  ? "Processing..."
                  : editingHotel
                  ? "Update Hotel"
                  : "Create Hotel"}
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
                <div className="rounded-lg overflow-hidden h-48 md:h-full">
                  <img
                    src={
                      apiService.toAbsoluteUrl(hotel.cardImage) ||
                      apiService.toAbsoluteUrl(hotel.image) ||
                      (hotel.images && hotel.images.length > 0
                        ? apiService.toAbsoluteUrl(hotel.images[0].url)
                        : "/hotels/goa-hotel.png")
                    }
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-4 right-4 lg:top-2 lg:right-2 flex space-x-1">
                  <button
                    onClick={() => handleEditHotel(hotel)}
                    className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors shadow-sm"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteHotel(hotel.id || hotel._id)}
                    className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors shadow-sm"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {/* Hotel Name and Rating */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                    {hotel.name}
                  </h3>
                  <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-md">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-gray-900">
                      {hotel.rating}
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <p className="text-sky-600 font-semibold text-sm uppercase tracking-wide">
                    {hotel.placeName ||
                      (hotel.placeId &&
                        typeof hotel.placeId === "object" &&
                        hotel.placeId.name) ||
                      "Unknown Place"}
                  </p>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                      {hotel.address}
                    </p>
                  </div>
                </div>

                {/* Price Section */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-baseline">
                    <p className="text-sm text-gray-500">Starting from</p>
                    <p className="text-lg font-bold text-gray-900">
                      {hotel.priceRange}
                    </p>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {hotel.amenities.slice(0, 3).map((amenity) => (
                    <span
                      key={amenity}
                      className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold px-2 py-1 rounded"
                    >
                      {amenity}
                    </span>
                  ))}
                  {hotel.amenities.length > 3 && (
                    <span className="text-[10px] text-gray-400 font-medium px-2 py-1">
                      +{hotel.amenities.length - 3}
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
        <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-100">
          <Hotel className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Hotels Found
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {searchTerm
              ? "We couldn't find any hotels matching your search. Try different keywords."
              : "Get started by adding your first premium hotel property to the system."}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-sky-600 text-white px-8 py-3 rounded-xl hover:bg-sky-700 transition-colors font-medium shadow-md hover:shadow-lg"
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
