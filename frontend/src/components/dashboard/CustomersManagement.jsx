import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, X, ReceiptText } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

const emptyCustomer = { name: "", phone: "", email: "", address: "", gstin: "", notes: "" };

function CustomersManagement() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyCustomer);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const totals = useMemo(() => customers.reduce((acc, customer) => {
    acc.billed += Number(customer.summary?.totalBilled || 0);
    acc.paid += Number(customer.summary?.totalPaid || 0);
    acc.due += Number(customer.summary?.totalDue || 0);
    return acc;
  }, { billed: 0, paid: 0, due: 0 }), [customers]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.listCustomers({ search, limit: 200 });
      setCustomers(res.data?.items || []);
    } catch (error) {
      toast.error(error.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCustomer = async (customer) => {
    setSelected(customer);
    try {
      const res = await api.getCustomer(customer._id);
      setInvoices(res.data?.invoices || []);
    } catch (error) {
      toast.error(error.message || "Failed to load customer invoices");
    }
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      if (form._id) await api.updateCustomer(form._id, form);
      else await api.createCustomer(form);
      toast.success(form._id ? "Customer updated" : "Customer added");
      setShowForm(false);
      setForm(emptyCustomer);
      load();
    } catch (error) {
      toast.error(error.message || "Failed to save customer");
    }
  };

  const remove = async (customer) => {
    if (!window.confirm(`Archive ${customer.name}?`)) return;
    await api.deleteCustomer(customer._id);
    toast.success("Customer archived");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">Customer-wise invoice, payment and due history.</p>
        </div>
        <button onClick={() => { setForm(emptyCustomer); setShowForm(true); }} className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-white hover:bg-sky-700">
          <Plus className="h-5 w-5" /> Add Customer
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm border"><p className="text-sm text-gray-500">Total Billed</p><p className="text-2xl font-bold">₹{totals.billed.toLocaleString("en-IN")}</p></div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border"><p className="text-sm text-gray-500">Total Paid</p><p className="text-2xl font-bold text-emerald-700">₹{totals.paid.toLocaleString("en-IN")}</p></div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border"><p className="text-sm text-gray-500">Pending Due</p><p className="text-2xl font-bold text-amber-700">₹{totals.due.toLocaleString("en-IN")}</p></div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm border">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="Search customer, phone, email..." className="w-full rounded-xl border px-4 py-3 pl-10" />
          </div>
          <button onClick={load} className="rounded-xl border px-5 py-3 font-medium hover:bg-gray-50">Search</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr><th className="p-4">Customer</th><th className="p-4">Invoices</th><th className="p-4">Due</th><th className="p-4 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y">
              {loading ? <tr><td className="p-6" colSpan="4">Loading...</td></tr> : customers.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50">
                  <td className="p-4"><button onClick={() => openCustomer(customer)} className="text-left"><div className="font-semibold text-gray-900">{customer.name}</div><div className="text-gray-500">{customer.phone || "No phone"} · {customer.email || "No email"}</div></button></td>
                  <td className="p-4">{customer.summary?.invoiceCount || 0}</td>
                  <td className="p-4 font-semibold">₹{Number(customer.summary?.totalDue || 0).toLocaleString("en-IN")}</td>
                  <td className="p-4"><div className="flex justify-end gap-2"><button onClick={() => { setForm(customer); setShowForm(true); }} className="rounded-lg border px-3 py-2">Edit</button><button onClick={() => remove(customer)} className="rounded-lg bg-red-50 px-3 py-2 text-red-600"><Trash2 className="h-4 w-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold"><ReceiptText className="h-5 w-5 text-sky-600" /> Customer Bill Details</h2>
          {!selected ? <p className="mt-4 text-sm text-gray-500">Select a customer to view invoice history.</p> : (
            <div className="mt-4 space-y-3">
              <div><p className="font-semibold">{selected.name}</p><p className="text-sm text-gray-500">{selected.phone} {selected.email ? `· ${selected.email}` : ""}</p></div>
              {invoices.length === 0 ? <p className="text-sm text-gray-500">No invoices yet.</p> : invoices.map((invoice) => (
                <div key={invoice._id} className="rounded-xl border p-3">
                  <div className="flex justify-between gap-3"><span className="font-semibold">{invoice.invoiceNumber}</span><span className="capitalize text-xs rounded-full bg-gray-100 px-2 py-1">{invoice.status}</span></div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <span>Total ₹{Number(invoice.total || 0).toLocaleString("en-IN")}</span>
                    <span>Paid ₹{Number(invoice.advancePaid || 0).toLocaleString("en-IN")}</span>
                    <span>Due ₹{Number(invoice.dueAmount || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={save} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">{form._id ? "Edit Customer" : "Add Customer"}</h2><button type="button" onClick={() => setShowForm(false)}><X /></button></div>
            <div className="grid gap-4 md:grid-cols-2">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="rounded-xl border px-4 py-3" />
              <input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="rounded-xl border px-4 py-3" />
              <input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-xl border px-4 py-3" />
              <input value={form.gstin || ""} onChange={(e) => setForm({ ...form, gstin: e.target.value })} placeholder="GSTIN" className="rounded-xl border px-4 py-3" />
              <textarea value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" className="rounded-xl border px-4 py-3 md:col-span-2" />
              <textarea value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" className="rounded-xl border px-4 py-3 md:col-span-2" />
            </div>
            <button className="mt-5 w-full rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white">Save Customer</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default CustomersManagement;
