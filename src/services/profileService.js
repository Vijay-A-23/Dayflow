import { db, isFirebaseConfigured } from "./firebase";
import { 
  collection, 
  getDocs, 
  getDoc,
  updateDoc, 
  doc, 
  setDoc,
  deleteDoc
} from "firebase/firestore";
import { INITIAL_EMPLOYEES } from "../constants/mockData";

// Local storage helper
const getLocalEmployees = () => {
  const data = localStorage.getItem("df_employees");
  if (!data) {
    localStorage.setItem("df_employees", JSON.stringify(INITIAL_EMPLOYEES));
    return INITIAL_EMPLOYEES;
  }
  return JSON.parse(data);
};

const saveLocalEmployees = (records) => {
  localStorage.setItem("df_employees", JSON.stringify(records));
};

export const profileService = {
  // Get profile of single employee
  getProfile: async (employeeId) => {
    if (isFirebaseConfigured) {
      try {
        const docRef = doc(db, "users", employeeId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data();
        }
        return null;
      } catch (error) {
        console.error("Firestore user profile fetch error:", error);
        return null;
      }
    } else {
      const list = getLocalEmployees();
      return list.find(emp => emp.id === employeeId) || null;
    }
  },

  // Update profile
  updateProfile: async (employeeId, data) => {
    if (isFirebaseConfigured) {
      const docRef = doc(db, "users", employeeId);
      await updateDoc(docRef, data);
      return { id: employeeId, ...data };
    } else {
      const list = getLocalEmployees();
      const idx = list.findIndex(emp => emp.id === employeeId);
      
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data };
        saveLocalEmployees(list);
        return list[idx];
      }
      throw new Error("Employee profile not found");
    }
  },

  // Get list of all employees (Directory / admin views)
  getEmployees: async () => {
    if (isFirebaseConfigured) {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const list = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        return list;
      } catch (error) {
        console.error("Firestore user directory fetch error:", error);
        return [];
      }
    } else {
      return getLocalEmployees();
    }
  },

  // Add new employee (Admin operation)
  addEmployee: async (employee) => {
    const newRecord = {
      name: employee.name,
      email: employee.email,
      role: employee.role || "employee",
      department: employee.department || "Engineering",
      position: employee.position || "Staff Engineer",
      joinDate: employee.joinDate || new Date().toISOString().split("T")[0],
      status: employee.status || "Active",
      phone: employee.phone || "",
      avatar: employee.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`
    };

    if (isFirebaseConfigured) {
      // In a real app we might create auth credentials, but here we can just create a document for the roster
      const docId = `emp-${Date.now()}`;
      newRecord.id = docId;
      await setDoc(doc(db, "users", docId), newRecord);
      return newRecord;
    } else {
      const list = getLocalEmployees();
      newRecord.id = `emp-${Date.now()}`;
      list.push(newRecord);
      saveLocalEmployees(list);
      return newRecord;
    }
  },

  // Delete employee (Admin operation)
  deleteEmployee: async (employeeId) => {
    if (isFirebaseConfigured) {
      const docRef = doc(db, "users", employeeId);
      await deleteDoc(docRef);
      return true;
    } else {
      const list = getLocalEmployees();
      const filtered = list.filter(emp => emp.id !== employeeId);
      saveLocalEmployees(filtered);
      return true;
    }
  }
};
