import React from "react";
import { useAuth } from "../context/AuthContext";
import { isFirebaseConfigured } from "../services/firebase";
import { LogOut, Bell, Menu, Database, ShieldAlert, Sparkles } from "lucide-react";

export const Navbar = ({ onMenuToggle }) => {
  const { userProfile, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 backdrop-blur-md">
      {/* Mobile Toggle & Brand */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-white">
            Dayflow<span className="text-violet-500">.</span>
          </span>
        </div>
      </div>

      {/* Center status badges */}
      <div className="hidden sm:flex items-center gap-3">
        {isFirebaseConfigured ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Cloud Database Connected
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
            <Database className="h-3 w-3" />
            Local Sandbox (Mock Mode)
          </span>
        )}
      </div>

      {/* User profile & actions */}
      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-violet-500 ring-2 ring-slate-900" />
        </button>

        {/* User Card */}
        <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-white">{userProfile?.name || "User"}</p>
            <p className="text-xs text-slate-400 capitalize">{userProfile?.role}</p>
          </div>
          
          <img
            src={userProfile?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"}
            alt={userProfile?.name || "Avatar"}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-violet-500/40"
          />

          <button
            onClick={logout}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-rose-400"
            title="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
