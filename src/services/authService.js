import { auth, db, isFirebaseConfigured } from "./firebase.js";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { INITIAL_EMPLOYEES, DEMO_USERS } from "../constants/mockData.js";

// Local storage helpers for mock mode
const getMockEmployees = () => {
  const data = localStorage.getItem("df_employees");
  if (!data) {
    localStorage.setItem("df_employees", JSON.stringify(INITIAL_EMPLOYEES));
    return INITIAL_EMPLOYEES;
  }
  try {
    return JSON.parse(data);
  } catch {
    localStorage.setItem("df_employees", JSON.stringify(INITIAL_EMPLOYEES));
    return INITIAL_EMPLOYEES;
  }
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
          status: "Active",
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`
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
      const normalizedEmail = (email || "").trim().toLowerCase();
      
      let employee = employees.find(
        emp => emp.email.toLowerCase() === normalizedEmail
      );
      
      // Check demo aliases if not directly matched by email
      if (!employee) {
        if (
          normalizedEmail === "admin" || 
          normalizedEmail === "admin@dayflow.internal" || 
          normalizedEmail === "admin@dayflow.com"
        ) {
          employee = DEMO_USERS?.admin || employees.find(e => e.role === "admin");
        } else if (
          normalizedEmail === "employee" || 
          normalizedEmail === "alex.morgan@dayflow.internal" || 
          normalizedEmail === "alex.morgan@dayflow.com" || 
          normalizedEmail === "employee@dayflow.com"
        ) {
          employee = DEMO_USERS?.employee || employees.find(e => e.role === "employee");
        }
      }
      
      if (!employee) {
        throw new Error("auth/user-not-found");
      }
      
      // Allow standard demo passwords or prefix123
      const emailPrefix = employee.email.split('@')[0];
      const validPasswords = [
        "password",
        "password123",
        `${emailPrefix}123`,
        "admin123",
        "employee123",
        "alex123",
        "123456"
      ];
      
      const isPasswordValid = 
        validPasswords.includes(password) || 
        password === `${emailPrefix}123` ||
        (employee.password && employee.password === password);

      if (!isPasswordValid) {
        throw new Error("auth/wrong-password");
      }
      
      return {
        user: {
          uid: employee.id,
          email: employee.email,
          displayName: employee.name,
          role: employee.role
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
        phone: "",
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`
      };
      
      await setDoc(doc(db, "users", userCredential.user.uid), newProfile);
      return {
        user: userCredential.user,
        profile: newProfile
      };
    } else {
      // Mock Signup
      const employees = getMockEmployees();
      if (employees.some(emp => emp.email.toLowerCase() === (email || "").trim().toLowerCase())) {
        throw new Error("auth/email-already-in-use");
      }

      const newId = `emp-${Date.now()}`;
      const newProfile = {
        id: newId,
        name: displayName || email.split("@")[0],
        email: email,
        role: role || "employee",
        department: department || "Engineering",
        position: "Staff Member",
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
          displayName: newProfile.name,
          role: newProfile.role
        },
        profile: newProfile
      };
    }
  }
};
