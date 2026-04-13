import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, BookOpen, HelpCircle, ChevronDown } from "lucide-react";
import SEO from "../components/SEO";

const Policies = () => {
  const [activeTab, setActiveTab] = useState("privacy");
  const [openFaq, setOpenFaq] = useState(null);

  // In a real app, you would fetch these from your backend CMS
  const faqs = [
    { q: "How do I book a tour package?", a: "You can book directly through our website by selecting a package, clicking 'Plan Your Journey', and submitting an inquiry. Our team will contact you to confirm details and process payment." },
    { q: "What is your cancellation policy?", a: "Cancellations made 30 days prior to departure receive a full refund. Cancellations within 15 days incur a 50% fee. No refunds for cancellations within 7 days." },
    { q: "Are flights included in the packages?", a: "Flight inclusions depend on the specific package. Please check the 'What's Included' section of your chosen destination." },
    { q: "Do you offer custom itineraries?", a: "Yes! We specialize in crafting tailor-made journeys. Contact our corporate team with your requirements." }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 font-sans text-midnight-ocean">
      <SEO title="Policies & FAQ" description="Pather Khonje privacy policy, booking terms, and frequently asked questions." />
      
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Legal & Support</h1>
          <p className="text-slate-gray">Everything you need to know about traveling with us.</p>
        </div>

        {/* Custom Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {[
            { id: "privacy", label: "Privacy Policy", icon: Shield },
            { id: "booking", label: "Booking Terms", icon: BookOpen },
            { id: "faq", label: "FAQs", icon: HelpCircle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-midnight-ocean text-white shadow-lg"
                  : "bg-white text-slate-gray hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
          <AnimatePresence mode="wait">
            {activeTab === "privacy" && (
              <motion.div key="privacy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h2 className="text-2xl font-serif mb-6 border-b pb-4">Privacy Policy</h2>
                <div className="space-y-6 text-gray-600 leading-relaxed font-light">
                  <p><strong>1. Information Collection:</strong> We collect personal information (name, email, phone number) when you submit an inquiry or make a booking.</p>
                  <p><strong>2. Use of Information:</strong> Your data is used strictly to process bookings, communicate travel updates, and improve our services.</p>
                  <p><strong>3. Data Protection:</strong> We implement rigorous security measures to maintain the safety of your personal information. We do not sell or trade your data to outside parties.</p>
                  <p><strong>4. Cookies:</strong> Our website uses cookies to enhance user experience and analyze site traffic.</p>
                </div>
              </motion.div>
            )}

            {activeTab === "booking" && (
              <motion.div key="booking" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h2 className="text-2xl font-serif mb-6 border-b pb-4">Booking Policy</h2>
                <div className="space-y-6 text-gray-600 leading-relaxed font-light">
                  <p><strong>1. Reservations:</strong> A 30% advance payment is required to confirm any booking. The remaining balance must be paid 15 days before the travel date.</p>
                  <p><strong>2. Modifications:</strong> Requests to change travel dates are subject to availability and may incur administrative fees.</p>
                  <p><strong>3. Liability:</strong> Pather Khonje acts solely as an agent for hotels, transporters, and other service providers. We are not liable for delays or expenses caused by weather, strikes, or natural disasters.</p>
                  <p><strong>4. Insurance:</strong> We highly recommend all travelers secure comprehensive travel insurance prior to departure.</p>
                </div>
              </motion.div>
            )}

            {activeTab === "faq" && (
              <motion.div key="faq" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h2 className="text-2xl font-serif mb-6 border-b pb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border border-gray-100 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                        className="w-full flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                      >
                        <span className="font-semibold text-midnight-ocean">{faq.q}</span>
                        <ChevronDown className={`transform transition-transform ${openFaq === index ? "rotate-180" : ""}`} size={20} />
                      </button>
                      <AnimatePresence>
                        {openFaq === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="p-5 bg-white text-gray-600 font-light leading-relaxed border-t border-gray-100"
                          >
                            {faq.a}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Policies;