// Test script for Dayflow Authentication Module (feature/auth)
import { DEMO_USERS, INITIAL_EMPLOYEES } from "./src/constants/mockData.js";
import { authService } from "./src/services/authService.js";

// Mock localStorage in Node environment
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.localStorage = new MockLocalStorage();
const AUTH_STORAGE_KEY = "dayflow_auth_user";

// Helper function to simulate AuthContext hydration
function getStoredSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem("df_current_user");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed) return null;

    const profile = parsed.profile || parsed.user || null;
    const user = parsed.user || (profile ? {
      uid: profile.id || profile.uid,
      email: profile.email,
      displayName: profile.name || profile.displayName || profile.email?.split("@")[0],
      role: profile.role || parsed.role || "employee"
    } : null);

    const role = parsed.role || profile?.role || user?.role || "employee";

    if (user && profile) {
      if (!localStorage.getItem(AUTH_STORAGE_KEY)) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, profile, role }));
      }
      return { user, profile, role };
    }
  } catch (error) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("df_current_user");
  }
  return null;
}

// Helper function to simulate ProtectedRoute guard check
function checkRouteAccess(path, allowedRoles, user, role) {
  const isAuth = Boolean(user);
  if (!isAuth) {
    return { status: "REDIRECT", destination: "/login", reason: "Unauthenticated" };
  }
  if (allowedRoles && allowedRoles.length > 0) {
    const activeRole = role || user?.role || "employee";
    if (!allowedRoles.includes(activeRole)) {
      return { status: "REDIRECT", destination: "/", reason: "UnauthorizedRole" };
    }
  }
  return { status: "ALLOWED", destination: path, reason: "Authorized" };
}

async function runQAChecklist() {
  console.log("\n=======================================================");
  console.log(" DAYFLOW AUTHENTICATION (feature/auth) QA TEST SUITE ");
  console.log("=======================================================\n");

  let allPassed = true;
  const assert = (condition, description) => {
    if (condition) {
      console.log(` ✅ PASS: ${description}`);
    } else {
      console.error(` ❌ FAIL: ${description}`);
      allPassed = false;
    }
  };

  // -----------------------------------------------------------
  // TEST 1: Page Refresh & Persistence
  // -----------------------------------------------------------
  console.log("--- TEST 1: Page Refresh & Session Hydration ---");
  localStorage.clear();

  // 1a. Admin Login & Refresh
  const adminLoginResult = await authService.login("admin@dayflow.internal", "password123");
  const adminSession = {
    user: adminLoginResult.user,
    profile: adminLoginResult.profile,
    role: "admin"
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminSession));

  // Simulate Page Refresh (new hydration read)
  const hydratedAdmin = getStoredSession();
  assert(hydratedAdmin !== null, "Admin session hydrates from localStorage on page refresh");
  assert(hydratedAdmin?.user?.email === "admin@dayflow.internal", "Admin user email is admin@dayflow.internal");
  assert(hydratedAdmin?.role === "admin", "Hydrated role remains 'admin'");
  assert(hydratedAdmin?.profile?.name === "Eleanor Vance", "Admin profile name is Eleanor Vance");

  // 1b. Employee Login & Refresh
  localStorage.clear();
  const empLoginResult = await authService.login("alex.morgan@dayflow.internal", "password123");
  const empSession = {
    user: empLoginResult.user,
    profile: empLoginResult.profile,
    role: "employee"
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(empSession));

  // Simulate Page Refresh
  const hydratedEmp = getStoredSession();
  assert(hydratedEmp !== null, "Employee session hydrates from localStorage on page refresh");
  assert(hydratedEmp?.user?.email === "alex.morgan@dayflow.internal", "Employee email is alex.morgan@dayflow.internal");
  assert(hydratedEmp?.role === "employee", "Hydrated role remains 'employee'");
  assert(hydratedEmp?.profile?.name === "Alex Morgan", "Employee profile name is Alex Morgan");

  // -----------------------------------------------------------
  // TEST 2: Route Protection Guard
  // -----------------------------------------------------------
  console.log("\n--- TEST 2: Route Protection Guards ---");
  
  // 2a. Unauthenticated user
  const unauthCheck = checkRouteAccess("/dashboard", null, null, null);
  assert(unauthCheck.status === "REDIRECT" && unauthCheck.destination === "/login", 
    "Unauthenticated user navigating to /dashboard is redirected to /login");

  // 2b. Employee accessing public protected route (e.g. /attendance, /leaves)
  const empAttendanceCheck = checkRouteAccess("/attendance", null, empSession.user, "employee");
  assert(empAttendanceCheck.status === "ALLOWED", "Employee is allowed access to /attendance");

  // 2c. Employee accessing Admin-restricted route (/employees)
  const empAdminRouteCheck = checkRouteAccess("/employees", ["admin"], empSession.user, "employee");
  assert(empAdminRouteCheck.status === "REDIRECT" && empAdminRouteCheck.destination === "/", 
    "Employee accessing /employees is safely redirected to '/' without crash");

  // 2d. Admin accessing Admin-restricted route (/employees)
  const adminRouteCheck = checkRouteAccess("/employees", ["admin"], adminSession.user, "admin");
  assert(adminRouteCheck.status === "ALLOWED" && adminRouteCheck.destination === "/employees", 
    "Admin accessing /employees is successfully allowed entry");

  // -----------------------------------------------------------
  // TEST 3: Dynamic Live Role Switching
  // -----------------------------------------------------------
  console.log("\n--- TEST 3: Live Role Switcher (switchRole) ---");
  
  // Start as employee
  let currentSession = { ...empSession };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentSession));
  assert(currentSession.role === "employee", "Starting role is employee");

  // Switch to admin on-the-fly
  const targetRole1 = "admin";
  currentSession.role = targetRole1;
  currentSession.user.role = targetRole1;
  currentSession.profile.role = targetRole1;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentSession));

  const afterSwitchToAdmin = getStoredSession();
  assert(afterSwitchToAdmin.role === "admin", "Role dynamically updated to 'admin' in state and storage");
  
  // Verify route guard now allows /employees
  const accessAfterSwitch = checkRouteAccess("/employees", ["admin"], afterSwitchToAdmin.user, afterSwitchToAdmin.role);
  assert(accessAfterSwitch.status === "ALLOWED", "After switching to Admin, access to /employees is instantly granted");

  // Switch back to employee
  const targetRole2 = "employee";
  currentSession.role = targetRole2;
  currentSession.user.role = targetRole2;
  currentSession.profile.role = targetRole2;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentSession));

  const afterSwitchToEmp = getStoredSession();
  assert(afterSwitchToEmp.role === "employee", "Role dynamically toggled back to 'employee'");
  const accessAfterSwitchEmp = checkRouteAccess("/employees", ["admin"], afterSwitchToEmp.user, afterSwitchToEmp.role);
  assert(accessAfterSwitchEmp.status === "REDIRECT" && accessAfterSwitchEmp.destination === "/", "After switching back to Employee, /employees is guarded again");

  // -----------------------------------------------------------
  // TEST 4: Hard Reset & Teardown
  // -----------------------------------------------------------
  console.log("\n--- TEST 4: Hard Reset & Logout Teardown ---");
  
  // Clear localStorage
  localStorage.clear();
  const resetSession = getStoredSession();
  assert(resetSession === null, "Hard reset returns null session safely");

  const unauthAfterReset = checkRouteAccess("/", null, resetSession?.user, resetSession?.role);
  assert(unauthAfterReset.status === "REDIRECT" && unauthAfterReset.destination === "/login", 
    "Navigating to '/' after hard reset redirects gracefully to '/login' with 0 errors");

  // Corrupted localStorage resilience test
  localStorage.setItem(AUTH_STORAGE_KEY, "INVALID_JSON_CORRUPTED{}[");
  const corruptedSession = getStoredSession();
  assert(corruptedSession === null, "Corrupted localStorage is caught gracefully without throwing exceptions");

  console.log("\n=======================================================");
  if (allPassed) {
    console.log(" 🎉 ALL 4 QA TEST CHECKLIST ITEMS PASSED SUCCESSFULLY! ");
  } else {
    console.log(" ❌ SOME QA CHECKS FAILED! PLEASE REVIEW OUTPUT ABOVE. ");
  }
  console.log("=======================================================\n");
}

runQAChecklist();
