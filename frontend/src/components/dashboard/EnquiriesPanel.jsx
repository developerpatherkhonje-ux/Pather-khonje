import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Calendar, CheckCircle, Clock } from 'lucide-react';
// Assuming you have an apiService method for this. If not, this uses simulated data to show the UI.
import apiService from '../../services/api'; 

function EnquiriesPanel() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch - replace with your actual API call: apiService.getEnquiries()
    setTimeout(() => {
      setEnquiries([
        { id: 1, name: "Rahul Sharma", email: "rahul@example.com", phone: "+91 98765 43210", subject: "Darjeeling Package Inquiry", message: "Hi, I want to book a 4-night package for Darjeeling in May. Please share details.", date: "2026-04-03", status: "New" },
        { id: 2, name: "Priya Das", email: "priya.d@example.com", phone: "+91 87654 32109", subject: "Corporate Outing", message: "Looking for an office picnic destination near Kolkata for 50 people.", date: "2026-04-01", status: "Responded" },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const markAsResponded = (id) => {
    setEnquiries(enquiries.map(enq => enq.id === id ? { ...enq, status: "Responded" } : enq));
    // Here you would also trigger an API call to update the backend status
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-midnight-ocean"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-midnight-ocean">Customer Enquiries</h1>
          <p className="text-gray-500 text-sm mt-1">Leads from your Contact Page</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-semibold">Contact Info</th>
                <th className="p-4 font-semibold">Subject & Message</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold text-center">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enquiries.map((enq) => (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={enq.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-midnight-ocean">{enq.name}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1"><Mail size={12}/> {enq.email}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1"><Phone size={12}/> {enq.phone}</div>
                  </td>
                  <td className="p-4 max-w-md">
                    <div className="font-semibold text-sm text-gray-800">{enq.subject}</div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{enq.message}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2"><Calendar size={14}/> {enq.date}</div>
                  </td>
                  <td className="p-4 text-center">
                    {enq.status === "New" ? (
                      <button 
                        onClick={() => markAsResponded(enq.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-md text-xs font-bold uppercase tracking-wide hover:bg-orange-100 transition-colors"
                      >
                        <Clock size={14} /> Mark Responded
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-md text-xs font-bold uppercase tracking-wide">
                        <CheckCircle size={14} /> Responded
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EnquiriesPanel;