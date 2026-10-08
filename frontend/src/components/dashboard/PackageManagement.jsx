import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  Clock,
  Edit,
  Image as ImageIcon,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import apiService from "../../services/api";

const emptyPackage = {
  name: "",
  description: "",
  duration: "",
  price: "",
  rating: 4.5,
  category: "mountain",
  route: "",
  bestTime: "",
  groupSize: "",
  highlights: ["", "", ""],
  inclusions: ["Accommodation", "Transfers", ""],
  exclusions: ["Airfare", "Personal expenses", ""],
  itinerary: [
    { day: "Day 1", title: "", description: "" },
    { day: "Day 2", title: "", description: "" },
  ],
  hotels: [],
};

const categories = [
  "mountain",
  "hill stations",
  "family",
  "heritage",
  "beach",
  "adventure",
  "custom",
];

const toEditablePackage = (pkg) => ({
  ...emptyPackage,
  name: pkg.name || "",
  description: pkg.description || "",
  duration: pkg.duration || "",
  price: pkg.price || "",
  rating: pkg.rating || 4.5,
  category: pkg.category || "mountain",
  route: pkg.route || "",
  bestTime: pkg.bestTime || "",
  groupSize: pkg.groupSize || "",
  highlights: [...(pkg.highlights || []), "", ""],
  inclusions: [...(pkg.inclusions || []), ""],
  exclusions: [...(pkg.exclusions || []), ""],
  itinerary:
    pkg.itinerary && pkg.itinerary.length
      ? pkg.itinerary.map((item, index) => ({
          day: item.day || `Day ${index + 1}`,
          title: item.title || "",
          description: item.description || "",
        }))
      : emptyPackage.itinerary,
  hotels: pkg.hotels
    ? pkg.hotels.map((hotel) => (typeof hotel === "object" ? hotel.id || hotel._id : hotel))
    : [],
});

const cleanList = (items) => items.map((item) => String(item || "").trim()).filter(Boolean);

function PackageManagement() {
  const [packages, setPackages] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState(emptyPackage);
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [coverImage, setCoverImage] = useState("");
  const [galleryImages, setGalleryImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const loadPackages = async () => {
    const res = await apiService.listPackages();
    if (res.success) setPackages(res.data.packages || []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await loadPackages();
        const hotelRes = await apiService.getHotels(1, 100);
        if (hotelRes.success) setHotels(hotelRes.data.hotels || []);
      } catch (error) {
        console.error("Package management load failed:", error);
      }
    };
    load();
  }, []);

  const filteredPackages = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return packages;
    return packages.filter((pkg) =>
      [pkg.name, pkg.category, pkg.description, pkg.route].some((value) =>
        String(value || "").toLowerCase().includes(term),
      ),
    );
  }, [packages, searchTerm]);

  const resetForm = () => {
    setFormData(emptyPackage);
    setEditingPackage(null);
    setCoverFile(null);
    setGalleryFiles([]);
    setCoverImage("");
    setGalleryImages([]);
    setShowForm(false);
  };

  const openEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData(toEditablePackage(pkg));
    setCoverImage(pkg.image || "");
    setGalleryImages(pkg.images || []);
    setCoverFile(null);
    setGalleryFiles([]);
    setShowForm(true);
  };

  const updateArray = (field, index, value) => {
    setFormData((prev) => {
      const next = [...prev[field]];
      next[index] = value;
      return { ...prev, [field]: next };
    });
  };

  const addArrayItem = (field) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const updateItinerary = (index, key, value) => {
    setFormData((prev) => {
      const next = [...prev.itinerary];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, itinerary: next };
    });
  };

  const addItineraryDay = () => {
    setFormData((prev) => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        { day: `Day ${prev.itinerary.length + 1}`, title: "", description: "" },
      ],
    }));
  };

  const removeItineraryDay = (index) => {
    setFormData((prev) => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const toggleHotel = (hotelId) => {
    setFormData((prev) => ({
      ...prev,
      hotels: prev.hotels.includes(hotelId)
        ? prev.hotels.filter((id) => id !== hotelId)
        : [...prev.hotels, hotelId],
    }));
  };

  const savePackage = async () => {
    if (!formData.name || !formData.description || !formData.duration || !formData.price) {
      alert("Please fill name, description, duration and price.");
      return;
    }

    setSaving(true);
    try {
      let image = coverImage;
      let images = [...galleryImages];

      if (coverFile) {
        const uploaded = await apiService.uploadPackageImage(coverFile);
        if (uploaded.success) image = uploaded.data.relativeUrl || uploaded.data.url;
      }

      if (galleryFiles.length) {
        const uploaded = await apiService.uploadPackageImages(galleryFiles);
        if (uploaded.success && uploaded.data.files) {
          images = [
            ...images,
            ...uploaded.data.files.map((file) => file.relativeUrl || file.url),
          ];
        }
      }

      const payload = {
        ...formData,
        price: Number(formData.price),
        rating: formData.rating ? Number(formData.rating) : undefined,
        image,
        images,
        highlights: cleanList(formData.highlights),
        inclusions: cleanList(formData.inclusions),
        exclusions: cleanList(formData.exclusions),
        itinerary: formData.itinerary
          .map((item, index) => ({
            day: item.day || `Day ${index + 1}`,
            title: item.title.trim(),
            description: item.description.trim(),
          }))
          .filter((item) => item.title || item.description),
      };

      const res = editingPackage
        ? await apiService.updatePackage(editingPackage.id || editingPackage._id, payload)
        : await apiService.createPackage(payload);

      if (res.success) {
        await loadPackages();
        resetForm();
        alert(editingPackage ? "Package updated!" : "Package created!");
      } else {
        alert(res.message || "Failed to save package.");
      }
    } catch (error) {
      console.error("Package save failed:", error);
      alert(error.message || "Failed to save package.");
    } finally {
      setSaving(false);
    }
  };

  const deletePackage = async (id) => {
    if (!id || !window.confirm("Delete this package?")) return;
    const res = await apiService.deletePackage(id);
    if (res.success) setPackages((prev) => prev.filter((pkg) => (pkg.id || pkg._id) !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Package Management</h1>
          <p className="text-sm text-gray-500">
            Manage cover photos, gallery, itinerary, inclusions and pricing.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-white transition hover:bg-sky-800"
        >
          <Plus className="h-5 w-5" />
          Add Package
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search packages by name, category, route or description..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPackage ? "Edit Package" : "Add Package"}
              </h2>
              <button type="button" onClick={resetForm} className="rounded-full p-2 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Package Name *">
                <input className="admin-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </Field>
              <Field label="Category">
                <select className="admin-input" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </Field>
              <Field label="Duration *">
                <input className="admin-input" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="6 Days 5 Nights" />
              </Field>
              <Field label="Price per person *">
                <input type="number" className="admin-input" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </Field>
              <Field label="Route / Starts & Ends">
                <input className="admin-input" value={formData.route} onChange={(e) => setFormData({ ...formData, route: e.target.value })} placeholder="NJP - Gangtok - Pelling - NJP" />
              </Field>
              <Field label="Best Time">
                <input className="admin-input" value={formData.bestTime} onChange={(e) => setFormData({ ...formData, bestTime: e.target.value })} />
              </Field>
              <Field label="Group Size">
                <input className="admin-input" value={formData.groupSize} onChange={(e) => setFormData({ ...formData, groupSize: e.target.value })} />
              </Field>
              <Field label="Rating">
                <input type="number" min="1" max="5" step="0.1" className="admin-input" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} />
              </Field>
              <Field label="Cover Photo">
                <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
                {(coverFile || coverImage) && <p className="mt-2 text-xs text-green-700">{coverFile?.name || coverImage.split("/").pop()}</p>}
              </Field>
              <Field label="Gallery Photos">
                <input type="file" accept="image/*" multiple onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))} />
                {galleryImages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {galleryImages.map((image, index) => (
                      <div key={`${image}-${index}`} className="relative">
                        <img src={apiService.toAbsoluteUrl(image)} alt="" className="h-14 w-20 rounded-lg object-cover" />
                        <button type="button" onClick={() => setGalleryImages((prev) => prev.filter((_, itemIndex) => itemIndex !== index))} className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Field>
              <Field label="Description *" wide>
                <textarea rows={4} className="admin-input" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </Field>

              <ArrayEditor title="Highlights" field="highlights" values={formData.highlights} onAdd={addArrayItem} onRemove={removeArrayItem} onUpdate={updateArray} />
              <ArrayEditor title="Inclusions" field="inclusions" values={formData.inclusions} onAdd={addArrayItem} onRemove={removeArrayItem} onUpdate={updateArray} />
              <ArrayEditor title="Exclusions" field="exclusions" values={formData.exclusions} onAdd={addArrayItem} onRemove={removeArrayItem} onUpdate={updateArray} />

              <div className="md:col-span-2 rounded-xl border border-gray-200 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Day-wise Itinerary</h3>
                    <p className="text-xs text-gray-500">Shown on package details and itinerary download.</p>
                  </div>
                  <button type="button" onClick={addItineraryDay} className="rounded-lg bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700">+ Add Day</button>
                </div>
                <div className="space-y-3">
                  {formData.itinerary.map((item, index) => (
                    <div key={`day-${index}`} className="grid gap-3 rounded-xl bg-gray-50 p-3 md:grid-cols-[110px_1fr_40px]">
                      <input className="admin-input" value={item.day} onChange={(e) => updateItinerary(index, "day", e.target.value)} />
                      <div className="space-y-2">
                        <input className="admin-input" value={item.title} onChange={(e) => updateItinerary(index, "title", e.target.value)} placeholder="Day title" />
                        <textarea rows={2} className="admin-input" value={item.description} onChange={(e) => updateItinerary(index, "description", e.target.value)} placeholder="What happens on this day?" />
                      </div>
                      <button type="button" onClick={() => removeItineraryDay(index)} className="h-10 rounded-lg border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600">
                        <X className="mx-auto h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {hotels.length > 0 && (
                <div className="md:col-span-2 rounded-xl border border-gray-200 p-4">
                  <h3 className="mb-3 font-semibold text-gray-900">Included Hotels</h3>
                  <div className="grid max-h-48 gap-2 overflow-y-auto sm:grid-cols-2">
                    {hotels.map((hotel) => {
                      const id = hotel.id || hotel._id;
                      const selected = formData.hotels.includes(id);
                      return (
                        <button key={id} type="button" onClick={() => toggleHotel(id)} className={`flex items-center gap-3 rounded-lg border p-3 text-left ${selected ? "border-sky-300 bg-sky-50" : "border-gray-100 hover:bg-gray-50"}`}>
                          <span className={`flex h-5 w-5 items-center justify-center rounded border ${selected ? "border-sky-600 bg-sky-600" : "border-gray-300"}`}>
                            {selected && <Check className="h-3 w-3 text-white" />}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{hotel.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-3 border-t pt-5">
              <button type="button" onClick={savePackage} disabled={saving} className="flex-1 rounded-xl bg-sky-700 py-3 font-semibold text-white disabled:opacity-60">
                {saving ? "Saving..." : editingPackage ? "Update Package" : "Create Package"}
              </button>
              <button type="button" onClick={resetForm} disabled={saving} className="flex-1 rounded-xl border border-gray-300 py-3 font-semibold text-gray-700">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredPackages.map((pkg) => (
          <article key={pkg.id || pkg._id} className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-100">
            <div className="relative h-48">
              <img src={apiService.toAbsoluteUrl(pkg.image) || "/assets/hero12.jpg"} alt={pkg.name} className="h-full w-full object-cover" />
              <span className="absolute left-4 top-4 rounded-full bg-sky-900/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                {pkg.category}
              </span>
              <div className="absolute right-4 top-4 flex gap-2">
                <button type="button" onClick={() => openEdit(pkg)} className="rounded-full bg-white/95 p-2 shadow">
                  <Edit className="h-4 w-4 text-gray-700" />
                </button>
                <button type="button" onClick={() => deletePackage(pkg.id || pkg._id)} className="rounded-full bg-white/95 p-2 shadow">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
            <div className="p-5">
              <h3 className="line-clamp-1 text-lg font-bold text-gray-900">{pkg.name}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">{pkg.description}</p>
              <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{pkg.duration}</span>
                <span className="font-bold text-sky-700">₹{Number(pkg.price || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(pkg.highlights || []).slice(0, 3).map((item) => (
                  <span key={item} className="rounded bg-gray-100 px-2 py-1 text-[10px] font-bold uppercase text-gray-600">{item}</span>
                ))}
                {pkg.itinerary?.length > 0 && (
                  <span className="rounded bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">{pkg.itinerary.length} days</span>
                )}
                {pkg.images?.length > 0 && (
                  <span className="rounded bg-sky-50 px-2 py-1 text-[10px] font-bold uppercase text-sky-700">{pkg.images.length} photos</span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredPackages.length === 0 && (
        <div className="rounded-3xl border border-gray-100 bg-gray-50 py-16 text-center">
          <ImageIcon className="mx-auto mb-4 h-14 w-14 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900">No packages found</h3>
          <p className="mt-2 text-sm text-gray-500">Add a package or change your search.</p>
        </div>
      )}
    </div>
  );
}

function Field({ label, children, wide = false }) {
  return (
    <label className={wide ? "md:col-span-2" : ""}>
      <span className="mb-2 block text-sm font-semibold text-gray-700">{label}</span>
      {children}
    </label>
  );
}

function ArrayEditor({ title, field, values, onAdd, onRemove, onUpdate }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <button type="button" onClick={() => onAdd(field)} className="text-xs font-semibold text-sky-700">+ Add</button>
      </div>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={`${field}-${index}`} className="flex gap-2">
            <input className="admin-input" value={value} onChange={(event) => onUpdate(field, index, event.target.value)} placeholder={`${title} ${index + 1}`} />
            <button type="button" onClick={() => onRemove(field, index)} className="rounded-lg border border-gray-200 px-3 text-gray-500 hover:bg-red-50 hover:text-red-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PackageManagement;
