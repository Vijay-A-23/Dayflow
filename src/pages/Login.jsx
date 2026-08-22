import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Shield,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowRight,
  Zap,
  Building2,
  LockKeyhole
} from "lucide-react";

export const Login = () => {
  const { currentUser, isAuthenticated, login, signup, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Tab State: 'login' | 'signup'
  const [tab, setTab] = useState("login");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [showPassword, setShowPassword] = useState(false);

  // Status & Validation States
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState(null); // 'admin' | 'employee' | 'submit'
  const [toastMessage, setToastMessage] = useState(null);

  // Target redirection path
  const destination = location.state?.from?.pathname || "/";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated || currentUser) {
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate, destination]);

  // Dismiss toast automatically
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Client-side validation
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (tab === "signup") {
      if (!name.trim()) {
        errors.name = "Full name is required";
      } else if (name.trim().length < 2) {
        errors.name = "Name must be at least 2 characters";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submission (Login / Signup)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setLoadingRole("submit");

    try {
      if (tab === "login") {
        await login(email.trim(), password);
        setToastMessage({ type: "success", text: "Signed in successfully!" });
      } else {
        await signup({
          email: email.trim(),
          password,
          displayName: name.trim(),
          department: department || "Engineering",
          role: "employee"
        });
        setToastMessage({ type: "success", text: "Account created successfully!" });
      }
      navigate(destination, { replace: true });
    } catch (err) {
      console.error("Auth action failed:", err);
      const code = err.code || err.message || "";

      if (code.includes("user-not-found") || code === "auth/user-not-found") {
        setError("Account not found. Check your email or use Quick Access below.");
      } else if (code.includes("wrong-password") || code === "auth/wrong-password") {
        setError("Incorrect password. Demo users can use 'password123'.");
      } else if (code.includes("email-already-in-use") || code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Try signing in.");
      } else if (code.includes("invalid-email") || code === "auth/invalid-email") {
        setError("Invalid email format. Please check your work email.");
      } else {
        setError(err.message || "Authentication failed. Please verify your credentials.");
      }
    } finally {
      setLoading(false);
      setLoadingRole(null);
    }
  };

  // Prefill Demo Credentials helper
  const handlePrefill = (role) => {
    setError("");
    setFieldErrors({});
    setTab("login"); // Switch to login tab

    if (role === "admin") {
      setEmail("admin@dayflow.com");
      setPassword("password123");
      setToastMessage({
        type: "success",
        text: "Prefilled Admin credentials. Click Sign In!"
      });
    } else {
      setEmail("employee@dayflow.com");
      setPassword("password123");
      setToastMessage({
        type: "success",
        text: "Prefilled Employee credentials. Click Sign In!"
      });
    }
  };

  // Switch tab helper
  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    setError("");
    setFieldErrors({});
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 px-4 py-8 selection:bg-violet-500 selection:text-white">
      {/* Background Animated Gradient Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-purple-600/10 blur-[100px]" />
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/90 px-4 py-3 text-sm font-medium text-emerald-300 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Glassmorphic Card Container */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="relative rounded-3xl border border-slate-800/80 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-2xl transition-all duration-300 sm:p-10">
          
          {/* Header Brand */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 blur-md opacity-60" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-xl shadow-violet-500/30">
                <Sparkles className="h-7 w-7 text-white animate-pulse" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
                Dayflow<span className="text-violet-500">.</span>
              </span>
              <span className="rounded-full bg-violet-500/10 border border-violet-500/25 px-2.5 py-0.5 text-[11px] font-semibold text-violet-300">
                HR Platform
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-400">
              {tab === "login"
                ? "Sign in to access your attendance, leaves, and HR directory"
                : "Create your employee profile to get started"}
            </p>
          </div>

          {/* Hackathon Demo Quick Access Bar */}
          <div className="mb-6 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/40 via-slate-900/60 to-indigo-950/40 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-violet-300">
                <Zap className="h-3.5 w-3.5 text-violet-400 fill-violet-400" />
                <span>Prefill Demo Credentials</span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/50">
                Click to Prefill Inputs
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Quick Admin Button */}
              <button
                type="button"
                onClick={() => handlePrefill("admin")}
                disabled={loading}
                className="group relative flex flex-col items-start gap-1 rounded-xl border border-violet-500/30 bg-violet-900/20 p-3 text-left transition-all duration-200 hover:border-violet-400 hover:bg-violet-900/40 hover:shadow-lg hover:shadow-violet-900/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-violet-200">
                    <Shield className="h-4 w-4 text-violet-400" />
                    <span>Admin Mode</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-300 font-medium truncate w-full">
                  Kavitha Sundaram
                </span>
                <span className="text-[10px] text-violet-400/80 font-mono truncate w-full">
                  admin@dayflow.com
                </span>
              </button>

              {/* Quick Employee Button */}
              <button
                type="button"
                onClick={() => handlePrefill("employee")}
                disabled={loading}
                className="group relative flex flex-col items-start gap-1 rounded-xl border border-indigo-500/30 bg-indigo-900/20 p-3 text-left transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-900/40 hover:shadow-lg hover:shadow-indigo-900/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-200">
                    <User className="h-4 w-4 text-indigo-400" />
                    <span>Employee Mode</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-300 font-medium truncate w-full">
                  Karthik Subramanian
                </span>
                <span className="text-[10px] text-indigo-400/80 font-mono truncate w-full">
                  employee@dayflow.com
                </span>
              </button>
            </div>
          </div>

          {/* Form Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute w-full border-t border-slate-800" />
            <span className="relative bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              Or With Credentials
            </span>
          </div>

          {/* Tab Switcher: Sign In vs Create Account */}
          <div className="relative mb-6 grid grid-cols-2 rounded-xl bg-slate-950/80 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => handleTabSwitch("login")}
              className={`relative z-10 py-2.5 text-xs font-semibold transition-all duration-200 rounded-lg cursor-pointer ${
                tab === "login"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch("signup")}
              className={`relative z-10 py-2.5 text-xs font-semibold transition-all duration-200 rounded-lg cursor-pointer ${
                tab === "signup"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner with Dismiss */}
          {error && (
            <div className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-400 animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-relaxed">{error}</span>
              </div>
              <button
                type="button"
                onClick={() => setError("")}
                className="rounded-lg p-1 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                title="Dismiss error"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Sign Up Only) */}
            {tab === "signup" && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="text-xs font-semibold text-slate-300" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute top-3.5 left-3.5 h-4 w-4 text-slate-500" />
                  <input
                    id="name"
                    type="text"
                    placeholder="e.g. Kavitha Sundaram"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: null });
                    }}
                    className={`w-full rounded-xl border bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-all focus:bg-slate-900 focus:outline-none focus:ring-1 ${
                      fieldErrors.name
                        ? "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/30"
                        : "border-slate-800 focus:border-violet-500 focus:ring-violet-500"
                    }`}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-[11px] text-rose-400 pl-1">{fieldErrors.name}</p>
                )}
              </div>
            )}

            {/* Work Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300" htmlFor="email">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute top-3.5 left-3.5 h-4 w-4 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@dayflow.internal"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                  }}
                  className={`w-full rounded-xl border bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-all focus:bg-slate-900 focus:outline-none focus:ring-1 ${
                    fieldErrors.email
                      ? "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/30"
                      : "border-slate-800 focus:border-violet-500 focus:ring-violet-500"
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-400 pl-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Department (Sign Up Only) */}
            {tab === "signup" && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="text-xs font-semibold text-slate-300" htmlFor="department">
                  Department
                </label>
                <div className="relative">
                  <Building2 className="absolute top-3.5 left-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
                  <select
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-white transition-all focus:border-violet-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Product">Product</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>
            )}

            {/* Password Field with Eye/EyeOff Toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300" htmlFor="password">
                  Password
                </label>
                {tab === "login" && (
                  <span className="text-[11px] text-slate-500">
                    Demo default: <code className="text-violet-400 font-mono">password123</code>
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute top-3.5 left-3.5 h-4 w-4 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                  }}
                  className={`w-full rounded-xl border bg-slate-950/60 py-3 pl-10 pr-11 text-sm text-white placeholder-slate-500 transition-all focus:bg-slate-900 focus:outline-none focus:ring-1 ${
                    fieldErrors.password
                      ? "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/30"
                      : "border-slate-800 focus:border-violet-500 focus:ring-violet-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-3 right-3 rounded-lg p-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-400 pl-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 py-3.5 font-semibold text-sm text-white shadow-lg shadow-violet-600/25 transition-all duration-200 hover:scale-[1.01] hover:shadow-violet-600/40 active:scale-[0.99] disabled:opacity-50 cursor-pointer bg-[length:200%_auto] hover:bg-right"
            >
              {loadingRole === "submit" ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>{tab === "login" ? "Authenticating..." : "Creating Account..."}</span>
                </>
              ) : (
                <>
                  <span>{tab === "login" ? "Sign In to Workspace" : "Complete Registration"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer security note */}
          <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
            <LockKeyhole className="h-3.5 w-3.5 text-slate-600" />
            <span>End-to-end encrypted HR management workspace</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
