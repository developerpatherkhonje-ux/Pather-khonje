import React, { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

function BranchHrManagement() {
  const [branches, setBranches] = useState([]);
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ name: "", code: "", phone: "", email: "", address: "", revenueTarget: 0 });

  const load = async () => {
    try {
      const res = await api.listBranches();
      setBranches(res.data?.branches || []);
      setStaff(res.data?.staff || []);
    } catch (error) {
      toast.error(error.message || "Failed to load branches");
    }
  };

  useEffect(() => { load(); }, []);

  const payroll = useMemo(() => staff.map((member) => {
    const base = Number(member.salary?.base || 0);
    const incentive = Number(member.salary?.incentivePercent || 0);
    const target = Number(member.salary?.target || 0);
    return { ...member, estimatedSalary: base + Math.round((target * incentive) / 100) };
  }), [staff]);

  const saveBranch = async (event) => {
    event.preventDefault();
    try {
      await api.createBranch(form);
      toast.success("Branch added");
      setForm({ name: "", code: "", phone: "", email: "", address: "", revenueTarget: 0 });
      load();
    } catch (error) {
      toast.error(error.message || "Failed to save branch");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Branches, Staff & Payroll</h1>
        <p className="text-sm text-gray-500">Branch-wise staff access, revenue target and salary calculation foundation.</p>
      </div>
      <form onSubmit={saveBranch} className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Plus className="h-5 w-5" /> Add Branch</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Branch name" className="rounded-xl border px-4 py-3" />
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Code" className="rounded-xl border px-4 py-3" />
          <input type="number" value={form.revenueTarget} onChange={(e) => setForm({ ...form, revenueTarget: e.target.value })} placeholder="Revenue target" className="rounded-xl border px-4 py-3" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="rounded-xl border px-4 py-3" />
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-xl border px-4 py-3" />
          <button className="rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white">Save Branch</button>
        </div>
      </form>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Branches</h2>
          <div className="space-y-3">
            {branches.map((branch) => <div key={branch._id} className="rounded-xl border p-4"><div className="font-semibold">{branch.name} {branch.code ? `(${branch.code})` : ""}</div><div className="text-sm text-gray-500">Target ₹{Number(branch.revenueTarget || 0).toLocaleString("en-IN")}</div></div>)}
          </div>
        </section>
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Payroll Estimate</h2>
          <div className="space-y-3">
            {payroll.map((member) => <div key={member._id} className="rounded-xl border p-4"><div className="font-semibold">{member.name}</div><div className="text-sm capitalize text-gray-500">{member.role} · {member.designation}</div><div className="mt-2 text-sm font-semibold">Estimated salary ₹{Number(member.estimatedSalary || 0).toLocaleString("en-IN")}</div></div>)}
          </div>
        </section>
      </div>
    </div>
  );
}

export default BranchHrManagement;
