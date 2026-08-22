import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sparkles } from "lucide-react";

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, isLoading, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  const isAuthLoading = isLoading ?? loading ?? false;
  const isUserAuthenticated = isAuthenticated || Boolean(currentUser);

  // During session hydration or Firebase auth check, render a smooth skeleton/spinner
  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-slate-100 selection:bg-violet-500 selection:text-white">
        <div className="relative flex flex-col items-center">
          {/* Animated pulsing glow */}
          <div className="absolute -inset-4 rounded-full bg-violet-600/20 blur-xl animate-pulse" />
          
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-xl shadow-violet-500/25 mb-4">
            <Sparkles className="h-7 w-7 text-white animate-spin" style={{ animationDuration: "3s" }} />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            <span className="text-sm font-medium text-slate-300">
              Restoring Dayflow session...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in -> Redirect to login page preserving the attempted URL
  if (!isUserAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check: If current user's role is not authorized for this route -> fallback to home
  if (allowedRoles && allowedRoles.length > 0) {
    const role = userRole || currentUser?.role || "employee";
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
