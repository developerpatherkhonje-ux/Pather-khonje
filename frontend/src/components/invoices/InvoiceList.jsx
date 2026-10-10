import React, { useEffect, useState } from 'react';
import { Download, Edit, IndianRupee, ReceiptText, Trash2, X } from 'lucide-react';
import api from '../../services/api';
import { formatDisplayDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

function InvoiceList({ onEdit, onDeleted, onStatusUpdated, reload = 0, items: externalItems }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'Cash', date: new Date().toISOString().slice(0, 10), reference: '', notes: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.listInvoices({ page: 1, limit: 100 });
      const invoices = res.data.items || res.data || [];
      // Sort invoices in ascending order by invoice number (HTL0001 first, HTL0002 second, etc.)
      const sortedInvoices = invoices.sort((a, b) => {
        const aNumber = a.invoiceNumber || '';
        const bNumber = b.invoiceNumber || '';
        return aNumber.localeCompare(bNumber, undefined, { numeric: true });
      });
      setItems(sortedInvoices);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // If items are provided from parent, use them; otherwise fetch locally
  useEffect(() => {
    if (Array.isArray(externalItems)) {
      setItems(externalItems);
      setLoading(false);
      return;
    }
    fetchData();
  }, [reload, externalItems]);

  const remove = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    await api.deleteInvoice(id);
    if (typeof onDeleted === 'function') {
      onDeleted(id);
    } else {
      fetchData();
    }
  };

  const addPayment = async (event) => {
    event.preventDefault();
    try {
      const res = await api.addInvoicePayment(paymentInvoice._id, paymentForm);
      const updatedInvoice = res.data?.invoice || res.data;
      setItems(prevItems => 
        prevItems.map(item => 
          item._id === paymentInvoice._id
            ? updatedInvoice
            : item
        )
      );
      if (typeof onStatusUpdated === 'function') {
        onStatusUpdated();
      }
      const payment = res.data?.payment;
      if (payment?._id) {
        await api.downloadPaymentReceiptPdf(updatedInvoice._id, payment._id, payment.receiptNumber);
      }
      toast.success('Payment received and receipt generated');
      setPaymentInvoice(null);
      setPaymentForm({ amount: '', method: 'Cash', date: new Date().toISOString().slice(0, 10), reference: '', notes: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to add payment');
    }
  };

  const download = async (inv) => {
    try {
      await api.downloadInvoicePdf(inv._id || inv.id, inv.invoiceNumber || `invoice-${inv._id || inv.id}`);
      toast.success(`${inv.invoiceNumber || 'Invoice'} downloaded`);
    } catch (e2) {
      toast.error(e2.message || 'Failed to download');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  const getStatusBadge = (inv) => {
    // Use the status field from database, or calculate based on due amount
    let status = inv.status;
    
    if (!status) {
      const dueAmount = Number(inv.total || 0) - Number(inv.advancePaid || 0);
      status = dueAmount <= 0 ? 'paid' : 'pending';
    }
    
    switch (status) {
      case 'paid':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Paid</span>;
      case 'partial':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">Partial</span>;
      case 'overdue':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Overdue</span>;
      case 'pending':
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
    }
  };

  const getTypeBadge = (type) => {
    if (type === 'hotel') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Hotel</span>;
    } else if (type === 'tour') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Tour</span>;
    } else if (type === 'car') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Car</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">{type}</span>;
  };

  const getPackageName = (inv) => {
    if (inv.type === 'hotel') {
      return inv.hotelDetails?.hotelName || 'Hotel Booking';
    } else if (inv.type === 'tour') {
      return inv.tourDetails?.packageName || 'Tour Package';
    } else if (inv.type === 'car') {
      return inv.carDetails?.carName || inv.carDetails?.route || 'Car Rental';
    }
    return 'Package';
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">INVOICE</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CUSTOMER</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TYPE</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AMOUNT</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATE</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map(inv => {
            const dueAmount = Number(inv.total || 0) - Number(inv.advancePaid || 0);
            const advancePaid = Number(inv.advancePaid || 0);
            
            return (
              <tr key={inv._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">{inv.invoiceNumber}</div>
                  <div className="text-sm text-gray-500">{getPackageName(inv)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{inv.customer?.name}</div>
                  <div className="text-sm text-gray-500">{inv.customer?.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getTypeBadge(inv.type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">₹{Number(inv.total).toLocaleString('en-IN')}</div>
                  <div className="text-xs text-gray-500">
                    Advance: ₹{advancePaid.toLocaleString('en-IN')} | Due: ₹{dueAmount.toLocaleString('en-IN')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {getStatusBadge(inv)}
                    <div className="text-[11px] text-gray-500">Auto from payments</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDisplayDate(inv.date)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setPaymentInvoice(inv);
                        setPaymentForm((prev) => ({ ...prev, amount: Math.max(Number(inv.dueAmount ?? dueAmount), 0) || '' }));
                      }}
                      className="text-gray-400 hover:text-emerald-600 transition-colors"
                      title="Receive Payment"
                    >
                      <IndianRupee className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onEdit && onEdit(inv)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit Invoice"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => download(inv)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Download PDF"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => remove(inv._id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Invoice"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {paymentInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={addPayment} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold"><ReceiptText className="h-5 w-5 text-emerald-600" /> Receive Payment</h2>
                <p className="text-sm text-gray-500">{paymentInvoice.invoiceNumber} · Due ₹{Number(paymentInvoice.dueAmount || 0).toLocaleString('en-IN')}</p>
              </div>
              <button type="button" onClick={() => setPaymentInvoice(null)} className="rounded-full p-2 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-3">
              <input required type="number" min="1" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} placeholder="Amount received" className="rounded-xl border px-4 py-3" />
              <input type="date" value={paymentForm.date} onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })} className="rounded-xl border px-4 py-3" />
              <select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })} className="rounded-xl border px-4 py-3">
                <option>Cash</option>
                <option>UPI</option>
                <option>Bank Transfer</option>
                <option>Card</option>
                <option>Cheque</option>
              </select>
              <input value={paymentForm.reference} onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })} placeholder="Reference / transaction id" className="rounded-xl border px-4 py-3" />
              <textarea value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} placeholder="Notes" className="rounded-xl border px-4 py-3" />
            </div>
            <button className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white">Save Payment & Download Receipt</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default InvoiceList;

