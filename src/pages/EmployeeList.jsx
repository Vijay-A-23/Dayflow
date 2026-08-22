import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useHR } from "../context/HRContext";
import { generateCustomEmployeeId, getFormattedEmployeeId, formatLakhsToSalaryStr } from "../utils/employeeIdGenerator";
import { 
  Search, 
  Filter, 
  Plus, 
  Mail, 
  Phone, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  UserCheck, 
  Eye, 
  X, 
  Grid, 
  List, 
  Briefcase,
  DollarSign,
  Calendar,
  Building,
  AlertCircle
} from "lucide-react";

export const EmployeeList = () => {
  const { employees, addEmployee, deleteEmployee, loading } = useHR();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form states for slide-over drawer
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [salary, setSalary] = useState("");
  const [role, setRole] = useState("employee");
  const [status, setStatus] = useState("Active");

  // UX states
  const [formError, setFormError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const FILTER_DEPTS = ["All", "Engineering", "Design", "Human Resources", "Marketing", "Sales"];

  const handleOpenDrawer = () => {
    setName("");
    setEmail("");
    setDepartment("Engineering");
    setPosition("");
    setPhone("");
    setSalary("");
    setRole("employee");
    setStatus("Active");
    setFormError("");
    setIsDrawerOpen(true);
  };

  const handleOnboard = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !position.trim() || !salary.trim()) {
      return setFormError("Name, Email, Job Title, and Salary are required.");
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return setFormError("Please enter a valid work email address.");
    }

    setFormError("");
    try {
      const generatedId = generateCustomEmployeeId(name.trim(), new Date().getFullYear(), employees.length + 1);
      await addEmployee({
        name: name.trim(),
        email: email.trim(),
        employeeId: generatedId,
        department,
        position: position.trim(),
        phone: phone.trim(),
        salary: formatLakhsToSalaryStr(salary.trim()),
        role,
        status
      });
      setIsDrawerOpen(false);
      triggerToast("Employee onboarded successfully!");
    } catch (err) {
      setFormError("Onboarding failed: " + err.message);
    }
  };

  const handleDelete = async (id, empName) => {
    if (window.confirm(`Are you sure you want to remove ${empName} from the Dayflow database?`)) {
      try {
        await deleteEmployee(id);
        triggerToast(`${empName} has been removed successfully.`);
      } catch (err) {
        alert("Deletion failed: " + err.message);
      }
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  // Filter and search computation
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesDept = selectedDept === "All" || emp.department === selectedDept;
    
    return matchesSearch && matchesDept;
  });

  // Deduplicate by email
  const seenEmails = new Set();
  const uniqueEmployees = filteredEmployees.filter((emp) => {
    const emailLower = (emp.email || "").toLowerCase().trim();
    if (!emailLower) return true;
    if (seenEmails.has(emailLower)) return false;
    seenEmails.add(emailLower);
    return true;
  });

  // Total unique employees count
  const allUniqueEmails = new Set();
  employees.forEach(emp => {
    const emailLower = (emp.email || "").toLowerCase().trim();
    if (emailLower) allUniqueEmails.add(emailLower);
  });
  const totalUniqueCount = allUniqueEmails.size || employees.length;

  return (
    <div className="relative min-h-screen space-y-6 p-6 max-w-7xl mx-auto">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 border border-violet-500/35 px-4 py-3 text-sm text-violet-300 shadow-2xl animate-bounce">
          <UserCheck className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-white">Employee Directory</h1>
            <p className="text-slate-400 text-sm mt-1">Audit permissions, update active roster profiles, and onboard recruits.</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300 border border-slate-700/50">
            {totalUniqueCount} Total
          </span>
        </div>

        <button
          onClick={handleOpenDrawer}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 transition-all text-sm active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Employee
        </button>
      </div>

      {/* Filter and control bars */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute top-3 left-3 h-5 w-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search name, email, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:bg-slate-950"
          />
        </div>

        {/* Action controls (Filters & Mode switches) */}
        <div className="flex w-full md:w-auto flex-wrap items-center justify-between sm:justify-end gap-4">
          
          {/* View switches */}
          <div className="flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-lg p-1.5 transition-all ${
                viewMode === "grid" 
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/20" 
                  : "text-slate-400 hover:text-white"
              }`}
              title="Grid Card View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`rounded-lg p-1.5 transition-all ${
                viewMode === "table" 
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/20" 
                  : "text-slate-400 hover:text-white"
              }`}
              title="Table List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Department Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {FILTER_DEPTS.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-all shrink-0 active:scale-[0.97] cursor-pointer ${
              selectedDept === dept
                ? "bg-violet-500/15 text-violet-400 border-violet-500/30"
                : "bg-slate-900/40 text-slate-400 border-slate-800/60 hover:text-white hover:border-slate-700"
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Grid Card View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uniqueEmployees.map((emp, index) => (
            <div key={emp.id} className="glass-card rounded-2xl p-5 border border-slate-800/60 flex flex-col justify-between hover:border-slate-700/60 transition-all group">
              <div className="space-y-4">
                
                {/* Header card area */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar || emp.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"}
                      alt={emp.name}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-violet-500/25 transition-transform group-hover:scale-105"
                    />
                    <div className="truncate text-left">
                      <h3 className="font-semibold text-white truncate text-base">{emp.name}</h3>
                      <p className="text-xs text-violet-400 truncate font-semibold">{emp.position || emp.jobDetails?.position || "Staff Member"}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{emp.department || emp.jobDetails?.department || "Engineering"}</p>
                    </div>
                  </div>

                  {/* Delete button (Admin Action) */}
                  <button
                    onClick={() => handleDelete(emp.id, emp.name)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-all shrink-0"
                    title="Remove Employee"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Tags and badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex rounded-full bg-slate-950/65 px-2.5 py-0.5 text-xs font-mono font-bold text-violet-300 border border-violet-500/20">
                    {getFormattedEmployeeId(emp, index + 1)}
                  </span>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                    emp.status === "Active" 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" 
                      : "bg-amber-500/10 text-amber-400 border-amber-500/10"
                  }`}>
                    {emp.status}
                  </span>
                  <span className="inline-flex rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/10 capitalize">
                    {emp.role}
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-800/60 my-1" />

                {/* Contact data list */}
                <div className="space-y-2.5 text-xs text-slate-350">
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span>{emp.personalDetails?.phone || emp.phone || '+91 98401 23456'}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span>Joined: {(() => {
                      const rawDate = emp.joinDate || emp.joinedDate || emp.createdAt || '2024-01-15';
                      return rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
                    })()}</span>
                  </div>
                </div>
              </div>

              {/* View profile button */}
              <div className="mt-5 border-t border-slate-800/60 pt-4">
                <Link
                  to={`/profile?id=${emp.id}`}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-semibold text-white border border-slate-700/60 transition-all active:scale-[0.98]"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table List View */}
      {viewMode === "table" && (
        <div className="glass-panel rounded-2xl border border-slate-800/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-350">
              <thead className="bg-slate-950/50 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4 rounded-l-xl">Employee</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">System Role</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {uniqueEmployees.map((emp, index) => (
                  <tr key={emp.id} className="hover:bg-slate-800/20 transition-all group">
                    
                    {/* Identity cell */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar || emp.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <span className="font-semibold text-white block">{emp.name}</span>
                          <span className="text-xs text-slate-400 block">{emp.position || emp.jobDetails?.position || "Staff Member"}</span>
                          <span className="text-[10px] text-slate-505 block mt-0.5">{emp.department || emp.jobDetails?.department || "Engineering"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Department cell */}
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-semibold text-violet-400 border border-violet-500/10">
                        {emp.department || emp.jobDetails?.department || "Engineering"}
                      </span>
                    </td>

                    {/* Role cell */}
                    <td className="px-6 py-4 text-xs font-medium text-slate-400 capitalize">
                      <div className="space-y-1">
                        <span className="block">{emp.role}</span>
                        <span className="inline-block rounded-md bg-slate-950/65 px-1.5 py-0.5 font-mono text-[9px] font-bold text-violet-300 border border-violet-500/10">
                          {getFormattedEmployeeId(emp, index + 1)}
                        </span>
                      </div>
                    </td>

                    {/* Contact info cell */}
                    <td className="px-6 py-4 text-xs">
                      <div className="space-y-1.5 text-slate-400">
                        <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" /> {emp.email}</p>
                        <p className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" /> 
                          {emp.personalDetails?.phone || emp.phone || '+91 98401 23456'}
                        </p>
                      </div>
                    </td>

                    {/* Date cell */}
                    <td className="px-6 py-4 text-xs font-medium text-slate-400">
                      {(() => {
                        const rawDate = emp.joinDate || emp.joinedDate || emp.createdAt || '2024-01-15';
                        return rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
                      })()}
                    </td>

                    {/* Status cell */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold border ${
                        emp.status === "Active" 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" 
                          : "bg-amber-500/10 text-amber-400 border-amber-500/10"
                      }`}>
                        {emp.status}
                      </span>
                    </td>

                    {/* Action buttons cell */}
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <Link
                          to={`/profile?id=${emp.id}`}
                          className="rounded-lg p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all"
                          title="View Profile"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(emp.id, emp.name)}
                          className="rounded-lg p-2 bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/20 transition-all"
                          title="Delete Employee"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fallback empty view */}
      {uniqueEmployees.length === 0 && (
        <div className="py-20 text-center glass-panel rounded-2xl border border-slate-800">
          <p className="text-slate-500 text-sm">No employee matches your current search criteria.</p>
        </div>
      )}

      {/* Slide-over Onboarding Drawer Panel */}
      <div 
        className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop Overlay */}
        <div 
          onClick={() => setIsDrawerOpen(false)}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
        />

        <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
          <div 
            className={`w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out ${
              isDrawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Drawer Body container */}
            <div className="flex h-full flex-col overflow-y-scroll bg-slate-900 px-6 py-6 scrollbar-thin">
              
              {/* Header drawer */}
              <div className="flex items-center justify-between border-b border-slate-800/65 pb-4 mb-6">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">Onboard New Employee</h2>
                  <p className="text-slate-400 text-xs mt-1">Register a new profile in the HRMS directory.</p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form Content */}
              <form onSubmit={handleOnboard} className="space-y-4 flex-1">
                
                {/* Full name input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Alexander Pierce"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-sm text-white focus:border-violet-500"
                  />
                </div>

                {/* Email input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Work Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@dayflow.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-sm text-white focus:border-violet-500"
                  />
                </div>

                {/* Department drop dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3 text-sm text-slate-300 focus:border-violet-500 cursor-pointer"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                {/* Job Position */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Job Title</label>
                  <input
                    type="text"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="E.g. Senior Product Designer"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-sm text-white focus:border-violet-500"
                  />
                </div>

                {/* Contact phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 012-3456"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-sm text-white focus:border-violet-500"
                  />
                </div>

                {/* Salary input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Annual Salary (INR / LPA)</label>
                  <div className="relative">
                    <span className="absolute top-3 left-3 text-sm text-slate-500 font-semibold">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="e.g. 18.5"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-7 pr-3.5 text-sm text-white focus:border-violet-500"
                    />
                  </div>
                </div>

                {/* Role option */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3 text-sm text-slate-300 focus:border-violet-500 cursor-pointer"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Status select option */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Onboarding Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3 text-sm text-slate-300 focus:border-violet-500 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 justify-end border-t border-slate-800/60 pt-6 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="rounded-xl border border-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-950 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 transition-all disabled:opacity-50"
                  >
                    {loading ? "Onboarding..." : "Onboard Recruit"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default EmployeeList;
