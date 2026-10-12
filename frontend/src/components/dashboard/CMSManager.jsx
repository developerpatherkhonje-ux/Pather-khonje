import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, HelpCircle, Loader2, PlusCircle, Quote, Receipt, Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

function CMSManager() {
  const [activeTab, setActiveTab] = useState("invoice");
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getBusinessSettings()
      .then((res) => setSettings(res.data || {}))
      .catch((error) => toast.error(error.message || "Failed to load content settings"));
  }, []);

  const content = settings?.content || {};

  const updateContent = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      content: {
        ...(prev?.content || {}),
        [field]: value,
      },
    }));
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateBusinessSettings(settings);
      setSettings(res.data || settings);
      toast.success("Content saved");
    } catch (error) {
      toast.error(error.message || "Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const updateFaq = (index, field, value) => {
    const faqs = [...(content.faqs || [])];
    faqs[index] = { ...faqs[index], [field]: value };
    updateContent("faqs", faqs);
  };

  const updateTestimonial = (index, field, value) => {
    const testimonials = [...(content.testimonials || [])];
    testimonials[index] = { ...testimonials[index], [field]: value };
    updateContent("testimonials", testimonials);
  };

  if (!settings) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-sky-600" /></div>;
  }

  return (
    <div className="max-w-5xl space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-serif text-midnight-ocean">Content Manager</h1>
        <p className="mt-1 text-sm text-gray-500">Manage website copy, invoice terms, FAQ and testimonials from one place.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-gray-200">
        {[
          { id: "invoice", icon: Receipt, label: "Invoice Terms" },
          { id: "policies", icon: FileText, label: "Policies & FAQ" },
          { id: "testimonials", icon: Quote, label: "Testimonials" },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 border-b-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === tab.id ? "border-midnight-ocean text-midnight-ocean" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        {activeTab === "invoice" && (
          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={save} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-bold text-midnight-ocean">Invoice & Receipt Terms and Conditions</label>
              <textarea value={content.invoiceTerms || ""} onChange={(e) => updateContent("invoiceTerms", e.target.value)} rows={10} className="w-full rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm font-medium leading-relaxed outline-none focus:ring-2 focus:ring-soft-gold" />
            </div>
            <button disabled={saving} className="flex items-center gap-2 rounded-md bg-midnight-ocean px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-deep-steel-blue disabled:opacity-60">
              <Save size={16} /> {saving ? "Saving..." : "Save Invoice Settings"}
            </button>
          </motion.form>
        )}

        {activeTab === "policies" && (
          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={save} className="space-y-10">
            <div>
              <label className="mb-2 block text-lg font-serif text-midnight-ocean">Privacy Policy</label>
              <textarea value={content.privacyPolicy || ""} onChange={(e) => updateContent("privacyPolicy", e.target.value)} rows={6} className="w-full rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm font-medium leading-relaxed outline-none focus:ring-2 focus:ring-soft-gold" />
            </div>
            <div>
              <label className="mb-2 block text-lg font-serif text-midnight-ocean">Booking Terms & Conditions</label>
              <textarea value={content.bookingTerms || ""} onChange={(e) => updateContent("bookingTerms", e.target.value)} rows={6} className="w-full rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm font-medium leading-relaxed outline-none focus:ring-2 focus:ring-soft-gold" />
            </div>
            <div>
              <div className="mb-4 flex items-center justify-between">
                <label className="block text-lg font-serif text-midnight-ocean">Frequently Asked Questions</label>
                <button type="button" onClick={() => updateContent("faqs", [...(content.faqs || []), { q: "", a: "" }])} className="flex items-center gap-2 rounded-md bg-soft-gold/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-midnight-ocean hover:bg-soft-gold hover:text-white">
                  <PlusCircle size={16} /> Add FAQ
                </button>
              </div>
              <div className="space-y-4">
                {(content.faqs || []).map((faq, index) => (
                  <div key={index} className="flex items-start gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <HelpCircle className="mt-2 text-gray-400" size={20} />
                    <div className="flex-1 space-y-3">
                      <input value={faq.q || ""} onChange={(e) => updateFaq(index, "q", e.target.value)} placeholder="Question..." className="w-full rounded border border-gray-200 bg-white p-2 text-sm font-bold text-midnight-ocean outline-none focus:ring-1 focus:ring-soft-gold" />
                      <textarea value={faq.a || ""} onChange={(e) => updateFaq(index, "a", e.target.value)} placeholder="Answer..." rows={2} className="w-full rounded border border-gray-200 bg-white p-2 text-sm leading-relaxed text-gray-600 outline-none focus:ring-1 focus:ring-soft-gold" />
                    </div>
                    <button type="button" onClick={() => updateContent("faqs", (content.faqs || []).filter((_, itemIndex) => itemIndex !== index))} className="mt-1 p-2 text-red-400 hover:text-red-600"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
            </div>
            <button disabled={saving} className="flex items-center gap-2 rounded-md bg-midnight-ocean px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-deep-steel-blue disabled:opacity-60">
              <Save size={16} /> {saving ? "Saving..." : "Save Policies & FAQ"}
            </button>
          </motion.form>
        )}

        {activeTab === "testimonials" && (
          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={save} className="space-y-6">
            <button type="button" onClick={() => updateContent("testimonials", [...(content.testimonials || []), { name: "", text: "", location: "" }])} className="flex items-center gap-2 rounded-md bg-soft-gold/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-midnight-ocean hover:bg-soft-gold hover:text-white">
              <PlusCircle size={16} /> Add New Testimonial
            </button>
            <div className="space-y-4">
              {(content.testimonials || []).map((item, index) => (
                <div key={index} className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-[1fr_1fr_auto]">
                  <input value={item.name || ""} onChange={(e) => updateTestimonial(index, "name", e.target.value)} placeholder="Name" className="rounded border border-gray-200 bg-white p-2 text-sm font-semibold outline-none focus:ring-1 focus:ring-soft-gold" />
                  <input value={item.location || ""} onChange={(e) => updateTestimonial(index, "location", e.target.value)} placeholder="Location" className="rounded border border-gray-200 bg-white p-2 text-sm outline-none focus:ring-1 focus:ring-soft-gold" />
                  <button type="button" onClick={() => updateContent("testimonials", (content.testimonials || []).filter((_, itemIndex) => itemIndex !== index))} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                  <textarea value={item.text || ""} onChange={(e) => updateTestimonial(index, "text", e.target.value)} placeholder="Testimonial" rows={2} className="rounded border border-gray-200 bg-white p-2 text-sm outline-none focus:ring-1 focus:ring-soft-gold md:col-span-3" />
                </div>
              ))}
            </div>
            <button disabled={saving} className="flex items-center gap-2 rounded-md bg-midnight-ocean px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-deep-steel-blue disabled:opacity-60">
              <Save size={16} /> {saving ? "Saving..." : "Save Testimonials"}
            </button>
          </motion.form>
        )}
      </div>
    </div>
  );
}

export default CMSManager;
