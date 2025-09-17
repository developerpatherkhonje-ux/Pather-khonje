import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Save, Download } from 'lucide-react';
import HotelInvoiceForm from '../../components/invoices/HotelInvoiceForm';
import { generateInvoicePdf } from '../../utils/pdf';
import toast from 'react-hot-toast';

function HotelInvoicePage() {
  const navigate = useNavigate();
  const [savedId, setSavedId] = useState(null);
  const [lastInvoice, setLastInvoice] = useState(null);
  const formId = 'hotel-invoice-form';

  const handleCreated = async (inv) => {
    setSavedId(inv?._id);
    setLastInvoice(inv);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FileText className="h-6 w-6 text-sky-600" /> Hotel Booking Invoice</h1>
          <p className="text-sm text-gray-500">Fill in the details and save. You can download PDF after saving.</p>
        </div>
        <div className="flex gap-3">
          <button form={formId} type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Save className="h-4 w-4" /> Save Invoice
          </button>
          <button type="button" disabled={!lastInvoice} onClick={() => {
            try {
              const file = lastInvoice.invoiceNumber || `HTL${String(Date.now()).slice(-6)}`;
              generateInvoicePdf(lastInvoice, file);
              toast.success(`${file} downloaded`);
            } catch (e) { toast.error('Failed to generate PDF'); }
          }} className="bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Download className="h-4 w-4" /> Download PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <HotelInvoiceForm formId={formId} inlineButtons={false} onCreated={handleCreated} onCancel={() => navigate('/dashboard/invoices')} />
      </div>
    </div>
  );
}

export default HotelInvoicePage;



