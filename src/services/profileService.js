import { db } from "./firebase.js";
import { 
  collection, 
  getDocs, 
  getDoc,
  updateDoc, 
  doc, 
  setDoc,
  deleteDoc
} from "firebase/firestore";

export const profileService = {
  // Get profile of single employee
  getProfile: async (employeeId) => {
    const docRef = doc(db, "users", employeeId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  },

  // Update profile
  updateProfile: async (employeeId, data) => {
    const docRef = doc(db, "users", employeeId);
    
    // Fetch current document first to merge nested details correctly
    const docSnap = await getDoc(docRef);
    let existing = {};
    if (docSnap.exists()) {
      existing = docSnap.data();
    }
    
    const jobDetails = {
      department: data.department !== undefined ? data.department : (existing.jobDetails?.department || existing.department || "Engineering"),
      position: data.position !== undefined ? data.position : (existing.jobDetails?.position || existing.position || "Staff Member"),
      manager: data.manager !== undefined ? data.manager : (existing.jobDetails?.manager || ""),
      employmentType: data.employmentType !== undefined ? data.employmentType : (existing.jobDetails?.employmentType || "Full-time"),
      workLocation: data.workLocation !== undefined ? data.workLocation : (existing.jobDetails?.workLocation || "HQ - Office")
    };
    
    const personalDetails = {
      personalEmail: data.personalEmail !== undefined ? data.personalEmail : (existing.personalDetails?.personalEmail || existing.email || ""),
      phone: data.phone !== undefined ? data.phone : (existing.personalDetails?.phone || existing.phone || ""),
      emergencyContact: data.emergencyContact !== undefined ? data.emergencyContact : (existing.personalDetails?.emergencyContact || ""),
      address: data.address !== undefined ? data.address : (existing.personalDetails?.address || ""),
      dob: data.dob !== undefined ? data.dob : (existing.personalDetails?.dob || "")
    };

    const salaryDetails = {
      baseSalary: data.salary !== undefined ? data.salary : (existing.salaryDetails?.baseSalary || existing.salary || ""),
      bankName: data.bankName !== undefined ? data.bankName : (existing.salaryDetails?.bankName || ""),
      accountNumber: data.bankAccount !== undefined ? data.bankAccount : (existing.salaryDetails?.accountNumber || ""),
      ifscCode: data.ifscCode !== undefined ? data.ifscCode : (existing.salaryDetails?.ifscCode || ""),
      taxId: data.taxId !== undefined ? data.taxId : (existing.salaryDetails?.taxId || "")
    };
    
    const mergedData = {
      ...data,
      jobDetails,
      personalDetails,
      salaryDetails
    };
    
    await updateDoc(docRef, mergedData);
    return { id: employeeId, ...mergedData };
  },

  // Get list of all employees (Directory / admin views)
  getEmployees: async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  },

  // Add new employee (Admin operation)
  addEmployee: async (employee) => {
    const docId = employee.id || `emp-${Date.now()}`;
    
    const { generateCustomEmployeeId } = await import("../utils/employeeIdGenerator.js");
    const { db: firestoreDb } = await import("./firebase.js");
    const { collection, getDocs } = await import("firebase/firestore");
    
    let count = 0;
    try {
      const snap = await getDocs(collection(firestoreDb, "users"));
      count = snap.size;
    } catch (e) {
      console.error(e);
    }
    const generatedId = employee.employeeId || generateCustomEmployeeId(employee.name, employee.joinDate || new Date().getFullYear(), count + 1);

    const newRecord = {
      id: docId,
      uid: docId,
      employeeId: generatedId,
      name: employee.name,
      email: employee.email,
      role: employee.role || "employee",
      department: employee.department || "Engineering",
      position: employee.position || "Staff Engineer",
      joinDate: employee.joinDate || new Date().toISOString().split("T")[0],
      status: employee.status || "Active",
      phone: employee.phone || "",
      salary: employee.salary || "",
      avatar: employee.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`,
      jobDetails: {
        department: employee.department || "Engineering",
        position: employee.position || "Staff Engineer",
        manager: "",
        employmentType: "Full-time",
        workLocation: "HQ - Office"
      },
      personalDetails: {
        personalEmail: employee.email,
        phone: employee.phone || "",
        emergencyContact: "",
        address: "",
        dob: ""
      },
      salaryDetails: {
        baseSalary: employee.salary || "",
        bankName: employee.bankName || "",
        accountNumber: employee.bankAccount || "",
        ifscCode: employee.ifscCode || "",
        taxId: employee.taxId || ""
      },
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, "users", docId), newRecord);
    return newRecord;
  },

  // Delete employee (Admin operation)
  deleteEmployee: async (employeeId) => {
    const docRef = doc(db, "users", employeeId);
    await deleteDoc(docRef);
    return true;
  }
};
