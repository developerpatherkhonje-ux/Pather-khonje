import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle, Clock, Mail, Phone, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import apiService from "../../services/api";

function EnquiriesPanel() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await apiService.listEnquiries();
      setEnquiries(response.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const response = await apiService.updateEnquiryStatus(id, status);
      const updated = response.data;
      setEnquiries((items) => items.map((item) => (item._id === id ? updated : item)));
      toast.success("Enquiry updated");
    } catch (error) {
      toast.error(error.message || "Failed to update enquiry");
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><RefreshCw className="h-8 w-8 animate-spin text-sky-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-midnight-ocean">Customer Enquiries</h1>
          <p className="mt-1 text-sm text-gray-500">Live leads from the contact page.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-gray-50">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold">Contact Info</th>
                <th className="p-4 font-semibold">Trip Query</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 text-center font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enquiries.length === 0 ? (
                <tr><td colSpan="4" className="p-6 text-center text-sm text-gray-500">No enquiries yet.</td></tr>
              ) : enquiries.map((enquiry) => (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={enquiry._id} className="transition-colors hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="font-bold text-midnight-ocean">{enquiry.name}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500"><Mail size={12} /> {enquiry.email}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500"><Phone size={12} /> {enquiry.phone || "No phone"}</div>
                  </td>
                  <td className="max-w-md p-4">
                    <div className="text-sm font-semibold text-gray-800">{enquiry.destination || "Custom travel enquiry"} {enquiry.month ? `· ${enquiry.month}` : ""}</div>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">{enquiry.message}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(enquiry.createdAt).toLocaleDateString("en-IN")}</div>
                  </td>
                  <td className="p-4 text-center">
                    {enquiry.status !== "responded" ? (
                      <button onClick={() => updateStatus(enquiry._id, "responded")} className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-orange-600 transition-colors hover:bg-orange-100">
                        <Clock size={14} /> Mark Responded
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-green-600">
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
