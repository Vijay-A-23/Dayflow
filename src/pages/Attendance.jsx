import React, { useState } from "react";
import { useHR } from "../context/HRContext";
import { useAuth } from "../context/AuthContext";
import { Clock, CalendarCheck, AlertTriangle, ListFilter, ArrowUpDown, Calendar } from "lucide-react";

export const Attendance = () => {
  const { userRole, userProfile } = useAuth();
  const { attendance, employees } = useHR();

  const [dateFilter, setDateFilter] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("All");

  // Determine whose logs to show
  const isEmployee = userRole !== "admin";
  const myPunches = attendance.filter(p => isEmployee ? p.employeeId === userProfile?.id : true);

  // Stats calculation
  const totalDays = myPunches.length;
  const presentDays = myPunches.filter(p => p.status === "Present").length;
  const lateDays = myPunches.filter(p => p.status === "Late").length;
  const totalHours = myPunches.reduce((acc, curr) => acc + curr.totalHours, 0).toFixed(1);

  // Apply filters
  const filteredPunches = myPunches.filter((punch) => {
    const matchesDate = !dateFilter || punch.date.includes(dateFilter);
    const matchesEmployee = 
      isEmployee || 
      selectedEmployeeId === "All" || 
      punch.employeeId === selectedEmployeeId;
      
    return matchesDate && matchesEmployee;
  });

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">Attendance Registry</h1>
        <p className="text-slate-400 text-sm mt-1">Review clock logs, track worked hours, and analyze shift timings.</p>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Days Logged</p>
            <h3 className="text-3xl font-extrabold text-white">{totalDays}</h3>
            <p className="text-[10px] text-slate-400">Total punches recorded</p>
          </div>
          <div className="rounded-xl bg-violet-500/10 p-3.5 text-violet-500">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">On-Time Days</p>
            <h3 className="text-3xl font-extrabold text-white">{presentDays}</h3>
            <p className="text-[10px] text-emerald-400 font-medium">Punched before 9:00 AM</p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 p-3.5 text-emerald-500">
            <CalendarCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Late Arrivals</p>
            <h3 className="text-3xl font-extrabold text-white">{lateDays}</h3>
            <p className="text-[10px] text-amber-400 font-medium">Punched after 9:00 AM</p>
          </div>
          <div className="rounded-xl bg-amber-500/10 p-3.5 text-amber-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Accumulated Hours</p>
            <h3 className="text-3xl font-extrabold text-white">{totalHours} hrs</h3>
            <p className="text-[10px] text-slate-400">Total shift times summed</p>
          </div>
          <div className="rounded-xl bg-indigo-500/10 p-3.5 text-indigo-500">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/60 items-center">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <ListFilter className="h-4 w-4" />
          <span>Filters:</span>
        </div>
        
        {/* Date Filter */}
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-950/40 px-3.5 py-2 text-sm text-slate-300 focus:border-violet-500 cursor-pointer"
        />

        {/* Employee Dropdown filter (Admin only) */}
        {!isEmployee && (
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950/40 px-3.5 py-2 text-sm text-slate-300 focus:border-violet-500 cursor-pointer"
          >
            <option value="All">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        )}

        {(dateFilter || selectedEmployeeId !== "All") && (
          <button
            onClick={() => {
              setDateFilter("");
              setSelectedEmployeeId("All");
            }}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Log list grid/table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Date</th>
                {!isEmployee && <th className="px-6 py-4">Employee</th>}
                {!isEmployee && <th className="px-6 py-4">Department</th>}
                <th className="px-6 py-4">Punch In</th>
                <th className="px-6 py-4">Punch Out</th>
                <th className="px-6 py-4">Shift Hours</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPunches.map((punch) => {
                const emp = employees.find(e => e.id === punch.employeeId);
                return (
                  <tr key={punch.id} className="hover:bg-slate-800/20 transition-all">
                    <td className="px-6 py-4 font-semibold text-white">{punch.date}</td>
                    {!isEmployee && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={emp?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"}
                            alt=""
                            className="h-6 w-6 rounded-full object-cover"
                          />
                          <span className="font-medium text-slate-200">{emp?.name || punch.employeeId}</span>
                        </div>
                      </td>
                    )}
                    {!isEmployee && (
                      <td className="px-6 py-4 text-xs">
                        <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-violet-400 font-medium">
                          {emp?.department || "HR"}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{punch.punchIn}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{punch.punchOut || "--:--"}</td>
                    <td className="px-6 py-4 font-semibold text-white">{punch.totalHours ? `${punch.totalHours} hrs` : "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        punch.status === "Present" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" 
                          : punch.status === "Late" 
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/10"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/10"
                      }`}>
                        {punch.status}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredPunches.length === 0 && (
                <tr>
                  <td colSpan={isEmployee ? 5 : 7} className="text-center py-12 text-slate-500">
                    No matching attendance logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Attendance;
