import React, { useState } from "react";
import { useHR } from "../context/HRContext";
import { DEPARTMENTS } from "../constants/mockData";
import { Search, UserPlus, Filter, X, Phone, Mail, Building, Briefcase, Calendar } from "lucide-react";

export const EmployeeList = () => {
  const { employees, addEmployee, loading } = useHR();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for adding employee
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("employee");
  const [status, setStatus] = useState("Active");
  const [formError, setFormError] = useState("");

  const handleOpenModal = () => {
    setName("");
    setEmail("");
    setDepartment("Engineering");
    setPosition("");
    setPhone("");
    setRole("employee");
    setStatus("Active");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!name || !email || !position) {
      return setFormError("Name, Email, and Position are required fields.");
    }

    setFormError("");
    try {
      await addEmployee({
        name,
        email,
        department,
        position,
        phone,
        role,
        status
      });
      setIsModalOpen(false);
    } catch (err) {
      setFormError("Failed to add employee: " + err.message);
    }
  };

  // Filters
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesDept = selectedDept === "All" || emp.department === selectedDept;
    
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Employee Directory</h1>
          <p className="text-slate-400 text-sm mt-1">Manage, search, and onboard employee profiles.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 transition-all text-sm active:scale-[0.98]"
        >
          <UserPlus className="h-4 w-4" />
          Add Employee
        </button>
      </div>

      {/* Filter and search bars */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/60">
        <div className="relative flex-1">
          <Search className="absolute top-3 left-3 h-5 w-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-violet-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2.5 text-sm text-slate-300 focus:border-violet-500 cursor-pointer"
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((emp) => (
          <div key={emp.id} className="glass-card rounded-2xl p-5 border border-slate-800/60 flex flex-col justify-between hover:border-slate-700/60 transition-all">
            <div className="space-y-4">
              {/* Profile Card Header */}
              <div className="flex items-center gap-3">
                <img
                  src={emp.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"}
                  alt={emp.name}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-violet-500/25"
                />
                <div className="truncate">
                  <h3 className="font-semibold text-white truncate text-base">{emp.name}</h3>
                  <p className="text-xs text-violet-400 truncate font-medium">{emp.position}</p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2">
                <span className="inline-flex rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-400 border border-violet-500/10">
                  {emp.department}
                </span>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                  emp.status === "Active" 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" 
                    : "bg-slate-500/10 text-slate-400 border-slate-800"
                }`}>
                  {emp.status}
                </span>
                <span className="inline-flex rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/10 capitalize">
                  {emp.role}
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-800/60 my-1" />

              {/* Card body detail metrics */}
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span>{emp.email}</span>
                </div>
                {emp.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    <span>{emp.phone}</span>
                  </div>
                )}
                {emp.joinDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>Joined: {emp.joinDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredEmployees.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <p className="text-slate-500 text-sm">No employees match your search constraints.</p>
          </div>
        )}
      </div>

      {/* Add Employee Modal Backdrop/Sheet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <h2 className="font-display text-lg font-bold text-white">Add New Employee Profile</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/20">{formError}</p>
            )}

            {/* Modal Form */}
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-sm text-white focus:border-violet-500"
                  />
                </div>
                
                <div className="space-y-1">
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

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3 text-sm text-slate-300 focus:border-violet-500 cursor-pointer"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Position / Job Title</label>
                  <input
                    type="text"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Senior Engineer"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-sm text-white focus:border-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 012-3456"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-sm text-white focus:border-violet-500"
                  />
                </div>

                <div className="space-y-1">
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

                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold text-slate-300">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3 text-sm text-slate-300 focus:border-violet-500 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-800/60 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-900 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 transition-all disabled:opacity-50"
                >
                  {loading ? "Onboarding..." : "Register Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default EmployeeList;
