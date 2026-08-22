import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  Clock, 
  CalendarDays, 
  User, 
  Users, 
  X,
  FileSpreadsheet
} from "lucide-react";

export const Sidebar = ({ isOpen, onClose }) => {
  const { userRole } = useAuth();

  const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/attendance", label: "Attendance", icon: Clock },
    { to: "/leaves", label: "Leaves", icon: CalendarDays },
    { to: "/profile", label: "Profile", icon: User },
  ];

  // Admin exclusive links
  if (userRole === "admin") {
    links.push({ to: "/employees", label: "Employee Directory", icon: Users });
  }

  const baseClasses = "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200";
  const activeClasses = "bg-violet-600 text-white shadow-lg shadow-violet-600/30";
  const inactiveClasses = "text-slate-400 hover:bg-slate-800 hover:text-white";

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:sticky lg:top-0 lg:h-[calc(100vh-4rem)]`}
      >
        {/* Mobile Header Inside Sidebar */}
        <div className="flex h-16 items-center justify-between px-6 lg:hidden border-b border-slate-800">
          <span className="font-display text-lg font-bold text-white">Menu</span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Info */}
        <div className="border-t border-slate-800 p-4">
          <div className="rounded-xl bg-slate-850 p-4 border border-slate-800/40">
            <p className="text-xs text-slate-400">Workspace</p>
            <p className="text-sm font-semibold text-white truncate">Dayflow HR Head Office</p>
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
