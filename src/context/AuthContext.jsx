import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, isFirebaseConfigured, db } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin' | 'employee'
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync auth state
  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            // Get user role from firestore
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              setCurrentUser(user);
              setUserRole(data.role);
              setUserProfile(data);
            } else {
              // Default
              setCurrentUser(user);
              setUserRole("employee");
              setUserProfile({
                id: user.uid,
                name: user.displayName || user.email.split("@")[0],
                email: user.email,
                role: "employee",
                status: "Active"
              });
            }
          } catch (error) {
            console.error("Error fetching user role on state change:", error);
            setCurrentUser(user);
            setUserRole("employee");
          }
        } else {
          setCurrentUser(null);
          setUserRole(null);
          setUserProfile(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Mock session check
      const savedUser = localStorage.getItem("df_current_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setCurrentUser({
          uid: parsed.profile.id,
          email: parsed.profile.email,
          displayName: parsed.profile.name
        });
        setUserRole(parsed.profile.role);
        setUserProfile(parsed.profile);
      }
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      if (isFirebaseConfigured) {
        // Firebase onAuthStateChanged handles state updating
      } else {
        // In Mock mode, we update the state directly
        const session = {
          user: result.user,
          profile: result.profile
        };
        localStorage.setItem("df_current_user", JSON.stringify(session));
        setCurrentUser(result.user);
        setUserRole(result.profile.role);
        setUserProfile(result.profile);
      }
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      if (!isFirebaseConfigured) {
        localStorage.removeItem("df_current_user");
        setCurrentUser(null);
        setUserRole(null);
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, displayName, role = "employee", department = "Engineering") => {
    setLoading(true);
    try {
      const result = await authService.signup(email, password, displayName, role, department);
      if (isFirebaseConfigured) {
        // Firebase onAuthStateChanged handles state updating
      } else {
        // Mock State setup
        const session = {
          user: result.user,
          profile: result.profile
        };
        localStorage.setItem("df_current_user", JSON.stringify(session));
        setCurrentUser(result.user);
        setUserRole(result.profile.role);
        setUserProfile(result.profile);
      }
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfileDetails = async (data) => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    const updated = await profileService.updateProfile(uid, data);
    setUserProfile(updated);
    if (!isFirebaseConfigured) {
      const session = JSON.parse(localStorage.getItem("df_current_user"));
      session.profile = updated;
      localStorage.setItem("df_current_user", JSON.stringify(session));
    }
    return updated;
  };

  const value = {
    currentUser,
    userRole,
    userProfile,
    loading,
    login,
    logout,
    signup,
    updateProfileDetails
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
