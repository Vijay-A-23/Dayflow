import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { HRProvider } from "./context/HRContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";

// Pages
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { EmployeeList } from "./pages/EmployeeList";
import { Profile } from "./pages/Profile";
import { Attendance } from "./pages/Attendance";
import { Leaves } from "./pages/Leaves";

// Main Layout Wrapper for Authenticated Pages
const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex flex-1 flex-col lg:pl-64">
        <Navbar onMenuToggle={() => setIsSidebarOpen(prev => !prev)} />
        
        <main className="flex-1 bg-slate-950/40 min-h-[calc(100vh-4rem)] overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <Router>
      <AuthProvider>
        <HRProvider>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes Inside Sidebar Layout */}
            <Route element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="/" element={<Dashboard />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/leaves" element={<Leaves />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Admin-only exclusive route */}
              <Route path="/employees" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <EmployeeList />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<Login />} />
          </Routes>
        </HRProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
