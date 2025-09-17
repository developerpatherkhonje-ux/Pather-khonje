import React, { useEffect, useState } from 'react';
import { Download, Eye, Trash2, Edit3, Check, X } from 'lucide-react';
import api from '../../services/api';
import { generateInvoicePdf } from '../../utils/pdf';
import { generateTourInvoicePdf } from '../../utils/pdfTour';
import toast from 'react-hot-toast';

function InvoiceList({ onEdit, onDeleted, onStatusUpdated, reload = 0, items: externalItems }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStatus, setEditingStatus] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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

  const updateStatus = async (invoiceId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const updatedInvoice = await api.updateInvoice(invoiceId, { status: newStatus });
      
      // Update local state
      setItems(prevItems => 
        prevItems.map(item => 
          item._id === invoiceId 
            ? { ...item, status: newStatus }
            : item
        )
      );
      
      // Notify parent component to refresh data
      if (typeof onStatusUpdated === 'function') {
        onStatusUpdated();
      }
      
      toast.success(`Status updated to ${newStatus}`);
      setEditingStatus(null);
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const startEditingStatus = (invoiceId) => {
    setEditingStatus(invoiceId);
  };

  const cancelEditingStatus = () => {
    setEditingStatus(null);
  };

  const download = async (inv) => {
    try {
        console.log('InvoiceList - Raw invoice data from backend:', inv);
        console.log('InvoiceList - Tour Details:', inv.tourDetails);
        console.log('InvoiceList - Transport Details:', inv.transportDetails);
        console.log('InvoiceList - Raw hotels from tourDetails:', inv.tourDetails?.hotels);
        console.log('InvoiceList - Raw hotels from root:', inv.hotels);
        console.log('InvoiceList - Hotels array type:', Array.isArray(inv.tourDetails?.hotels));
        console.log('InvoiceList - Hotels length:', inv.tourDetails?.hotels?.length || 0);
        
        if (inv.type === 'tour') {
          // Transform backend data to match TourInvoiceForm structure
          const tourData = {
            type: 'tour',
            invoiceNumber: inv.invoiceNumber,
            date: inv.date,
            customer: inv.customer,
            tourDetails: {
              packageName: inv.tourDetails?.packageName || '',
              startDate: inv.tourDetails?.startDate || '',
              endDate: inv.tourDetails?.endDate || '',
              totalDays: inv.tourDetails?.totalDays || inv.tourDetails?.days || 0,
              totalNights: inv.tourDetails?.totalNights || (inv.tourDetails?.days ? inv.tourDetails.days - 1 : 0),
              pax: inv.tourDetails?.pax || '',
              inclusions: inv.tourDetails?.inclusions || '',
              exclusions: inv.tourDetails?.exclusions || '',
              adults: inv.tourDetails?.adults || 0,
              children: inv.tourDetails?.children || 0,
              adultPrice: inv.tourDetails?.adultPrice || 0,
              childPrice: inv.tourDetails?.childPrice || 0
            },
            transportDetails: {
              modeOfTransport: inv.transportDetails?.modeOfTransport || inv.tourDetails?.modeOfTransport || inv.tourDetails?.transport || '',
              fooding: inv.transportDetails?.fooding || inv.tourDetails?.fooding || '',
              pickupPoint: inv.transportDetails?.pickupPoint || inv.tourDetails?.pickupPoint || inv.tourDetails?.pickup || '',
              dropPoint: inv.transportDetails?.dropPoint || inv.tourDetails?.dropPoint || inv.tourDetails?.drop || '',
              includedTransportDetails: inv.transportDetails?.includedTransportDetails || inv.tourDetails?.includedTransportDetails || ''
            },
            hotels: inv.tourDetails?.hotels || inv.hotels || [],
            subtotal: inv.subtotal,
            discount: inv.discount,
            tax: inv.tax,
            gstPercent: inv.gstPercent,
            total: inv.total,
            advancePaid: inv.advancePaid,
            paymentMethod: inv.paymentMethod
          };
          
          console.log('InvoiceList - Transformed tour data:', tourData);
          console.log('InvoiceList - Transport Details in transformed data:', tourData.transportDetails);
          console.log('InvoiceList - Hotels data:', tourData.hotels);
          await generateTourInvoicePdf(tourData, inv.invoiceNumber || `tour-invoice-${inv._id}`);
        } else {
          await generateInvoicePdf(inv, inv.invoiceNumber || `invoice-${inv._id}`);
        }
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
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">{type}</span>;
  };

  const getPackageName = (inv) => {
    if (inv.type === 'hotel') {
      return inv.hotelDetails?.hotelName || 'Hotel Booking';
    } else if (inv.type === 'tour') {
      return inv.tourDetails?.packageName || 'Tour Package';
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
                  {editingStatus === inv._id ? (
                    <div className="flex items-center space-x-2">
                      <select
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue={inv.status || 'pending'}
                        onChange={(e) => updateStatus(inv._id, e.target.value)}
                        disabled={updatingStatus}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                      <button
                        onClick={cancelEditingStatus}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={updatingStatus}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(inv)}
                      <button
                        onClick={() => startEditingStatus(inv._id)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit Status"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(inv.date).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onEdit && onEdit(inv)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="View Invoice"
                    >
                      <Eye className="h-5 w-5" />
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
    </div>
  );
}

export default InvoiceList;


