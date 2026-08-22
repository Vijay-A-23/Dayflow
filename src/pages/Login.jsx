import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sparkles, Mail, Lock, AlertCircle, Shield, User } from "lucide-react";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError("Please fill in all fields");
    }

    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      if (err.code === "auth/user-not-found" || err.message === "auth/user-not-found") {
        setError("Invalid email address. User not found.");
      } else if (err.code === "auth/wrong-password" || err.message === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Failed to sign in. Please verify your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    setError("");
    setLoading(true);
    const demoEmail = role === "admin" ? "admin@dayflow.com" : "employee@dayflow.com";
    const demoPassword = role === "admin" ? "admin123" : "employee123";

    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      await login(demoEmail, demoPassword);
      navigate("/", { replace: true });
    } catch (err) {
      setError("Failed to quick login: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-violet-600/10 blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-indigo-600/10 blur-[100px] animate-pulse" />

      {/* Main Container */}
      <div className="glass-panel w-full max-w-md rounded-2xl p-8 shadow-2xl animate-float">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/25 mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">
            Welcome to Dayflow
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Sign in to access your HR workspace
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 p-3.5 text-sm text-rose-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300" htmlFor="email">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute top-3.5 left-3.5 h-5 w-5 text-slate-500" />
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 transition-all focus:border-violet-500 focus:bg-slate-900"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute top-3.5 left-3.5 h-5 w-5 text-slate-500" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 transition-all focus:border-violet-500 focus:bg-slate-900"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:scale-[1.01] hover:from-violet-500 hover:to-indigo-500 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute w-full border-t border-slate-800" />
          <span className="relative bg-slate-950 px-3 text-xs text-slate-500 uppercase tracking-widest">
            Quick Sandbox Login
          </span>
        </div>

        {/* Quick login selectors */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleQuickLogin("admin")}
            disabled={loading}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/40 p-3 hover:bg-slate-800/60 text-slate-300 hover:text-white transition-all text-xs font-medium"
          >
            <Shield className="h-5 w-5 text-violet-500" />
            <span>As Admin</span>
            <span className="text-[10px] text-slate-500">Full HR Controls</span>
          </button>
          
          <button
            onClick={() => handleQuickLogin("employee")}
            disabled={loading}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/40 p-3 hover:bg-slate-800/60 text-slate-300 hover:text-white transition-all text-xs font-medium"
          >
            <User className="h-5 w-5 text-indigo-500" />
            <span>As Employee</span>
            <span className="text-[10px] text-slate-500">Attendance/Leaves</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default Login;
