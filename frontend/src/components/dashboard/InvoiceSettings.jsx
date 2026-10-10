import React, { useEffect, useState } from "react";
import { Save, Upload } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

function InvoiceSettings() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getBusinessSettings()
      .then((res) => setSettings(res.data))
      .catch((error) => toast.error(error.message || "Failed to load settings"));
  }, []);

  const update = (path, value) => {
    setSettings((prev) => {
      const next = structuredClone(prev || {});
      const parts = path.split(".");
      let target = next;
      for (let i = 0; i < parts.length - 1; i += 1) {
        target[parts[i]] = target[parts[i]] || {};
        target = target[parts[i]];
      }
      target[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.updateBusinessSettings(settings);
      setSettings(res.data);
      toast.success("Invoice settings saved");
    } catch (error) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="p-6">Loading settings...</div>;

  const input = "w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-sky-500 focus:ring-2 focus:ring-sky-500";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Settings</h1>
          <p className="text-sm text-gray-500">GST, company details, signature, bank details and invoice template controls.</p>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-700 disabled:opacity-60"><Save className="h-5 w-5" /> {saving ? "Saving..." : "Save Settings"}</button>
      </div>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">Company Details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <input className={input} value={settings.company?.name || ""} onChange={(e) => update("company.name", e.target.value)} placeholder="Company name" />
          <input className={input} value={settings.company?.tagline || ""} onChange={(e) => update("company.tagline", e.target.value)} placeholder="Tagline" />
          <input className={input} value={settings.company?.phone || ""} onChange={(e) => update("company.phone", e.target.value)} placeholder="Phone" />
          <input className={input} value={settings.company?.email || ""} onChange={(e) => update("company.email", e.target.value)} placeholder="Email" />
          <input className={input} value={settings.company?.gstin || ""} onChange={(e) => update("company.gstin", e.target.value)} placeholder="GSTIN" />
          <input className={input} value={settings.company?.whatsappNumber || ""} onChange={(e) => update("company.whatsappNumber", e.target.value)} placeholder="Company WhatsApp number" />
          <textarea className={`${input} md:col-span-2`} value={settings.company?.address || ""} onChange={(e) => update("company.address", e.target.value)} placeholder="Company address" />
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">GST & Automation</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <label className="flex items-center gap-3 rounded-xl border px-4 py-3"><input type="checkbox" checked={Boolean(settings.invoice?.gstEnabled)} onChange={(e) => update("invoice.gstEnabled", e.target.checked)} /> GST enabled</label>
          <input type="number" className={input} value={settings.invoice?.defaultGstPercent || 0} onChange={(e) => update("invoice.defaultGstPercent", Number(e.target.value))} placeholder="Default GST %" />
          <label className="flex items-center gap-3 rounded-xl border px-4 py-3"><input type="checkbox" checked={Boolean(settings.invoice?.autoSendEmail)} onChange={(e) => update("invoice.autoSendEmail", e.target.checked)} /> Auto email</label>
          <label className="flex items-center gap-3 rounded-xl border px-4 py-3"><input type="checkbox" checked={Boolean(settings.invoice?.autoSendWhatsapp)} onChange={(e) => update("invoice.autoSendWhatsapp", e.target.checked)} /> WhatsApp queue</label>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">Templates</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {["hotel", "tour", "car"].map((type) => (
            <div key={type} className="rounded-2xl border p-4">
              <h3 className="mb-3 font-bold capitalize">{type} invoice</h3>
              <input className={`${input} mb-3`} value={settings.invoice?.templates?.[type]?.title || ""} onChange={(e) => update(`invoice.templates.${type}.title`, e.target.value)} placeholder="Template title" />
              <input className={`${input} mb-3`} value={settings.invoice?.templates?.[type]?.prefix || ""} onChange={(e) => update(`invoice.templates.${type}.prefix`, e.target.value.toUpperCase())} placeholder="Invoice prefix" />
              <textarea className={input} value={settings.invoice?.templates?.[type]?.notes || ""} onChange={(e) => update(`invoice.templates.${type}.notes`, e.target.value)} placeholder="Default notes / template instructions" />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">Signature & Bank</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <input className={input} value={settings.signature?.imageUrl || ""} onChange={(e) => update("signature.imageUrl", e.target.value)} placeholder="Signature image URL" />
          <button type="button" className="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-gray-600"><Upload className="h-4 w-4" /> Upload endpoint ready; paste uploaded URL here</button>
          <input className={input} value={settings.bankDetails?.accountName || ""} onChange={(e) => update("bankDetails.accountName", e.target.value)} placeholder="Account name" />
          <input className={input} value={settings.bankDetails?.accountNumber || ""} onChange={(e) => update("bankDetails.accountNumber", e.target.value)} placeholder="Account number" />
          <input className={input} value={settings.bankDetails?.ifsc || ""} onChange={(e) => update("bankDetails.ifsc", e.target.value)} placeholder="IFSC" />
          <input className={input} value={settings.bankDetails?.upi || ""} onChange={(e) => update("bankDetails.upi", e.target.value)} placeholder="UPI ID" />
        </div>
      </section>
    </div>
  );
}

export default InvoiceSettings;
