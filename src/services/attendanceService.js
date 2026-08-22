import { db } from "./firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  doc, 
  orderBy 
} from "firebase/firestore";
import { determineAttendanceStatus, calculateWorkHours } from "../utils/attendanceHelpers";

export const attendanceService = {
  // Fetch logs for specific employee
  getPunches: async (employeeId) => {
    const q = query(
      collection(db, "attendance"),
      where("employeeId", "==", employeeId),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  },

  // Fetch all logs (Admin view)
  getAllPunches: async () => {
    const q = query(collection(db, "attendance"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  },

  // Punch In
  punchIn: async (employeeId, employeeName = "") => {
    const today = new Date().toISOString().split("T")[0];
    const nowTime = new Date().toLocaleTimeString("en-US", { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    // Check if punch-in is after 09:30 AM for status "Late"
    const status = determineAttendanceStatus(nowTime, null, today);

    const newRecord = {
      employeeId,
      userId: employeeId,
      employeeName,
      userName: employeeName,
      date: today,
      punchIn: nowTime,
      checkIn: nowTime,
      punchOut: "",
      checkOut: "",
      totalHours: 0,
      status: status
    };

    const docRef = await addDoc(collection(db, "attendance"), newRecord);
    return { id: docRef.id, ...newRecord };
  },

  // Punch Out
  punchOut: async (employeeId, recordId) => {
    const nowTime = new Date().toLocaleTimeString("en-US", { hour12: false, hour: '2-digit', minute: '2-digit' });
    const docRef = doc(db, "attendance", recordId);
    const docSnap = await getDoc(docRef);
    
    let punchInTime = "09:00";
    let punchDate = new Date().toISOString().split("T")[0];
    
    if (docSnap.exists()) {
      punchInTime = docSnap.data().punchIn || docSnap.data().checkIn || "09:00";
      punchDate = docSnap.data().date;
    }
    
    const totalHours = calculateWorkHours(punchInTime, nowTime, punchDate);
    const finalStatus = determineAttendanceStatus(punchInTime, totalHours, punchDate);
    const updates = {
      punchOut: nowTime,
      checkOut: nowTime,
      totalHours: totalHours,
      status: finalStatus
    };
    
    await updateDoc(docRef, updates);
    return { id: recordId, punchOut: nowTime, checkOut: nowTime, totalHours, status: finalStatus };
  }
};
