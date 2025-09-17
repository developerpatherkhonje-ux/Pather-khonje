import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Save, Download } from 'lucide-react';
import TourInvoiceForm from '../../components/invoices/TourInvoiceForm';

function TourInvoicePage() {
  const navigate = useNavigate();
  const formRef = React.useRef(null);
  const [formState, setFormState] = React.useState({ loading: false, savedId: null });

  const handleCreated = () => {
    // Stay on this page after save; user can navigate back manually
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FileText className="h-6 w-6 text-green-600" /> Tour Package Invoice</h1>
          <p className="text-sm text-gray-500">Fill in the details and save. You can download PDF after saving.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={formState.loading}
            onClick={() => formRef.current?.submitForm()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Save className="h-4 w-4" /> {formState.loading ? 'Saving...' : 'Save Invoice'}
          </button>
          <button
            type="button"
            disabled={!formState.savedId}
            onClick={() => formRef.current?.downloadPdf()}
            className="bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Download PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <TourInvoiceForm ref={formRef} onCreated={handleCreated} onCancel={() => navigate('/dashboard/invoices')} inlineButtons={false} onStateChange={setFormState} />
      </div>

    </div>
  );
}

export default TourInvoicePage;



