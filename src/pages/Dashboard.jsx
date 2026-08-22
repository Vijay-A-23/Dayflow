import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useHR } from "../context/HRContext";
import { 
  Clock, 
  Users, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Hourglass,
  ArrowRight,
  UserCheck,
  Building
} from "lucide-react";

export const Dashboard = () => {
  const { userProfile, userRole } = useAuth();
  const { 
    employees, 
    leaves, 
    attendance, 
    punchIn, 
    punchOut, 
    loading 
  } = useHR();

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  // Find active punch record for today
  const todayPunches = attendance.filter(p => (p.employeeId === userProfile?.id || p.userId === userProfile?.id) && p.date === todayStr);
  const activePunch = todayPunches.find(p => p.punchOut === "" || p.checkOut === "");

  // Stats calculations
  // Admin stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === "Active").length;
  const presentToday = attendance.filter(a => a.date === todayStr).length;
  const leavesPending = leaves.filter(l => l.status === "Pending").length;
  
  // Employee stats
  const employeeAttendance = attendance.filter(a => a.employeeId === userProfile?.id || a.userId === userProfile?.id);
  const totalHoursWorked = employeeAttendance.reduce((acc, curr) => acc + (curr.totalHours || 0), 0).toFixed(1);
  const latePunches = employeeAttendance.filter(a => a.status === "Late").length;
  
  // Calculate dynamic leave balances from live leaves collection
  const employeeApprovedLeaves = leaves.filter(l => (l.employeeId === userProfile?.id || l.userId === userProfile?.id || l.userEmail?.toLowerCase() === userProfile?.email?.toLowerCase()) && l.status === "Approved");
  const leavesTaken = employeeApprovedLeaves.reduce((acc, curr) => acc + curr.days, 0);
  const annualBalance = Math.max(2 - employeeApprovedLeaves.filter(l => (l.type || l.leaveType || "").toLowerCase().includes("annual") || (l.type || l.leaveType || "").toLowerCase().includes("earned")).reduce((acc, curr) => acc + curr.days, 0), 0);
  const sickBalance = Math.max(3 - employeeApprovedLeaves.filter(l => (l.type || l.leaveType || "").toLowerCase().includes("sick")).reduce((acc, curr) => acc + curr.days, 0), 0);

  const handlePunch = async () => {
    try {
      if (activePunch) {
        await punchOut(activePunch.id);
      } else {
        await punchIn();
      }
    } catch (err) {
      alert("Clocking operation failed: " + err.message);
    }
  };

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

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-violet-900/60 to-indigo-900/40 p-6 border border-violet-800/30">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white">
            Hello, {userProfile?.name || (userRole === 'admin' ? 'Kavitha Sundaram' : 'Karthik Subramanian')}!
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            {userRole === "admin" 
              ? "Here is what requires your attention today." 
              : "Review your schedule, log attendance, and manage leaves."
            }
          </p>
          <div className="flex flex-wrap gap-2 mt-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 px-2.5 py-1 text-[11px] font-semibold text-violet-300 border border-violet-500/25">
              <Building className="h-3.5 w-3.5 shrink-0" />
              Dayflow OMR Tech Park, Chennai
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-950/40 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800">
          <Clock className="h-5 w-5 text-violet-400" />
          <div className="text-right">
            <p className="text-sm font-semibold text-white font-mono">{formattedTime}</p>
            <p className="text-[10px] text-slate-400">{formattedDate}</p>
          </div>
        </div>
      </div>

      {/* Admin Dashboard Statistics */}
      {userRole === "admin" && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Headcount</p>
              <h3 className="text-3xl font-extrabold text-white">{totalEmployees}</h3>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                <TrendingUp className="h-3 w-3" /> {activeEmployees} Active
              </p>
            </div>
            <div className="rounded-xl bg-violet-500/10 p-3.5 text-violet-500 border border-violet-500/10">
              <Users className="h-6 w-6" />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Present Today</p>
              <h3 className="text-3xl font-extrabold text-white">{presentToday}</h3>
              <p className="text-[10px] text-slate-400">
                Punches logged today
              </p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 p-3.5 text-emerald-500 border border-emerald-500/10">
              <UserCheck className="h-6 w-6" />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Leave Applications</p>
              <h3 className="text-3xl font-extrabold text-white">{leavesPending}</h3>
              <p className="text-[10px] text-amber-400 flex items-center gap-1 font-medium">
                <Hourglass className="h-3 w-3 animate-spin" style={{ animationDuration: '3s' }} /> Pending Approval
              </p>
            </div>
            <div className="rounded-xl bg-amber-500/10 p-3.5 text-amber-500 border border-amber-500/10">
              <Calendar className="h-6 w-6" />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">HR Operations</p>
              <h3 className="text-lg font-bold text-white">All Systems</h3>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Fully Synced
              </p>
            </div>
            <div className="rounded-xl bg-indigo-500/10 p-3.5 text-indigo-500 border border-indigo-500/10">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
        </div>
      )}

      {/* Employee Dashboard Statistics */}
      {userRole !== "admin" && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Work Hours</p>
              <h3 className="text-2xl font-extrabold text-white">{totalHoursWorked} hrs</h3>
              <p className="text-[10px] text-slate-400">Total hours logged this month</p>
            </div>
            <div className="rounded-xl bg-violet-500/10 p-3.5 text-violet-500">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Earned Leave Balance</p>
              <h3 className="text-2xl font-extrabold text-white">{annualBalance} days</h3>
              <p className="text-[10px] text-slate-400">2 days allocated annually</p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 p-3.5 text-emerald-500">
              <Calendar className="h-6 w-6" />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sick Leave Balance</p>
              <h3 className="text-2xl font-extrabold text-white">{sickBalance} days</h3>
              <p className="text-[10px] text-slate-400">3 days allocated annually</p>
            </div>
            <div className="rounded-xl bg-indigo-500/10 p-3.5 text-indigo-500">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Attendance Punching Widget (Employee View) / Admin Operations Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {userRole !== "admin" ? (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <h2 className="font-display text-lg font-bold text-white mb-4">
                Attendance Punch Clock
              </h2>
              
              <div className="flex flex-col md:flex-row items-center gap-6 justify-between bg-slate-950/30 p-5 rounded-2xl border border-slate-800/60">
                <div className="space-y-1 text-center md:text-left">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Today's Clock State</p>
                  <p className="text-lg font-semibold text-white mt-1">
                    {activePunch 
                      ? `Clocked In at ${activePunch.punchIn}` 
                      : todayPunches.length > 0 
                        ? `Finished Work (Out: ${todayPunches[todayPunches.length - 1].punchOut})`
                        : "Not Clocked In"
                    }
                  </p>
                  <p className="text-xs text-slate-500">
                    Shift target: 9:00 AM - 6:00 PM
                  </p>
                </div>
                
                <button
                  onClick={handlePunch}
                  disabled={loading}
                  className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-semibold shadow-lg transition-all active:scale-[0.98] ${
                    activePunch 
                      ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25" 
                      : todayPunches.length > 0 && !activePunch
                        ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                        : "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/25"
                  }`}
                >
                  {loading 
                    ? "Updating Log..." 
                    : activePunch 
                      ? "Clock Out" 
                      : todayPunches.length > 0
                        ? "Shift Complete"
                        : "Clock In"
                  }
                </button>
              </div>

              {/* Today's Punch List */}
              <div className="mt-6 space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Timeline</h3>
                {todayPunches.length === 0 ? (
                  <p className="text-sm text-slate-500">No punch actions logged today.</p>
                ) : (
                  todayPunches.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm bg-slate-900/60 px-4 py-3 rounded-xl border border-slate-800/40">
                      <span className="text-slate-300 font-medium">Shift Session</span>
                      <div className="flex gap-4 font-mono text-xs">
                        <span>In: <span className="text-emerald-400 font-semibold">{p.punchIn}</span></span>
                        {p.punchOut && (
                          <span>Out: <span className="text-rose-400 font-semibold">{p.punchOut}</span></span>
                        )}
                        {p.totalHours > 0 && (
                          <span>Worked: <span className="text-violet-400 font-semibold">{p.totalHours} hrs</span></span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            // Admin Action Center
            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <h2 className="font-display text-lg font-bold text-white mb-4">
                HR Core Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-800 hover:border-violet-500/20 transition-all flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-white text-sm">Add New Recruit</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-3">Onboard a new employee to the central database directory.</p>
                  </div>
                  <a href="/employees" className="inline-flex items-center gap-1.5 text-xs text-violet-400 font-semibold hover:text-violet-300 mt-auto">
                    Directory & Onboarding <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
                
                <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-800 hover:border-violet-500/20 transition-all flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-white text-sm">Approve Pending Leaves</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-3">Check pending leave requests submitted by staff members.</p>
                  </div>
                  <a href="/leaves" className="inline-flex items-center gap-1.5 text-xs text-violet-400 font-semibold hover:text-violet-300 mt-auto">
                    Review Requests <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Recent Operations Log (Shared) */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h2 className="font-display text-lg font-bold text-white mb-4">
              Recent Attendance Logs
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/40 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">Date</th>
                    {userRole === "admin" && <th className="px-4 py-3">Employee</th>}
                    <th className="px-4 py-3">Clock In</th>
                    <th className="px-4 py-3">Clock Out</th>
                    <th className="px-4 py-3">Hours</th>
                    <th className="px-4 py-3 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {attendance.slice(0, 5).map((log) => {
                    const emp = employees.find(e => e.id === log.employeeId);
                    return (
                      <tr key={log.id} className="hover:bg-slate-800/30">
                        <td className="px-4 py-3 font-medium text-white">{log.date}</td>
                        {userRole === "admin" && (
                          <td className="px-4 py-3 font-semibold text-slate-300">
                            {emp?.name || log.employeeId}
                          </td>
                        )}
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{log.punchIn}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{log.punchOut || "--:--"}</td>
                        <td className="px-4 py-3 font-semibold text-white">{log.totalHours ? `${log.totalHours} hrs` : "-"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                            log.status === "Present" 
                              ? "bg-emerald-500/10 text-emerald-400" 
                              : log.status === "Late" 
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-rose-500/10 text-rose-400"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {attendance.length === 0 && (
                    <tr>
                      <td colSpan={userRole === "admin" ? 6 : 5} className="text-center py-6 text-slate-500">
                        No recent attendance logs.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Panel inside Grid (Leave Status Overview) */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-white">
                Leaves Overview
              </h2>
              <a href="/leaves" className="text-xs text-violet-400 hover:text-violet-300 font-semibold">
                Manage
              </a>
            </div>

            <div className="space-y-4">
              {leaves.slice(0, 4).map((lv) => (
                <div key={lv.id} className="p-3.5 bg-slate-950/20 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{lv.type}</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 font-bold ${
                      lv.status === "Approved" 
                        ? "bg-emerald-500/10 text-emerald-400" 
                        : lv.status === "Pending" 
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-rose-500/10 text-rose-400"
                    }`}>
                      {lv.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{lv.startDate} to {lv.endDate}</span>
                    <span className="font-semibold text-slate-200">{lv.days} day(s)</span>
                  </div>
                  
                  {userRole === "admin" && (
                    <div className="text-[11px] text-slate-500 border-t border-slate-850 pt-1.5 flex justify-between">
                      <span>Applicant: <strong className="text-slate-300">{lv.employeeName}</strong></span>
                    </div>
                  )}
                </div>
              ))}
              
              {leaves.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No leave entries recorded.</p>
              )}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-gradient-to-br from-indigo-950/40 to-slate-900/40">
            <h3 className="font-display text-md font-bold text-white mb-2">Company Notice</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Please ensure you register your punches daily before 09:00 AM to avoid being flagged as late.
              Annual reviews require 90% attendance record conformity.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Dashboard;
