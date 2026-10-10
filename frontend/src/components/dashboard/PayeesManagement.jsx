import React, { useEffect, useState } from "react";
import { Plus, Search, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

const emptyPayee = { name: "", type: "vendor", phone: "", email: "", address: "", gstin: "" };

function PayeesManagement() {
  const [payees, setPayees] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyPayee);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const res = await api.listPayees({ search, limit: 200 });
      setPayees(res.data?.items || []);
    } catch (error) {
      toast.error(error.message || "Failed to load payees");
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (event) => {
    event.preventDefault();
    try {
      if (form._id) await api.updatePayee(form._id, form);
      else await api.createPayee(form);
      toast.success(form._id ? "Payee updated" : "Payee added");
      setShowForm(false);
      setForm(emptyPayee);
      load();
    } catch (error) {
      toast.error(error.message || "Failed to save payee");
    }
  };

  const remove = async (payee) => {
    if (!window.confirm(`Archive ${payee.name}?`)) return;
    await api.deletePayee(payee._id);
    toast.success("Payee archived");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payees & Vendors</h1>
          <p className="text-sm text-gray-500">Vendor/payee ledger for payment vouchers and expense control.</p>
        </div>
        <button onClick={() => { setForm(emptyPayee); setShowForm(true); }} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-white hover:bg-emerald-700"><Plus className="h-5 w-5" /> Add Payee</button>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="Search payee..." className="w-full rounded-xl border px-4 py-3 pl-10" /></div>
          <button onClick={load} className="rounded-xl border px-5 py-3">Search</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-4">Payee</th><th className="p-4">Type</th><th className="p-4">Expense</th><th className="p-4">Due</th><th className="p-4 text-right">Actions</th></tr></thead>
          <tbody className="divide-y">
            {payees.map((payee) => (
              <tr key={payee._id}>
                <td className="p-4"><div className="font-semibold">{payee.name}</div><div className="text-gray-500">{payee.phone || "No phone"} · {payee.email || "No email"}</div></td>
                <td className="p-4 capitalize">{payee.type}</td>
                <td className="p-4">₹{Number(payee.summary?.totalExpense || 0).toLocaleString("en-IN")}</td>
                <td className="p-4">₹{Number(payee.summary?.totalDue || 0).toLocaleString("en-IN")}</td>
                <td className="p-4"><div className="flex justify-end gap-2"><button onClick={() => { setForm(payee); setShowForm(true); }} className="rounded-lg border px-3 py-2">Edit</button><button onClick={() => remove(payee)} className="rounded-lg bg-red-50 px-3 py-2 text-red-600"><Trash2 className="h-4 w-4" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={save} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">{form._id ? "Edit Payee" : "Add Payee"}</h2><button type="button" onClick={() => setShowForm(false)}><X /></button></div>
            <div className="grid gap-4 md:grid-cols-2">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="rounded-xl border px-4 py-3" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-xl border px-4 py-3"><option value="vendor">Vendor</option><option value="hotel">Hotel</option><option value="transport">Transport</option><option value="guide">Guide</option><option value="staff">Staff</option><option value="other">Other</option></select>
              <input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="rounded-xl border px-4 py-3" />
              <input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-xl border px-4 py-3" />
              <input value={form.gstin || ""} onChange={(e) => setForm({ ...form, gstin: e.target.value })} placeholder="GSTIN" className="rounded-xl border px-4 py-3" />
              <textarea value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" className="rounded-xl border px-4 py-3 md:col-span-2" />
            </div>
            <button className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white">Save Payee</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default PayeesManagement;
