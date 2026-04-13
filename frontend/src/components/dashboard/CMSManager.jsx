import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Quote, FileText, Receipt, PlusCircle, Trash2, HelpCircle } from 'lucide-react';

function CMSManager() {
  const [activeTab, setActiveTab] = useState("invoice");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // --- MOCK STATE (These would be fetched/saved to your backend) ---
  
  // 1. Invoice Terms
  const [invoiceTerms, setInvoiceTerms] = useState(
    "1. All payments must be made in full before the journey begins.\n2. Bank charges for transfers are to be borne by the client.\n3. Pather Khonje holds no liability for natural disasters affecting travel."
  );

  // 2. Testimonials
  const [testimonials, setTestimonials] = useState([
    { id: 1, name: "Aritra Ghosh", text: "Amazing experience with Pather Khonje!", location: "Kolkata" }
  ]);

  // 3. Policies & FAQs
  const [privacyPolicy, setPrivacyPolicy] = useState(
    "1. Information Collection: We collect personal information (name, email, phone number) when you submit an inquiry or make a booking.\n2. Use of Information: Your data is used strictly to process bookings, communicate travel updates, and improve our services."
  );
  const [bookingTerms, setBookingTerms] = useState(
    "1. Reservations: A 30% advance payment is required to confirm any booking. The remaining balance must be paid 15 days before the travel date.\n2. Modifications: Requests to change travel dates are subject to availability and may incur administrative fees."
  );
  const [faqs, setFaqs] = useState([
    { q: "How do I book a tour package?", a: "You can book directly through our website by selecting a package, clicking 'Plan Your Journey', and submitting an inquiry." },
    { q: "What is your cancellation policy?", a: "Cancellations made 30 days prior to departure receive a full refund. Cancellations within 15 days incur a 50% fee." }
  ]);

  // --- HANDLERS ---

  const handleSave = (e) => {
    e.preventDefault();
    // Simulate API call to save settings
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddFaq = () => {
    setFaqs([...faqs, { q: "", a: "" }]);
  };

  const handleRemoveFaq = (index) => {
    const newFaqs = faqs.filter((_, i) => i !== index);
    setFaqs(newFaqs);
  };

  const handleFaqChange = (index, field, value) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-midnight-ocean">Content Manager</h1>
          <p className="text-gray-500 text-sm mt-1">Manage Website Data and PDF Configurations</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: "invoice", icon: Receipt, label: "Invoice Terms" },
          { id: "policies", icon: FileText, label: "Website Policies & FAQ" },
          { id: "testimonials", icon: Quote, label: "Testimonials" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${
              activeTab === tab.id ? "border-midnight-ocean text-midnight-ocean" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Form Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        
        {/* TAB 1: INVOICE SETTINGS */}
        {activeTab === "invoice" && (
          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-midnight-ocean mb-2">Invoice & Receipt Terms and Conditions</label>
              <p className="text-xs text-gray-500 mb-4">This text will be automatically printed on the SECOND PAGE of all generated PDF Invoices and Payment Receipts.</p>
              <textarea
                value={invoiceTerms}
                onChange={(e) => setInvoiceTerms(e.target.value)}
                rows={10}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soft-gold outline-none text-sm font-medium leading-relaxed"
              ></textarea>
            </div>
            <div className="flex items-center">
              <button type="submit" className="flex items-center gap-2 bg-midnight-ocean text-white px-6 py-3 font-bold uppercase tracking-widest text-xs rounded-md hover:bg-deep-steel-blue">
                <Save size={16} /> Save Invoice Settings
              </button>
              {saveSuccess && <span className="text-green-600 text-sm ml-4 font-bold">Settings Saved Successfully!</span>}
            </div>
          </motion.form>
        )}

        {/* TAB 2: POLICIES & FAQ */}
        {activeTab === "policies" && (
          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSave} className="space-y-10">
            
            {/* Privacy Policy */}
            <div>
              <label className="block text-lg font-serif text-midnight-ocean mb-2">Privacy Policy</label>
              <p className="text-xs text-gray-500 mb-4">Edit the text that appears on the public Privacy Policy page.</p>
              <textarea
                value={privacyPolicy}
                onChange={(e) => setPrivacyPolicy(e.target.value)}
                rows={6}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soft-gold outline-none text-sm font-medium leading-relaxed"
              ></textarea>
            </div>

            {/* Booking Terms */}
            <div>
              <label className="block text-lg font-serif text-midnight-ocean mb-2">Booking Terms & Conditions</label>
              <p className="text-xs text-gray-500 mb-4">Edit the text that appears on the public Booking Terms page.</p>
              <textarea
                value={bookingTerms}
                onChange={(e) => setBookingTerms(e.target.value)}
                rows={6}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soft-gold outline-none text-sm font-medium leading-relaxed"
              ></textarea>
            </div>

            <hr className="border-gray-100" />

            {/* FAQs */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <label className="block text-lg font-serif text-midnight-ocean">Frequently Asked Questions</label>
                  <p className="text-xs text-gray-500 mt-1">Manage the Q&A section on your policies page.</p>
                </div>
                <button 
                  type="button" 
                  onClick={handleAddFaq}
                  className="flex items-center gap-2 bg-soft-gold/20 text-midnight-ocean px-4 py-2 font-bold uppercase tracking-widest text-xs rounded-md hover:bg-soft-gold hover:text-white transition-colors"
                >
                  <PlusCircle size={16} /> Add FAQ
                </button>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 items-start">
                    <div className="mt-2 text-gray-400"><HelpCircle size={20} /></div>
                    <div className="flex-1 space-y-3">
                      <input 
                        type="text" 
                        value={faq.q} 
                        onChange={(e) => handleFaqChange(index, "q", e.target.value)}
                        placeholder="Question..."
                        className="w-full p-2 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-soft-gold outline-none font-bold text-midnight-ocean text-sm"
                      />
                      <textarea 
                        value={faq.a} 
                        onChange={(e) => handleFaqChange(index, "a", e.target.value)}
                        placeholder="Answer..."
                        rows={2}
                        className="w-full p-2 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-soft-gold outline-none text-sm text-gray-600 leading-relaxed"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveFaq(index)}
                      className="text-red-400 hover:text-red-600 p-2 mt-1 transition-colors"
                      title="Remove FAQ"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center pt-4">
              <button type="submit" className="flex items-center gap-2 bg-midnight-ocean text-white px-6 py-3 font-bold uppercase tracking-widest text-xs rounded-md hover:bg-deep-steel-blue">
                <Save size={16} /> Save Policies & FAQ
              </button>
              {saveSuccess && <span className="text-green-600 text-sm ml-4 font-bold">Policies Saved Successfully!</span>}
            </div>
          </motion.form>
        )}

        {/* TAB 3: TESTIMONIALS (Placeholder for UI) */}
        {activeTab === "testimonials" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <button className="flex items-center gap-2 bg-soft-gold/20 text-midnight-ocean px-4 py-2 font-bold uppercase tracking-widest text-xs rounded-md hover:bg-soft-gold hover:text-white transition-colors">
              <PlusCircle size={16} /> Add New Testimonial
            </button>
            <div className="space-y-4">
              {testimonials.map(t => (
                <div key={t.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div>
                    <h4 className="font-bold text-midnight-ocean">{t.name} <span className="text-gray-400 text-xs font-normal">({t.location})</span></h4>
                    <p className="text-sm text-gray-600 mt-1 italic">"{t.text}"</p>
                  </div>
                  <button className="text-red-400 hover:text-red-600 p-2 transition-colors"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

export default CMSManager;