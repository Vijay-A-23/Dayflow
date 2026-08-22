// Mock Data for Dayflow HRMS (Fallback local database)

export const INITIAL_EMPLOYEES = [
  {
    id: "emp-01",
    name: "Admin User",
    email: "admin@dayflow.com",
    role: "admin",
    department: "Human Resources",
    position: "HR Director",
    joinDate: "2024-01-15",
    status: "Active",
    phone: "+1 (555) 019-2834",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "emp-02",
    name: "John Doe",
    email: "employee@dayflow.com",
    role: "employee",
    department: "Engineering",
    position: "Senior Frontend Engineer",
    joinDate: "2024-03-10",
    status: "Active",
    phone: "+1 (555) 014-9988",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "emp-03",
    name: "Sarah Jenkins",
    email: "sarah.j@dayflow.com",
    role: "employee",
    department: "Engineering",
    position: "QA Engineer",
    joinDate: "2024-05-18",
    status: "Active",
    phone: "+1 (555) 017-3322",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "emp-04",
    name: "Michael Chen",
    email: "michael.c@dayflow.com",
    role: "employee",
    department: "Product",
    position: "Product Manager",
    joinDate: "2024-02-01",
    status: "Active",
    phone: "+1 (555) 012-7744",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "emp-05",
    name: "Emily Rodriguez",
    email: "emily.r@dayflow.com",
    role: "employee",
    department: "Marketing",
    position: "Growth Specialist",
    joinDate: "2024-06-22",
    status: "Inactive",
    phone: "+1 (555) 015-8811",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
  }
];

export const INITIAL_ATTENDANCE = [
  {
    id: "att-01",
    employeeId: "emp-02", // John Doe
    date: "2026-08-18",
    punchIn: "08:55",
    punchOut: "17:30",
    totalHours: 8.5,
    status: "Present",
  },
  {
    id: "att-02",
    employeeId: "emp-02", // John Doe
    date: "2026-08-19",
    punchIn: "09:15",
    punchOut: "18:05",
    totalHours: 8.8,
    status: "Late", // punched in after 09:00
  },
  {
    id: "att-03",
    employeeId: "emp-02", // John Doe
    date: "2026-08-20",
    punchIn: "08:45",
    punchOut: "17:15",
    totalHours: 8.5,
    status: "Present",
  },
  {
    id: "att-04",
    employeeId: "emp-02", // John Doe
    date: "2026-08-21",
    punchIn: "09:05",
    punchOut: "17:45",
    totalHours: 8.6,
    status: "Late",
  },
  {
    id: "att-05",
    employeeId: "emp-03", // Sarah Jenkins
    date: "2026-08-21",
    punchIn: "08:50",
    punchOut: "17:00",
    totalHours: 8.1,
    status: "Present",
  },
  {
    id: "att-06",
    employeeId: "emp-04", // Michael Chen
    date: "2026-08-21",
    punchIn: "09:30",
    punchOut: "18:00",
    totalHours: 8.5,
    status: "Late",
  }
];

export const INITIAL_LEAVES = [
  {
    id: "lv-01",
    employeeId: "emp-02", // John Doe
    employeeName: "John Doe",
    type: "Sick Leave",
    startDate: "2026-08-10",
    endDate: "2026-08-11",
    days: 2,
    reason: "Recovering from flu",
    status: "Approved",
    appliedDate: "2026-08-09"
  },
  {
    id: "lv-02",
    employeeId: "emp-02", // John Doe
    employeeName: "John Doe",
    type: "Annual Leave",
    startDate: "2026-09-01",
    endDate: "2026-09-05",
    days: 5,
    reason: "Family trip",
    status: "Pending",
    appliedDate: "2026-08-20"
  },
  {
    id: "lv-03",
    employeeId: "emp-03", // Sarah Jenkins
    employeeName: "Sarah Jenkins",
    type: "Casual Leave",
    startDate: "2026-08-25",
    endDate: "2026-08-25",
    days: 1,
    reason: "Personal urgent work",
    status: "Pending",
    appliedDate: "2026-08-21"
  },
  {
    id: "lv-04",
    employeeId: "emp-04", // Michael Chen
    employeeName: "Michael Chen",
    type: "Maternity/Paternity",
    startDate: "2026-07-01",
    endDate: "2026-07-15",
    days: 15,
    reason: "Paternity leave",
    status: "Approved",
    appliedDate: "2026-06-15"
  }
];

export const DEPARTMENTS = [
  "Human Resources",
  "Engineering",
  "Product",
  "Marketing",
  "Sales",
  "Finance"
];

export const LEAVE_TYPES = [
  "Annual Leave",
  "Sick Leave",
  "Casual Leave",
  "Maternity/Paternity",
  "Unpaid Leave"
];
