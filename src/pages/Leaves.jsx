import React, { useState, useContext } from "react";
// Import AuthContext to read currentUser and userRole
import { useAuth } from "../context/AuthContext";
// Import HRContext directly and via useHR hook
import HRContext, { useHR } from "../context/HRContext";
import { LeaveApplicationModal } from "../components/LeaveApplicationModal";
import {
  Thermometer,
  Coffee,
  Sun,
  Check,
  X,
  Plus,
  Calendar,
  Clock,
  Search,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Loader2
} from "lucide-react";

export const Leaves = () => {
  // Read currentUser and userRole from AuthContext
  const { currentUser, userRole } = useAuth();

  // Access HRContext directly or via hook
  const hrCtx = useContext(HRContext) || {};
  let useHRCtx = {};
  try {
    useHRCtx = useHR() || {};
  } catch (e) {
    // Fallback if not inside HRProvider
  }

  // Resolve values from HRContext with graceful fallbacks
  const loading = hrCtx.loading || useHRCtx.loading || false;
  const rawLeaves = hrCtx.leaves || useHRCtx.leaves || [];

  // Context properties specified in requirement: leaveBalances, myLeaveHistory, pendingLeaves, updateLeaveStatus
  const contextLeaveBalances = hrCtx.leaveBalances || useHRCtx.leaveBalances;
  const contextMyLeaveHistory = hrCtx.myLeaveHistory || useHRCtx.myLeaveHistory;
  const contextPendingLeaves = hrCtx.pendingLeaves || useHRCtx.pendingLeaves;
  const updateLeaveStatus = hrCtx.updateLeaveStatus || useHRCtx.updateLeaveStatus;
  const approveLeave = hrCtx.approveLeave || useHRCtx.approveLeave;
  const rejectLeave = hrCtx.rejectLeave || useHRCtx.rejectLeave;

  // Resolve myLeaveHistory with fallback (filtered for logged-in employee)
  const myLeaveHistory = Array.isArray(contextMyLeaveHistory)
    ? contextMyLeaveHistory
    : Array.isArray(rawLeaves)
      ? rawLeaves.filter((l) => l.userId === currentUser?.uid || l.employeeId === currentUser?.uid || l.userEmail?.toLowerCase() === currentUser?.email?.toLowerCase())
      : [];

  // Resolve pendingLeaves for Admin view counters
  const pendingLeaves = Array.isArray(rawLeaves)
    ? rawLeaves.filter((l) => (l.status || "").toLowerCase() === "pending")
    : [];

  const adminAllLeaves = Array.isArray(rawLeaves) ? rawLeaves : [];

  // Compute balances dynamically from live leaves collection
  const myApprovedLeaves = rawLeaves.filter(
    (l) => (l.userId === currentUser?.uid || l.employeeId === currentUser?.uid || l.userEmail?.toLowerCase() === currentUser?.email?.toLowerCase()) && l.status === "Approved"
  );
  
  const sickUsed = myApprovedLeaves
    .filter((l) => (l.type || l.leaveType || "").toLowerCase().includes("sick"))
    .reduce((sum, l) => sum + (l.days || 0), 0);
  const annualUsed = myApprovedLeaves
    .filter((l) => (l.type || l.leaveType || "").toLowerCase().includes("annual") || (l.type || l.leaveType || "").toLowerCase().includes("earned"))
    .reduce((sum, l) => sum + (l.days || 0), 0);
  const casualUsed = myApprovedLeaves
    .filter((l) => (l.type || l.leaveType || "").toLowerCase().includes("casual"))
    .reduce((sum, l) => sum + (l.days || 0), 0);

  const leaveBalances = contextLeaveBalances || {
    sick: {
      type: "Sick Leave",
      available: Math.max(8 - sickUsed, 0),
      used: sickUsed,
      total: 8,
      percent: Math.round((Math.max(8 - sickUsed, 0) / 8) * 100)
    },
    casual: {
      type: "Casual Leave",
      available: Math.max(5 - casualUsed, 0),
      used: casualUsed,
      total: 5,
      percent: Math.round((Math.max(5 - casualUsed, 0) / 5) * 100)
    },
    earned: {
      type: "Annual Leave",
      available: Math.max(12 - annualUsed, 0),
      used: annualUsed,
      total: 12,
      percent: Math.round((Math.max(12 - annualUsed, 0) / 12) * 100)
    }
  };

  // UI state for search, status filter, modal
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Admin Approve Handler using updateLeaveStatus
  const handleApprove = async (leaveId) => {
    try {
      setActionLoadingId(leaveId);
      if (typeof updateLeaveStatus === "function") {
        await updateLeaveStatus(leaveId, "Approved");
      } else if (typeof approveLeave === "function") {
        await approveLeave(leaveId);
      }
    } catch (error) {
      console.error("Error approving leave request:", error);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Admin Reject Handler using updateLeaveStatus
  const handleReject = async (leaveId) => {
    try {
      setActionLoadingId(leaveId);
      if (typeof updateLeaveStatus === "function") {
        await updateLeaveStatus(leaveId, "Rejected");
      } else if (typeof rejectLeave === "function") {
        await rejectLeave(leaveId);
      }
    } catch (error) {
      console.error("Error rejecting leave request:", error);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered Applications for Employee
  const filteredMyHistory = myLeaveHistory.filter((app) => {
    const status = app.status || "Pending";
    const matchesStatus = filterStatus === "All" || status === filterStatus;
    const matchesQuery =
      (app.type || app.leaveType || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.reason || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  // Filtered Pending Requests for Admin
  const filteredPending = adminAllLeaves.filter((req) => {
    const status = (req.status || "Pending").trim();
    let matchesStatus = false;
    if (filterStatus === "All") {
      matchesStatus = ["pending", "approved", "rejected"].includes(status.toLowerCase());
    } else {
      matchesStatus = status.toLowerCase() === filterStatus.toLowerCase();
    }
    const matchesQuery =
      (req.employeeName || req.applicantName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.type || req.leaveType || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.reason || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  // Helper function for status badge rendering
  const renderStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5" /> Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400 border border-rose-500/20 shadow-sm">
            <XCircle className="h-3.5 w-3.5" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20 shadow-sm">
            <Clock className="h-3.5 w-3.5 animate-pulse" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-violet-950/40 to-slate-900 p-6 border border-slate-800/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-400 border border-violet-500/20">
              {userRole === "admin" ? "Management Dashboard" : "Employee Portal"}
            </span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {userRole === "admin" ? "Leave Approvals & Overview" : "Leave Management"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {userRole === "admin"
              ? "Review, approve, or reject employee leave applications connected to central HR context."
              : "Track your leave balances, submit leave requests, and view your application history."}
          </p>
        </div>

        {/* Employee View CTA: Request Leave Button */}
        {userRole === "employee" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 active:scale-[0.98] shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Request Leave</span>
          </button>
        )}
      </div>

      {/* Loading State Banner */}
      {loading && (
        <div className="flex items-center justify-center gap-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 p-4 text-violet-300 text-sm animate-pulse">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Synchronizing leave records with HR Context...</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EMPLOYEE ROLE VIEW                                                        */}
      {/* ========================================================================= */}
      {userRole === "employee" && (
        <div className="space-y-8">
          {/* Leave Balances Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-400" />
                Leave Balances
              </h2>
              <span className="text-xs text-slate-400">Synced Allocation</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sick Leave Card */}
              <div className="glass-panel relative overflow-hidden rounded-2xl p-6 border border-slate-800 hover:border-violet-500/30 transition-all group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Thermometer className="h-24 w-24 text-rose-400" />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="rounded-xl bg-rose-500/10 p-3 text-rose-400 border border-rose-500/20">
                    <Thermometer className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {leaveBalances.sick?.available ?? 3} Days Available
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-white">Sick Leave</h3>
                <p className="text-xs text-slate-400 mt-1">Medical leave & health care</p>
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">
                      Used: {leaveBalances.sick?.used ?? 0} / {leaveBalances.sick?.total ?? 3} Days
                    </span>
                    <span className="text-rose-400 font-semibold">
                      {leaveBalances.sick?.percent ?? 100}% Remaining
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${leaveBalances.sick?.percent ?? 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Casual Leave Card */}
              <div className="glass-panel relative overflow-hidden rounded-2xl p-6 border border-slate-800 hover:border-violet-500/30 transition-all group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Coffee className="h-24 w-24 text-amber-400" />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400 border border-amber-500/20">
                    <Coffee className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {leaveBalances.casual?.available ?? 1} Days Available
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-white">Casual Leave</h3>
                <p className="text-xs text-slate-400 mt-1">Urgent personal matters & affairs</p>
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">
                      Used: {leaveBalances.casual?.used ?? 0} / {leaveBalances.casual?.total ?? 1} Days
                    </span>
                    <span className="text-amber-400 font-semibold">
                      {leaveBalances.casual?.percent ?? 100}% Remaining
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${leaveBalances.casual?.percent ?? 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Earned Leave Card */}
              <div className="glass-panel relative overflow-hidden rounded-2xl p-6 border border-slate-800 hover:border-violet-500/30 transition-all group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sun className="h-24 w-24 text-emerald-400" />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400 border border-emerald-500/20">
                    <Sun className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {leaveBalances.earned?.available ?? 2} Days Available
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-white">Earned Leave</h3>
                <p className="text-xs text-slate-400 mt-1">Privilege leave for vacations</p>
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">
                      Used: {leaveBalances.earned?.used ?? 0} / {leaveBalances.earned?.total ?? 2} Days
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      {leaveBalances.earned?.percent ?? 100}% Remaining
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${leaveBalances.earned?.percent ?? 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* My Recent Applications Table / List */}
          <section className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-bold text-white">My Recent Applications</h2>
                <p className="text-xs text-slate-400 mt-0.5">Overview of applications from HRContext</p>
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-48 pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:border-violet-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 p-1 rounded-xl">
                  {["All", "Pending", "Approved", "Rejected"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        filterStatus === status
                          ? "bg-violet-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/50 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3.5 rounded-l-xl">Leave Type</th>
                    <th className="px-4 py-3.5">Duration</th>
                    <th className="px-4 py-3.5">Days</th>
                    <th className="px-4 py-3.5">Reason</th>
                    <th className="px-4 py-3.5">Applied On</th>
                    <th className="px-4 py-3.5 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredMyHistory.map((app) => (
                    <tr key={app.id || app.appliedDate} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-violet-400" />
                          <span>{app.type || app.leaveType || "Leave Request"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-mono text-slate-300">
                        {app.startDate} <span className="text-slate-500">to</span> {app.endDate}
                      </td>
                      <td className="px-4 py-4 text-xs font-semibold text-slate-200">
                        {app.days || 1} {app.days > 1 ? "days" : "day"}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-400 max-w-xs truncate" title={app.reason}>
                        {app.reason || "N/A"}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-400 font-mono">
                        {app.appliedDate || app.appliedOn || "Recent"}
                      </td>
                      <td className="px-4 py-4">
                        {renderStatusBadge(app.status || "Pending")}
                      </td>
                    </tr>
                  ))}

                  {filteredMyHistory.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-500 text-sm">
                        No leave applications found in history.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN ROLE VIEW: PENDING APPROVALS DASHBOARD                              */}
      {/* ========================================================================= */}
      {userRole === "admin" && (
        <div className="space-y-8">
          {/* Admin Summary Counters */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
                <h3 className="text-3xl font-extrabold text-amber-400">
                  {pendingLeaves.length}
                </h3>
                <p className="text-[10px] text-slate-400">Requires review</p>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-3.5 text-amber-400 border border-amber-500/20">
                <Clock className="h-6 w-6" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Evaluated</p>
                <h3 className="text-3xl font-extrabold text-emerald-400">
                  {rawLeaves.filter((r) => r.status === "Approved").length}
                </h3>
                <p className="text-[10px] text-slate-400">Approved applications</p>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-3.5 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Declined Leaves</p>
                <h3 className="text-3xl font-extrabold text-rose-400">
                  {rawLeaves.filter((r) => r.status === "Rejected").length}
                </h3>
                <p className="text-[10px] text-slate-400">Rejected applications</p>
              </div>
              <div className="rounded-xl bg-rose-500/10 p-3.5 text-rose-400 border border-rose-500/20">
                <XCircle className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Pending Approvals Table */}
          <section className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-bold text-white">Pending Approvals Dashboard</h2>
                <p className="text-xs text-slate-400 mt-0.5">Evaluate leave applications from HRContext</p>
              </div>

              {/* Filter and Search Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search applicant or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-56 pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:border-violet-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 p-1 rounded-xl">
                  {["All", "Pending", "Approved", "Rejected"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        filterStatus === status
                          ? "bg-violet-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Admin Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/50 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3.5 rounded-l-xl">Employee</th>
                    <th className="px-4 py-3.5">Leave Details</th>
                    <th className="px-4 py-3.5">Dates & Duration</th>
                    <th className="px-4 py-3.5">Reason</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right rounded-r-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPending.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-violet-500/20 flex items-center justify-center font-bold text-violet-300 text-xs border border-violet-500/30">
                            {((req.employeeName && req.employeeName.toLowerCase() !== "employee" ? req.employeeName : (req.applicantName && req.applicantName.toLowerCase() !== "employee" ? req.applicantName : "Karthik Subramanian"))).charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">
                              {req.employeeName && req.employeeName.toLowerCase() !== "employee" ? req.employeeName : (req.applicantName && req.applicantName.toLowerCase() !== "employee" ? req.applicantName : "Karthik Subramanian")}
                            </p>
                            <p className="text-[11px] text-slate-400">Staff Member</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-200 text-xs block">
                            {req.type || req.leaveType || "Leave"}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Applied: {req.appliedDate || req.appliedOn || "Recently"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-mono text-slate-300">
                            {req.startDate} to {req.endDate}
                          </p>
                          <p className="text-[11px] text-violet-400 font-semibold">
                            {req.days || 1} {req.days > 1 ? "Days" : "Day"}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-400 max-w-xs truncate" title={req.reason}>
                        {req.reason || "No description provided."}
                      </td>

                      <td className="px-4 py-4">
                        {renderStatusBadge(req.status || "Pending")}
                      </td>

                      {/* Action Buttons: Approve (Check) & Reject (X) wired to updateLeaveStatus */}
                      <td className="px-4 py-4 text-right">
                        {(req.status || "Pending").toLowerCase() === "pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleReject(req.id)}
                              disabled={actionLoadingId === req.id}
                              title="Reject Request"
                              className="flex items-center gap-1 rounded-xl bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                              {actionLoadingId === req.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                              <span className="hidden sm:inline">Reject</span>
                            </button>

                            <button
                              onClick={() => handleApprove(req.id)}
                              disabled={actionLoadingId === req.id}
                              title="Approve Request"
                              className="flex items-center gap-1 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                              {actionLoadingId === req.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                              <span className="hidden sm:inline">Approve</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredPending.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-500 text-sm">
                        No pending leave applications requiring approval.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* Request Leave Modal */}
      <LeaveApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Leaves;
