import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, FileText, Download, Eye, Calendar, IndianRupee } from 'lucide-react';
import HotelInvoiceForm from '../invoices/HotelInvoiceForm';
import TourInvoiceForm from '../invoices/TourInvoiceForm';
import InvoiceList from '../invoices/InvoiceList';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

function InvoiceManagement() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createType, setCreateType] = useState('hotel');
  const [reloadKey, setReloadKey] = useState(0);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.listInvoices({ page: 1, limit: 200 });
        const items = res.data?.items || res.data || [];
        // Sort invoices in ascending order by invoice number (HTL0001 first, HTL0002 second, etc.)
        const sortedInvoices = items.sort((a, b) => {
          const aNumber = a.invoiceNumber || '';
          const bNumber = b.invoiceNumber || '';
          return aNumber.localeCompare(bNumber, undefined, { numeric: true });
        });
        setInvoices(sortedInvoices);
      } catch (e) {
        console.error(e);
        setError(e.message || 'Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [reloadKey]);

  const filteredInvoices = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return invoices.filter((invoice) => {
      const name = invoice.customer?.name || invoice.customerName || '';
      const email = invoice.customer?.email || invoice.customerEmail || '';
      const invoiceNumber = invoice.invoiceNumber || '';
      const matchesSearch = !q || name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || invoiceNumber.toLowerCase().includes(q);
      const matchesType = filterType === 'all' || (invoice.type === filterType);
      // Use the status field from database, or calculate based on due amount
      let status = invoice.status;
      if (!status) {
        const dueAmount = Number(invoice.total || 0) - Number(invoice.advancePaid || 0);
        status = dueAmount <= 0 ? 'paid' : 'pending';
      }
      const matchesStatus = filterStatus === 'all' || status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [invoices, searchTerm, filterType, filterStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateInvoice = (type) => {
    navigate(`/dashboard/invoices/${type}`);
  };

  const handleDownloadInvoice = async (invoice) => {
    await api.downloadInvoicePdf(invoice._id || invoice.id);
  };

  const handleEditInvoice = (invoice) => {
    setCreateType(invoice.type);
    setEditData(invoice);
    setShowCreateForm(true);
  };

  // Helper function to get invoice status
  const getInvoiceStatus = (invoice) => {
    if (invoice.status) return invoice.status;
    const dueAmount = Number(invoice.total || 0) - Number(invoice.advancePaid || 0);
    return dueAmount <= 0 ? 'paid' : 'pending';
  };

  // Calculate amounts based on status
  const totalRevenue = useMemo(() => {
    return invoices.reduce((sum, invoice) => {
      const status = getInvoiceStatus(invoice);
      // Only count revenue for paid invoices (completed transactions)
      if (status === 'paid') {
        return sum + Number(invoice.total || invoice.amount || 0);
      }
      return sum;
    }, 0);
  }, [invoices]);

  const totalAdvance = useMemo(() => {
    return invoices.reduce((sum, invoice) => {
      const status = getInvoiceStatus(invoice);
      // Count advance for all invoices (money already received)
      return sum + Number(invoice.advancePaid || 0);
    }, 0);
  }, [invoices]);

  const totalDue = useMemo(() => {
    return invoices.reduce((sum, invoice) => {
      const status = getInvoiceStatus(invoice);
      // Only count due amounts for pending and overdue invoices
      if (status === 'pending' || status === 'overdue') {
        const dueAmount = Number(invoice.dueAmount || Math.max((invoice.total || 0) - (invoice.advancePaid || 0), 0));
        return sum + dueAmount;
      }
      return sum;
    }, 0);
  }, [invoices]);

  // Additional status-based calculations
  const paidRevenue = useMemo(() => {
    return invoices.reduce((sum, invoice) => {
      const status = getInvoiceStatus(invoice);
      if (status === 'paid') {
        return sum + Number(invoice.total || invoice.amount || 0);
      }
      return sum;
    }, 0);
  }, [invoices]);

  const pendingRevenue = useMemo(() => {
    return invoices.reduce((sum, invoice) => {
      const status = getInvoiceStatus(invoice);
      if (status === 'pending') {
        return sum + Number(invoice.total || invoice.amount || 0);
      }
      return sum;
    }, 0);
  }, [invoices]);

  const overdueRevenue = useMemo(() => {
    return invoices.reduce((sum, invoice) => {
      const status = getInvoiceStatus(invoice);
      if (status === 'overdue') {
        return sum + Number(invoice.total || invoice.amount || 0);
      }
      return sum;
    }, 0);
  }, [invoices]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Invoice Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => handleCreateInvoice('hotel')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Hotel Invoice</span>
          </button>
          <button
            onClick={() => handleCreateInvoice('tour')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Tour Invoice</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100">
              <IndianRupee className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₹{paidRevenue.toLocaleString()}</h3>
          <p className="text-gray-600">Paid Revenue</p>
          <div className="mt-2 text-sm text-gray-500">
            <div>Pending: ₹{pendingRevenue.toLocaleString()}</div>
            <div>Overdue: ₹{overdueRevenue.toLocaleString()}</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <IndianRupee className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₹{totalAdvance.toLocaleString()}</h3>
          <p className="text-gray-600">Total Advance Received</p>
          <div className="mt-2 text-sm text-gray-500">
            <div>From all invoices</div>
            <div>Cash flow indicator</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-100">
              <IndianRupee className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₹{totalDue.toLocaleString()}</h3>
          <p className="text-gray-600">Outstanding Amount</p>
          <div className="mt-2 text-sm text-gray-500">
            <div>Pending + Overdue</div>
            <div>Collection target</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-100">
              <IndianRupee className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₹{(paidRevenue + pendingRevenue + overdueRevenue).toLocaleString()}</h3>
          <p className="text-gray-600">Total Potential Revenue</p>
          <div className="mt-2 text-sm text-gray-500">
            <div>All invoices combined</div>
            <div>Business volume</div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="all">All Types</option>
            <option value="hotel">Hotel Invoices</option>
            <option value="tour">Tour Invoices</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            Total: {filteredInvoices.length} invoices
          </div>
        </div>
      </div>

      {/* Invoices Table - data-backed */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          {error && <div className="p-4 text-red-600">{error}</div>}
          {loading ? (
            <div className="p-6">Loading...</div>
          ) : (
            <InvoiceList
              onEdit={handleEditInvoice}
              onDeleted={() => setReloadKey(k => k + 1)}
              onStatusUpdated={() => setReloadKey(k => k + 1)}
              items={filteredInvoices}
            />
          )}
        </div>
      </div>

      {/* No Invoices Message */}
      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
              ? 'No invoices match your search criteria.' 
              : 'Start by creating your first invoice.'}
          </p>
          {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => handleCreateInvoice('hotel')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Hotel Invoice
              </button>
              <button
                onClick={() => handleCreateInvoice('tour')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Tour Invoice
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-1 sm:p-2 md:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateForm(false);
              setEditData(null);
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-7xl max-h-[98vh] flex flex-col shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {editData ? 'Edit' : 'Create'} {createType === 'hotel' ? 'Hotel' : 'Tour'} Invoice
              </h2>
              <button
                onClick={() => { setShowCreateForm(false); setEditData(null); }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6">
              {createType === 'hotel' ? (
                <HotelInvoiceForm
                  initial={editData?.type === 'hotel' ? editData : null}
                  onCreated={() => { setShowCreateForm(false); setEditData(null); setReloadKey(k => k + 1); }}
                  onCancel={() => { setShowCreateForm(false); setEditData(null); }}
                  inlineButtons={true}
                />
              ) : (
                <TourInvoiceForm
                  initial={editData?.type === 'tour' ? editData : null}
                  onCreated={() => { setShowCreateForm(false); setEditData(null); setReloadKey(k => k + 1); }}
                  onCancel={() => { setShowCreateForm(false); setEditData(null); }}
                  inlineButtons={true}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default InvoiceManagement;