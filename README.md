# Dayflow — Modern Cloud HRMS & People Operations Platform

Dayflow is a real-time Human Resource Management System (HRMS) built with React, Vite, Tailwind CSS, and Cloud Firestore. It streamlines employee lifecycle management, attendance tracking, leave requests, and payroll summaries with deterministic employee identification and role-based access control (RBAC).

---

## Key Features

* **Role-Based Access Control (RBAC):** Distinct dashboards and capabilities tailored for Administrators (HR Leadership) and standard Employees.
* **Live Cloud Sync via Firestore:** Real-time listeners (`onSnapshot`) power zero-delay updates across leave requests, approval decisions, and daily attendance logs.
* **Deterministic Custom Employee IDs:** Automatic generation of structured IDs following the `OIXXYYZZZZAAAA` standard (Company Prefix + Name Initials + Joining Year + Sequential Counter).
* **Attendance Management:** Live daily punch clock tracking working hours, late marks, and real-time statuses.
* **Leave Management:** Filterable leave lifecycle (All, Pending, Approved, Rejected) with automated quota tracking (Sick: 3, Casual: 1, Earned: 2).
* **Employee Directory & Onboarding:** Searchable, filterable employee cards displaying designation, department, contact information, joining dates, and individual profiles.
* **Localized Financials:** Support for Indian corporate structures, INR currency formats (₹ / LPA), and +91 contact details.

---

## Tech Stack

* **Frontend:** React 18, Vite
* **Styling:** Tailwind CSS, Lucide React (Icons)
* **Backend & Auth:** Firebase Authentication (Email & Password)
* **Database:** Google Cloud Firestore (Real-time synchronization)
* **Routing:** React Router v6

---

## Project Structure

```text
src/
├── components/          # Reusable UI elements (Navbar, Sidebar, Badges, Modals)
├── context/             # Global providers (AuthContext, HRContext)
├── pages/               # Views (Dashboard, EmployeeList, Profile, Attendance, Leaves, Login)
├── services/            # Firestore data services (authService, leaveService, dbSeeder)
├── utils/               # Utilities & ID generator algorithms
├── App.jsx              # Routing and primary layout
└── main.jsx             # React entry point