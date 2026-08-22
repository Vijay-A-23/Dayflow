import { db, isFirebaseConfigured } from "./firebase";
import { doc, collection, getDocs, setDoc, addDoc, deleteDoc } from "firebase/firestore";

export const INDIAN_STAFF_ROSTER = [
  {
    id: "admin_uid",
    uid: "admin_uid",
    employeeId: "OIKASU20230001",
    name: "Kavitha Sundaram",
    email: "admin@dayflow.com",
    role: "admin",
    status: "Active",
    designation: "Head of People & Operations",
    department: "Human Resources",
    workLocation: "Chennai HQ - OMR",
    phone: "+91 98401 23456",
    joinedDate: "2023-06-15",
    joinDate: "2023-06-15",
    baseSalary: "₹24,50,000 / yr",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    position: "Head of People & Operations",
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
      address: "OMR IT Corridor, Chennai",
      dob: "1985-04-12"
    },
    salaryDetails: {
      baseSalary: "₹24,50,000 / yr",
      bankName: "HDFC Bank",
      accountNumber: "****4821",
      taxId: "PAN-KAV890"
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "emp_karthik",
    uid: "emp_karthik",
    employeeId: "OIKASU20240001",
    name: "Karthik Subramanian",
    email: "employee@dayflow.com",
    role: "employee",
    status: "Active",
    designation: "Senior Full Stack Engineer",
    department: "Engineering",
    workLocation: "Bengaluru Tech Hub",
    phone: "+91 98840 55123",
    joinedDate: "2024-02-15",
    joinDate: "2024-02-15",
    baseSalary: "₹18,50,000 / yr",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    position: "Senior Full Stack Engineer",
    jobDetails: {
      department: "Engineering",
      position: "Senior Full Stack Engineer",
      manager: "Kavitha Sundaram",
      employmentType: "Full-Time",
      workLocation: "Bengaluru Tech Hub"
    },
    personalDetails: {
      personalEmail: "employee@dayflow.com",
      phone: "+91 98840 55123",
      emergencyContact: "+91 98840 00000",
      address: "Koramangala, Bengaluru",
      dob: "1995-08-20"
    },
    salaryDetails: {
      baseSalary: "₹18,50,000 / yr",
      bankName: "ICICI Bank",
      accountNumber: "****7192",
      taxId: "PAN-KAR448"
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "emp_ananya",
    uid: "emp_ananya",
    employeeId: "OIANKR20240002",
    name: "Ananya Krishnan",
    email: "ananya.k@dayflow.in",
    role: "employee",
    status: "Active",
    designation: "Lead UX Designer",
    department: "Product & Design",
    workLocation: "Chennai HQ - OMR",
    phone: "+91 94441 98712",
    joinedDate: "2024-04-01",
    joinDate: "2024-04-01",
    baseSalary: "₹16,00,000 / yr",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    position: "Lead UX Designer",
    jobDetails: {
      department: "Product & Design",
      position: "Lead UX Designer",
      manager: "Kavitha Sundaram",
      employmentType: "Full-Time",
      workLocation: "Chennai HQ - OMR"
    },
    personalDetails: {
      personalEmail: "ananya.k@dayflow.in",
      phone: "+91 94441 98712",
      emergencyContact: "+91 94441 00000",
      address: "Adyar, Chennai",
      dob: "1994-02-14"
    },
    salaryDetails: {
      baseSalary: "₹16,00,000 / yr",
      bankName: "HDFC Bank",
      accountNumber: "****9922",
      taxId: "PAN-ANA338"
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "emp_arun",
    uid: "emp_arun",
    employeeId: "OIARVE20240003",
    name: "Arun Venkatesh",
    email: "arun.v@dayflow.in",
    role: "employee",
    status: "Active",
    designation: "Backend Systems Architect",
    department: "Engineering",
    workLocation: "Bengaluru Tech Hub",
    phone: "+91 99620 44321",
    joinedDate: "2024-07-18",
    joinDate: "2024-07-18",
    baseSalary: "₹21,00,000 / yr",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    position: "Backend Systems Architect",
    jobDetails: {
      department: "Engineering",
      position: "Backend Systems Architect",
      manager: "Kavitha Sundaram",
      employmentType: "Full-Time",
      workLocation: "Bengaluru Tech Hub"
    },
    personalDetails: {
      personalEmail: "arun.v@dayflow.in",
      phone: "+91 99620 44321",
      emergencyContact: "+91 99620 00000",
      address: "Whitefield, Bengaluru",
      dob: "1990-07-22"
    },
    salaryDetails: {
      baseSalary: "₹21,00,000 / yr",
      bankName: "State Bank of India",
      accountNumber: "****1122",
      taxId: "PAN-ARU229"
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "emp_pooja",
    uid: "emp_pooja",
    employeeId: "OIPORA20250001",
    name: "Pooja Ramachandran",
    email: "pooja.r@dayflow.in",
    role: "employee",
    status: "Active",
    designation: "Product Operations Lead",
    department: "Product & Design",
    workLocation: "Chennai HQ - OMR",
    phone: "+91 98410 77654",
    joinedDate: "2025-01-20",
    joinDate: "2025-01-20",
    baseSalary: "₹13,50,000 / yr",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    position: "Product Operations Lead",
    jobDetails: {
      department: "Product & Design",
      position: "Product Operations Lead",
      manager: "Kavitha Sundaram",
      employmentType: "Full-Time",
      workLocation: "Chennai HQ - OMR"
    },
    personalDetails: {
      personalEmail: "pooja.r@dayflow.in",
      phone: "+91 98410 77654",
      emergencyContact: "+91 98410 00000",
      address: "Velachery, Chennai",
      dob: "1993-05-18"
    },
    salaryDetails: {
      baseSalary: "₹13,50,000 / yr",
      bankName: "Axis Bank",
      accountNumber: "****8833",
      taxId: "PAN-POO991"
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "emp_siddharth",
    uid: "emp_siddharth",
    employeeId: "OISIME20250002",
    name: "Siddharth Menon",
    email: "siddharth.m@dayflow.in",
    role: "employee",
    status: "Active",
    designation: "DevOps & Cloud Specialist",
    department: "Engineering",
    workLocation: "Bengaluru Tech Hub",
    phone: "+91 97909 33210",
    joinedDate: "2025-05-12",
    joinDate: "2025-05-12",
    baseSalary: "₹15,50,000 / yr",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    position: "DevOps & Cloud Specialist",
    jobDetails: {
      department: "Engineering",
      position: "DevOps & Cloud Specialist",
      manager: "Kavitha Sundaram",
      employmentType: "Full-Time",
      workLocation: "Bengaluru Tech Hub"
    },
    personalDetails: {
      personalEmail: "siddharth.m@dayflow.in",
      phone: "+91 97909 33210",
      emergencyContact: "+91 97909 00000",
      address: "HSR Layout, Bengaluru",
      dob: "1991-09-03"
    },
    salaryDetails: {
      baseSalary: "₹15,50,000 / yr",
      bankName: "Kotak Mahindra Bank",
      accountNumber: "****3344",
      taxId: "PAN-SID123"
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "emp_meera",
    uid: "emp_meera",
    employeeId: "OIMERA20250003",
    name: "Meera Raghavan",
    email: "meera.r@dayflow.in",
    role: "employee",
    status: "Inactive",
    designation: "Growth Marketing Strategist",
    department: "Marketing",
    workLocation: "Remote (India)",
    phone: "+91 94450 11223",
    joinedDate: "2025-09-01",
    joinDate: "2025-09-01",
    baseSalary: "₹11,00,000 / yr",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    position: "Growth Marketing Strategist",
    jobDetails: {
      department: "Marketing",
      position: "Growth Marketing Strategist",
      manager: "Kavitha Sundaram",
      employmentType: "Full-Time",
      workLocation: "Remote (India)"
    },
    personalDetails: {
      personalEmail: "meera.r@dayflow.in",
      phone: "+91 94450 11223",
      emergencyContact: "+91 94450 00000",
      address: "Mylapore, Chennai",
      dob: "1996-03-24"
    },
    salaryDetails: {
      baseSalary: "₹11,00,000 / yr",
      bankName: "HDFC Bank",
      accountNumber: "****5566",
      taxId: "PAN-MEE456"
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "emp_vignesh",
    uid: "emp_vignesh",
    employeeId: "OIVINA20260001",
    name: "Vignesh Natarajan",
    email: "vignesh.n@dayflow.in",
    role: "employee",
    status: "Active",
    designation: "Associate Software Engineer",
    department: "Engineering",
    workLocation: "Chennai HQ - OMR",
    phone: "+91 99400 88990",
    joinedDate: "2026-01-15",
    joinDate: "2026-01-15",
    baseSalary: "₹8,50,000 / yr",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
    position: "Associate Software Engineer",
    jobDetails: {
      department: "Engineering",
      position: "Associate Software Engineer",
      manager: "Kavitha Sundaram",
      employmentType: "Full-Time",
      workLocation: "Chennai HQ - OMR"
    },
    personalDetails: {
      personalEmail: "vignesh.n@dayflow.in",
      phone: "+91 99400 88990",
      emergencyContact: "+91 99400 00000",
      address: "Thiruvanmiyur, Chennai",
      dob: "1998-07-07"
    },
    salaryDetails: {
      baseSalary: "₹8,50,000 / yr",
      bankName: "ICICI Bank",
      accountNumber: "****6677",
      taxId: "PAN-VIG789"
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "emp_sneha",
    uid: "emp_sneha",
    employeeId: "OISNSW20260002",
    name: "Sneha Swaminathan",
    email: "sneha.s@dayflow.in",
    role: "employee",
    status: "Active",
    designation: "Financial Planning Analyst",
    department: "Finance",
    workLocation: "Chennai HQ - OMR",
    phone: "+91 98844 66778",
    joinedDate: "2026-03-02",
    joinDate: "2026-03-02",
    baseSalary: "₹10,50,000 / yr",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
    position: "Financial Planning Analyst",
    jobDetails: {
      department: "Finance",
      position: "Financial Planning Analyst",
      manager: "Kavitha Sundaram",
      employmentType: "Full-Time",
      workLocation: "Chennai HQ - OMR"
    },
    personalDetails: {
      personalEmail: "sneha.s@dayflow.in",
      phone: "+91 98844 66778",
      emergencyContact: "+91 98844 00000",
      address: "Nungambakkam, Chennai",
      dob: "1997-12-12"
    },
    salaryDetails: {
      baseSalary: "₹10,50,000 / yr",
      bankName: "HDFC Bank",
      accountNumber: "****8899",
      taxId: "PAN-SNE221"
    },
    createdAt: new Date().toISOString()
  }
];

export const seedDatabase = async (force = false) => {
  if (!isFirebaseConfigured) {
    console.log("Firebase not configured. Skipping seeding.");
    return false;
  }

  try {
    // 1. Check if database is already seeded by checking users collection
    const usersSnap = await getDocs(collection(db, "users"));
    if (!usersSnap.empty && !force) {
      console.log("Database already seeded. Skipping.");
      return false;
    }

    const todayStr = new Date().toISOString().split("T")[0];

    // Delete existing users, leaves, and attendance if forced
    if (force) {
      console.log("Forced Reset: Deleting existing Firestore collections...");
      for (const d of usersSnap.docs) {
        await deleteDoc(doc(db, "users", d.id));
      }
      const leavesSnap = await getDocs(collection(db, "leaves"));
      for (const d of leavesSnap.docs) {
        await deleteDoc(doc(db, "leaves", d.id));
      }
      const attSnap = await getDocs(collection(db, "attendance"));
      for (const d of attSnap.docs) {
        await deleteDoc(doc(db, "attendance", d.id));
      }
    }

    // 2. Write all users
    for (const u of INDIAN_STAFF_ROSTER) {
      await setDoc(doc(db, "users", u.id), u);
    }

    // 3. Define Seed Leaves
    const seedLeaves = [
      {
        employeeId: "emp_karthik",
        userId: "emp_karthik",
        employeeName: "Karthik Subramanian",
        userName: "Karthik Subramanian",
        userEmail: "employee@dayflow.com",
        type: "Sick Leave",
        leaveType: "Sick Leave",
        startDate: todayStr,
        endDate: todayStr,
        days: 1,
        reason: "Dental checkup and minor procedure",
        status: "Pending",
        appliedDate: todayStr,
        createdAt: new Date().toISOString()
      },
      {
        employeeId: "emp_ananya",
        userId: "emp_ananya",
        employeeName: "Ananya Krishnan",
        userName: "Ananya Krishnan",
        userEmail: "ananya.k@dayflow.in",
        type: "Annual Leave",
        leaveType: "Annual Leave",
        startDate: "2026-09-10",
        endDate: "2026-09-14",
        days: 5,
        reason: "Pre-planned family vacation",
        status: "Approved",
        appliedDate: todayStr,
        createdAt: new Date().toISOString()
      },
      {
        employeeId: "emp_arun",
        userId: "emp_arun",
        employeeName: "Arun Venkatesh",
        userName: "Arun Venkatesh",
        userEmail: "arun.v@dayflow.in",
        type: "Casual Leave",
        leaveType: "Casual Leave",
        startDate: "2026-08-01",
        endDate: "2026-08-02",
        days: 2,
        reason: "Personal business",
        status: "Rejected",
        adminRemarks: "Overlapping team schedules",
        appliedDate: "2026-07-28",
        createdAt: new Date().toISOString()
      }
    ];

    // Write leaves
    for (const l of seedLeaves) {
      await addDoc(collection(db, "leaves"), l);
    }

    // 4. Define Seed Attendance Records for Today
    const seedAttendance = [
      {
        employeeId: "emp_karthik",
        userId: "emp_karthik",
        employeeName: "Karthik Subramanian",
        userName: "Karthik Subramanian",
        date: todayStr,
        punchIn: "08:52",
        checkIn: "08:52",
        punchOut: "",
        checkOut: "",
        totalHours: 0,
        status: "Present"
      },
      {
        employeeId: "emp_ananya",
        userId: "emp_ananya",
        employeeName: "Ananya Krishnan",
        userName: "Ananya Krishnan",
        date: todayStr,
        punchIn: "09:45",
        checkIn: "09:45",
        punchOut: "",
        checkOut: "",
        totalHours: 0,
        status: "Late"
      },
      {
        employeeId: "emp_arun",
        userId: "emp_arun",
        employeeName: "Arun Venkatesh",
        userName: "Arun Venkatesh",
        date: todayStr,
        punchIn: "13:00",
        checkIn: "13:00",
        punchOut: "17:00",
        checkOut: "17:00",
        totalHours: 4,
        status: "Half Day"
      }
    ];

    // Write attendance
    for (const a of seedAttendance) {
      await addDoc(collection(db, "attendance"), a);
    }

    console.log("Database successfully seeded with Indian Staff Roster.");
    return true;
  } catch (error) {
    console.error("Database seeding failed:", error);
    throw error;
  }
};
