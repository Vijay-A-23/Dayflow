import { auth, db, isFirebaseConfigured } from "./firebase";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { INITIAL_EMPLOYEES } from "../constants/mockData";

// Local storage helpers for mock mode
const getMockEmployees = () => {
  const data = localStorage.getItem("df_employees");
  if (!data) {
    localStorage.setItem("df_employees", JSON.stringify(INITIAL_EMPLOYEES));
    return INITIAL_EMPLOYEES;
  }
  return JSON.parse(data);
};

export const authService = {
  login: async (email, password) => {
    if (isFirebaseConfigured) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Fetch user role from Firestore
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userSnap = await getDoc(userDocRef);
      
      if (userSnap.exists()) {
        return {
          user: userCredential.user,
          profile: userSnap.data()
        };
      } else {
        // Fallback or default profile if none exists
        const defaultProfile = {
          id: userCredential.user.uid,
          name: userCredential.user.displayName || email.split('@')[0],
          email: email,
          role: "employee", // Default role
          department: "Engineering",
          status: "Active"
        };
        await setDoc(userDocRef, defaultProfile);
        return {
          user: userCredential.user,
          profile: defaultProfile
        };
      }
    } else {
      // Mock login validation
      const employees = getMockEmployees();
      const employee = employees.find(
        emp => emp.email.toLowerCase() === email.toLowerCase()
      );
      
      if (!employee) {
        throw new Error("auth/user-not-found");
      }
      
      // For mock simplicity, match password as email prefix + '123' (e.g. admin123, employee123)
      const expectedPassword = email.split('@')[0] + "123";
      if (password !== expectedPassword && password !== "password123") {
        throw new Error("auth/wrong-password");
      }
      
      return {
        user: {
          uid: employee.id,
          email: employee.email,
          displayName: employee.name,
        },
        profile: employee
      };
    }
  },

  logout: async () => {
    if (isFirebaseConfigured) {
      await signOut(auth);
    }
    return true;
  },

  signup: async (email, password, displayName, role = "employee", department = "Engineering") => {
    if (isFirebaseConfigured) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      
      const newProfile = {
        id: userCredential.user.uid,
        name: displayName,
        email: email,
        role: role,
        department: department,
        status: "Active",
        joinDate: new Date().toISOString().split('T')[0],
        phone: ""
      };
      
      await setDoc(doc(db, "users", userCredential.user.uid), newProfile);
      return {
        user: userCredential.user,
        profile: newProfile
      };
    } else {
      // Mock Signup
      const employees = getMockEmployees();
      if (employees.some(emp => emp.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("auth/email-already-in-use");
      }

      const newId = `emp-${Date.now()}`;
      const newProfile = {
        id: newId,
        name: displayName,
        email: email,
        role: role,
        department: department,
        status: "Active",
        joinDate: new Date().toISOString().split('T')[0],
        phone: "",
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`
      };

      employees.push(newProfile);
      localStorage.setItem("df_employees", JSON.stringify(employees));

      return {
        user: {
          uid: newId,
          email: email,
          displayName: displayName
        },
        profile: newProfile
      };
    }
  }
};
