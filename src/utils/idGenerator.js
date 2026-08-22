import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";

export const generateEmployeeId = async (name, joinDate) => {
  const cleanName = (name || "Jane Doe").trim();
  const parts = cleanName.split(/\s+/);
  const firstName = parts[0] || "XX";
  const lastName = parts.length > 1 ? parts[parts.length - 1] : "YY";
  
  const xx = firstName.slice(0, 2).toUpperCase().padEnd(2, "X");
  const yy = lastName.slice(0, 2).toUpperCase().padEnd(2, "Y");
  
  const dateObj = joinDate ? new Date(joinDate) : new Date();
  const zzzz = isNaN(dateObj.getTime()) ? "2024" : dateObj.getFullYear().toString();
  
  let count = 0;
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const empJoinDate = data.joinDate || data.createdAt || "2024-01-15";
      const empYear = empJoinDate.split("-")[0] || "2024";
      if (empYear === zzzz) {
        count++;
      }
    });
  } catch (err) {
    console.error("Error reading employee count for ID generation:", err);
  }
  
  const sequentialNum = (count + 1).toString().padStart(4, "0");
  return `OI${xx}${yy}${zzzz}${sequentialNum}`;
};
