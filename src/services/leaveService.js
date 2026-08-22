import { db } from "./firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  orderBy,
  serverTimestamp
} from "firebase/firestore";

export const leaveService = {
  // Get leaves for a specific employee
  getLeaves: async (employeeId) => {
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
  },

  // Get all leaves (Admin view)
  getAllLeaves: async () => {
    const q = query(collection(db, "leaves"), orderBy("appliedDate", "desc"));
    const querySnapshot = await getDocs(q);
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
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
      userId: employeeId,
      employeeName,
      userName: employeeName,
      userEmail: request.userEmail || "",
      leaveType: request.type,
      type: request.type,
      startDate: request.startDate,
      endDate: request.endDate,
      days: diffDays,
      reason: request.reason,
      status: "Pending",
      appliedDate: today,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "leaves"), newRequest);
    return { id: docRef.id, ...newRequest };
  },

  // Approve/Reject leave
  updateLeaveStatus: async (leaveId, status, adminRemarks = "") => {
    const docRef = doc(db, "leaves", leaveId);
    await updateDoc(docRef, { status, adminRemarks });
    return { id: leaveId, status, adminRemarks };
  }
};
