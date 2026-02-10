import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  getEnquiries,
  updateEnquiryStatus,
} from "../../services/enquiryService";

const EnquiriesPanel = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const response = await getEnquiries();
      setEnquiries(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch enquiries");
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateEnquiryStatus(id, newStatus);
      // Optimistic update
      setEnquiries(
        enquiries.map((enq) =>
          enq._id === id ? { ...enq, status: newStatus } : enq,
        ),
      );
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const filteredEnquiries = enquiries.filter((enquiry) => {
    const matchesFilter = filter === "all" || enquiry.status === filter;
    const matchesSearch =
      enquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "read":
        return "bg-gray-100 text-gray-800";
      case "responded":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Enquiries</h2>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search enquiries..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none appearance-none bg-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="responded">Responded</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {filteredEnquiries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
            <Mail className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No enquiries found</p>
          </div>
        ) : (
          filteredEnquiries.map((enquiry) => (
            <motion.div
              key={enquiry._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {enquiry.name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${getStatusColor(
                          enquiry.status,
                        )}`}
                      >
                        {enquiry.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Mail size={14} />
                        {enquiry.email}
                      </div>
                      {enquiry.phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={14} />
                          {enquiry.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(enquiry.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {enquiry.status === "new" && (
                      <button
                        onClick={() => handleStatusUpdate(enquiry._id, "read")}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                    {enquiry.status !== "responded" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(enquiry._id, "responded")
                        }
                        className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <CheckCircle size={14} />
                        Mark Responded
                      </button>
                    )}
                  </div>
                </div>

                {(enquiry.destination || enquiry.month) && (
                  <div className="flex gap-4 mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                    {enquiry.destination && (
                      <span className="flex items-center gap-2 text-gray-700">
                        <MapPin size={16} className="text-sky-600" />
                        Destination: <strong>{enquiry.destination}</strong>
                      </span>
                    )}
                    {enquiry.month && (
                      <span className="flex items-center gap-2 text-gray-700">
                        <Calendar size={16} className="text-sky-600" />
                        Travel Date: <strong>{enquiry.month}</strong>
                      </span>
                    )}
                  </div>
                )}

                <div className="prose prose-sm max-w-none text-gray-600 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                  {enquiry.message}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default EnquiriesPanel;
