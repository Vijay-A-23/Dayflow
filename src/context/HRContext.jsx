import React, { createContext, useContext, useState, useEffect } from "react";
import { profileService } from "../services/profileService";
import { leaveService } from "../services/leaveService";
import { attendanceService } from "../services/attendanceService";
import { useAuth } from "./AuthContext";
import { db } from "../services/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { seedDatabase } from "../services/dbSeeder";

const HRContext = createContext(null);

export const useHR = () => {
  const context = useContext(HRContext);
  if (!context) {
    throw new Error("useHR must be used within an HRProvider");
  }
  return context;
};

export const HRProvider = ({ children }) => {
  const { currentUser, userRole, userProfile, updateProfileDetails } = useAuth();
  
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAndSeed = async () => {
      try {
        const { getDocs, collection: getFirestoreCollection } = await import("firebase/firestore");
        const { db: firestoreDb } = await import("../services/firebase");
        const snap = await getDocs(getFirestoreCollection(firestoreDb, "users"));
        const hasOldSeed = snap.docs.some(d => d.id === "sarah_uid" || d.id === "david_uid" || d.id === "priya_uid" || d.id === "employee_uid" || d.data().name === "Sarah Jenkins" || d.data().name === "Alex Morgan");
        if (snap.empty || hasOldSeed) {
          console.log("Forcing fresh database seed for Indian staff roster...");
          await seedDatabase(true);
        }
      } catch (err) {
        console.error("Startup seeding check failed:", err);
      }
    };
    checkAndSeed();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setEmployees([]);
      setLeaves([]);
      setAttendance([]);
      return;
    }

    setLoading(true);

    // 1. Live Employees Sync
    const unsubscribeEmployees = onSnapshot(collection(db, "users"), (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setEmployees(list);
      setLoading(false);
    }, (err) => {
      console.error("Employees sync failed:", err);
      setLoading(false);
    });

    // 2. Live Leaves Sync
    const unsubscribeLeaves = onSnapshot(collection(db, "leaves"), (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      list.sort((a, b) => (b.appliedDate || "").localeCompare(a.appliedDate || ""));
      setLeaves(list);
    }, (err) => {
      console.error("Leaves sync failed:", err);
    });

    // 3. Live Attendance Sync
    const unsubscribeAttendance = onSnapshot(collection(db, "attendance"), (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      list.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      setAttendance(list);
    }, (err) => {
      console.error("Attendance sync failed:", err);
    });

    return () => {
      unsubscribeEmployees();
      unsubscribeLeaves();
      unsubscribeAttendance();
    };
  }, [currentUser]);

  // Submit a leave request
  const applyLeave = async (request) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      return await leaveService.applyLeave(
        currentUser.uid, 
        userProfile?.name || currentUser.displayName || ((userProfile?.role || userRole) === "admin" ? "Kavitha Sundaram" : "Karthik Subramanian"), 
        {
          ...request,
          userEmail: currentUser.email || ""
        }
      );
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
      return await leaveService.updateLeaveStatus(leaveId, "Approved");
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
      return await leaveService.updateLeaveStatus(leaveId, "Rejected");
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
      return await attendanceService.punchIn(currentUser.uid, userProfile?.name || currentUser.displayName || ((userProfile?.role || userRole) === "admin" ? "Kavitha Sundaram" : "Karthik Subramanian"));
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
      return await attendanceService.punchOut(currentUser.uid, recordId);
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
      return await profileService.addEmployee(employeeData);
    } catch (error) {
      console.error("Error adding employee:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete Employee (Admin only)
  const deleteEmployee = async (employeeId) => {
    if (userRole !== "admin") return;
    setLoading(true);
    try {
      return await profileService.deleteEmployee(employeeId);
    } catch (error) {
      console.error("Error deleting employee:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update Employee (Admin or self)
  const updateEmployee = async (id, updatedData) => {
    if (userRole !== "admin" && id !== currentUser?.uid) return;
    setLoading(true);
    try {
      if (id === currentUser?.uid) {
        return await updateProfileDetails(updatedData);
      } else {
        return await profileService.updateProfile(id, updatedData);
      }
    } catch (error) {
      console.error("Error updating employee profile:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Seed demo data (Admin only)
  const seedDemoData = async () => {
    if (userRole !== "admin") return;
    setLoading(true);
    try {
      await seedDatabase(true);
      console.log("Firestore successfully seeded.");
    } catch (error) {
      console.error("Database seeding failed:", error);
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
      applyLeave,
      approveLeave,
      rejectLeave,
      punchIn,
      punchOut,
      addEmployee,
      deleteEmployee,
      updateEmployee,
      seedDemoData
    }}>
      {children}
    </HRContext.Provider>
  );
};

export default HRContext;
