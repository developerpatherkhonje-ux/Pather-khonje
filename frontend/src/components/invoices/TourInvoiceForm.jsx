import React, { useState } from 'react';
import { Save, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateInvoicePdf } from '../../utils/pdf';
import { generateTourInvoicePdf } from '../../utils/pdfTour';
import api from '../../services/api';

const TourInvoiceForm = React.forwardRef(function TourInvoiceForm({ onCreated, onCancel, initial, inlineButtons = true, onStateChange, formId = 'tour-invoice-form' }, ref) {
  const [form, setForm] = useState({
    type: 'tour',
    invoiceNumber: '',
    customer: { name: '', phone: '', email: '', address: '' },
    tourDetails: { 
      packageName: '', 
      startDate: '', 
      endDate: '', 
      totalDays: '',
      totalNights: '',
      adults: '',
      children: '',
      adultPrice: '',
      childPrice: '',
      pax: '', 
      inclusions: '',
      exclusions: ''
    },
    transportDetails: {
      modeOfTransport: '',
      fooding: '',
      pickupPoint: '',
      dropPoint: '',
      includedTransportDetails: ''
    },
    hotels: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    gstPercent: 0,
    total: 0,
    advancePaid: 0,
    paymentMethod: 'Cash'
  });
  const [loading, setLoading] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  
  React.useEffect(() => {
    if (initial) {
      // Safely merge initial data ensuring no undefined values
      const safeInitial = {
        type: initial.type || 'tour',
        invoiceNumber: initial.invoiceNumber || '',
        customer: {
          name: initial.customer?.name || '',
          phone: initial.customer?.phone || '',
          email: initial.customer?.email || '',
          address: initial.customer?.address || ''
        },
        tourDetails: {
          packageName: initial.tourDetails?.packageName || '',
          startDate: initial.tourDetails?.startDate ? 
            (typeof initial.tourDetails.startDate === 'string' && initial.tourDetails.startDate.includes('T') ? 
              initial.tourDetails.startDate.split('T')[0] : 
              (typeof initial.tourDetails.startDate === 'string' ? 
                initial.tourDetails.startDate : 
                new Date(initial.tourDetails.startDate).toISOString().split('T')[0])) : '',
          endDate: initial.tourDetails?.endDate ? 
            (typeof initial.tourDetails.endDate === 'string' && initial.tourDetails.endDate.includes('T') ? 
              initial.tourDetails.endDate.split('T')[0] : 
              (typeof initial.tourDetails.endDate === 'string' ? 
                initial.tourDetails.endDate : 
                new Date(initial.tourDetails.endDate).toISOString().split('T')[0])) : '',
          totalDays: initial.tourDetails?.totalDays || initial.tourDetails?.days || '',
          totalNights: initial.tourDetails?.totalNights || '',
          adults: initial.tourDetails?.adults || '',
          children: initial.tourDetails?.children || '',
          adultPrice: initial.tourDetails?.adultPrice || '',
          childPrice: initial.tourDetails?.childPrice || '',
          pax: initial.tourDetails?.pax || '',
          inclusions: initial.tourDetails?.inclusions || '',
          exclusions: initial.tourDetails?.exclusions || ''
        },
        transportDetails: {
          modeOfTransport: initial.transportDetails?.modeOfTransport || '',
          fooding: initial.transportDetails?.fooding || '',
          pickupPoint: initial.transportDetails?.pickupPoint || '',
          dropPoint: initial.transportDetails?.dropPoint || '',
          includedTransportDetails: initial.transportDetails?.includedTransportDetails || ''
        },
        hotels: (initial.tourDetails?.hotels || initial.hotels || []).map(hotel => ({
          ...hotel,
          checkIn: hotel.checkIn ? 
            (typeof hotel.checkIn === 'string' && hotel.checkIn.includes('T') ? 
              hotel.checkIn.split('T')[0] : 
              new Date(hotel.checkIn).toISOString().split('T')[0]) : '',
          checkOut: hotel.checkOut ? 
            (typeof hotel.checkOut === 'string' && hotel.checkOut.includes('T') ? 
              hotel.checkOut.split('T')[0] : 
              new Date(hotel.checkOut).toISOString().split('T')[0]) : ''
        })),
        subtotal: Number(initial.subtotal || 0),
        discount: Number(initial.discount || 0),
        tax: Number(initial.tax || 0),
        gstPercent: Number(initial.gstPercent || 0),
        total: Number(initial.total || 0),
        advancePaid: Number(initial.advancePaid || 0),
        paymentMethod: initial.paymentMethod || 'Cash'
      };
      
      setForm(safeInitial);
    }
  }, [initial]);

  React.useEffect(() => {
    onStateChange && onStateChange({ loading, savedId, isSaved });
  }, [loading, savedId, isSaved, onStateChange]);

  const update = (path, value) => {
    setForm(prev => {
      const next = { ...prev };
      const parts = path.split('.');
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      // Prevent negative numbers for numeric fields
      let safeValue = value;
      if (typeof value === 'string' && !isNaN(value) && value !== '') {
        const numValue = parseFloat(value);
        if (numValue < 0) {
          safeValue = '0';
        }
      }
      
      obj[parts[parts.length - 1]] = safeValue;
      
      // Auto-calculate subtotal based on adults/children and their prices
      if (path.includes('adults') || path.includes('children') || path.includes('adultPrice') || path.includes('childPrice')) {
        const adults = Number(next.tourDetails.adults || 0);
        const children = Number(next.tourDetails.children || 0);
        const adultPrice = Number(next.tourDetails.adultPrice || 0);
        const childPrice = Number(next.tourDetails.childPrice || 0);
        next.subtotal = (adults * adultPrice) + (children * childPrice);
      }
      
      // Auto-calculate days and nights from start/end dates
      if (path.includes('startDate') || path.includes('endDate')) {
        const startDate = new Date(next.tourDetails.startDate);
        const endDate = new Date(next.tourDetails.endDate);
        if (!isNaN(startDate) && !isNaN(endDate) && endDate > startDate) {
          const timeDiff = endDate.getTime() - startDate.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          next.tourDetails.totalDays = daysDiff;
          next.tourDetails.totalNights = daysDiff - 1; // Nights are typically one less than days
        }
      }
      
      // Keep GST percent and tax amount in sync
      const subtotalAmount = Number(next.subtotal || 0);
      const discountAmount = Number(next.discount || 0);
      
      if (path === 'tax') {
        const taxAmount = Math.max(0, Number(value || 0));
        next.tax = taxAmount;
        next.gstPercent = subtotalAmount > 0 ? (taxAmount / Math.max(1, subtotalAmount - discountAmount)) * 100 : 0;
      }
      if (path === 'gstPercent') {
        const gst = Math.max(0, Number(value || 0));
        next.gstPercent = gst;
        const base = Math.max(0, subtotalAmount - discountAmount);
        next.tax = Math.round((base * gst) / 100);
      }

      next.total = Math.max(0, subtotalAmount - discountAmount + Number(next.tax || 0));
      return { ...next };
    });
  };

  const validateForm = () => {
    const required = [
      { field: form.customer.name, message: 'Customer name is required' },
      { field: form.customer.phone, message: 'Customer phone is required' },
      { field: form.tourDetails.packageName, message: 'Package name is required' },
      { field: form.tourDetails.startDate, message: 'Start date is required' },
      { field: form.tourDetails.endDate, message: 'End date is required' }
    ];
    
    for (const req of required) {
      if (!req.field || req.field.trim() === '') {
        toast.error(req.message);
        return false;
      }
    }
    
    if (Number(form.tourDetails.adults || 0) === 0 && Number(form.tourDetails.children || 0) === 0) {
      toast.error('At least one adult or child is required');
      return false;
    }
    
    return true;
  };

  const saveInvoice = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      let res;
      let updatedInvoice;
      
      // Prepare data with hotels in the correct structure
      const dataToSend = {
        ...form,
        tourDetails: {
          ...form.tourDetails,
          hotels: form.hotels  // Move hotels into tourDetails for backend
        },
        invoiceNumber: initial && initial._id ? form.invoiceNumber : undefined,
        _id: initial && initial._id ? initial._id : undefined
      };
      
      // Debug: Log the data being sent
      console.log('TourInvoiceForm - Sending data to backend:', JSON.stringify(dataToSend, null, 2));
      console.log('TourInvoiceForm - Hotels array:', form.hotels);
      console.log('TourInvoiceForm - TourDetails hotels:', dataToSend.tourDetails.hotels);
      
      // Check if this is an edit operation (has initial data with _id)
      if (initial && initial._id) {
        // Update existing invoice
        res = await api.updateInvoice(initial._id, dataToSend);
        updatedInvoice = res.data || res;
        setSavedId(initial._id);
        toast.success(`${updatedInvoice.invoiceNumber || 'Invoice'} updated successfully`);
      } else {
        // Create new invoice
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
    } catch (err) {
      toast.error(err.message || 'Failed to save invoice');
    } finally { 
      setLoading(false); 
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    await saveInvoice();
  };

  const downloadPdf = async () => {
    const fileName = form.invoiceNumber || `TRP${String(Date.now()).slice(-6)}`;
    try {
      const data = {
        invoiceNumber: fileName,
        date: Date.now(),
        customer: form.customer,
        tourDetails: {
          ...form.tourDetails,
          hotels: form.hotels  // Move hotels into tourDetails
        },
        transportDetails: form.transportDetails,
        hotels: form.hotels,  // Keep this for backward compatibility
        subtotal: form.subtotal,
        discount: form.discount,
        tax: form.tax,
        gstPercent: form.gstPercent,
        total: form.total,
        advancePaid: form.advancePaid,
      };
      
      // Debug: Log the data being sent to PDF
      console.log('TourInvoiceForm - PDF data:', JSON.stringify(data, null, 2));
      console.log('TourInvoiceForm - PDF hotels:', data.hotels);
      console.log('TourInvoiceForm - PDF tourDetails.hotels:', data.tourDetails.hotels);
      
      await generateTourInvoicePdf(data, fileName);
      toast.success(`${fileName} downloaded`);
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF');
    }
  };

  const addHotel = () => {
    const newHotel = {
      id: Date.now(),
      hotelName: '',
      place: '',
      roomType: '',
      checkIn: '',
      checkOut: ''
    };
    setForm(prev => ({
      ...prev,
      hotels: [...prev.hotels, newHotel]
    }));
  };

  const removeHotel = (hotelId) => {
    setForm(prev => ({
      ...prev,
      hotels: prev.hotels.filter(hotel => hotel.id !== hotelId)
    }));
  };

  const updateHotel = (hotelId, field, value) => {
    setForm(prev => ({
      ...prev,
      hotels: prev.hotels.map(hotel => 
        hotel.id === hotelId ? { ...hotel, [field]: value } : hotel
      )
    }));
  };

  const dueAmount = Math.max(0, Number(form.total || 0) - Number(form.advancePaid || 0));

  React.useImperativeHandle(ref, () => ({
    submitForm: saveInvoice,
    downloadPdf,
    getState: () => ({ loading, savedId })
  }), [loading, savedId, saveInvoice]);

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
              disabled={loading || isSaved} 
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

      {/* Customer Information */}
      <div className="border rounded-xl">
        <div className="px-4 py-3 border-b font-semibold">Customer Information</div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="px-4 py-3 border rounded-lg" placeholder="Customer Name" value={form.customer.name} onChange={e => update('customer.name', e.target.value)} required />
          <input className="px-4 py-3 border rounded-lg" placeholder="Phone" value={form.customer.phone} onChange={e => update('customer.phone', e.target.value)} required />
          <input className="px-4 py-3 border rounded-lg" placeholder="Email" value={form.customer.email} onChange={e => update('customer.email', e.target.value)} />
          <input className="px-4 py-3 border rounded-lg" placeholder="Address" value={form.customer.address} onChange={e => update('customer.address', e.target.value)} />
        </div>
      </div>

      {/* Tour Package Details */}
      <div className="border rounded-xl">
        <div className="px-4 py-3 border-b font-semibold">Tour Package Details</div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="px-4 py-3 border rounded-lg" placeholder="Package Name" value={form.tourDetails.packageName || ''} onChange={e => update('tourDetails.packageName', e.target.value)} required />
          <input className="px-4 py-3 border rounded-lg" placeholder="Pax (e.g. 2A + 1C)" value={form.tourDetails.pax || ''} onChange={e => update('tourDetails.pax', e.target.value)} />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:col-span-2">
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">Starting Date</div>
              <input type="date" className="w-full px-4 py-3 border rounded-lg" value={form.tourDetails.startDate || ''} onChange={e => update('tourDetails.startDate', e.target.value)} required />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">Ending Date</div>
              <input type="date" className="w-full px-4 py-3 border rounded-lg" value={form.tourDetails.endDate || ''} onChange={e => update('tourDetails.endDate', e.target.value)} required />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">Total Days</div>
              <input type="number" min="0" className="w-full px-4 py-3 border rounded-lg" placeholder="0" value={form.tourDetails.totalDays || ''} onChange={e => update('tourDetails.totalDays', e.target.value)} />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">Total Nights</div>
              <input type="number" min="0" className="w-full px-4 py-3 border rounded-lg" placeholder="0" value={form.tourDetails.totalNights || ''} onChange={e => update('tourDetails.totalNights', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:col-span-2">
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">Number of Adults</div>
              <input type="number" min="0" className="w-full px-4 py-3 border rounded-lg" placeholder="0" value={form.tourDetails.adults || ''} onChange={e => update('tourDetails.adults', e.target.value)} />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">Number of Children</div>
              <input type="number" min="0" className="w-full px-4 py-3 border rounded-lg" placeholder="0" value={form.tourDetails.children || ''} onChange={e => update('tourDetails.children', e.target.value)} />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">Adult Price (₹)</div>
              <input type="number" min="0" className="w-full px-4 py-3 border rounded-lg" placeholder="0" value={form.tourDetails.adultPrice || ''} onChange={e => update('tourDetails.adultPrice', e.target.value)} />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">Child Price (₹)</div>
              <input type="number" min="0" className="w-full px-4 py-3 border rounded-lg" placeholder="0" value={form.tourDetails.childPrice || ''} onChange={e => update('tourDetails.childPrice', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
            <textarea className="px-4 py-3 border rounded-lg" placeholder="Inclusions" value={form.tourDetails.inclusions || ''} onChange={e => update('tourDetails.inclusions', e.target.value)} />
            <textarea className="px-4 py-3 border rounded-lg" placeholder="Exclusions" value={form.tourDetails.exclusions || ''} onChange={e => update('tourDetails.exclusions', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Hotel Details */}
      <div className="border rounded-xl">
        <div className="px-4 py-3 border-b font-semibold flex items-center justify-between">
          <span>Hotel Details</span>
          <button type="button" onClick={addHotel} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
            <span className="text-white">+</span> Add Hotel
          </button>
        </div>
        <div className="p-4">
          {form.hotels.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No hotels added yet. Click "Add Hotel" to add hotel details.
            </div>
          ) : (
            <div className="space-y-4">
              {form.hotels.map((hotel, index) => (
                <div key={hotel.id} className="bg-white border rounded-xl p-4 relative">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800">Hotel {index + 1}</h4>
                    <button 
                      type="button" 
                      onClick={() => removeHotel(hotel.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-1">Hotel Name</div>
                      <input 
                        className="w-full px-4 py-3 border rounded-lg" 
                        placeholder="Hotel Name" 
                        value={hotel.hotelName} 
                        onChange={e => updateHotel(hotel.id, 'hotelName', e.target.value)} 
                      />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-1">Place/Location</div>
                      <input 
                        className="w-full px-4 py-3 border rounded-lg" 
                        placeholder="Place/Location" 
                        value={hotel.place} 
                        onChange={e => updateHotel(hotel.id, 'place', e.target.value)} 
                      />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-1">Room Type</div>
                      <input 
                        className="w-full px-4 py-3 border rounded-lg" 
                        placeholder="Room Type" 
                        value={hotel.roomType} 
                        onChange={e => updateHotel(hotel.id, 'roomType', e.target.value)} 
                      />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-1">Check-in Date</div>
                      <input 
                        type="date" 
                        className="w-full px-4 py-3 border rounded-lg" 
                        placeholder="dd-mm-yyyy" 
                        value={hotel.checkIn} 
                        onChange={e => updateHotel(hotel.id, 'checkIn', e.target.value)} 
                      />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-1">Check-out Date</div>
                      <input 
                        type="date" 
                        className="w-full px-4 py-3 border rounded-lg" 
                        placeholder="dd-mm-yyyy" 
                        value={hotel.checkOut} 
                        onChange={e => updateHotel(hotel.id, 'checkOut', e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transport Details */}
      <div className="border rounded-xl">
        <div className="px-4 py-3 border-b font-semibold">Other Details</div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input className="w-full px-4 py-3 border rounded-lg" placeholder="Mode of Transport" value={form.transportDetails.modeOfTransport} onChange={e => update('transportDetails.modeOfTransport', e.target.value)} />
          </div>
          <div>
            <input className="w-full px-4 py-3 border rounded-lg" placeholder="Fooding (e.g., MAP, CP, AP)" value={form.transportDetails.fooding} onChange={e => update('transportDetails.fooding', e.target.value)} />
          </div>
          <div>
            <input className="w-full px-4 py-3 border rounded-lg" placeholder="Pickup Point" value={form.transportDetails.pickupPoint} onChange={e => update('transportDetails.pickupPoint', e.target.value)} />
          </div>
          <div>
            <input className="w-full px-4 py-3 border rounded-lg" placeholder="Drop Point" value={form.transportDetails.dropPoint} onChange={e => update('transportDetails.dropPoint', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <input className="w-full px-4 py-3 border rounded-lg" placeholder="Included Transport Details" value={form.transportDetails.includedTransportDetails} onChange={e => update('transportDetails.includedTransportDetails', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="border rounded-xl">
        <div className="px-4 py-3 border-b font-semibold">Payment Details</div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">GST (%)</div>
            <input type="number" min="0" className="w-full px-4 py-3 border rounded-lg" placeholder="0" value={form.gstPercent || ''} onChange={e => update('gstPercent', e.target.value)} />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">GST Amount (₹)</div>
            <input type="number" min="0" className="w-full px-4 py-3 border rounded-lg" placeholder="0" value={form.tax || ''} onChange={e => update('tax', e.target.value)} />
          </div>
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
            <span>₹{Number(form.total || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

    </form>
  );
});

export default TourInvoiceForm;


