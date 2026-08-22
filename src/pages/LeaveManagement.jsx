import React, { useState } from "react";
import { useHR } from "../context/HRContext";
import { useAuth } from "../context/AuthContext";
import { LEAVE_TYPES } from "../constants/mockData";
import { Calendar, FileText, Check, X, AlertCircle, Hourglass, Plus, ChevronRight } from "lucide-react";

export const LeaveManagement = () => {
  const { userRole } = useAuth();
  const { leaves, applyLeave, approveLeave, rejectLeave, loading } = useHR();

  // Application form states
  const [leaveType, setLeaveType] = useState(LEAVE_TYPES[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleApply = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      return setFormError("Please fill in all fields.");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return setFormError("End date cannot be prior to start date.");
    }

    setFormError("");
    setSuccessMsg("");

    try {
      await applyLeave({
        type: leaveType,
        startDate,
        endDate,
        reason
      });
      setSuccessMsg("Leave application submitted successfully!");
      setStartDate("");
      setEndDate("");
      setReason("");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setFormError("Submission failed: " + err.message);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveLeave(id);
    } catch (err) {
      alert("Error approving leave: " + err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectLeave(id);
    } catch (err) {
      alert("Error rejecting leave: " + err.message);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">Leave Planner & Scheduler</h1>
        <p className="text-slate-400 text-sm mt-1">Submit leave requests, check status lists, and audit schedules.</p>
      </div>

      {/* Main split grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Submit Form (Employee View) / Quick summary panels */}
        <div className="lg:col-span-1 space-y-6">
          {userRole !== "admin" ? (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <h2 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-violet-500" /> Apply for Leave
              </h2>

              {formError && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-3 text-xs text-emerald-400">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleApply} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 px-3 text-sm text-slate-350 focus:border-violet-500 cursor-pointer"
                  >
                    {LEAVE_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Start Date</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 px-3 text-xs text-slate-300 focus:border-violet-500 cursor-pointer"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">End Date</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 px-3 text-xs text-slate-300 focus:border-violet-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Reason / Description</label>
                  <textarea
                    rows={4}
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide a brief explanation for leave..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 focus:border-violet-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:from-violet-500 hover:to-indigo-500 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            </div>
          ) : (
            // Admin Panel Informational Widget
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-gradient-to-br from-violet-950/20 to-indigo-950/20 space-y-4">
              <h2 className="font-display text-lg font-bold text-white">Leave Audit Dashboard</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                As an HR administrator, you have complete authority to evaluate, approve, or reject employee leave applications.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                  <span>Total Pending Applications</span>
                  <span className="font-bold text-amber-400">{leaves.filter(l => l.status === "Pending").length}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                  <span>Total Approved Applications</span>
                  <span className="font-bold text-emerald-400">{leaves.filter(l => l.status === "Approved").length}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Requests List (Admin Actions / Employee Log History) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h2 className="font-display text-lg font-bold text-white mb-4">
              {userRole === "admin" ? "All Employee Leave Requests" : "My Leave History"}
            </h2>

            <div className="space-y-4">
              {leaves.map((lv) => (
                <div
                  key={lv.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/40"
                >
                  <div className="space-y-2 max-w-md">
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-white text-sm">{lv.type}</span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                        lv.status === "Approved" 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" 
                          : lv.status === "Pending" 
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/10"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/10"
                      }`}>
                        {lv.status}
                      </span>
                    </div>

                    {userRole === "admin" && (
                      <p className="text-xs text-slate-300">
                        Requested by: <strong className="text-violet-400">{lv.employeeName}</strong>
                      </p>
                    )}

                    <p className="text-xs text-slate-400 leading-normal flex items-start gap-1">
                      <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>{lv.reason}</span>
                    </p>
                    
                    <p className="text-[10px] text-slate-500">
                      Applied Date: {lv.appliedDate}
                    </p>
                  </div>

                  <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 border-t border-slate-850 sm:border-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-400 font-medium">Duration</p>
                      <p className="text-sm font-semibold text-slate-200 mt-0.5">
                        {lv.startDate} to {lv.endDate}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        ({lv.days} day{lv.days > 1 ? "s" : ""})
                      </p>
                    </div>

                    {/* Approve / Reject buttons for Admin */}
                    {userRole === "admin" && lv.status === "Pending" && (
                      <div className="flex gap-2 mt-2 sm:mt-1">
                        <button
                          onClick={() => handleReject(lv.id)}
                          disabled={loading}
                          className="rounded-lg p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-350 transition-all border border-rose-500/10"
                          title="Reject Leave"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleApprove(lv.id)}
                          disabled={loading}
                          className="rounded-lg p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-350 transition-all border border-emerald-500/10"
                          title="Approve Leave"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {leaves.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-sm">
                  No leave requests logged in system.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default LeaveManagement;
