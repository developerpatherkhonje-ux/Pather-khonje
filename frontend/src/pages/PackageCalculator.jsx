import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Car, Hotel, IndianRupee, MapPinned, Soup, Users } from "lucide-react";
import toast from "react-hot-toast";
import SEO from "../components/SEO";
import api from "../services/api";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

function PackageCalculator() {
  const [settings, setSettings] = useState(null);
  const [packages, setPackages] = useState([]);
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    packageId: "",
    adults: 4,
    children: 0,
    nights: 3,
    days: 4,
    rooms: 2,
    sharing: "double",
    vehicleType: "suv",
    vehicleCount: 1,
    emptySeats: 0,
    meals: ["breakfast", "dinner"],
    includeGst: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getPackageCalculatorPublicSettings();
        const data = res.data || {};
        setSettings(data.settings);
        setPackages(data.packages || []);
        const defaults = data.settings?.defaults || {};
        const defaultMeals = (data.settings?.mealOptions || []).filter((meal) => meal.defaultIncluded).map((meal) => meal.key);
        const firstPackage = data.packages?.[0];
        setForm((prev) => ({
          ...prev,
          packageId: firstPackage?.id || "",
          nights: defaults.nights || prev.nights,
          days: firstPackage?.days || (defaults.nights || prev.nights) + 1,
          adults: defaults.adults || prev.adults,
          children: defaults.children || 0,
          rooms: defaults.rooms || prev.rooms,
          sharing: defaults.sharing || prev.sharing,
          vehicleType: defaults.vehicleType || prev.vehicleType,
          vehicleCount: defaults.vehicleCount || prev.vehicleCount,
          emptySeats: defaults.emptySeats || 0,
          includeGst: defaults.includeGst ?? true,
          meals: defaultMeals.length ? defaultMeals : prev.meals,
        }));
      } catch (error) {
        toast.error(error.message || "Failed to load calculator");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectedPackage = useMemo(() => packages.find((pkg) => pkg.id === form.packageId), [packages, form.packageId]);
  const pax = Number(form.adults || 0) + Number(form.children || 0);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const calculate = async () => {
    try {
      const res = await api.calculatePackageEstimate(form);
      setEstimate(res.data);
    } catch (error) {
      toast.error(error.message || "Failed to calculate package");
    }
  };

  useEffect(() => {
    if (!loading && settings) calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, settings]);

  const toggleMeal = (key) => {
    setForm((prev) => ({
      ...prev,
      meals: prev.meals.includes(key) ? prev.meals.filter((item) => item !== key) : [...prev.meals, key],
    }));
  };

  const fieldClass = "w-full rounded-2xl border border-white/15 bg-white/90 px-4 py-3 text-sm font-semibold text-midnight-ocean shadow-sm outline-none focus:border-soft-gold focus:ring-2 focus:ring-soft-gold/40";

  if (loading) return <div className="min-h-screen bg-midnight-ocean pt-28 text-white">Loading calculator...</div>;

  return (
    <>
      <SEO title="Tour Package Calculator | Pather Khonje" description="Estimate custom tour package cost by travellers, room sharing, vehicle, meals, sightseeing and GST." />
      <main className="min-h-screen bg-[#071c23] text-white">
        <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(232,184,92,.35), transparent 28%), radial-gradient(circle at 80% 12%, rgba(77,171,169,.28), transparent 28%), linear-gradient(135deg, #071c23, #0b4a42)" }} />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-10 max-w-3xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-soft-gold/40 bg-soft-gold/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-soft-gold"><Calculator className="h-4 w-4" /> Package Calculator</p>
              <h1 className="font-serif text-4xl font-black leading-tight md:text-6xl">Build a hill tour estimate in minutes.</h1>
              <p className="mt-5 text-lg text-white/78">Select package, travellers, sharing, vehicle, meals and local services. The estimate separates hotel, transport, meals, sightseeing, permits, margin and GST.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-xl md:p-7">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="md:col-span-2">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-soft-gold">Package</span>
                    <select className={fieldClass} value={form.packageId} onChange={(e) => {
                      const pkg = packages.find((item) => item.id === e.target.value);
                      setForm((prev) => ({ ...prev, packageId: e.target.value, days: pkg?.days || prev.days, nights: Math.max((pkg?.days || prev.days) - 1, 0) }));
                    }}>
                      {packages.map((pkg) => <option key={pkg.id} value={pkg.id}>{pkg.name} · {pkg.duration}</option>)}
                    </select>
                  </label>

                  {[
                    ["adults", "Adults", Users],
                    ["children", "Children", Users],
                    ["nights", "Nights", Hotel],
                    ["days", "Days", MapPinned],
                    ["rooms", "Rooms", Hotel],
                    ["vehicleCount", "Vehicles", Car],
                    ["emptySeats", "Empty seats", Users],
                  ].map(([field, label, Icon]) => (
                    <label key={field}>
                      <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/70"><Icon className="h-4 w-4 text-soft-gold" /> {label}</span>
                      <input type="number" min="0" className={fieldClass} value={form[field]} onChange={(e) => update(field, Number(e.target.value))} />
                    </label>
                  ))}

                  <label>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-white/70">Room sharing</span>
                    <select className={fieldClass} value={form.sharing} onChange={(e) => update("sharing", e.target.value)}>
                      {(settings?.roomSharing || []).map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                    </select>
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-white/70">Vehicle</span>
                    <select className={fieldClass} value={form.vehicleType} onChange={(e) => update("vehicleType", e.target.value)}>
                      {(settings?.vehicleOptions || []).map((item) => <option key={item.key} value={item.key}>{item.label} · {item.capacity} seats</option>)}
                    </select>
                  </label>
                </div>

                <div className="mt-6 rounded-3xl border border-white/10 bg-white/8 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-bold text-soft-gold"><Soup className="h-5 w-5" /> Meals required</div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {(settings?.mealOptions || []).map((meal) => (
                      <button key={meal.key} type="button" onClick={() => toggleMeal(meal.key)} className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${form.meals.includes(meal.key) ? "border-soft-gold bg-soft-gold text-midnight-ocean" : "border-white/15 bg-white/10 text-white hover:bg-white/15"}`}>
                        <span className="block font-bold">{meal.label}</span>
                        <span className="text-xs opacity-75">{money(meal.perPersonCost)} / pax / day</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={calculate} className="mt-6 w-full rounded-2xl bg-soft-gold px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-midnight-ocean shadow-xl transition hover:brightness-110">
                  Calculate Package
                </button>
              </motion.div>

              <motion.aside initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-[2rem] border border-white/12 bg-white p-5 text-midnight-ocean shadow-2xl md:p-7">
                <div className="rounded-3xl bg-[#edf6f8] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0b4a42]">Estimated quote</p>
                  <h2 className="mt-2 text-3xl font-black">{money(estimate?.breakdown?.total)}</h2>
                  <p className="mt-1 text-sm text-slate-600">{money(estimate?.breakdown?.perPerson)} per person for {pax || 0} travellers</p>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    ["Hotel & sharing", estimate?.breakdown?.hotelCost],
                    ["Vehicle, driver, tolls", estimate?.breakdown?.transportCost],
                    ["Empty seat adjustment", estimate?.breakdown?.emptySeatCharge],
                    ["Meals", estimate?.breakdown?.mealCost],
                    ["Sightseeing & entries", estimate?.breakdown?.sightseeingCost],
                    ["Permits", estimate?.breakdown?.permitsCost],
                    ["Guide", estimate?.breakdown?.guideCost],
                    ["Contingency", estimate?.breakdown?.contingency],
                    ["Margin", estimate?.breakdown?.margin],
                    ["GST", estimate?.breakdown?.gst],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
                      <span className="text-sm font-semibold text-slate-600">{label}</span>
                      <span className="font-black">{money(value)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-3xl border border-soft-gold/40 bg-soft-gold/10 p-4 text-sm text-slate-700">
                  <p className="font-bold text-midnight-ocean">{selectedPackage?.name}</p>
                  <p className="mt-1">{selectedPackage?.route || "Route will be finalized by the team."}</p>
                  <p className="mt-3 text-xs leading-5">{estimate?.notes}</p>
                </div>
              </motion.aside>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default PackageCalculator;
