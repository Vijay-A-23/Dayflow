import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { profileService } from "../services/profileService";
import { leaveService } from "../services/leaveService";
import { attendanceService } from "../services/attendanceService";
import { useAuth } from "./AuthContext";

const HRContext = createContext(null);

export const useHR = () => {
  const context = useContext(HRContext);
  if (!context) {
    throw new Error("useHR must be used within an HRProvider");
  }
  return context;
};

export const HRProvider = ({ children }) => {
  const { currentUser, userRole } = useAuth();
  
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load all data (role-based)
  const refreshData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      if (userRole === "admin") {
        // Admins see everything
        const [empList, leaveList, attList] = await Promise.all([
          profileService.getEmployees(),
          leaveService.getAllLeaves(),
          attendanceService.getAllPunches()
        ]);
        setEmployees(empList);
        setLeaves(leaveList);
        setAttendance(attList);
      } else {
        // Employees see their own items plus employee list (for display/profile checks)
        const [leaveList, attList] = await Promise.all([
          leaveService.getLeaves(currentUser.uid),
          attendanceService.getPunches(currentUser.uid)
        ]);
        setLeaves(leaveList);
        setAttendance(attList);
      }
    } catch (error) {
      console.error("Error refreshing HR data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, userRole]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Submit a leave request
  const applyLeave = async (request) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const newLeave = await leaveService.applyLeave(
        currentUser.uid, 
        currentUser.displayName || "Employee", 
        request
      );
      setLeaves(prev => [newLeave, ...prev]);
      return newLeave;
    } catch (error) {
      console.error("Error applying leave:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Admin approval of leaves
  const approveLeave = async (leaveId) => {
    if (userRole !== "admin") return;
    setLoading(true);
    try {
      const updated = await leaveService.updateLeaveStatus(leaveId, "Approved");
      setLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, status: "Approved" } : l));
      return updated;
    } catch (error) {
      console.error("Error approving leave:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const rejectLeave = async (leaveId) => {
    if (userRole !== "admin") return;
    setLoading(true);
    try {
      const updated = await leaveService.updateLeaveStatus(leaveId, "Rejected");
      setLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, status: "Rejected" } : l));
      return updated;
    } catch (error) {
      console.error("Error rejecting leave:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Punch Operations
  const punchIn = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const record = await attendanceService.punchIn(currentUser.uid);
      setAttendance(prev => [record, ...prev]);
      return record;
    } catch (error) {
      console.error("Punch In failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const punchOut = async (recordId) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const record = await attendanceService.punchOut(currentUser.uid, recordId);
      setAttendance(prev => prev.map(r => r.id === recordId ? record : r));
      return record;
    } catch (error) {
      console.error("Punch Out failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register Employee (Admin only)
  const addEmployee = async (employeeData) => {
    if (userRole !== "admin") return;
    setLoading(true);
    try {
      // For mock simplicity, we can auto-register user via Auth (mock)
      const mockEmail = employeeData.email;
      const mockPassword = mockEmail.split("@")[0] + "123";
      
      // Call auth signup directly to register them in list
      const result = await authService.signup(
        mockEmail,
        mockPassword,
        employeeData.name,
        employeeData.role || "employee",
        employeeData.department || "Engineering"
      );

      // Now set details like phone and position in profile
      const updatedProfile = await profileService.updateProfile(result.profile.id, {
        position: employeeData.position || "Staff Engineer",
        phone: employeeData.phone || "",
        status: employeeData.status || "Active",
      });

      setEmployees(prev => [...prev.filter(e => e.id !== updatedProfile.id), updatedProfile]);
      return updatedProfile;
    } catch (error) {
      console.error("Error adding employee:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <HRContext.Provider value={{
      employees,
      leaves,
      attendance,
      loading,
      refreshData,
      applyLeave,
      approveLeave,
      rejectLeave,
      punchIn,
      punchOut,
      addEmployee
    }}>
      {children}
    </HRContext.Provider>
  );
};
