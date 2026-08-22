import { auth, db } from "./firebase.js";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

export const authService = {
  login: async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDocRef = doc(db, "users", userCredential.user.uid);
    let userSnap = await getDoc(userDocRef);
    let profile = null;
    
    if (userSnap.exists()) {
      profile = userSnap.data();
    } else {
      // Search by email query fallback
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        profile = { ...querySnap.docs[0].data(), id: userCredential.user.uid, uid: userCredential.user.uid };
        await setDoc(userDocRef, profile);
      }
    }

    if (email.trim().toLowerCase() === "admin@dayflow.com") {
      const avatarUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80";
      if (profile) {
        profile.role = "admin";
        profile.name = "Kavitha Sundaram";
        profile.avatar = avatarUrl;
        profile.avatarUrl = avatarUrl;
        if (!profile.jobDetails) profile.jobDetails = {};
        profile.jobDetails.position = "Head of People & Operations";
        profile.jobDetails.workLocation = "Chennai HQ - OMR";
        profile.position = "Head of People & Operations";
        await setDoc(userDocRef, profile);
      } else {
        profile = {
          id: userCredential.user.uid,
          uid: userCredential.user.uid,
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
        await setDoc(userDocRef, profile);
      }
    }

    if (email.trim().toLowerCase() === "employee@dayflow.com") {
      const avatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80";
      if (profile) {
        profile.role = "employee";
        profile.name = "Karthik Subramanian";
        profile.avatar = avatarUrl;
        profile.avatarUrl = avatarUrl;
        if (!profile.jobDetails) profile.jobDetails = {};
        profile.jobDetails.department = "Engineering";
        profile.jobDetails.position = "Senior Full Stack Engineer";
        profile.jobDetails.manager = "Kavitha Sundaram";
        profile.jobDetails.employmentType = "Full-Time";
        profile.jobDetails.workLocation = "Bengaluru Tech Hub (Hybrid)";
        profile.position = "Senior Full Stack Engineer";
        await setDoc(userDocRef, profile);
      } else {
        profile = {
          id: userCredential.user.uid,
          uid: userCredential.user.uid,
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
        await setDoc(userDocRef, profile);
      }
    }
    
    return {
      user: userCredential.user,
      profile: profile
    };
  },

  logout: async () => {
    await signOut(auth);
    return true;
  },

  signup: async (email, password, displayName, role = "employee", department = "Engineering") => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    
    const uid = userCredential.user.uid;
    const actualRole = email.trim().toLowerCase() === "admin@dayflow.com" ? "admin" : role;
    const actualDept = actualRole === "admin" ? "Human Resources" : department;
    const actualPos = actualRole === "admin" ? "HR Director" : "Staff Member";

    const joinDateVal = new Date().toISOString().split('T')[0];
    const { generateCustomEmployeeId } = await import("../utils/employeeIdGenerator.js");
    const { collection, getDocs } = await import("firebase/firestore");
    const snap = await getDocs(collection(db, "users"));
    const nextIdx = snap.empty ? 1 : snap.size + 1;
    const generatedId = generateCustomEmployeeId(displayName, joinDateVal, nextIdx);

    const newProfile = {
      id: uid,
      uid: uid,
      name: displayName,
      email: email,
      role: actualRole,
      department: actualDept,
      position: actualPos,
      status: "Active",
      joinDate: joinDateVal,
      employeeId: generatedId,
      phone: "",
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`,
      jobDetails: {
        department: actualDept,
        position: actualPos,
        manager: "",
        employmentType: "Full-time",
        workLocation: "HQ - Office"
      },
      personalDetails: {
        personalEmail: email,
        phone: "",
        emergencyContact: "",
        address: "",
        dob: ""
      },
      createdAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, "users", uid), newProfile);
    return {
      user: userCredential.user,
      profile: newProfile
    };
  }
};
