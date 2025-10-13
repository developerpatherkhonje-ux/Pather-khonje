import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Save, Download, ArrowLeft } from 'lucide-react';
import HotelInvoiceForm from '../../components/invoices/HotelInvoiceForm';
import { generateInvoicePdf } from '../../utils/pdf';
import toast from 'react-hot-toast';

function HotelInvoicePage() {
  const navigate = useNavigate();
  const [savedId, setSavedId] = useState(null);
  const [lastInvoice, setLastInvoice] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const formId = 'hotel-invoice-form';

  const handleCreated = async (inv) => {
    setSavedId(inv?._id);
    setLastInvoice(inv);
    setIsSaved(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/dashboard/invoices')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back to Invoices</span>
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FileText className="h-6 w-6 text-sky-600" /> Hotel Booking Invoice</h1>
          <p className="text-sm text-gray-500">Fill in the details and save. You can download PDF after saving.</p>
        </div>
        <div className="flex gap-3">
          <button 
            form={formId} 
            type="submit" 
            disabled={loading || isSaved}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-500 ${
              isSaved 
                ? 'bg-red-500 text-white cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <Save className="h-4 w-4" /> 
            {loading ? 'Saving...' : isSaved ? 'Saved ✓' : 'Save Invoice'}
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
        <HotelInvoiceForm 
          formId={formId} 
          inlineButtons={false} 
          onCreated={handleCreated} 
          onCancel={() => navigate('/dashboard/invoices')}
          onStateChange={({ loading, isSaved }) => {
            setLoading(loading);
            setIsSaved(isSaved);
          }}
        />
      </div>
    </div>
  );
}

export default HotelInvoicePage;



