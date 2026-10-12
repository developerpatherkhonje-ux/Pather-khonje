import React, { useEffect, useState } from "react";
import { Calculator, Plus, Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

const numberFields = new Set([
  "personsPerRoom", "extraBedRate", "multiplier", "capacity", "perDayCost", "driverAllowance", "fuelBuffer",
  "perPersonCost", "hotelPerRoomNight", "childMealPercent", "sightseeingPerPerson", "guidePerDay", "permitsPerPerson",
  "parkingTollPerDay", "contingencyPercent", "childActivityPercent", "emptySeatChargePercent", "nights", "adults",
  "children", "rooms", "vehicleCount", "emptySeats", "marginPercent", "gstPercent",
]);

function PackageCalculatorSettings() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getPackageCalculatorSettings()
      .then((res) => setSettings(res.data))
      .catch((error) => toast.error(error.message || "Failed to load calculator settings"));
  }, []);

  const update = (path, value) => {
    setSettings((prev) => {
      const next = structuredClone(prev);
      const parts = path.split(".");
      let target = next;
      for (let i = 0; i < parts.length - 1; i += 1) target = target[parts[i]];
      const last = parts[parts.length - 1];
      target[last] = numberFields.has(last) ? Number(value) : value;
      return next;
    });
  };

  const updateArray = (arrayName, index, field, value) => {
    setSettings((prev) => {
      const next = structuredClone(prev);
      next[arrayName][index][field] = numberFields.has(field) ? Number(value) : value;
      return next;
    });
  };

  const addArrayItem = (arrayName, item) => setSettings((prev) => ({ ...prev, [arrayName]: [...(prev[arrayName] || []), item] }));
  const removeArrayItem = (arrayName, index) => setSettings((prev) => ({ ...prev, [arrayName]: prev[arrayName].filter((_, i) => i !== index) }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.updatePackageCalculatorSettings(settings);
      setSettings(res.data);
      toast.success("Package calculator settings saved");
    } catch (error) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="p-6">Loading package calculator settings...</div>;
  const input = "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900"><Calculator className="h-6 w-6 text-sky-600" /> Package Calculator Settings</h1>
          <p className="text-sm text-gray-500">Admin cost rules for public package calculator: rooms, sharing, vehicle, meals, sightseeing, permits, margin and GST.</p>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-700 disabled:opacity-60"><Save className="h-5 w-5" /> {saving ? "Saving..." : "Save Settings"}</button>
      </div>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">Default Inputs</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {["nights", "adults", "children", "rooms", "vehicleCount", "emptySeats", "marginPercent", "gstPercent"].map((field) => (
            <label key={field} className="text-sm font-semibold capitalize text-gray-600">{field.replace(/([A-Z])/g, " $1")}
              <input type="number" className={`${input} mt-1`} value={settings.defaults?.[field] ?? 0} onChange={(e) => update(`defaults.${field}`, e.target.value)} />
            </label>
          ))}
          <label className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold text-gray-700"><input type="checkbox" checked={Boolean(settings.defaults?.includeGst)} onChange={(e) => update("defaults.includeGst", e.target.checked)} /> Include GST</label>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">Cost Rules</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.keys(settings.costRules || {}).map((field) => (
            <label key={field} className="text-sm font-semibold capitalize text-gray-600">{field.replace(/([A-Z])/g, " $1")}
              <input type="number" className={`${input} mt-1`} value={settings.costRules?.[field] ?? 0} onChange={(e) => update(`costRules.${field}`, e.target.value)} />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Room Sharing</h2>
          <button onClick={() => addArrayItem("roomSharing", { key: "custom", label: "Custom sharing", personsPerRoom: 2, extraBedRate: 0, multiplier: 1 })} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><Plus className="h-4 w-4" /> Add</button>
        </div>
        <div className="space-y-3">
          {(settings.roomSharing || []).map((item, index) => (
            <div key={`${item.key}-${index}`} className="grid gap-3 rounded-xl border p-3 md:grid-cols-6">
              {["key", "label", "personsPerRoom", "extraBedRate", "multiplier"].map((field) => <input key={field} className={input} value={item[field] ?? ""} onChange={(e) => updateArray("roomSharing", index, field, e.target.value)} placeholder={field} />)}
              <button onClick={() => removeArrayItem("roomSharing", index)} className="rounded-lg bg-red-50 px-3 text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Vehicle Options</h2>
          <button onClick={() => addArrayItem("vehicleOptions", { key: "custom", label: "Custom vehicle", capacity: 4, perDayCost: 0, driverAllowance: 0, fuelBuffer: 0 })} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><Plus className="h-4 w-4" /> Add</button>
        </div>
        <div className="space-y-3">
          {(settings.vehicleOptions || []).map((item, index) => (
            <div key={`${item.key}-${index}`} className="grid gap-3 rounded-xl border p-3 md:grid-cols-7">
              {["key", "label", "capacity", "perDayCost", "driverAllowance", "fuelBuffer"].map((field) => <input key={field} className={input} value={item[field] ?? ""} onChange={(e) => updateArray("vehicleOptions", index, field, e.target.value)} placeholder={field} />)}
              <button onClick={() => removeArrayItem("vehicleOptions", index)} className="rounded-lg bg-red-50 px-3 text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Meal Options</h2>
          <button onClick={() => addArrayItem("mealOptions", { key: "custom", label: "Custom meal", perPersonCost: 0, defaultIncluded: false })} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><Plus className="h-4 w-4" /> Add</button>
        </div>
        <div className="space-y-3">
          {(settings.mealOptions || []).map((item, index) => (
            <div key={`${item.key}-${index}`} className="grid gap-3 rounded-xl border p-3 md:grid-cols-5">
              {["key", "label", "perPersonCost"].map((field) => <input key={field} className={input} value={item[field] ?? ""} onChange={(e) => updateArray("mealOptions", index, field, e.target.value)} placeholder={field} />)}
              <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={Boolean(item.defaultIncluded)} onChange={(e) => updateArray("mealOptions", index, "defaultIncluded", e.target.checked)} /> Default</label>
              <button onClick={() => removeArrayItem("mealOptions", index)} className="rounded-lg bg-red-50 px-3 text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">Customer Note</h2>
        <textarea rows={4} className={input} value={settings.notes || ""} onChange={(e) => update("notes", e.target.value)} />
      </section>
    </div>
  );
}

export default PackageCalculatorSettings;
