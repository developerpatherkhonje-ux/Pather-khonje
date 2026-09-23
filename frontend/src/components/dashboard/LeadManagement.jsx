import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Edit, Plus, Search, Trash2, X } from "lucide-react";
import apiService from "../../services/api";

const stageOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "negotiation", label: "Negotiation" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

const queryTypeOptions = [
  { value: "package", label: "Package" },
  { value: "hotel", label: "Hotel" },
  { value: "transport", label: "Transport" },
  { value: "custom", label: "Custom" },
  { value: "other", label: "Other" },
];

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  queryPlace: "",
  queryType: "package",
  stage: "new",
  nextFollowUp: "",
  remarks: "",
};

function LeadManagement() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [queryTypeFilter, setQueryTypeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const totalLeads = useMemo(
    () => Object.values(stats).reduce((sum, count) => sum + Number(count || 0), 0),
    [stats],
  );

  useEffect(() => {
    fetchLeads();
  }, [stageFilter, queryTypeFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.listLeads({
        search: searchTerm.trim(),
        stage: stageFilter,
        queryType: queryTypeFilter,
      });
      if (response.success) {
        setLeads(response.data.leads || []);
        setStats(response.data.stats || {});
      }
    } catch (err) {
      setError(err.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingLead(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      queryPlace: lead.queryPlace || "",
      queryType: lead.queryType || "package",
      stage: lead.stage || "new",
      nextFollowUp: lead.nextFollowUp ? lead.nextFollowUp.slice(0, 10) : "",
      remarks: lead.remarks || "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingLead(null);
    setFormData(emptyForm);
    setSaving(false);
  };

  const saveLead = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      const payload = {
        ...formData,
        email: formData.email.trim() || undefined,
        nextFollowUp: formData.nextFollowUp || undefined,
      };
      const response = editingLead
        ? await apiService.updateLead(editingLead.id || editingLead._id, payload)
        : await apiService.createLead(payload);

      if (response.success) {
        resetForm();
        fetchLeads();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save lead");
    } finally {
      setSaving(false);
    }
  };

  const changeStage = async (lead, stage) => {
    try {
      const response = await apiService.updateLeadStage(lead.id || lead._id, stage);
      if (response.success) {
        setLeads((items) =>
          items.map((item) =>
            (item.id || item._id) === (lead.id || lead._id) ? response.data.lead : item,
          ),
        );
        fetchLeads();
      }
    } catch (err) {
      setError(err.message || "Failed to update lead stage");
    }
  };

  const deleteLead = async (lead) => {
    if (!window.confirm(`Delete lead for ${lead.name}?`)) return;
    try {
      const response = await apiService.deleteLead(lead.id || lead._id);
      if (response.success) fetchLeads();
    } catch (err) {
      setError(err.message || "Failed to delete lead");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-sm text-gray-500">Track enquiries, follow-ups, and conversion stages.</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-white transition-colors hover:bg-sky-700"
        >
          <Plus className="h-5 w-5" />
          Add New Lead
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Leads</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{totalLeads}</p>
        </div>
        {stageOptions.slice(0, 3).map((stage) => (
          <div key={stage.value} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{stage.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stats[stage.value] || 0}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && fetchLeads()}
            placeholder="Search by name, phone, email, place..."
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(event) => setStageFilter(event.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-3 focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
        >
          <option value="all">All Stages</option>
          {stageOptions.map((stage) => (
            <option key={stage.value} value={stage.value}>{stage.label}</option>
          ))}
        </select>
        <select
          value={queryTypeFilter}
          onChange={(event) => setQueryTypeFilter(event.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-3 focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
        >
          <option value="all">All Query Types</option>
          {queryTypeOptions.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="p-4">Lead</th>
                <th className="p-4">Query</th>
                <th className="p-4">Stage</th>
                <th className="p-4">Follow Up</th>
                <th className="p-4">Remarks</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading leads...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No leads found.</td></tr>
              ) : leads.map((lead) => (
                <tr key={lead.id || lead._id} className="align-top hover:bg-gray-50/70">
                  <td className="p-4">
                    <div className="font-semibold text-gray-900">{lead.name}</div>
                    <div className="text-sm text-gray-500">{lead.phone}</div>
                    <div className="text-sm text-gray-500">{lead.email || "No email"}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium capitalize text-gray-900">{lead.queryType}</div>
                    <div className="text-sm text-gray-500">{lead.queryPlace || "No place added"}</div>
                  </td>
                  <td className="p-4">
                    <select
                      value={lead.stage}
                      onChange={(event) => changeStage(lead, event.target.value)}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm capitalize focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
                    >
                      {stageOptions.map((stage) => (
                        <option key={stage.value} value={stage.value}>{stage.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString("en-IN") : "Not set"}
                  </td>
                  <td className="max-w-xs p-4 text-sm text-gray-600">
                    <p className="line-clamp-3">{lead.remarks || "No remarks"}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditForm(lead)} className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteLead(lead)} className="rounded-full bg-red-50 p-2 text-red-600 hover:bg-red-100">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.form
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={saveLead}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingLead ? "Edit Lead" : "Add New Lead"}</h2>
              <button type="button" onClick={resetForm} className="rounded-full p-2 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input required placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-3" />
              <input required placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-3" />
              <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-3" />
              <input placeholder="Place of query" value={formData.queryPlace} onChange={(e) => setFormData({ ...formData, queryPlace: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-3" />
              <select value={formData.queryType} onChange={(e) => setFormData({ ...formData, queryType: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-3">
                {queryTypeOptions.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
              <select value={formData.stage} onChange={(e) => setFormData({ ...formData, stage: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-3">
                {stageOptions.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}
              </select>
              <input type="date" value={formData.nextFollowUp} onChange={(e) => setFormData({ ...formData, nextFollowUp: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-3 md:col-span-2" />
              <textarea rows={4} placeholder="Remarks" value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-3 md:col-span-2" />
            </div>

            <div className="mt-6 flex gap-3">
              <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-sky-600 px-4 py-3 font-medium text-white hover:bg-sky-700 disabled:opacity-60">
                {saving ? "Saving..." : editingLead ? "Update Lead" : "Create Lead"}
              </button>
              <button type="button" onClick={resetForm} className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
}

export default LeadManagement;
