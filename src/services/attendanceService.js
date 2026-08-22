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
import { INITIAL_ATTENDANCE } from "../constants/mockData";
import { determineAttendanceStatus, calculateWorkHours } from "../utils/attendanceHelpers";

// Local storage helper
const getLocalAttendance = () => {
  const data = localStorage.getItem("df_attendance");
  if (!data) {
    localStorage.setItem("df_attendance", JSON.stringify(INITIAL_ATTENDANCE));
    return INITIAL_ATTENDANCE;
  }
  return JSON.parse(data);
};

const saveLocalAttendance = (records) => {
  localStorage.setItem("df_attendance", JSON.stringify(records));
};

export const attendanceService = {
  // Fetch logs for specific employee
  getPunches: async (employeeId) => {
    if (isFirebaseConfigured) {
      try {
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
      } catch (error) {
        console.error("Firestore attendance fetch error:", error);
        return [];
      }
    } else {
      const records = getLocalAttendance();
      return records
        .filter(r => r.employeeId === employeeId)
        .sort((a, b) => b.date.localeCompare(a.date));
    }
  },

  // Fetch all logs (Admin view)
  getAllPunches: async () => {
    if (isFirebaseConfigured) {
      try {
        const q = query(collection(db, "attendance"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const list = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        return list;
      } catch (error) {
        console.error("Firestore all attendance fetch error:", error);
        return [];
      }
    } else {
      return getLocalAttendance().sort((a, b) => b.date.localeCompare(a.date));
    }
  },

  // Punch In
  punchIn: async (employeeId) => {
    const today = new Date().toISOString().split("T")[0];
    const nowTime = new Date().toLocaleTimeString("en-US", { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    // Check if punch-in is after 09:30 AM for status "Late"
    const status = determineAttendanceStatus(nowTime, null, today);

    const newRecord = {
      employeeId,
      date: today,
      punchIn: nowTime,
      punchOut: "",
      totalHours: 0,
      status: status
    };

    if (isFirebaseConfigured) {
      const docRef = await addDoc(collection(db, "attendance"), newRecord);
      return { id: docRef.id, ...newRecord };
    } else {
      const records = getLocalAttendance();
      // Avoid double punch-in for same day
      const existing = records.find(r => r.employeeId === employeeId && r.date === today);
      if (existing) {
        return existing;
      }
      
      newRecord.id = `att-${Date.now()}`;
      records.push(newRecord);
      saveLocalAttendance(records);
      return newRecord;
    }
  },

  // Punch Out
  punchOut: async (employeeId, recordId) => {
    const nowTime = new Date().toLocaleTimeString("en-US", { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    if (isFirebaseConfigured) {
      const docRef = doc(db, "attendance", recordId);
      
      // We need to fetch the document to calculate the total hours
      const snapshot = await getDocs(query(collection(db, "attendance")));
      let punchInTime = "09:00";
      let punchDate = new Date().toISOString().split("T")[0];
      snapshot.forEach((doc) => {
        if (doc.id === recordId) {
          punchInTime = doc.data().punchIn;
          punchDate = doc.data().date;
        }
      });
      
      const totalHours = calculateWorkHours(punchInTime, nowTime, punchDate);
      const finalStatus = determineAttendanceStatus(punchInTime, totalHours, punchDate);
      const updates = {
        punchOut: nowTime,
        totalHours: totalHours,
        status: finalStatus
      };
      
      await updateDoc(docRef, updates);
      return { id: recordId, punchOut: nowTime, totalHours, status: finalStatus };
    } else {
      const records = getLocalAttendance();
      const idx = records.findIndex(r => r.id === recordId);
      
      if (idx !== -1) {
        const record = records[idx];
        const totalHours = calculateWorkHours(record.punchIn, nowTime, record.date);
        const finalStatus = determineAttendanceStatus(record.punchIn, totalHours, record.date);
        
        record.punchOut = nowTime;
        record.totalHours = totalHours;
        record.status = finalStatus;
        
        records[idx] = record;
        saveLocalAttendance(records);
        return record;
      }
      throw new Error("Attendance record not found");
    }
  }
};
