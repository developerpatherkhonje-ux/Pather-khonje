import React, { useMemo, useState } from 'react';
import { Calendar, IndianRupee, Save, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { generateInvoicePdf } from '../../utils/pdf';
import api from '../../services/api';

function HotelInvoiceForm({ onCreated, onSaved, onCancel, initial, inlineButtons = true, formId = 'hotel-invoice-form' }) {
  const [form, setForm] = useState({
    type: 'hotel',
    customer: { name: '', phone: '', email: '', address: '' },
    hotelDetails: { hotelName: '', place: '', address: '', additionalBenefits: '', checkIn: '', checkOut: '', nights: 0, days: 0, roomType: '', rooms: 1, pricePerNight: 0, adults: 1, children: 0 },
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    advancePaid: 0,
    paymentMethod: 'Cash'
  });
  React.useEffect(() => {
    if (initial) {
      // Safely merge initial data ensuring no undefined values
      const safeInitial = {
        type: initial.type || 'hotel',
        customer: {
          name: initial.customer?.name || '',
          phone: initial.customer?.phone || '',
          email: initial.customer?.email || '',
          address: initial.customer?.address || ''
        },
        hotelDetails: {
          hotelName: initial.hotelDetails?.hotelName || '',
          place: initial.hotelDetails?.place || '',
          address: initial.hotelDetails?.address || '',
          additionalBenefits: initial.hotelDetails?.additionalBenefits || '',
          checkIn: initial.hotelDetails?.checkIn ? 
            (typeof initial.hotelDetails.checkIn === 'string' && initial.hotelDetails.checkIn.includes('T') ? 
              initial.hotelDetails.checkIn.split('T')[0] : 
              new Date(initial.hotelDetails.checkIn).toISOString().split('T')[0]) : '',
          checkOut: initial.hotelDetails?.checkOut ? 
            (typeof initial.hotelDetails.checkOut === 'string' && initial.hotelDetails.checkOut.includes('T') ? 
              initial.hotelDetails.checkOut.split('T')[0] : 
              new Date(initial.hotelDetails.checkOut).toISOString().split('T')[0]) : '',
          nights: Number(initial.hotelDetails?.nights || 0),
          days: Number(initial.hotelDetails?.days || 0),
          roomType: initial.hotelDetails?.roomType || '',
          rooms: Number(initial.hotelDetails?.rooms || 1),
          pricePerNight: Number(initial.hotelDetails?.pricePerNight || 0),
          adults: Number(initial.hotelDetails?.adults || 1),
          children: Number(initial.hotelDetails?.children || 0)
        },
        subtotal: Number(initial.subtotal || 0),
        discount: Number(initial.discount || 0),
        tax: Number(initial.tax || 0),
        total: Number(initial.total || 0),
        advancePaid: Number(initial.advancePaid || 0),
        paymentMethod: initial.paymentMethod || 'Cash'
        };
      
      setForm(safeInitial);
    }
  }, [initial]);
  const [loading, setLoading] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const addDays = (dateStr, days) => {
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    const nd = new Date(d.getTime());
    nd.setDate(nd.getDate() + Number(days || 0));
    return nd.toISOString().slice(0, 10);
  };

  const recomputeTotals = (next) => {
    const nights = Number(next.hotelDetails.nights || 0);
    const price = Number(next.hotelDetails.pricePerNight || 0);
    const rooms = Number(next.hotelDetails.rooms || 1);
    next.subtotal = nights * price * rooms;
    next.total = Math.max(0, next.subtotal - Number(next.discount || 0) + Number(next.tax || 0));
  };

  const update = (path, value) => {
    setForm(prev => {
      const next = { ...prev };
      const parts = path.split('.');
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      
      // Ensure value is never undefined - use empty string for strings, 0 for numbers
      let safeValue = value;
      if (value === undefined || value === null) {
        // Determine the type based on the field name or current value
        const currentValue = obj[parts[parts.length - 1]];
        if (typeof currentValue === 'number') {
          safeValue = 0;
        } else {
          safeValue = '';
        }
      }
      
      // Prevent negative numbers for numeric fields
      if (typeof safeValue === 'string' && !isNaN(safeValue) && safeValue !== '') {
        const numValue = parseFloat(safeValue);
        if (numValue < 0) {
          safeValue = '0';
        }
      }
      
      obj[parts[parts.length - 1]] = safeValue;
      // derive nights/days from dates when available
      if (path === 'hotelDetails.checkIn' || path === 'hotelDetails.checkOut') {
        const ci = new Date(next.hotelDetails.checkIn || '');
        const co = new Date(next.hotelDetails.checkOut || '');
        if (!isNaN(ci) && !isNaN(co)) {
          const ms = Math.max(0, co - ci);
          const nightsCalc = Math.floor(ms / (1000 * 60 * 60 * 24));
          next.hotelDetails.nights = nightsCalc;
          next.hotelDetails.days = nightsCalc;
        }
      }
      // when nights changes, sync days and optionally checkOut if checkIn exists
      if (path === 'hotelDetails.nights') {
        const n = Number(value || 0);
        next.hotelDetails.days = n;
        if (next.hotelDetails.checkIn) {
          next.hotelDetails.checkOut = addDays(next.hotelDetails.checkIn, n);
        }
      }
      // when days changes, sync nights and optionally checkOut
      if (path === 'hotelDetails.days') {
        const d = Number(value || 0);
        next.hotelDetails.nights = d;
        if (next.hotelDetails.checkIn) {
          next.hotelDetails.checkOut = addDays(next.hotelDetails.checkIn, d);
        }
      }
      // recompute amounts
      recomputeTotals(next);
      return { ...next };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      let res;
      let updatedInvoice;
      
      // Check if this is an edit operation (has initial data with _id)
      if (initial && initial._id) {
        // Update existing invoice
        const dataToSend = { ...form, _id: initial._id };
        res = await api.updateInvoice(initial._id, dataToSend);
        updatedInvoice = res.data || res;
        setSavedId(initial._id);
        toast.success(`${updatedInvoice.invoiceNumber || 'Invoice'} updated successfully`);
      } else {
        // Create new invoice
        const dataToSend = { ...form, invoiceNumber: undefined };
        res = await api.createInvoice(dataToSend);
        updatedInvoice = res.data || res;
        setSavedId(updatedInvoice?._id);
        if (updatedInvoice?.invoiceNumber) {
          toast.success(`${updatedInvoice.invoiceNumber} saved`);
        } else {
          toast.success('Invoice saved');
        }
      }
      
      setIsSaved(true);
      onCreated && onCreated(updatedInvoice);
      
      // Reset saved state after a short delay to allow re-saving
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
    } catch (err) {
      toast.error(err.message || 'Failed to save invoice');
    } finally { setLoading(false); }
  };

  const downloadPdf = async () => {
    const fileName = form.invoiceNumber || `HTL${String(Date.now()).slice(-6)}`;
    try {
      const data = {
        invoiceNumber: fileName,
        date: Date.now(),
        customer: form.customer,
        hotelDetails: form.hotelDetails,
        subtotal: form.subtotal,
        discount: form.discount,
        tax: form.tax,
        total: form.total,
        advancePaid: form.advancePaid,
      };
      await generateInvoicePdf(data, fileName);
      toast.success(`${fileName} downloaded`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      // Ultimate fallback: capture page
      try {
        const target = document.body;
        const canvas = await html2canvas(target, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let position = 0;
        let heightLeft = imgHeight;
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
          heightLeft -= pageHeight;
        }
        pdf.save(`${fileName}.pdf`);
        toast.success(`${fileName} downloaded`);
      } catch (genErr) {
        console.error(genErr);
        toast.error('Failed to download PDF');
      }
    }
  };

  const dueAmount = useMemo(() => {
    return Math.max(0, Number(form.total || 0) - Number(form.advancePaid || 0));
  }, [form.total, form.advancePaid]);

  return (
    <form id={formId} onSubmit={submit} className="space-y-5">
      {/* Header with action buttons */}
      {inlineButtons && (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-sky-600">Invoice #{savedId ? savedId.slice(-6).toUpperCase() : '—'}</div>
          </div>
          <div className="flex gap-3">
            <button 
              type="submit" 
              disabled={loading} 
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-500 ${
                isSaved 
                  ? 'bg-red-500 text-white cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Save className="h-4 w-4" /> 
              {loading ? 'Saving...' : isSaved ? 'Saved ✓' : (initial && initial._id ? 'Update Invoice' : 'Save Invoice')}
            </button>
          </div>
        </div>
      )}

      {/* Customer and Hotel Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-xl">
          <div className="px-4 py-3 border-b font-semibold">Customer Information</div>
          <div className="p-4 space-y-3">
            <input className="w-full px-4 py-3 border rounded-lg" placeholder="Customer Name" value={form.customer.name || ''} onChange={e => update('customer.name', e.target.value)} />
            <textarea className="w-full px-4 py-3 border rounded-lg" placeholder="Address" value={form.customer.address || ''} onChange={e => update('customer.address', e.target.value)} />
            <input className="w-full px-4 py-3 border rounded-lg" placeholder="Contact Number" value={form.customer.phone || ''} onChange={e => update('customer.phone', e.target.value)} />
            <input className="w-full px-4 py-3 border rounded-lg" placeholder="Email" value={form.customer.email || ''} onChange={e => update('customer.email', e.target.value)} />
          </div>
        </div>
        <div className="border rounded-xl">
          <div className="px-4 py-3 border-b font-semibold">Hotel Information</div>
          <div className="p-4 space-y-3">
            <input className="w-full px-4 py-3 border rounded-lg" placeholder="Hotel Name" value={form.hotelDetails.hotelName} onChange={e => update('hotelDetails.hotelName', e.target.value)} />
            <input className="w-full px-4 py-3 border rounded-lg" placeholder="Place/Location" value={form.hotelDetails.place} onChange={e => update('hotelDetails.place', e.target.value)} />
            <textarea className="w-full px-4 py-3 border rounded-lg" placeholder="Hotel Address" value={form.hotelDetails.address} onChange={e => update('hotelDetails.address', e.target.value)} />
            <textarea className="w-full px-4 py-3 border rounded-lg" placeholder="Additional Benefits (Food, Amenities)" value={form.hotelDetails.additionalBenefits} onChange={e => update('hotelDetails.additionalBenefits', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="border rounded-xl">
        <div className="px-4 py-3 border-b font-semibold">Booking Details</div>
        {/* First row: Check In, Check Out, Nights, Days */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Check In</div>
            <input type="date" className="w-full px-4 py-3 border rounded-lg" placeholder="dd-mm-yyyy" value={form.hotelDetails.checkIn} onChange={e => update('hotelDetails.checkIn', e.target.value)} />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Check Out</div>
            <input type="date" className="w-full px-4 py-3 border rounded-lg" placeholder="dd-mm-yyyy" value={form.hotelDetails.checkOut} onChange={e => update('hotelDetails.checkOut', e.target.value)} />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Nights</div>
            <input type="number" min="0" className="w-full px-4 py-3 border rounded-lg" placeholder="0" value={form.hotelDetails.nights || ''} onChange={e => update('hotelDetails.nights', e.target.value)} />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Days</div>
            <input type="number" min="0" className="w-full px-4 py-3 border rounded-lg" placeholder="0" value={form.hotelDetails.days || ''} onChange={e => update('hotelDetails.days', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Room Details (separate section) */}
      <div className="border rounded-xl">
        <div className="px-4 py-3 border-b font-semibold">Room Details</div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Room Type</div>
            <input 
              type="text" 
              className="w-full px-4 py-3 border rounded-lg" 
              placeholder="Enter room type" 
              value={form.hotelDetails.roomType} 
              onChange={e => update('hotelDetails.roomType', e.target.value)} 
            />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Rooms</div>
            <input type="number" min="0" className="w-full px-4 py-3 border rounded-lg" placeholder="0" value={form.hotelDetails.rooms || ''} onChange={e => update('hotelDetails.rooms', e.target.value)} />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Price/Night</div>
            <input type="number" min="0" className="w-full px-4 py-3 border rounded-lg" placeholder="0" value={form.hotelDetails.pricePerNight || ''} onChange={e => update('hotelDetails.pricePerNight', e.target.value)} />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Adults</div>
            <input type="number" min="0" className="w-full px-4 py-3 border rounded-lg" placeholder="0" value={form.hotelDetails.adults || ''} onChange={e => update('hotelDetails.adults', e.target.value)} />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Children</div>
            <input type="number" min="0" className="w-full px-4 py-3 border rounded-lg" placeholder="0" value={form.hotelDetails.children || ''} onChange={e => update('hotelDetails.children', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="border rounded-xl">
        <div className="px-4 py-3 border-b font-semibold">Payment Details</div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Discount (₹)</div>
            <input type="number" min="0" className="w-full px-4 py-3 border rounded-lg" placeholder="0" value={form.discount || ''} onChange={e => update('discount', e.target.value)} />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Advance Paid (₹)</div>
            <input type="number" min="0" className="w-full px-4 py-3 border rounded-lg" placeholder="0" value={form.advancePaid || ''} onChange={e => update('advancePaid', e.target.value)} />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Payment Method</div>
            <select className="w-full px-4 py-3 border rounded-lg" value={form.paymentMethod} onChange={e => update('paymentMethod', e.target.value)}>
              <option value="Cash">Cash</option>
              <option value="Online">Bank/NEFT/UPI</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="border rounded-xl">
        <div className="px-4 py-3 border-b font-semibold">Payment Summary</div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between bg-sky-50 px-4 py-3 rounded-lg">
            <span>Subtotal:</span>
            <span>₹{Number(form.subtotal).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between bg-red-50 px-4 py-3 rounded-lg">
            <span>Discount:</span>
            <span>-₹{Number(form.discount || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between bg-green-50 px-4 py-3 rounded-lg">
            <span>Advance Paid:</span>
            <span>₹{Number(form.advancePaid || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between bg-orange-50 px-4 py-3 rounded-lg">
            <span>Due Amount:</span>
            <span>₹{dueAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="md:col-span-2 flex items-center justify-between bg-gray-100 px-4 py-3 rounded-lg font-semibold">
            <span>Total Amount:</span>
            <span className="flex items-center gap-1"><IndianRupee className="h-5 w-5" /> {Number(form.total || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

    </form>
  );
}

export default HotelInvoiceForm;


