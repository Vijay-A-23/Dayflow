import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useHR } from "../context/HRContext";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  UserCheck,
  Play,
  Square,
  Download,
  Search,
  X
} from "lucide-react";
import {
  parseTimeToToday,
  exportAttendanceToCSV
} from "../utils/attendanceHelpers";

export const Attendance = () => {
  const { userRole, userProfile } = useAuth();
  const { 
    attendance, 
    employees, 
    leaves, 
    punchIn, 
    punchOut, 
    loading 
  } = useHR();

  // 1. Digital Clock & Calendar Info
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  // 2. Active Punch & Timer Persistence (Employee)
  const [localActivePunch, setLocalActivePunch] = useState(() => {
    const saved = localStorage.getItem("df_active_punch_start");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date === new Date().toISOString().split("T")[0]) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved active punch", e);
      }
    }
    return null;
  });

  const [elapsedTime, setElapsedTime] = useState("00:00:00");

  // Sync local active punch state with actual context data
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const contextActive = attendance.find(
      p => p.employeeId === userProfile?.id && p.date === todayStr && p.punchOut === ""
    );

    if (contextActive) {
      const item = { punchIn: contextActive.punchIn, date: contextActive.date, id: contextActive.id };
      setLocalActivePunch(item);
      localStorage.setItem("df_active_punch_start", JSON.stringify(item));
    } else if (!loading) {
      // If loading is finished and there's no active punch, clear local timer
      setLocalActivePunch(null);
      localStorage.removeItem("df_active_punch_start");
    }
  }, [attendance, userProfile, loading]);

  // Live counter effect
  useEffect(() => {
    if (!localActivePunch) {
      setElapsedTime("00:00:00");
      return;
    }

    const updateTimer = () => {
      const inTime = parseTimeToToday(localActivePunch.punchIn, localActivePunch.date);
      if (!inTime) return;
      const diffMs = Math.max(0, new Date() - inTime);
      const secs = Math.floor(diffMs / 1000) % 60;
      const mins = Math.floor(diffMs / (1000 * 60)) % 60;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      setElapsedTime(
        [
          String(hours).padStart(2, "0"),
          String(mins).padStart(2, "0"),
          String(secs).padStart(2, "0")
        ].join(":")
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [localActivePunch]);

  // 3. Feedback Toasts
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handlePunchAction = async () => {
    try {
      if (localActivePunch) {
        // Clocking out
        const record = await punchOut(localActivePunch.id);
        showToast(`Clocked out! Total shift: ${record.totalHours} hrs`, "success");
        setLocalActivePunch(null);
        localStorage.removeItem("df_active_punch_start");
      } else {
        // Check if employee already clocked out today
        const todayStr = new Date().toISOString().split("T")[0];
        const hasCompletedToday = attendance.some(
          p => p.employeeId === userProfile?.id && p.date === todayStr && p.punchOut !== ""
        );
        if (hasCompletedToday) {
          showToast("You have already logged attendance for today.", "warning");
          return;
        }

        // Clocking in
        const record = await punchIn();
        const item = { punchIn: record.punchIn, date: record.date, id: record.id };
        setLocalActivePunch(item);
        localStorage.setItem("df_active_punch_start", JSON.stringify(item));
        showToast(`Clocked in successfully at ${record.punchIn}`, "success");
      }
    } catch (err) {
      showToast(err.message || "Clock action failed", "warning");
    }
  };

  // 4. Employee View States & Calculations
  const isEmployee = userRole !== "admin";
  const myPunches = attendance.filter(p => p.employeeId === userProfile?.id);

  // Month & Year Filter for Employee History
  const [empMonthFilter, setEmpMonthFilter] = useState(() => String(new Date().getMonth() + 1).padStart(2, "0"));
  const [empYearFilter, setEmpYearFilter] = useState(() => String(new Date().getFullYear()));

  // Employee Filtered History
  const filteredEmployeePunches = myPunches.filter(punch => {
    const [year, month] = punch.date.split("-");
    return year === empYearFilter && month === empMonthFilter;
  });

  // Stats for Employee History banner (over the selected month/year filter)
  const statsPunches = myPunches.filter(p => {
    const [year, month] = p.date.split("-");
    return year === empYearFilter && month === empMonthFilter;
  });
  const empPresentCount = statsPunches.filter(p => p.status === "Present").length;
  const empLateCount = statsPunches.filter(p => p.status === "Late").length;

  const empCompletedPunches = statsPunches.filter(p => p.punchOut !== "");
  const empAvgHours = empCompletedPunches.length > 0
    ? (empCompletedPunches.reduce((acc, curr) => acc + curr.totalHours, 0) / empCompletedPunches.length).toFixed(1)
    : "0.0";

  // 5. Admin View States & Calculations
  // Tabs for Admin view: "live" | "audit"
  const [adminTab, setAdminTab] = useState("live");

  // Admin Live status cards calculations
  const todayStr = new Date().toISOString().split("T")[0];
  const activeTodayRecords = attendance.filter(p => p.date === todayStr);
  const checkedInToday = activeTodayRecords.filter(p => p.punchOut === "");

  // Absent & On Leave counts
  const activeEmployeesList = employees.filter(e => e.status === "Active");
  const leavesList = leaves || [];
  const employeesOnLeaveToday = new Set(
    leavesList
      .filter(l => l.status === "Approved" && todayStr >= l.startDate && todayStr <= l.endDate)
      .map(l => l.employeeId)
  );

  const loggedTodayEmpIds = new Set(activeTodayRecords.map(r => r.employeeId));
  const checkedInTodayEmpIds = new Set(checkedInToday.map(r => r.employeeId));

  const totalCheckedIn = checkedInToday.length;
  const totalLateToday = activeTodayRecords.filter(p => p.status === "Late").length;
  
  // Total On Break/Out (Active employees who completed shift today, or haven't punched in and aren't on leave)
  const totalOutOrBreak = activeEmployeesList.filter(
    e => !checkedInTodayEmpIds.has(e.id)
  ).length;

  const totalAbsentToday = activeEmployeesList.filter(
    e => !loggedTodayEmpIds.has(e.id) && !employeesOnLeaveToday.has(e.id)
  ).length;

  // Admin Live Board Roster search & filter
  const [liveSearch, setLiveSearch] = useState("");
  const [liveDeptFilter, setLiveDeptFilter] = useState("All");

  // Admin Audit Log Filters
  const [auditSearch, setAuditSearch] = useState("");
  const [auditDeptFilter, setAuditDeptFilter] = useState("All");
  const [auditStatusFilter, setAuditStatusFilter] = useState("All");
  const [auditStartDate, setAuditStartDate] = useState("");
  const [auditEndDate, setAuditEndDate] = useState("");

  // Process Admin Audit Log list
  const filteredAuditPunches = attendance.filter(punch => {
    const emp = employees.find(e => e.id === punch.employeeId);
    const matchesSearch = !auditSearch || 
      (emp?.name || "").toLowerCase().includes(auditSearch.toLowerCase()) || 
      punch.employeeId.toLowerCase().includes(auditSearch.toLowerCase());
    const matchesDept = auditDeptFilter === "All" || emp?.department === auditDeptFilter;
    const matchesStatus = auditStatusFilter === "All" || punch.status === auditStatusFilter;
    
    const matchesStartDate = !auditStartDate || punch.date >= auditStartDate;
    const matchesEndDate = !auditEndDate || punch.date <= auditEndDate;

    return matchesSearch && matchesDept && matchesStatus && matchesStartDate && matchesEndDate;
  });

  const handleExport = () => {
    exportAttendanceToCSV(filteredAuditPunches, employees);
    showToast("CSV report generated and downloaded successfully!", "success");
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto min-h-screen relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl glass-panel border border-slate-700/80 px-5 py-4 text-sm shadow-2xl animate-float transition-all max-w-md">
          {toast.type === "success" ? (
            <div className="rounded-full bg-emerald-500/10 p-1.5 text-emerald-400">
              <CheckCircle className="h-5 w-5" />
            </div>
          ) : (
            <div className="rounded-full bg-amber-500/10 p-1.5 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          )}
          <span className="font-semibold text-slate-100">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-auto text-slate-400 hover:text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Attendance Control</h1>
          <p className="text-slate-400 text-sm mt-1">
            {isEmployee 
              ? "Punch in, track working hours, and review shift logs." 
              : "Monitor real-time employee attendance status and inspect timesheet registry."
            }
          </p>
        </div>

        {/* Global Clock display */}
        <div className="glass-card rounded-2xl px-5 py-3.5 border border-slate-800/80 flex items-center gap-4">
          <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-mono">{formattedTime}</h2>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">{formattedDate}</p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* EMPLOYEE VIEW                                            */}
      {/* ======================================================== */}
      {isEmployee ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Punch Card Widget */}
          <div className="glass-panel rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-6 lg:col-span-1">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clock Status</span>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  localActivePunch 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" 
                    : "bg-slate-500/10 text-slate-400 border border-slate-500/10"
                }`}>
                  {localActivePunch ? "Punched In" : "Punched Out"}
                </span>
              </div>
              
              <h3 className="text-slate-200 font-display text-lg font-bold">Shift Controller</h3>
              <p className="text-xs text-slate-400 mt-1">Log your working hours. Ensure accurate timings for status marks.</p>
            </div>

            {/* Live Clock / elapsed display */}
            <div className="bg-slate-950/40 rounded-2xl border border-slate-800/60 p-6 flex flex-col items-center justify-center text-center py-8">
              {localActivePunch ? (
                <div className="space-y-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping mx-auto" />
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shift Duration</p>
                  <h4 className="text-4xl font-extrabold text-white font-mono tracking-tight">{elapsedTime}</h4>
                  <p className="text-[10px] text-emerald-400 mt-1 font-mono">Started at {localActivePunch.punchIn}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <Clock className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shift Closed</p>
                  <h4 className="text-2xl font-extrabold text-slate-500 font-mono">00:00:00</h4>
                  <p className="text-[10px] text-slate-400">Punches logged for today will show in history below</p>
                </div>
              )}
            </div>

            {/* Toggle Button */}
            <button
              onClick={handlePunchAction}
              disabled={loading}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-semibold text-sm transition-all active:scale-[0.98] ${
                localActivePunch 
                  ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/40 cursor-pointer" 
                  : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-950/40 cursor-pointer"
              }`}
            >
              {localActivePunch ? (
                <>
                  <Square className="h-4 w-4 fill-white" />
                  <span>Punch Out (Clock Close)</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>Punch In (Clock Open)</span>
                </>
              )}
            </button>
          </div>

          {/* Personal History & Month Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Metrics Banner */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card rounded-2xl p-4 border border-slate-800/80">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Present Days</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">{empPresentCount}</h3>
                <span className="text-[9px] text-slate-400">This month (On Time)</span>
              </div>
              <div className="glass-card rounded-2xl p-4 border border-slate-800/80">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Late Marks</p>
                <h3 className="text-2xl font-extrabold text-amber-400 mt-1">{empLateCount}</h3>
                <span className="text-[9px] text-slate-400">Checked in after 09:30 AM</span>
              </div>
              <div className="glass-card rounded-2xl p-4 border border-slate-800/80">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Avg Shift Hours</p>
                <h3 className="text-2xl font-extrabold text-indigo-400 mt-1">{empAvgHours} hrs</h3>
                <span className="text-[9px] text-slate-400">Total shift averages</span>
              </div>
            </div>

            {/* Calendar History Logs */}
            <div className="glass-panel rounded-3xl border border-slate-800 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-violet-400" />
                  Attendance Sheet
                </h3>

                {/* Filters */}
                <div className="flex items-center gap-2.5">
                  <select
                    value={empMonthFilter}
                    onChange={(e) => setEmpMonthFilter(e.target.value)}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 focus:border-violet-500 cursor-pointer"
                  >
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                  
                  <select
                    value={empYearFilter}
                    onChange={(e) => setEmpYearFilter(e.target.value)}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 focus:border-violet-500 cursor-pointer"
                  >
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950/20">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Punch In</th>
                      <th className="px-5 py-3">Punch Out</th>
                      <th className="px-5 py-3">Work Hours</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredEmployeePunches.map((punch) => (
                      <tr key={punch.id} className="hover:bg-slate-800/10 transition-colors">
                        <td className="px-5 py-3 font-semibold text-white">{punch.date}</td>
                        <td className="px-5 py-3 font-mono text-slate-400">{punch.punchIn}</td>
                        <td className="px-5 py-3 font-mono text-slate-400">{punch.punchOut || "--:--"}</td>
                        <td className="px-5 py-3 font-semibold text-slate-300">
                          {punch.totalHours ? `${punch.totalHours} hrs` : "-"}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            punch.status === "Present" 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" 
                              : punch.status === "Late" 
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/10"
                                : punch.status === "Half Day" 
                                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/10"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/10"
                          }`}>
                            {punch.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredEmployeePunches.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-slate-500 font-medium">
                          No logs found for the selected month and year.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // ========================================================
        // ADMIN VIEW                                              
        // ========================================================
        <div className="space-y-6">
          {/* Admin Stats Board */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-card rounded-2xl p-5 flex items-center justify-between border border-slate-800/80">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Checked-In Today</p>
                <h3 className="text-3xl font-extrabold text-white">{totalCheckedIn}</h3>
                <p className="text-[9px] text-emerald-400 font-medium">Active sessions right now</p>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
                <UserCheck className="h-6 w-6" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 flex items-center justify-between border border-slate-800/80">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Late Arrivals</p>
                <h3 className="text-3xl font-extrabold text-amber-400">{totalLateToday}</h3>
                <p className="text-[9px] text-amber-500 font-medium">Checked in after 09:30 AM</p>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-3 text-amber-500">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 flex items-center justify-between border border-slate-800/80">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total On Break/Out</p>
                <h3 className="text-3xl font-extrabold text-indigo-400">{totalOutOrBreak}</h3>
                <p className="text-[9px] text-indigo-400 font-medium">Out of office or completed</p>
              </div>
              <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
                <Calendar className="h-6 w-6" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 flex items-center justify-between border border-slate-800/80">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Absent Today</p>
                <h3 className="text-3xl font-extrabold text-rose-400">{totalAbsentToday}</h3>
                <p className="text-[9px] text-rose-500/80 font-medium">Unaccounted active staff</p>
              </div>
              <div className="rounded-xl bg-rose-500/10 p-3 text-rose-400">
                <X className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Admin Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setAdminTab("live")}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                adminTab === "live" 
                  ? "border-violet-500 text-white bg-violet-500/5" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Company Live Status Board
            </button>
            <button
              onClick={() => setAdminTab("audit")}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                adminTab === "audit" 
                  ? "border-violet-500 text-white bg-violet-500/5" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Attendance Audit Log
            </button>
          </div>

          {/* TAB CONTENT: LIVE STATUS BOARD */}
          {adminTab === "live" && (
            <div className="glass-panel rounded-3xl border border-slate-800 p-6 space-y-6">
              {/* Header & Filters */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-base font-bold text-white">Live Operations Roster</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time status board of employees today.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search employee..."
                      value={liveSearch}
                      onChange={(e) => setLiveSearch(e.target.value)}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 pl-10 pr-4 py-2 text-xs text-slate-300 placeholder:text-slate-600 focus:border-violet-500 w-full sm:w-56"
                    />
                  </div>

                  {/* Department Filter */}
                  <select
                    value={liveDeptFilter}
                    onChange={(e) => setLiveDeptFilter(e.target.value)}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs text-slate-300 focus:border-violet-500 cursor-pointer"
                  >
                    <option value="All">All Departments</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              {/* Status Board Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeEmployeesList
                  .filter(emp => {
                    const matchesSearch = emp.name.toLowerCase().includes(liveSearch.toLowerCase()) || emp.id.toLowerCase().includes(liveSearch.toLowerCase());
                    const matchesDept = liveDeptFilter === "All" || emp.department === liveDeptFilter;
                    return matchesSearch && matchesDept;
                  })
                  .map(emp => {
                    const todayPunch = activeTodayRecords.find(p => p.employeeId === emp.id);
                    const isPunchedIn = todayPunch && todayPunch.punchOut === "";
                    const isPunchedOut = todayPunch && todayPunch.punchOut !== "";
                    const isOnLeave = employeesOnLeaveToday.has(emp.id);

                    // Compute Status Label and Styling
                    let statusLabel = "Offline";
                    let statusColor = "bg-slate-500/10 text-slate-400 border border-slate-500/20";
                    let dotColor = "bg-slate-500";
                    let subText = "Not Clocked In";

                    if (isPunchedIn) {
                      statusLabel = "Punched In";
                      statusColor = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                      dotColor = "bg-emerald-400 animate-pulse";
                      subText = `Shift started at ${todayPunch.punchIn}`;
                    } else if (isPunchedOut) {
                      statusLabel = "Completed";
                      statusColor = "bg-sky-500/10 text-sky-400 border border-sky-500/20";
                      dotColor = "bg-sky-400";
                      subText = `Shift: ${todayPunch.punchIn} - ${todayPunch.punchOut} (${todayPunch.totalHours} hrs)`;
                    } else if (isOnLeave) {
                      statusLabel = "On Leave";
                      statusColor = "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
                      dotColor = "bg-indigo-400";
                      subText = "Approved Absence";
                    }

                    return (
                      <div key={emp.id} className="glass-card rounded-2xl p-4 border border-slate-800/80 flex items-center justify-between hover:border-slate-700/60 transition-all">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"}
                            alt={(emp.name && emp.name.toLowerCase() !== "employee" ? emp.name : "Karthik Subramanian")}
                            className="h-10 w-10 rounded-xl object-cover border border-slate-800"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-white">
                              {emp.name && emp.name.toLowerCase() !== "employee" ? emp.name : "Karthik Subramanian"}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-semibold">{emp.department}</p>
                            <p className="text-[9px] text-slate-500 mt-1 font-mono">{subText}</p>
                          </div>
                        </div>

                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-bold ${statusColor}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                          {statusLabel}
                        </span>
                      </div>
                    );
                  })}

                {activeEmployeesList.filter(emp => {
                  const matchesSearch = emp.name.toLowerCase().includes(liveSearch.toLowerCase()) || emp.id.toLowerCase().includes(liveSearch.toLowerCase());
                  const matchesDept = liveDeptFilter === "All" || emp.department === liveDeptFilter;
                  return matchesSearch && matchesDept;
                }).length === 0 && (
                  <div className="col-span-full text-center py-12 text-slate-500 font-medium">
                    No employees matching the active search or filters.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: AUDIT LOGS */}
          {adminTab === "audit" && (
            <div className="glass-panel rounded-3xl border border-slate-800 p-6 space-y-6">
              {/* Header & Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-base font-bold text-white">Timesheet Audit Trail</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Filter, inspect, and export all historical attendance logs.</p>
                </div>
                <button
                  onClick={handleExport}
                  className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 text-xs font-bold flex items-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-violet-950/20 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Export to CSV
                </button>
              </div>

              {/* Advanced Filter Panel */}
              <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                    <input
                      type="text"
                      placeholder="Name or ID..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      className="rounded-xl border border-slate-800 bg-slate-950 w-full pl-9 pr-3 py-2 text-xs text-slate-300 placeholder:text-slate-600 focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Department</label>
                  <select
                    value={auditDeptFilter}
                    onChange={(e) => setAuditDeptFilter(e.target.value)}
                    className="rounded-xl border border-slate-800 bg-slate-950 w-full px-3 py-2 text-xs text-slate-300 focus:border-violet-500 cursor-pointer"
                  >
                    <option value="All">All Departments</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Status</label>
                  <select
                    value={auditStatusFilter}
                    onChange={(e) => setAuditStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-800 bg-slate-950 w-full px-3 py-2 text-xs text-slate-300 focus:border-violet-500 cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Start Date</label>
                  <input
                    type="date"
                    value={auditStartDate}
                    onChange={(e) => setAuditStartDate(e.target.value)}
                    className="rounded-xl border border-slate-800 bg-slate-950 w-full px-3 py-2 text-xs text-slate-300 focus:border-violet-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">End Date</label>
                  <input
                    type="date"
                    value={auditEndDate}
                    onChange={(e) => setAuditEndDate(e.target.value)}
                    className="rounded-xl border border-slate-800 bg-slate-950 w-full px-3 py-2 text-xs text-slate-300 focus:border-violet-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950/20">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4">Employee</th>
                      <th className="px-5 py-4">Department</th>
                      <th className="px-5 py-4">Punch In</th>
                      <th className="px-5 py-4">Punch Out</th>
                      <th className="px-5 py-4">Work Hours</th>
                      <th className="px-5 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredAuditPunches.map((punch) => {
                      const emp = employees.find(e => e.id === punch.employeeId);
                      return (
                        <tr key={punch.id} className="hover:bg-slate-800/10 transition-colors">
                          <td className="px-5 py-3 font-semibold text-white">{punch.date}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={emp?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"}
                                alt=""
                                className="h-6.5 w-6.5 rounded-lg object-cover border border-slate-800"
                              />
                              <span className="font-semibold text-slate-200">
                                {(() => {
                                  const nameVal = emp?.name || punch.employeeName;
                                  return (nameVal && nameVal.toLowerCase() !== "employee") ? nameVal : "Karthik Subramanian";
                                })()}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-slate-400 font-medium">{emp?.department || "N/A"}</td>
                          <td className="px-5 py-3 font-mono text-slate-400">{punch.punchIn}</td>
                          <td className="px-5 py-3 font-mono text-slate-400">{punch.punchOut || "--:--"}</td>
                          <td className="px-5 py-3 font-semibold text-slate-200">
                            {punch.totalHours ? `${punch.totalHours} hrs` : "-"}
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                              punch.status === "Present" 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" 
                                : punch.status === "Late" 
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/10"
                                  : punch.status === "Half Day" 
                                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/10"
                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/10"
                            }`}>
                              {punch.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredAuditPunches.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-500 font-medium">
                          No audit log records found matching the criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Attendance;
