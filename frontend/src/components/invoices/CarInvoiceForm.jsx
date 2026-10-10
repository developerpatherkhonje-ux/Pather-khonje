import React, { useMemo, useState } from "react";
import { Download, Save } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

function CarInvoiceForm({ onCreated, onCancel, inlineButtons = true, formId = "car-invoice-form" }) {
  const [form, setForm] = useState({
    type: "car",
    customer: { name: "", phone: "", email: "", address: "" },
    carDetails: { carName: "", vehicleNumber: "", route: "", pickupPoint: "", dropPoint: "", startDate: "", endDate: "", days: 1, ratePerDay: 0, driverName: "", driverPhone: "", inclusions: "", exclusions: "" },
    subtotal: 0,
    discount: 0,
    tax: 0,
    gstPercent: 0,
    total: 0,
    advancePaid: 0,
    paymentMethod: "Cash",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(null);

  const recompute = (next) => {
    const days = Number(next.carDetails.days || 0);
    const rate = Number(next.carDetails.ratePerDay || 0);
    next.subtotal = days * rate;
    const taxable = Math.max(next.subtotal - Number(next.discount || 0), 0);
    next.tax = Number(next.tax || 0);
    next.total = Math.max(taxable + next.tax, 0);
  };

  const update = (path, value) => {
    setForm((prev) => {
      const next = { ...prev, customer: { ...prev.customer }, carDetails: { ...prev.carDetails } };
      const parts = path.split(".");
      let target = next;
      for (let i = 0; i < parts.length - 1; i += 1) target = target[parts[i]];
      target[parts[parts.length - 1]] = value;
      if (path === "carDetails.startDate" || path === "carDetails.endDate") {
        const start = new Date(next.carDetails.startDate);
        const end = new Date(next.carDetails.endDate);
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
          next.carDetails.days = Math.max(Math.floor((end - start) / 86400000) + 1, 1);
        }
      }
      recompute(next);
      return next;
    });
  };

  const due = useMemo(() => Math.max(Number(form.total || 0) - Number(form.advancePaid || 0), 0), [form.total, form.advancePaid]);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await api.createInvoice({ ...form });
      const invoice = res.data || res;
      setSaved(invoice);
      toast.success(`${invoice.invoiceNumber || "Car invoice"} saved`);
      onCreated?.(invoice);
    } catch (error) {
      toast.error(error.message || "Failed to save car invoice");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-sky-500 focus:ring-2 focus:ring-sky-500";

  return (
    <form id={formId} onSubmit={submit} className="space-y-5">
      {inlineButtons && (
        <div className="flex justify-end gap-3">
          <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-white"><Save className="h-4 w-4" /> {loading ? "Saving..." : "Save Invoice"}</button>
          <button type="button" disabled={!saved?._id} onClick={() => api.downloadInvoicePdf(saved._id, saved.invoiceNumber)} className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-white disabled:opacity-50"><Download className="h-4 w-4" /> PDF</button>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white">
          <div className="border-b px-4 py-3 font-semibold">Customer Information</div>
          <div className="grid gap-3 p-4">
            <input required className={inputClass} placeholder="Customer name" value={form.customer.name} onChange={(e) => update("customer.name", e.target.value)} />
            <input className={inputClass} placeholder="Phone" value={form.customer.phone} onChange={(e) => update("customer.phone", e.target.value)} />
            <input type="email" className={inputClass} placeholder="Email" value={form.customer.email} onChange={(e) => update("customer.email", e.target.value)} />
            <textarea className={inputClass} placeholder="Address" value={form.customer.address} onChange={(e) => update("customer.address", e.target.value)} />
          </div>
        </section>
        <section className="rounded-2xl border bg-white">
          <div className="border-b px-4 py-3 font-semibold">Car Details</div>
          <div className="grid gap-3 p-4 md:grid-cols-2">
            <input required className={inputClass} placeholder="Car name" value={form.carDetails.carName} onChange={(e) => update("carDetails.carName", e.target.value)} />
            <input className={inputClass} placeholder="Vehicle number" value={form.carDetails.vehicleNumber} onChange={(e) => update("carDetails.vehicleNumber", e.target.value)} />
            <input className={`${inputClass} md:col-span-2`} placeholder="Route" value={form.carDetails.route} onChange={(e) => update("carDetails.route", e.target.value)} />
            <input className={inputClass} placeholder="Pickup point" value={form.carDetails.pickupPoint} onChange={(e) => update("carDetails.pickupPoint", e.target.value)} />
            <input className={inputClass} placeholder="Drop point" value={form.carDetails.dropPoint} onChange={(e) => update("carDetails.dropPoint", e.target.value)} />
            <input type="date" className={inputClass} value={form.carDetails.startDate} onChange={(e) => update("carDetails.startDate", e.target.value)} />
            <input type="date" className={inputClass} value={form.carDetails.endDate} onChange={(e) => update("carDetails.endDate", e.target.value)} />
            <input type="number" min="1" className={inputClass} placeholder="Days" value={form.carDetails.days} onChange={(e) => update("carDetails.days", e.target.value)} />
            <input type="number" min="0" className={inputClass} placeholder="Rate per day" value={form.carDetails.ratePerDay} onChange={(e) => update("carDetails.ratePerDay", e.target.value)} />
          </div>
        </section>
      </div>

      <section className="rounded-2xl border bg-white">
        <div className="border-b px-4 py-3 font-semibold">Payment Summary</div>
        <div className="grid gap-4 p-4 md:grid-cols-5">
          <input type="number" className={inputClass} value={form.subtotal} readOnly />
          <input type="number" className={inputClass} placeholder="Discount" value={form.discount} onChange={(e) => update("discount", e.target.value)} />
          <input type="number" className={inputClass} placeholder="GST/Tax" value={form.tax} onChange={(e) => update("tax", e.target.value)} />
          <input type="number" className={inputClass} value={form.total} readOnly />
          <input type="number" className={inputClass} placeholder="Paid now" value={form.advancePaid} onChange={(e) => update("advancePaid", e.target.value)} />
        </div>
        <div className="px-4 pb-4 text-sm font-semibold text-amber-700">Due after save: ₹{due.toLocaleString("en-IN")}</div>
      </section>
    </form>
  );
}

export default CarInvoiceForm;
