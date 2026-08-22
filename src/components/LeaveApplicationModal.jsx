import React, { useState, useEffect, useContext } from "react";
import { Calendar, X, AlertCircle, Send, Loader2 } from "lucide-react";
import HRContext, { useHR } from "../context/HRContext";

export const LeaveApplicationModal = ({ isOpen, onClose }) => {
  // Access HRContext directly or via hook for full compatibility
  const hrCtx = useContext(HRContext) || {};
  let useHRCtx = {};
  try {
    useHRCtx = useHR() || {};
  } catch (e) {
    // Fallback if rendered outside provider context
  }

  // Resolve submitLeaveRequest function from context with fallback to applyLeave
  const submitLeaveRequest =
    hrCtx.submitLeaveRequest ||
    useHRCtx.submitLeaveRequest ||
    hrCtx.applyLeave ||
    useHRCtx.applyLeave;

  const isGlobalLoading = hrCtx.loading || useHRCtx.loading || false;

  // Local state for form fields
  const [leaveType, setLeaveType] = useState("Sick");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Close modal on Escape key press for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  // If modal is not open, do not render
  if (!isOpen) return null;

  // Validation checks
  const isDateRangeInvalid =
    Boolean(startDate) && Boolean(endDate) && new Date(endDate) < new Date(startDate);

  const isFormIncomplete =
    !leaveType || !startDate || !endDate || !reason.trim();

  const isSubmitDisabled = isFormIncomplete || isDateRangeInvalid || isSubmitting || isGlobalLoading;

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    const payload = {
      leaveType,
      type: leaveType.endsWith("Leave") ? leaveType : `${leaveType} Leave`,
      startDate,
      endDate,
      reason: reason.trim()
    };

    // Leave request validation passed

    try {
      setIsSubmitting(true);
      setSubmitError("");

      if (typeof submitLeaveRequest === "function") {
        await submitLeaveRequest(payload);
      }

      // Reset form fields
      setLeaveType("Sick");
      setStartDate("");
      setEndDate("");
      setReason("");

      // Trigger onClose callback
      onClose();
    } catch (error) {
      console.error("Error submitting leave request:", error);
      setSubmitError(error?.message || "Failed to submit leave request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-modal-title"
    >
      {/* Modal Container */}
      <div
        className="glass-panel w-full max-w-lg rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click from closing when clicking inside modal
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-400 border border-violet-500/20">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 id="leave-modal-title" className="font-display text-lg font-bold text-white">
                Request Leave
              </h2>
              <p className="text-xs text-slate-400">Fill out the details to submit a new leave application.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800/80 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Validation Error Banner */}
        {isDateRangeInvalid && (
          <div className="flex items-center gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-400 animate-in fade-in duration-150">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>End Date cannot be earlier than Start Date.</span>
          </div>
        )}

        {/* Submission Error Banner */}
        {submitError && (
          <div className="flex items-center gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-400 animate-in fade-in duration-150">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Leave Type Select */}
          <div className="space-y-1.5">
            <label htmlFor="leaveType" className="text-xs font-semibold text-slate-300">
              Leave Type <span className="text-violet-400">*</span>
            </label>
            <select
              id="leaveType"
              disabled={isSubmitting}
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 px-3.5 text-sm text-slate-200 focus:border-violet-500 cursor-pointer disabled:opacity-50"
            >
              <option value="Sick">Sick</option>
              <option value="Casual">Casual</option>
              <option value="Earned">Earned</option>
            </select>
          </div>

          {/* Date Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="startDate" className="text-xs font-semibold text-slate-300">
                Start Date <span className="text-violet-400">*</span>
              </label>
              <input
                id="startDate"
                type="date"
                required
                disabled={isSubmitting}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 px-3.5 text-xs text-slate-200 focus:border-violet-500 cursor-pointer disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="endDate" className="text-xs font-semibold text-slate-300">
                End Date <span className="text-violet-400">*</span>
              </label>
              <input
                id="endDate"
                type="date"
                required
                disabled={isSubmitting}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full rounded-xl border bg-slate-900/90 py-2.5 px-3.5 text-xs text-slate-200 focus:border-violet-500 cursor-pointer disabled:opacity-50 ${
                  isDateRangeInvalid ? "border-rose-500/50" : "border-slate-800"
                }`}
              />
            </div>
          </div>

          {/* Reason Textarea */}
          <div className="space-y-1.5">
            <label htmlFor="reason" className="text-xs font-semibold text-slate-300">
              Reason <span className="text-violet-400">*</span>
            </label>
            <textarea
              id="reason"
              rows={3}
              required
              disabled={isSubmitting}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a brief explanation for your leave request..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 px-3.5 text-sm text-slate-100 placeholder-slate-500 focus:border-violet-500 disabled:opacity-50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-indigo-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-violet-600 disabled:hover:to-indigo-600 disabled:active:scale-100 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveApplicationModal;
