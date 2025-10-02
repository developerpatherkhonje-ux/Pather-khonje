import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Download, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import { generatePaymentVoucherPdf } from '../../utils/payPdf';

function PaymentVoucherPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    // Section 1: Voucher Details
    date: '',
    // Section 2: Payee Information
    payeeName: '',
    contact: '',
    address: '',
    tourCode: '',
    // Section 3: Expense Details
    category: 'hotel',
    expenseOther: '',
    description: '',
    // Section 4: Payment Details
    advance: 0,
    total: 0,
    paymentMethod: 'cash'
  });
  
  const [voucherNumber, setVoucherNumber] = useState('');
  const [savedId, setSavedId] = useState(null);

  const dueAmount = Number(form.total || 0) - Number(form.advance || 0);

  // Load voucher data if editing
  useEffect(() => {
    if (isEditing && id) {
      const loadVoucher = async () => {
        try {
          setLoading(true);
          const res = await apiService.getPaymentVoucher(id);
          if (res.success) {
            const voucher = res.data;
            setVoucherNumber(voucher.voucherNumber || '');
            setSavedId(voucher.id);
            setForm({
              date: voucher.date || '',
              payeeName: voucher.payeeName || '',
              contact: voucher.contact || '',
              address: voucher.address || '',
              tourCode: voucher.tourCode || '',
              category: voucher.category || 'hotel',
              expenseOther: voucher.expenseOther || '',
              description: voucher.description || '',
              advance: voucher.advance || 0,
              total: voucher.total || 0,
              paymentMethod: voucher.paymentMethod || 'cash'
            });
          }
        } catch (error) {
          console.error('Error loading voucher:', error);
          toast.error('Failed to load voucher data');
          navigate('/dashboard/vouchers');
        } finally {
          setLoading(false);
        }
      };
      loadVoucher();
    } else {
      // Set default date for new voucher
      setForm(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }));
    }
  }, [isEditing, id, navigate]);

  const categories = [
    { value: 'hotel', label: 'Hotel' },
    { value: 'transport', label: 'Transport' },
    { value: 'food', label: 'Food' },
    { value: 'guide', label: 'Guide' },
    { value: 'other', label: 'Other' }
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank Transfer / NEFT' },
    { value: 'upi', label: 'UPI' }
  ];

  const handleSave = async () => {
    if (!form.date || !form.payeeName || !form.total) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const voucherData = { ...form, due: dueAmount };
      
      let res;
      if (savedId) {
        // Update existing voucher
        res = await apiService.updatePaymentVoucher(savedId, voucherData);
      } else {
        // Create new voucher
        res = await apiService.createPaymentVoucher(voucherData);
      }
      
      if (res.success) {
        const created = res.data;
        setSavedId(created.id);
        setVoucherNumber(created.voucherNumber);
        
        if (created.voucherNumber) {
          toast.success(`${created.voucherNumber} saved`);
        } else {
          toast.success('Payment voucher saved');
        }
        
        // Update form with the generated voucher number from backend
        if (created.voucherNumber) {
          setForm(prev => ({ ...prev, voucherNumber: created.voucherNumber }));
        }
      }
    } catch (error) {
      console.error('Error saving voucher:', error);
      toast.error('Failed to save payment voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!savedId) {
      toast.error('Please save the voucher first before downloading');
      return;
    }

    try {
      const fileName = voucherNumber || `PAY${String(Date.now()).slice(-6)}`;
      
      // Create voucher data object for frontend PDF generation
      const voucherData = {
        voucherNumber: voucherNumber,
        date: form.date,
        payeeName: form.payeeName,
        contact: form.contact,
        address: form.address,
        tourCode: form.tourCode,
        category: form.category,
        expenseOther: form.expenseOther,
        description: form.description,
        total: form.total,
        advance: form.advance,
        due: dueAmount,
        paymentMethod: form.paymentMethod
      };
      
      // Use frontend PDF generator instead of backend
      await generatePaymentVoucherPdf(voucherData, fileName);
      toast.success(`${fileName} downloaded`);
    } catch (error) {
      console.error('Error downloading voucher:', error);
      toast.error('Failed to download voucher PDF');
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-4"></div>
          <p className="text-gray-600">Loading voucher data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/vouchers')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-xl font-semibold">
            {isEditing ? 'Edit Payment Voucher' : 'Create Payment Voucher'}
          </h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> 
            {loading ? 'Saving...' : (isEditing ? 'Update Voucher' : 'Save Voucher')}
          </button>
          <button 
            onClick={handleDownload} 
            disabled={!savedId}
            className="inline-flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> 
            Download PDF
          </button>
        </div>
      </div>

      {/* Section 1: Voucher Details */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Voucher Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Date *</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
          </div>
        </div>
      </div>

      {/* Section 2: Payee Information */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Payee Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Payee Name *</label>
            <input value={form.payeeName} onChange={e => setForm({ ...form, payeeName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="Enter payee name" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Contact</label>
            <input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="Phone or email" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-2">Address</label>
            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="Street, City, State" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-2">Tour Code / Client Name</label>
            <input value={form.tourCode} onChange={e => setForm({ ...form, tourCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="e.g., PK-DAJ-2025 or Client Name" />
          </div>
        </div>
      </div>

      {/* Section 3: Expense Details */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Expense Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Expense Type *</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500">
              {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          {form.category === 'other' && (
            <div>
              <label className="block text-sm text-gray-600 mb-2">Other (details)</label>
              <input value={form.expenseOther} onChange={e => setForm({ ...form, expenseOther: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="Specify expense type" />
            </div>
          )}
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-2">Expense Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="e.g., Hotel stay at Darjeeling – 2 nights" />
          </div>
        </div>
      </div>

      {/* Section 4: Payment Details */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Payment Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Advance Payment (₹)</label>
            <input type="number" min="0" value={form.advance} onChange={e => setForm({ ...form, advance: Math.max(0, parseInt(e.target.value || '0', 10)) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Total Amount (₹) *</label>
            <input type="number" value={form.total} onChange={e => setForm({ ...form, total: parseInt(e.target.value || '0', 10) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Amount Due (₹)</label>
            <input value={dueAmount} readOnly className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700" placeholder="0" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm text-gray-600 mb-2">Payment Mode *</label>
            <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500">
              {paymentMethods.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentVoucherPage;


