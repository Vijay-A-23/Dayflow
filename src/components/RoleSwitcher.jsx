import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, User, ArrowLeftRight, Sparkles } from "lucide-react";

export const RoleSwitcher = ({ variant = "pill" }) => {
  const { userRole, switchRole } = useAuth();
  const [switching, setSwitching] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const currentRole = userRole || "employee";
  const targetRole = currentRole === "admin" ? "employee" : "admin";

  const handleToggle = () => {
    if (switching) return;
    setSwitching(true);

    try {
      if (switchRole) {
        switchRole(targetRole);
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      console.error("Role switch error:", err);
    } finally {
      setSwitching(false);
    }
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleToggle}
        disabled={switching}
        title={`Active role: ${currentRole}. Click to switch to ${targetRole}.`}
        className="group relative inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300 transition-all hover:border-violet-400 hover:bg-violet-500/20 hover:text-white cursor-pointer shadow-sm active:scale-95"
      >
        {currentRole === "admin" ? (
          <Shield className="h-3.5 w-3.5 text-violet-400" />
        ) : (
          <User className="h-3.5 w-3.5 text-indigo-400" />
        )}
        <span className="capitalize">{currentRole}</span>
        <ArrowLeftRight className={`h-3 w-3 opacity-60 ml-0.5 transition-transform duration-300 ${switching ? "rotate-180" : "group-hover:rotate-45"}`} />
      </button>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={handleToggle}
        disabled={switching}
        title={`Switch role to ${targetRole}`}
        className="group relative flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-300 shadow-inner backdrop-blur-md transition-all duration-200 hover:border-violet-500/50 hover:bg-slate-800/90 hover:text-white cursor-pointer active:scale-95"
      >
        <div className="flex items-center gap-1.5">
          <div className={`flex h-5 w-5 items-center justify-center rounded-lg ${
            currentRole === "admin"
              ? "bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/40"
              : "bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/40"
          }`}>
            {currentRole === "admin" ? (
              <Shield className="h-3 w-3" />
            ) : (
              <User className="h-3 w-3" />
            )}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-slate-500 leading-none">Role</span>
            <span className="text-xs font-bold text-slate-200 capitalize leading-tight">
              {currentRole}
            </span>
          </div>
        </div>

        <div className="ml-1 flex items-center gap-1 rounded-lg bg-slate-800/80 px-2 py-0.5 text-[10px] text-violet-300 border border-slate-700/50 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-500 transition-colors">
          <ArrowLeftRight className={`h-2.5 w-2.5 ${switching ? "animate-spin" : ""}`} />
          <span className="font-semibold capitalize">To {targetRole}</span>
        </div>
      </button>

      {/* Floating feedback toast */}
      {showToast && (
        <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-slate-900/95 px-2.5 py-1 text-[11px] font-semibold text-violet-200 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-200 whitespace-nowrap">
          <Sparkles className="h-3 w-3 text-violet-400" />
          <span>Switched to {currentRole} Mode</span>
        </div>
      )}
    </div>
  );
};

export default RoleSwitcher;
