import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Bell, Menu, Sparkles } from "lucide-react";

export const Navbar = ({ onMenuToggle }) => {
  const { userProfile, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout navigation failed:", err);
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 backdrop-blur-md">
      {/* Mobile Toggle & Brand */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden cursor-pointer"
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

      {/* Center Space */}
      <div className="hidden sm:block" />

      {/* User profile & actions */}
      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-violet-500 ring-2 ring-slate-900" />
        </button>

        {/* User Card */}
        <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-white">{userProfile?.name || ((userProfile?.role || userRole) === "admin" ? "Kavitha Sundaram" : "Karthik Subramanian")}</p>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${
              (userProfile?.role || userRole) === "admin"
                ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            }`}>
              {(userProfile?.role || userRole) === "admin" ? "Admin" : "Employee"}
            </span>
          </div>
          
          {userProfile?.avatarUrl || userProfile?.avatar ? (
            <img
              src={userProfile.avatarUrl || userProfile.avatar}
              alt={userProfile?.name || "Avatar"}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-violet-500/40"
            />
          ) : (
            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-violet-500/40 ${
              (userProfile?.role || userRole) === "admin" 
                ? "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md shadow-violet-500/10" 
                : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/10"
            }`}>
              {(() => {
                const name = userProfile?.name || ((userProfile?.role || userRole) === "admin" ? "Kavitha Sundaram" : "Karthik Subramanian");
                return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
              })()}
            </div>
          )}

          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-rose-400 cursor-pointer transition-colors"
            title="Log out of Dayflow"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
