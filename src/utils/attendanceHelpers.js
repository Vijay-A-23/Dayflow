/**
 * Parse time string (HH:MM or HH:MM AM/PM) into Date object context of today
 */
export function parseTimeToToday(timeStr, baseDateStr) {
  if (!timeStr) return null;
  const dateStr = baseDateStr || new Date().toISOString().split("T")[0];
  const date = new Date(dateStr + "T00:00:00");
  
  let hours = 0;
  let minutes = 0;
  
  // Standardize potential spaces and normalize format
  const normalizedStr = timeStr.trim().toUpperCase();
  
  if (normalizedStr.includes("AM") || normalizedStr.includes("PM")) {
    const isPM = normalizedStr.includes("PM");
    const cleanTime = normalizedStr.replace(/[AP]M/, "").trim();
    let [h, m] = cleanTime.split(":").map(Number);
    
    if (isNaN(h) || isNaN(m)) return null;
    
    if (h === 12) {
      h = 0;
    }
    if (isPM) {
      h += 12;
    }
    hours = h;
    minutes = m;
  } else {
    const [h, m] = normalizedStr.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    hours = h;
    minutes = m;
  }
  
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Calculate total work hours between punch-in and punch-out strings
 */
export function calculateWorkHours(punchIn, punchOut, baseDateStr) {
  if (!punchIn || !punchOut) return 0;
  const inDate = parseTimeToToday(punchIn, baseDateStr);
  const outDate = parseTimeToToday(punchOut, baseDateStr);
  if (!inDate || !outDate) return 0;
  
  const diffMs = outDate - inDate;
  if (diffMs <= 0) return 0;
  return parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
}

/**
 * Determine status: 
 * - Late if punchIn is after 09:30 AM
 * - Half Day if totalHours is under 4.5 hours
 * - Present otherwise
 */
export function determineAttendanceStatus(punchInStr, totalHours = null, baseDateStr) {
  if (!punchInStr) return "Absent";
  
  // Late limit: 09:30 AM
  const inTime = parseTimeToToday(punchInStr, baseDateStr);
  const lateLimit = parseTimeToToday("09:30", baseDateStr);
  const isLate = inTime && inTime > lateLimit;
  
  if (totalHours !== null && totalHours < 4.5) {
    return "Half Day";
  }
  
  return isLate ? "Late" : "Present";
}

/**
 * Export to CSV helper
 */
export function exportAttendanceToCSV(records, employees) {
  const headers = ["Date", "Employee ID", "Employee Name", "Department", "Punch In", "Punch Out", "Total Hours (hrs)", "Status"];
  const rows = records.map(r => {
    const emp = employees.find(e => e.id === r.employeeId);
    return [
      r.date,
      r.employeeId,
      emp?.name || r.employeeName || "N/A",
      emp?.department || "N/A",
      r.punchIn,
      r.punchOut || "--:--",
      r.totalHours || "0",
      r.status
    ];
  });
  
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
  ].join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Dayflow_Attendance_Report_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
