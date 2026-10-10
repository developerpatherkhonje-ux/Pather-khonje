import React, { useState } from "react";
import { ArrowLeft, Car, Download, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import CarInvoiceForm from "../../components/invoices/CarInvoiceForm";

function CarInvoicePage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(null);
  const formId = "car-invoice-form";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <button onClick={() => navigate("/dashboard/invoices")} className="mb-2 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Back to Invoices</button>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900"><Car className="h-6 w-6 text-emerald-600" /> Car Rental Invoice</h1>
          <p className="text-sm text-gray-500">Create transport/car bills with automatic due and receipt tracking.</p>
        </div>
        <div className="flex gap-3">
          <button form={formId} type="submit" className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-white"><Save className="h-4 w-4" /> Save Invoice</button>
          <button disabled={!saved?._id} onClick={async () => {
            try {
              await api.downloadInvoicePdf(saved._id, saved.invoiceNumber);
              toast.success("PDF downloaded");
            } catch {
              toast.error("Failed to download PDF");
            }
          }} className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-white disabled:opacity-50"><Download className="h-4 w-4" /> Download PDF</button>
        </div>
      </div>
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <CarInvoiceForm formId={formId} inlineButtons={false} onCreated={setSaved} onCancel={() => navigate("/dashboard/invoices")} />
      </div>
    </div>
  );
}

export default CarInvoicePage;
