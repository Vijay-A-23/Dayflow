export const generateCustomEmployeeId = (name, joinedDateOrYear, index = 1) => {
  const cleanName = (name || "Jane Doe").trim();
  const parts = cleanName.split(/\s+/);
  const firstName = parts[0] || "XX";
  const lastName = parts.length > 1 ? parts[parts.length - 1] : "";
  
  const xx = firstName.slice(0, 2).toUpperCase().padEnd(2, "X");
  let yy = "";
  if (parts.length > 1 && lastName) {
    yy = lastName.slice(0, 2).toUpperCase().padEnd(2, "Y");
  } else {
    if (firstName.length >= 4) {
      yy = firstName.slice(2, 4).toUpperCase();
    } else {
      yy = "XX";
    }
  }
  
  let zzzz = "2024";
  if (joinedDateOrYear) {
    const strVal = String(joinedDateOrYear).trim();
    if (/^\d{4}$/.test(strVal)) {
      zzzz = strVal;
    } else {
      const dateObj = new Date(joinedDateOrYear);
      zzzz = isNaN(dateObj.getTime()) ? "2024" : dateObj.getFullYear().toString();
    }
  }
  
  const sequentialNum = String(index).padStart(4, "0");
  return `OI${xx}${yy}${zzzz}${sequentialNum}`;
};

export const getFormattedEmployeeId = (emp, index = 1) => {
  if (emp?.employeeId && emp.employeeId.startsWith('OI')) return emp.employeeId;
  const names = (emp?.name || 'Staff Member').trim().split(' ');
  const first = (names[0] || 'XX').slice(0, 2).toUpperCase().padEnd(2, 'X');
  const last = (names[1] || names[0]?.slice(2, 4) || 'YY').slice(0, 2).toUpperCase().padEnd(2, 'Y');
  const rawDate = emp?.joinedDate || emp?.joinDate || emp?.createdAt;
  const year = rawDate ? new Date(rawDate).getFullYear() : 2024;
  const seq = String(index).padStart(4, '0');
  return `OI${first}${last}${year}${seq}`;
};

export const parseSalaryToLakhs = (salaryStr) => {
  if (!salaryStr) return "";
  if (/^\d+(\.\d+)?$/.test(String(salaryStr).trim())) {
    const val = parseFloat(salaryStr);
    return val > 1000 ? (val / 100000).toFixed(2) : val;
  }
  const cleanStr = String(salaryStr).replace(/[^0-9.]/g, "");
  if (!cleanStr) return "";
  const val = parseFloat(cleanStr);
  return val > 100 ? (val / 100000).toFixed(2) : val;
};

export const formatLakhsToSalaryStr = (lakhs) => {
  if (!lakhs) return "";
  const numericVal = parseFloat(lakhs);
  if (isNaN(numericVal)) return lakhs;
  const totalRupees = Math.round(numericVal * 100000);
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });
  return `${formatter.format(totalRupees)} / yr`;
};
