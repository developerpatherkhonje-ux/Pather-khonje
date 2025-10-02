import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Receipt, Download, Eye, Calendar, IndianRupee, TrendingDown, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import { generatePaymentVoucherPdf } from '../../utils/payPdf';

const PaymentVouchers = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    totalAdvance: 0,
    totalDue: 0,
    monthlyExpenses: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = [
    { value: 'hotel', label: 'Hotel', color: 'bg-blue-100 text-blue-800' },
    { value: 'transport', label: 'Transport', color: 'bg-green-100 text-green-800' },
    { value: 'food', label: 'Food', color: 'bg-orange-100 text-orange-800' },
    { value: 'guide', label: 'Guide', color: 'bg-purple-100 text-purple-800' },
    { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
  ];

  // Function to calculate analytics from vouchers
  const calculateAnalytics = (vouchersList) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const analytics = vouchersList.reduce((acc, voucher) => {
      const voucherDate = new Date(voucher.date);
      const isCurrentMonth = voucherDate.getMonth() === currentMonth && voucherDate.getFullYear() === currentYear;
      
      acc.totalExpenses += voucher.total || 0;
      acc.totalAdvance += voucher.advance || 0;
      acc.totalDue += voucher.due || 0;
      
      if (isCurrentMonth) {
        acc.monthlyExpenses += voucher.total || 0;
      }
      
      return acc;
    }, {
      totalExpenses: 0,
      totalAdvance: 0,
      totalDue: 0,
      monthlyExpenses: 0
    });

    return {
      ...analytics,
      totalVouchers: vouchersList.length
    };
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank Transfer / NEFT' },
    { value: 'upi', label: 'UPI' }
  ];

  // Load vouchers from backend
  useEffect(() => {
    const loadVouchers = async () => {
      try {
        setLoading(true);
        const res = await apiService.listPaymentVouchers({
          category: filterCategory === 'all' ? '' : filterCategory,
          search: searchTerm
        });
        if (res.success) {
          const vouchersList = res.data.items || [];
          setVouchers(vouchersList);
          // Calculate analytics from the loaded vouchers
          const calculatedSummary = calculateAnalytics(vouchersList);
          setSummary(calculatedSummary);
        }
      } catch (error) {
        console.error('Error loading vouchers:', error);
        toast.error('Failed to load payment vouchers');
      } finally {
        setLoading(false);
      }
    };
    loadVouchers();
  }, [filterCategory, searchTerm]);

  const filteredVouchers = vouchers;

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.color : 'bg-gray-100 text-gray-800';
  };

  const handleEditVoucher = (voucher) => {
    navigate(`/dashboard/vouchers/Payment/${voucher.id}`);
  };

  const handleDeleteVoucher = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment voucher?')) {
      try {
        const res = await apiService.deletePaymentVoucher(id);
        if (res.success) {
          const updatedVouchers = vouchers.filter(v => v.id !== id);
          setVouchers(updatedVouchers);
          // Recalculate analytics after deletion
          const updatedSummary = calculateAnalytics(updatedVouchers);
          setSummary(updatedSummary);
          toast.success('Payment voucher deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting voucher:', error);
        toast.error('Failed to delete payment voucher');
      }
    }
  };

  const handleDownloadVoucher = async (voucher) => {
    try {
      // Use frontend PDF generator instead of backend
      await generatePaymentVoucherPdf(voucher, voucher.voucherNumber);
      toast.success('Voucher PDF downloaded');
    } catch (error) {
      console.error('Error downloading voucher:', error);
      toast.error('Failed to download voucher PDF');
    }
  };

  const handleViewVoucher = (voucher) => {
    // Navigate to voucher details page or show in modal
    console.log('View voucher:', voucher);
  };

  // Function to refresh vouchers and analytics
  const refreshVouchers = async () => {
    try {
      setLoading(true);
      const res = await apiService.listPaymentVouchers({
        category: filterCategory === 'all' ? '' : filterCategory,
        search: searchTerm
      });
      if (res.success) {
        const vouchersList = res.data.items || [];
        setVouchers(vouchersList);
        const calculatedSummary = calculateAnalytics(vouchersList);
        setSummary(calculatedSummary);
      }
    } catch (error) {
      console.error('Error refreshing vouchers:', error);
      toast.error('Failed to refresh payment vouchers');
    } finally {
      setLoading(false);
    }
  };

  // Refresh vouchers when component mounts (useful when returning from create/edit)
  useEffect(() => {
    const handleFocus = () => {
      refreshVouchers();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [filterCategory, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Payment Vouchers</h1>
        <button
          onClick={() => navigate('/dashboard/vouchers/Payment')}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Voucher</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-100">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₹{summary.totalExpenses.toLocaleString()}</h3>
          <p className="text-gray-600">Total Expenses</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-100">
              <IndianRupee className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₹{summary.monthlyExpenses.toLocaleString()}</h3>
          <p className="text-gray-600">This Month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <Receipt className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{vouchers.length}</h3>
          <p className="text-gray-600">Total Vouchers</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
              placeholder="Search vouchers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="all">All Categories</option>
                  {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>

          <div className="text-sm text-gray-600 flex items-center">
            Total: {filteredVouchers.length} vouchers
                </div>
              </div>
            </div>


      {/* Vouchers Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Voucher
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Payee
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVouchers.map((voucher) => (
                <motion.tr
                  key={voucher.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{voucher.voucherNumber}</div>
                      <div className="text-sm text-gray-500">{voucher.description || 'No description'}</div>
              </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{voucher.payeeName}</div>
                    <div className="text-sm text-gray-500">By: {voucher.createdBy?.name || 'Unknown'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(voucher.category)}`}>
                      {categories.find(c => c.value === voucher.category)?.label}
                </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-red-600">-₹{voucher.total.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{voucher.paymentMethod}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {voucher.createdAt}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditVoucher(voucher)}
                        className="text-sky-600 hover:text-sky-900 transition-colors"
                        title="Edit Voucher"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadVoucher(voucher)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVoucher(voucher.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete Voucher"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>)
              )}
            </tbody>
          </table>
            </div>
      </div>

      {/* No Vouchers Message */}
      {filteredVouchers.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Vouchers Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterCategory !== 'all' 
              ? 'No vouchers match your search criteria.' 
              : 'Start by creating your first payment voucher.'}
          </p>
          {!searchTerm && filterCategory === 'all' && (
            <button
              onClick={() => navigate('/dashboard/vouchers/Payment')}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Create Your First Voucher
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentVouchers;