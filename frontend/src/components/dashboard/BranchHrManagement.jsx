import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Plus, Target, Users } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

const emptyBranch = {
  name: "",
  code: "",
  type: "branch",
  phone: "",
  email: "",
  address: "",
  revenueTarget: 0,
  targets: [{ periodType: "monthly", period: new Date().toISOString().slice(0, 7), revenueTarget: 0, bookingTarget: 0, leadTarget: 0, customerTarget: 0 }],
};

function BranchHrManagement() {
  const [branches, setBranches] = useState([]);
  const [staff, setStaff] = useState([]);
  const [access, setAccess] = useState({ headOffice: false });
  const [form, setForm] = useState(emptyBranch);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [period, setPeriod] = useState("month");

  const load = useCallback(async () => {
    try {
      const res = await api.listBranches({ period });
      setBranches(res.data?.branches || []);
      setStaff(res.data?.staff || []);
      setAccess(res.data?.access || { headOffice: false });
    } catch (error) {
      toast.error(error.message || "Failed to load branches");
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const filteredBranches = selectedBranch === "all" ? branches : branches.filter((branch) => branch._id === selectedBranch);
  const filteredStaff = selectedBranch === "all" ? staff : staff.filter((member) => (member.branch?._id || member.branch) === selectedBranch);

  const summary = useMemo(() => filteredBranches.reduce((acc, branch) => {
    acc.revenue += Number(branch.stats?.revenue || 0);
    acc.collected += Number(branch.stats?.collected || 0);
    acc.due += Number(branch.stats?.due || 0);
    acc.expenses += Number(branch.stats?.expenses || 0);
    acc.leads += Number(branch.stats?.leads || 0);
    acc.customers += Number(branch.stats?.customers || 0);
    acc.bookings += Number(branch.stats?.bookings || 0);
    acc.target += Number(branch.revenueTarget || 0);
    return acc;
  }, { revenue: 0, collected: 0, due: 0, expenses: 0, leads: 0, customers: 0, bookings: 0, target: 0 }), [filteredBranches]);

  const payroll = useMemo(() => filteredStaff.map((member) => {
    const base = Number(member.salary?.base || 0);
    const incentive = Number(member.salary?.incentivePercent || 0);
    const achieved = Number(member.performance?.revenue || 0);
    const target = Number(member.salary?.target || member.targets?.[0]?.revenueTarget || 0);
    const incentiveBase = target > 0 && achieved >= target ? achieved : 0;
    return { ...member, estimatedSalary: base + Math.round((incentiveBase * incentive) / 100), achieved, target };
  }), [filteredStaff]);

  const saveBranch = async (event) => {
    event.preventDefault();
    try {
      await api.createBranch(form);
      toast.success("Branch added");
      setForm(emptyBranch);
      load();
    } catch (error) {
      toast.error(error.message || "Failed to save branch");
    }
  };

  const updateTarget = (field, value) => {
    setForm((prev) => ({
      ...prev,
      targets: [{ ...(prev.targets?.[0] || {}), [field]: field === "period" || field === "periodType" ? value : Number(value) }],
    }));
  };

  const currency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branches, Staff & Payroll</h1>
          <p className="text-sm text-gray-500">Branch-wise staff access, targets, customers, leads, bookings and reports.</p>
        </div>
        <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="rounded-xl border px-4 py-3">
          <option value="all">All accessible branches</option>
          {branches.map((branch) => <option key={branch._id} value={branch._id}>{branch.name}</option>)}
        </select>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="rounded-xl border px-4 py-3">
          <option value="week">This week</option>
          <option value="month">This month</option>
          <option value="year">This year</option>
          <option value="all">All time</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Revenue / Target</p><p className="text-2xl font-black">{currency(summary.revenue)}</p><p className="text-xs text-gray-500">Target {currency(summary.target)}</p></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Collected / Due</p><p className="text-2xl font-black text-emerald-700">{currency(summary.collected)}</p><p className="text-xs text-amber-700">Due {currency(summary.due)}</p></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Leads / Customers</p><p className="text-2xl font-black">{summary.leads} / {summary.customers}</p><p className="text-xs text-gray-500">Bookings {summary.bookings}</p></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Expenses</p><p className="text-2xl font-black text-red-700">{currency(summary.expenses)}</p><p className="text-xs text-gray-500">Branch-wise vouchers</p></div>
      </div>

      {access.headOffice && (
        <form onSubmit={saveBranch} className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Plus className="h-5 w-5" /> Add Branch / Head Office</h2>
          <div className="grid gap-3 md:grid-cols-4">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Branch name" className="rounded-xl border px-4 py-3" />
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Code" className="rounded-xl border px-4 py-3" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-xl border px-4 py-3"><option value="branch">Branch</option><option value="head_office">Head Office</option></select>
            <input type="number" value={form.revenueTarget} onChange={(e) => setForm({ ...form, revenueTarget: e.target.value })} placeholder="Overall revenue target" className="rounded-xl border px-4 py-3" />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="rounded-xl border px-4 py-3" />
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-xl border px-4 py-3" />
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" className="rounded-xl border px-4 py-3 md:col-span-2" />
          </div>
          <div className="mt-4 rounded-2xl border bg-gray-50 p-4">
            <h3 className="mb-3 flex items-center gap-2 font-bold"><Target className="h-4 w-4 text-sky-600" /> Period Target</h3>
            <div className="grid gap-3 md:grid-cols-5">
              <select value={form.targets?.[0]?.periodType || "monthly"} onChange={(e) => updateTarget("periodType", e.target.value)} className="rounded-xl border px-4 py-3"><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="yearly">Yearly</option></select>
              <input value={form.targets?.[0]?.period || ""} onChange={(e) => updateTarget("period", e.target.value)} placeholder="2026-10 or 2026-W42" className="rounded-xl border px-4 py-3" />
              <input type="number" value={form.targets?.[0]?.revenueTarget || 0} onChange={(e) => updateTarget("revenueTarget", e.target.value)} placeholder="Revenue target" className="rounded-xl border px-4 py-3" />
              <input type="number" value={form.targets?.[0]?.bookingTarget || 0} onChange={(e) => updateTarget("bookingTarget", e.target.value)} placeholder="Booking target" className="rounded-xl border px-4 py-3" />
              <button className="rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white">Save Branch</button>
            </div>
          </div>
        </form>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Building2 className="h-5 w-5 text-sky-600" /> Branch Reports</h2>
          <div className="space-y-3">
            {filteredBranches.map((branch) => (
              <div key={branch._id} className="rounded-2xl border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div><div className="font-bold">{branch.name} {branch.code ? `(${branch.code})` : ""}</div><div className="text-sm capitalize text-gray-500">{branch.type || "branch"}</div></div>
                  <div className="text-right text-sm"><div className="font-bold">{currency(branch.stats?.revenue)}</div><div className="text-gray-500">Target {currency(branch.revenueTarget)}</div></div>
                </div>
                <div className="mt-4 grid gap-2 text-sm md:grid-cols-4">
                  <span className="rounded-xl bg-sky-50 px-3 py-2">Leads {branch.stats?.leads || 0}</span>
                  <span className="rounded-xl bg-emerald-50 px-3 py-2">Customers {branch.stats?.customers || 0}</span>
                  <span className="rounded-xl bg-violet-50 px-3 py-2">Bookings {branch.stats?.bookings || 0}</span>
                  <span className="rounded-xl bg-red-50 px-3 py-2">Expenses {currency(branch.stats?.expenses)}</span>
                </div>
                {branch.targets?.length > 0 && (
                  <div className="mt-3 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600">
                    Active target: {branch.targets[0].periodType} {branch.targets[0].period} · Revenue {currency(branch.targets[0].revenueTarget)} · Bookings {branch.targets[0].bookingTarget || 0}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Users className="h-5 w-5 text-sky-600" /> Branch Staff & Payroll</h2>
          <div className="space-y-3">
            {payroll.map((member) => (
              <div key={member._id} className="rounded-2xl border p-4">
                <div className="font-bold">{member.name}</div>
                <div className="text-sm capitalize text-gray-500">{member.role} · {member.designation || "Staff"} · {member.branch?.name || "No branch"}</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <span className="rounded-lg bg-emerald-50 px-2 py-1">Revenue {currency(member.performance?.revenue || 0)}</span>
                  <span className="rounded-lg bg-sky-50 px-2 py-1">Bookings {member.performance?.bookings || 0}</span>
                  <span className="rounded-lg bg-amber-50 px-2 py-1">Leads {member.performance?.leads || 0}</span>
                  <span className="rounded-lg bg-violet-50 px-2 py-1">Customers {member.performance?.customers || 0}</span>
                </div>
                <div className="mt-2 text-sm font-semibold">Estimated salary {currency(member.estimatedSalary)}</div>
                <div className="text-xs text-gray-500">Personal target {currency(member.target || 0)}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default BranchHrManagement;
