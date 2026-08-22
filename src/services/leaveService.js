import { db, isFirebaseConfigured } from "./firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  orderBy 
} from "firebase/firestore";
import { INITIAL_LEAVES } from "../constants/mockData";

// Local storage helper
const getLocalLeaves = () => {
  const data = localStorage.getItem("df_leaves");
  if (!data) {
    localStorage.setItem("df_leaves", JSON.stringify(INITIAL_LEAVES));
    return INITIAL_LEAVES;
  }
  return JSON.parse(data);
};

const saveLocalLeaves = (records) => {
  localStorage.setItem("df_leaves", JSON.stringify(records));
};

export const leaveService = {
  // Get leaves for a specific employee
  getLeaves: async (employeeId) => {
    if (isFirebaseConfigured) {
      try {
        const q = query(
          collection(db, "leaves"),
          where("employeeId", "==", employeeId),
          orderBy("appliedDate", "desc")
        );
        const querySnapshot = await getDocs(q);
        const list = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        return list;
      } catch (error) {
        console.error("Firestore leaves fetch error:", error);
        return [];
      }
    } else {
      const leaves = getLocalLeaves();
      return leaves
        .filter(l => l.employeeId === employeeId)
        .sort((a, b) => b.appliedDate.localeCompare(a.appliedDate));
    }
  },

  // Get all leaves (Admin view)
  getAllLeaves: async () => {
    if (isFirebaseConfigured) {
      try {
        const q = query(collection(db, "leaves"), orderBy("appliedDate", "desc"));
        const querySnapshot = await getDocs(q);
        const list = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        return list;
      } catch (error) {
        console.error("Firestore all leaves fetch error:", error);
        return [];
      }
    } else {
      return getLocalLeaves().sort((a, b) => b.appliedDate.localeCompare(a.appliedDate));
    }
  },

  // Submit leave request
  applyLeave: async (employeeId, employeeName, request) => {
    const today = new Date().toISOString().split("T")[0];
    
    // Calculate difference in days
    const start = new Date(request.startDate);
    const end = new Date(request.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive

    const newRequest = {
      employeeId,
      employeeName,
      type: request.type,
      startDate: request.startDate,
      endDate: request.endDate,
      days: diffDays,
      reason: request.reason,
      status: "Pending",
      appliedDate: today
    };

    if (isFirebaseConfigured) {
      const docRef = await addDoc(collection(db, "leaves"), newRequest);
      return { id: docRef.id, ...newRequest };
    } else {
      const leaves = getLocalLeaves();
      newRequest.id = `lv-${Date.now()}`;
      leaves.push(newRequest);
      saveLocalLeaves(leaves);
      return newRequest;
    }
  },

  // Approve/Reject leave
  updateLeaveStatus: async (leaveId, status) => {
    if (isFirebaseConfigured) {
      const docRef = doc(db, "leaves", leaveId);
      await updateDoc(docRef, { status });
      return { id: leaveId, status };
    } else {
      const leaves = getLocalLeaves();
      const idx = leaves.findIndex(l => l.id === leaveId);
      
      if (idx !== -1) {
        leaves[idx].status = status;
        saveLocalLeaves(leaves);
        return leaves[idx];
      }
      throw new Error("Leave record not found");
    }
  }
};
