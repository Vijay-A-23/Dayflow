import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { auth, db, isFirebaseConfigured } from '../services/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";
import { authService } from "../services/authService";
import { profileService } from "../services/profileService";

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
      displayName: profile.name || profile.displayName || (profile.email?.toLowerCase() === "employee@dayflow.com" ? "Karthik Subramanian" : (profile.email?.toLowerCase() === "admin@dayflow.com" ? "Kavitha Sundaram" : profile.email?.split("@")[0])),
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
          let docSnap = await getDoc(doc(db, "users", firebaseUser.uid));
          let profile = null;

          if (docSnap.exists()) {
            profile = docSnap.data();
          } else {
            // Fallback: Query by email to link manual/seeded database records to auth login uids
            const q = query(collection(db, "users"), where("email", "==", firebaseUser.email));
            const querySnap = await getDocs(q);
            if (!querySnap.empty) {
              const docDoc = querySnap.docs[0];
              profile = { ...docDoc.data(), id: firebaseUser.uid, uid: firebaseUser.uid };
              // Create the document under actual UID path for future direct gets
              await setDoc(doc(db, "users", firebaseUser.uid), profile);
            }
          }

          if (profile) {
            // Verify and enforce profile properties for specific demo accounts
            if (firebaseUser.email === "admin@dayflow.com") {
              const avatarUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80";
              let updated = false;
              if (profile.name !== "Kavitha Sundaram") {
                profile.name = "Kavitha Sundaram";
                updated = true;
              }
              if (profile.employeeId !== "OIKASU20230001") {
                profile.employeeId = "OIKASU20230001";
                profile.joinDate = "2023-06-15";
                updated = true;
              }
              if (profile.avatar !== avatarUrl || profile.avatarUrl !== avatarUrl) {
                profile.avatar = avatarUrl;
                profile.avatarUrl = avatarUrl;
                updated = true;
              }
              if (profile.jobDetails?.position !== "Head of People & Operations" || profile.jobDetails?.workLocation !== "Chennai HQ - OMR") {
                profile.jobDetails = {
                  department: "Human Resources",
                  position: "Head of People & Operations",
                  manager: "Executive Board",
                  employmentType: "Full-Time",
                  workLocation: "Chennai HQ - OMR"
                };
                profile.position = "Head of People & Operations";
                updated = true;
              }
              if (updated) {
                await setDoc(doc(db, "users", firebaseUser.uid), profile);
              }
            } else if (firebaseUser.email === "employee@dayflow.com") {
              const avatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80";
              let updated = false;
              if (profile.name !== "Karthik Subramanian") {
                profile.name = "Karthik Subramanian";
                updated = true;
              }
              if (profile.employeeId !== "OIKASU20240001") {
                profile.employeeId = "OIKASU20240001";
                profile.joinDate = "2024-02-15";
                updated = true;
              }
              if (profile.avatar !== avatarUrl || profile.avatarUrl !== avatarUrl) {
                profile.avatar = avatarUrl;
                profile.avatarUrl = avatarUrl;
                updated = true;
              }
              if (profile.jobDetails?.position !== "Senior Full Stack Engineer" || profile.jobDetails?.manager !== "Kavitha Sundaram") {
                profile.jobDetails = {
                  department: "Engineering",
                  position: "Senior Full Stack Engineer",
                  manager: "Kavitha Sundaram",
                  employmentType: "Full-Time",
                  workLocation: "Bengaluru Tech Hub (Hybrid)"
                };
                profile.position = "Senior Full Stack Engineer";
                updated = true;
              }
              if (updated) {
                await setDoc(doc(db, "users", firebaseUser.uid), profile);
              }
            }
          } else {
            // Profile does not exist yet. Only auto-create if it's Admin or the default Employee
            if (firebaseUser.email === "admin@dayflow.com") {
              const avatarUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80";
              profile = {
                id: firebaseUser.uid,
                uid: firebaseUser.uid,
                name: "Kavitha Sundaram",
                email: "admin@dayflow.com",
                role: "admin",
                status: "Active",
                joinDate: "2023-06-15",
                employeeId: "OIKASU20230001",
                avatar: avatarUrl,
                avatarUrl: avatarUrl,
                jobDetails: {
                  department: "Human Resources",
                  position: "Head of People & Operations",
                  manager: "Executive Board",
                  employmentType: "Full-Time",
                  workLocation: "Chennai HQ - OMR"
                },
                personalDetails: {
                  personalEmail: "admin@dayflow.com",
                  phone: "+91 98401 23456",
                  emergencyContact: "+91 98401 00000",
                  address: "OMR Road, Chennai",
                  dob: "1988-04-12"
                },
                salaryDetails: {
                  baseSalary: "₹24,50,000 / yr",
                  bankName: "HDFC Bank",
                  accountNumber: "****4821",
                  taxId: "PAN-90218"
                },
                createdAt: new Date().toISOString()
              };
              await setDoc(doc(db, "users", firebaseUser.uid), profile);
            } else if (firebaseUser.email === "employee@dayflow.com") {
              const avatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80";
              profile = {
                id: firebaseUser.uid,
                uid: firebaseUser.uid,
                name: "Karthik Subramanian",
                email: "employee@dayflow.com",
                role: "employee",
                status: "Active",
                joinDate: "2024-02-15",
                employeeId: "OIKASU20240001",
                avatar: avatarUrl,
                avatarUrl: avatarUrl,
                jobDetails: {
                  department: "Engineering",
                  position: "Senior Full Stack Engineer",
                  manager: "Kavitha Sundaram",
                  employmentType: "Full-Time",
                  workLocation: "Bengaluru Tech Hub (Hybrid)"
                },
                personalDetails: {
                  personalEmail: "employee@dayflow.com",
                  phone: "+91 98840 55123",
                  emergencyContact: "+91 98840 00000",
                  address: "Indiranagar, Bengaluru",
                  dob: "1995-08-20"
                },
                salaryDetails: {
                  baseSalary: "₹18,50,000 / yr",
                  bankName: "ICICI Bank",
                  accountNumber: "****7192",
                  taxId: "PAN-44821"
                },
                createdAt: new Date().toISOString()
              };
              await setDoc(doc(db, "users", firebaseUser.uid), profile);
            } else {
              profile = {
                id: firebaseUser.uid,
                uid: firebaseUser.uid,
                name: firebaseUser.displayName && firebaseUser.displayName !== "employee" ? firebaseUser.displayName : firebaseUser.email.split("@")[0],
                email: firebaseUser.email,
                role: "employee",
                status: "Active",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                jobDetails: {
                  department: "Engineering",
                  position: "Staff Member",
                  manager: "Sarah Jenkins",
                  employmentType: "Full-time",
                  workLocation: "Hybrid"
                },
                personalDetails: {
                  personalEmail: firebaseUser.email,
                  phone: "",
                  emergencyContact: "",
                  address: "",
                  dob: ""
                }
              };
            }
          }

          // Backfill nested properties if missing for backwards compatibility
          if (!profile.jobDetails) {
            profile.jobDetails = {
              department: profile.department || "Engineering",
              position: profile.position || "Staff Member",
              manager: profile.manager || "",
              employmentType: profile.employmentType || "Full-time",
              workLocation: profile.workLocation || "HQ - Office"
            };
          }
          if (!profile.personalDetails) {
            profile.personalDetails = {
              personalEmail: profile.personalEmail || profile.email || "",
              phone: profile.phone || "",
              emergencyContact: profile.emergencyContact || "",
              address: profile.address || "",
              dob: profile.dob || ""
            };
          }
          
          if (!profile.employeeId) {
            const { generateCustomEmployeeId } = await import("../utils/employeeIdGenerator.js");
            const { collection, getDocs } = await import("firebase/firestore");
            const snap = await getDocs(collection(db, "users"));
            const nextIdx = snap.empty ? 1 : snap.size + 1;
            profile.employeeId = generateCustomEmployeeId(profile.name || profile.displayName || firebaseUser.email?.split("@")[0], profile.joinDate || profile.createdAt, nextIdx);
            await setDoc(doc(db, "users", firebaseUser.uid), profile);
          }

          // Ensure role is strictly set from profile.role
          let role = profile.role || (firebaseUser.email === "admin@dayflow.com" ? "admin" : "employee");
          profile.role = role;

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
            displayName: firebaseUser.displayName || (firebaseUser.email?.toLowerCase() === "employee@dayflow.com" ? "Karthik Subramanian" : (firebaseUser.email?.toLowerCase() === "admin@dayflow.com" ? "Kavitha Sundaram" : firebaseUser.email?.split("@")[0])),
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

      let role = result.profile?.role || result.user?.role || "employee";
      if (email.trim().toLowerCase() === "admin@dayflow.com") {
        role = "admin";
        if (result.profile) {
          result.profile.role = "admin";
        }
      }
      const user = {
        uid: result.user.uid || result.profile?.id,
        email: result.user.email || result.profile?.email,
        displayName: result.user.displayName || result.profile?.name,
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

  // Quick Login and Switch Role removed for production

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
        nameVal = userDataOrEmail.displayName || userDataOrEmail.name || (emailVal?.trim().toLowerCase() === "admin@dayflow.com" ? "Kavitha Sundaram" : (emailVal?.trim().toLowerCase() === "employee@dayflow.com" ? "Karthik Subramanian" : emailVal?.split("@")[0]));
        roleVal = userDataOrEmail.role || "employee";
        deptVal = userDataOrEmail.department || "Engineering";
        extraFields = userDataOrEmail;
      } else {
        emailVal = userDataOrEmail;
        passVal = password || "password123";
        nameVal = displayName || (emailVal?.trim().toLowerCase() === "admin@dayflow.com" ? "Kavitha Sundaram" : (emailVal?.trim().toLowerCase() === "employee@dayflow.com" ? "Karthik Subramanian" : emailVal?.split("@")[0]));
        roleVal = role || "employee";
        deptVal = department || "Engineering";
      }

      if (emailVal?.trim().toLowerCase() === "admin@dayflow.com") {
        roleVal = "admin";
        deptVal = "Human Resources";
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
