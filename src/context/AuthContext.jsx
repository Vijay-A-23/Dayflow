import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { auth, isFirebaseConfigured, db } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { authService } from "../services/authService";
import { profileService } from "../services/profileService";
import { DEMO_USERS, INITIAL_EMPLOYEES } from "../constants/mockData";

export const AUTH_STORAGE_KEY = "dayflow_auth_user";
const LEGACY_STORAGE_KEY = "df_current_user";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Safe helper to read and hydrate initial state from localStorage
const getStoredSession = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed) return null;

    // Support both standard { user, profile, role } and legacy shapes
    const profile = parsed.profile || parsed.user || null;
    const user = parsed.user || (profile ? {
      uid: profile.id || profile.uid,
      email: profile.email,
      displayName: profile.name || profile.displayName || profile.email?.split("@")[0],
      role: profile.role || parsed.role || "employee"
    } : null);

    const role = parsed.role || profile?.role || user?.role || "employee";

    if (user && profile) {
      // Ensure active under standard key
      if (!localStorage.getItem(AUTH_STORAGE_KEY)) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, profile, role }));
      }
      return { user, profile, role };
    }
  } catch (error) {
    console.error("Failed to parse stored auth session:", error);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // ignore storage clear errors
    }
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  // Synchronous initialization prevents flash of unauthenticated state
  const initialSession = getStoredSession();

  const [currentUser, setCurrentUser] = useState(initialSession ? initialSession.user : null);
  const [userRole, setUserRole] = useState(initialSession ? initialSession.role : null); // 'admin' | 'employee'
  const [userProfile, setUserProfile] = useState(initialSession ? initialSession.profile : null);
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured ? true : false);
  const [error, setError] = useState(null);

  // Sync auth state with Firebase when configured
  useEffect(() => {
    if (!isFirebaseConfigured) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          let role = "employee";
          let profile = null;

          if (docSnap.exists()) {
            profile = docSnap.data();
            role = profile.role || "employee";
          } else {
            profile = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
              email: firebaseUser.email,
              role: "employee",
              department: "Engineering",
              status: "Active",
              avatar: firebaseUser.photoURL || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`
            };
          }

          const userObj = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || profile.name,
            role: role
          };

          setCurrentUser(userObj);
          setUserRole(role);
          setUserProfile(profile);

          const session = { user: userObj, profile, role };
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
          localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(session));
        } catch (err) {
          console.error("Error fetching user profile on auth state change:", err);
          const fallbackUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
            role: "employee"
          };
          setCurrentUser(fallbackUser);
          setUserRole("employee");
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserProfile(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Standard Login
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.login(email, password);
      
      const role = result.profile?.role || result.user?.role || "employee";
      const user = {
        uid: result.user.uid || result.profile.id,
        email: result.user.email || result.profile.email,
        displayName: result.user.displayName || result.profile.name,
        role: role
      };
      const profile = result.profile;

      const session = { user, profile, role };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(session));

      setCurrentUser(user);
      setUserRole(role);
      setUserProfile(profile);

      return result;
    } catch (err) {
      const errMsg = err.message || "Failed to log in";
      setError(errMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Login as a pre-configured demo user (Admin or Employee)
  const quickLogin = async (targetRole = "employee") => {
    setIsLoading(true);
    setError(null);
    try {
      const normalizedRole = targetRole.toLowerCase() === "admin" ? "admin" : "employee";
      
      // Fetch demo template from DEMO_USERS or INITIAL_EMPLOYEES
      let demoUser = DEMO_USERS?.[normalizedRole];
      if (!demoUser) {
        demoUser = INITIAL_EMPLOYEES.find(e => e.role === normalizedRole) || {
          id: normalizedRole === "admin" ? "emp-01" : "emp-02",
          name: normalizedRole === "admin" ? "Eleanor Vance" : "Alex Morgan",
          email: normalizedRole === "admin" ? "admin@dayflow.internal" : "alex.morgan@dayflow.internal",
          role: normalizedRole,
          department: normalizedRole === "admin" ? "Human Resources" : "Engineering",
          position: normalizedRole === "admin" ? "HR Director" : "Senior Frontend Engineer",
          status: "Active",
          phone: normalizedRole === "admin" ? "+1 (555) 019-2834" : "+1 (555) 014-9988",
          avatar: normalizedRole === "admin"
            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
            : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
        };
      }

      // Check if employee exists in localStorage df_employees
      try {
        const rawEmps = localStorage.getItem("df_employees");
        let emps = rawEmps ? JSON.parse(rawEmps) : [...INITIAL_EMPLOYEES];
        const existingIdx = emps.findIndex(e => e.id === demoUser.id || e.email.toLowerCase() === demoUser.email.toLowerCase());
        if (existingIdx === -1) {
          emps.push(demoUser);
          localStorage.setItem("df_employees", JSON.stringify(emps));
        } else {
          // Merge with stored record to respect any existing changes
          demoUser = { ...demoUser, ...emps[existingIdx], role: normalizedRole };
        }
      } catch (err) {
        console.warn("Could not sync mock employee roster:", err);
      }

      const userObj = {
        uid: demoUser.id,
        email: demoUser.email,
        displayName: demoUser.name,
        role: normalizedRole
      };
      const profileObj = { ...demoUser, role: normalizedRole };

      const session = {
        user: userObj,
        profile: profileObj,
        role: normalizedRole
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(session));

      setCurrentUser(userObj);
      setUserRole(normalizedRole);
      setUserProfile(profileObj);

      return session;
    } catch (err) {
      const errMsg = err.message || "Quick login failed";
      setError(errMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Switch role on-the-fly without wiping session data
  const switchRole = (targetRole) => {
    const normalizedRole = targetRole?.toLowerCase() === "admin" ? "admin" : "employee";
    
    if (!currentUser || !userProfile) {
      return quickLogin(normalizedRole);
    }

    const updatedUser = {
      ...currentUser,
      role: normalizedRole
    };

    const updatedProfile = {
      ...userProfile,
      role: normalizedRole
    };

    const session = {
      user: updatedUser,
      profile: updatedProfile,
      role: normalizedRole
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(session));

    // Update role in mock directory if present
    try {
      const rawEmps = localStorage.getItem("df_employees");
      if (rawEmps) {
        const emps = JSON.parse(rawEmps);
        const idx = emps.findIndex(e => e.id === updatedProfile.id);
        if (idx !== -1) {
          emps[idx] = { ...emps[idx], role: normalizedRole };
          localStorage.setItem("df_employees", JSON.stringify(emps));
        }
      }
    } catch (err) {
      console.warn("Error updating mock directory role:", err);
    }

    setCurrentUser(updatedUser);
    setUserRole(normalizedRole);
    setUserProfile(updatedProfile);

    return session;
  };

  // Logout method
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      setCurrentUser(null);
      setUserRole(null);
      setUserProfile(null);
      setError(null);
      setIsLoading(false);
    }
  };

  // Signup method (polymorphic for object or positional arguments)
  const signup = async (userDataOrEmail, password, displayName, role = "employee", department = "Engineering") => {
    setIsLoading(true);
    setError(null);

    try {
      let emailVal, passVal, nameVal, roleVal, deptVal, extraFields = {};

      if (typeof userDataOrEmail === "object" && userDataOrEmail !== null) {
        emailVal = userDataOrEmail.email;
        passVal = userDataOrEmail.password || "password123";
        nameVal = userDataOrEmail.displayName || userDataOrEmail.name || emailVal?.split("@")[0];
        roleVal = userDataOrEmail.role || "employee";
        deptVal = userDataOrEmail.department || "Engineering";
        extraFields = userDataOrEmail;
      } else {
        emailVal = userDataOrEmail;
        passVal = password || "password123";
        nameVal = displayName || emailVal?.split("@")[0];
        roleVal = role || "employee";
        deptVal = department || "Engineering";
      }

      const result = await authService.signup(emailVal, passVal, nameVal, roleVal, deptVal);
      
      const newProfile = { ...result.profile, ...extraFields, role: roleVal };
      const newUser = {
        uid: result.user.uid || newProfile.id,
        email: result.user.email || newProfile.email,
        displayName: result.user.displayName || newProfile.name,
        role: roleVal
      };

      const session = {
        user: newUser,
        profile: newProfile,
        role: roleVal
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(session));

      setCurrentUser(newUser);
      setUserRole(roleVal);
      setUserProfile(newProfile);

      return result;
    } catch (err) {
      const errMsg = err.message || "Failed to create account";
      setError(errMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile details
  const updateProfileDetails = async (data) => {
    if (!currentUser) return null;
    try {
      const uid = currentUser.uid;
      const updated = await profileService.updateProfile(uid, data);
      
      const mergedProfile = { ...(userProfile || {}), ...(updated || data) };
      const updatedUser = {
        ...currentUser,
        displayName: mergedProfile.name || currentUser.displayName,
        role: mergedProfile.role || userRole
      };

      setUserProfile(mergedProfile);
      setCurrentUser(updatedUser);

      const session = {
        user: updatedUser,
        profile: mergedProfile,
        role: mergedProfile.role || userRole
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(session));

      return mergedProfile;
    } catch (err) {
      console.error("Failed to update profile details:", err);
      throw err;
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    currentUser,
    userRole,
    userProfile,
    isAuthenticated: Boolean(currentUser),
    isLoading,
    loading: isLoading, // Backward compatibility alias
    error,
    errors: error, // Alias
    login,
    quickLogin,
    switchRole,
    logout,
    signup,
    updateProfileDetails,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
