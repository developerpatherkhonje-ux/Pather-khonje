import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Edit, Plus, Search, Trash2, X } from "lucide-react";
import apiService from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  designation: "",
  role: "user",
  branch: "",
  salary: { base: 0, incentivePercent: 0, target: 0 },
  targets: [{ periodType: "monthly", period: new Date().toISOString().slice(0, 7), revenueTarget: 0, bookingTarget: 0, leadTarget: 0, customerTarget: 0 }],
  isActive: true,
};

function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.getUsers(1, 100, searchTerm.trim(), branchFilter);
      if (response.success) setUsers(response.data.users || []);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [branchFilter, searchTerm]);

  useEffect(() => {
    fetchUsers();
    apiService.listBranches().then((res) => setBranches(res.data?.branches || [])).catch(() => {});
  }, [fetchUsers]);

  const openAddForm = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      phone: user.phone || "",
      designation: user.designation || "",
      role: user.role || "user",
      branch: user.branch?._id || user.branch || "",
      salary: {
        base: Number(user.salary?.base || 0),
        incentivePercent: Number(user.salary?.incentivePercent || 0),
        target: Number(user.salary?.target || 0),
      },
      targets: user.targets?.length ? user.targets : emptyForm.targets,
      isActive: user.isActive !== false,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData(emptyForm);
    setSaving(false);
  };

  const saveUser = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        designation: formData.designation || undefined,
        role: formData.role,
        branch: formData.branch || null,
        salary: formData.salary,
        targets: formData.targets,
        isActive: formData.isActive,
      };

      if (!editingUser) payload.password = formData.password;

      const response = editingUser
        ? await apiService.updateUser(editingUser._id || editingUser.id, payload)
        : await apiService.createUser(payload);

      if (response.success) {
        resetForm();
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (user) => {
    const userId = user._id || user.id;
    if (String(userId) === String(currentUser?._id || currentUser?.id)) {
      setError("You cannot delete your own account.");
      return;
    }
    if (!window.confirm(`Delete ${user.name}?`)) return;

    try {
      const response = await apiService.deleteUser(userId);
      if (response.success) fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500">Add staff, assign branch, set role access and targets.</p>
        </div>
        <button onClick={openAddForm} className="flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700">
          <Plus className="h-5 w-5" />
          Add User
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_240px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && fetchUsers()}
            placeholder="Search users by name, email, designation..."
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <select value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)} className="rounded-lg border border-gray-300 px-4 py-3" onBlur={fetchUsers}>
          <option value="">All branches</option>
          {branches.map((branch) => <option key={branch._id} value={branch._id}>{branch.name}</option>)}
        </select>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Designation</th>
                <th className="p-4">Branch</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No users found.</td></tr>
              ) : users.map((user) => (
                <tr key={user._id || user.id} className="hover:bg-gray-50/70">
                  <td className="p-4">
                    <div className="font-semibold text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone || "No phone"}</div>
                  </td>
                  <td className="p-4">
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase text-sky-700">{user.role}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{user.designation || "Not set"}</td>
                  <td className="p-4 text-sm text-gray-600">{user.branch?.name || "Head office / unassigned"}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("en-IN") : "Never"}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditForm(user)} className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteUser(user)} className="rounded-full bg-red-50 p-2 text-red-600 hover:bg-red-100">
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
            onSubmit={saveUser}
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingUser ? "Edit User" : "Add User"}</h2>
              <button type="button" onClick={resetForm} className="rounded-full p-2 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input required placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-3" />
              <input required type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-3" />
              {!editingUser && (
                <input required type="password" minLength={8} placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-3" />
              )}
              <input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-3" />
              <input placeholder="Designation" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-3" />
              <select value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-3">
                <option value="">Head office / no branch</option>
                {branches.map((branch) => <option key={branch._id} value={branch._id}>{branch.name}</option>)}
              </select>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-3">
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
                <option value="sales_manager">Sales Manager</option>
                <option value="branch_manager">Branch Manager</option>
                <option value="agent">Agent</option>
                <option value="hr">HR</option>
                <option value="accounts">Accounts</option>
              </select>
              <label className="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-3">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                <span className="text-sm font-medium text-gray-700">Active user</span>
              </label>
              <input type="number" placeholder="Base salary" value={formData.salary?.base || 0} onChange={(e) => setFormData({ ...formData, salary: { ...formData.salary, base: Number(e.target.value) } })} className="rounded-lg border border-gray-300 px-4 py-3" />
              <input type="number" placeholder="Incentive %" value={formData.salary?.incentivePercent || 0} onChange={(e) => setFormData({ ...formData, salary: { ...formData.salary, incentivePercent: Number(e.target.value) } })} className="rounded-lg border border-gray-300 px-4 py-3" />
              <input type="number" placeholder="Personal revenue target" value={formData.salary?.target || 0} onChange={(e) => setFormData({ ...formData, salary: { ...formData.salary, target: Number(e.target.value) } })} className="rounded-lg border border-gray-300 px-4 py-3" />
              <input placeholder="Target period e.g. 2026-10" value={formData.targets?.[0]?.period || ""} onChange={(e) => setFormData({ ...formData, targets: [{ ...(formData.targets?.[0] || {}), period: e.target.value }] })} className="rounded-lg border border-gray-300 px-4 py-3" />
              <input type="number" placeholder="Monthly booking target" value={formData.targets?.[0]?.bookingTarget || 0} onChange={(e) => setFormData({ ...formData, targets: [{ ...(formData.targets?.[0] || {}), bookingTarget: Number(e.target.value) }] })} className="rounded-lg border border-gray-300 px-4 py-3" />
              <input type="number" placeholder="Monthly lead target" value={formData.targets?.[0]?.leadTarget || 0} onChange={(e) => setFormData({ ...formData, targets: [{ ...(formData.targets?.[0] || {}), leadTarget: Number(e.target.value) }] })} className="rounded-lg border border-gray-300 px-4 py-3" />
            </div>

            <div className="mt-6 flex gap-3">
              <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-sky-600 px-4 py-3 font-medium text-white hover:bg-sky-700 disabled:opacity-60">
                {saving ? "Saving..." : editingUser ? "Update User" : "Create User"}
              </button>
              <button type="button" onClick={resetForm} className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
