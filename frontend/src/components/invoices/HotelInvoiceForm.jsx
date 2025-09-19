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
    if (initial) setForm(prev => ({ ...prev, ...initial }));
  }, [initial]);
  const [loading, setLoading] = useState(false);
  const [savedId, setSavedId] = useState(null);

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
    if (path === 'hotelDetails.additionalBenefits') {
      console.log('Updating additionalBenefits:', value);
    }
    setForm(prev => {
      const next = { ...prev };
      const parts = path.split('.');
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      obj[parts[parts.length - 1]] = value;
      if (path === 'hotelDetails.additionalBenefits') {
        console.log('Updated next.hotelDetails.additionalBenefits:', next.hotelDetails.additionalBenefits);
      }
      // derive nights/days from dates when available
      if (path === 'hotelDetails.checkIn' || path === 'hotelDetails.checkOut') {
        const ci = new Date(next.hotelDetails.checkIn);
        const co = new Date(next.hotelDetails.checkOut);
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
      // Don't send invoiceNumber when creating a new invoice
      const dataToSend = savedId ? form : { ...form, invoiceNumber: undefined };
      const res = await api.createInvoice(dataToSend);
      const created = res.data || res;
      setSavedId(created?._id);
      if (created?.invoiceNumber) {
        toast.success(`${created.invoiceNumber} saved`);
      } else {
        toast.success('Invoice saved');
      }
      onCreated && onCreated(created);
    } catch (err) {
      toast.error(err.message || 'Failed to save invoice');
    } finally { setLoading(false); }
  };

  const downloadPdf = async () => {
    const fileName = form.invoiceNumber || `HTL${String(Date.now()).slice(-6)}`;
    
    // Debug form state immediately
    console.log('=== PDF GENERATION DEBUG ===');
    console.log('Current form state:', form);
    console.log('Current form.hotelDetails:', form.hotelDetails);
    console.log('Current form.hotelDetails.additionalBenefits:', form.hotelDetails.additionalBenefits);
    console.log('Current form.hotelDetails.additionalBenefits type:', typeof form.hotelDetails.additionalBenefits);
    console.log('Current form.hotelDetails.additionalBenefits length:', form.hotelDetails.additionalBenefits?.length);
    console.log('=== END DEBUG ===');
    
    try {
      // Ensure additionalBenefits is properly passed
      console.log('BEFORE data preparation - form.hotelDetails.additionalBenefits:', form.hotelDetails.additionalBenefits);
      console.log('BEFORE data preparation - typeof:', typeof form.hotelDetails.additionalBenefits);
      console.log('BEFORE data preparation - length:', form.hotelDetails.additionalBenefits?.length);
      
      // TEMPORARY TEST: Force a value to see if PDF generation works
      const additionalBenefitsValue = form.hotelDetails.additionalBenefits || '';
      const testValue = additionalBenefitsValue || 'TEST VALUE FROM FORM';
      console.log('Test value being used:', testValue);
      
      const hotelDetailsWithBenefits = {
        ...form.hotelDetails,
        additionalBenefits: testValue
      };
      
      console.log('AFTER data preparation - hotelDetailsWithBenefits.additionalBenefits:', hotelDetailsWithBenefits.additionalBenefits);
      console.log('AFTER data preparation - typeof:', typeof hotelDetailsWithBenefits.additionalBenefits);
      console.log('AFTER data preparation - length:', hotelDetailsWithBenefits.additionalBenefits?.length);
      
      const data = {
        invoiceNumber: fileName,
        date: Date.now(),
        customer: form.customer,
        hotelDetails: hotelDetailsWithBenefits,
        subtotal: form.subtotal,
        discount: form.discount,
        tax: form.tax,
        total: form.total,
        advancePaid: form.advancePaid,
      };
      console.log('PDF Data being sent:', data);
      console.log('Hotel Details:', data.hotelDetails);
      console.log('Additional Benefits:', data.hotelDetails.additionalBenefits);
      console.log('Form state:', form);
      console.log('Form hotelDetails:', form.hotelDetails);
      console.log('Form additionalBenefits:', form.hotelDetails.additionalBenefits);
      console.log('HotelDetails keys:', Object.keys(data.hotelDetails));
      console.log('HotelDetails values:', Object.values(data.hotelDetails));
      
      // Verify additionalBenefits is not undefined
      if (data.hotelDetails.additionalBenefits === undefined) {
        console.error('ERROR: additionalBenefits is undefined in data being sent to PDF');
        console.log('Form additionalBenefits value:', form.hotelDetails.additionalBenefits);
        console.log('Form additionalBenefits type:', typeof form.hotelDetails.additionalBenefits);
      } else if (data.hotelDetails.additionalBenefits === '') {
        console.warn('WARNING: additionalBenefits is empty string');
        console.log('Form additionalBenefits value:', form.hotelDetails.additionalBenefits);
        console.log('Form additionalBenefits type:', typeof form.hotelDetails.additionalBenefits);
      } else {
        console.log('SUCCESS: additionalBenefits is defined:', data.hotelDetails.additionalBenefits);
      }
      await generateInvoicePdf(data, fileName);
      toast.success(`${fileName} downloaded`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      console.log('Falling back to html2canvas method');
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
            <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Save Invoice'}
            </button>
            <button type="button" disabled={!savedId} onClick={downloadPdf} className="bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Download className="h-4 w-4" /> Download PDF
            </button>
          </div>
        </div>
      )}

      {/* Customer and Hotel Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-xl">
          <div className="px-4 py-3 border-b font-semibold">Customer Information</div>
          <div className="p-4 space-y-3">
            <input className="w-full px-4 py-3 border rounded-lg" placeholder="Customer Name" value={form.customer.name} onChange={e => update('customer.name', e.target.value)} />
            <textarea className="w-full px-4 py-3 border rounded-lg" placeholder="Address" value={form.customer.address} onChange={e => update('customer.address', e.target.value)} />
            <input className="w-full px-4 py-3 border rounded-lg" placeholder="Contact Number" value={form.customer.phone} onChange={e => update('customer.phone', e.target.value)} />
            <input className="w-full px-4 py-3 border rounded-lg" placeholder="Email" value={form.customer.email} onChange={e => update('customer.email', e.target.value)} />
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
            <input type="number" min="0" className="w-full px-4 py-3 border rounded-lg" placeholder="0" value={form.hotelDetails.nights} onChange={e => update('hotelDetails.nights', e.target.value)} />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Days</div>
            <input type="number" min="0" className="w-full px-4 py-3 border rounded-lg" placeholder="0" value={form.hotelDetails.days} onChange={e => update('hotelDetails.days', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Room Details (separate section) */}
      <div className="border rounded-xl">
        <div className="px-4 py-3 border-b font-semibold">Room Details</div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Room Type</div>
            <select className="w-full px-4 py-3 border rounded-lg" value={form.hotelDetails.roomType} onChange={e => update('hotelDetails.roomType', e.target.value)}>
              <option value="">Select Room Type</option>
              <option>Standard</option>
              <option>Deluxe</option>
              <option>Suite</option>
            </select>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Rooms</div>
            <input type="number" min="1" className="w-full px-4 py-3 border rounded-lg" placeholder="1" value={form.hotelDetails.rooms} onChange={e => update('hotelDetails.rooms', e.target.value)} />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Price/Night</div>
            <input type="number" min="0" className="w-full px-4 py-3 border rounded-lg" placeholder="0" value={form.hotelDetails.pricePerNight} onChange={e => update('hotelDetails.pricePerNight', e.target.value)} />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Adults</div>
            <input type="number" min="1" className="w-full px-4 py-3 border rounded-lg" placeholder="1" value={form.hotelDetails.adults} onChange={e => update('hotelDetails.adults', e.target.value)} />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Children</div>
            <input type="number" min="0" className="w-full px-4 py-3 border rounded-lg" placeholder="0" value={form.hotelDetails.children} onChange={e => update('hotelDetails.children', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="border rounded-xl">
        <div className="px-4 py-3 border-b font-semibold">Payment Details</div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Discount (₹)</div>
            <input type="number" min="0" className="w-full px-4 py-3 border rounded-lg" placeholder="0" value={form.discount} onChange={e => update('discount', e.target.value)} />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Advance Paid (₹)</div>
            <input type="number" min="0" className="w-full px-4 py-3 border rounded-lg" placeholder="0" value={form.advancePaid} onChange={e => update('advancePaid', e.target.value)} />
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

      {inlineButtons && (
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Save Invoice'}</button>
          <button type="button" disabled={!savedId} onClick={downloadPdf} className="bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Download className="h-4 w-4" /> Download PDF</button>
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border">Cancel</button>
        </div>
      )}
    </form>
  );
}

export default HotelInvoiceForm;


