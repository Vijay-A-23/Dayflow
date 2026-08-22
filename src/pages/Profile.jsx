import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useHR } from "../context/HRContext";
import { generateCustomEmployeeId, parseSalaryToLakhs, formatLakhsToSalaryStr } from "../utils/employeeIdGenerator";
import { 
  User, 
  Briefcase, 
  DollarSign, 
  Lock, 
  Check, 
  Edit3, 
  X, 
  Calendar, 
  Building, 
  ShieldCheck,
  Save,
  LockKeyhole,
  Info
} from "lucide-react";

export const Profile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userProfile, userRole } = useAuth();
  const { employees, updateEmployee, loading: hrLoading } = useHR();

  // Redirect check / Safe Fallback:
  // If role is employee and they try to target another user ID, safe fallback to self
  const rawTargetId = searchParams.get("id");
  const isEmployee = userRole === "employee";
  const targetId = isEmployee ? userProfile?.id : (rawTargetId || userProfile?.id);

  // Tabs: "personal" | "job" | "financial"
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);

  // Find targeted employee profile
  const targetProfile = employees.find(e => e.id === targetId) || userProfile;

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    personalEmail: "",
    email: "", // Work Email
    phone: "",
    emergencyContact: "",
    address: "",
    dob: "",
    
    department: "Engineering",
    position: "",
    manager: "",
    employmentType: "Full-time",
    workLocation: "HQ - Office",
    
    salary: "",
    bankName: "",
    bankAccount: "",
    ifscCode: "",
    taxId: ""
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync state with targeted employee profile when changed
  useEffect(() => {
    if (targetProfile) {
      setFormData({
        name: targetProfile.name || "",
        personalEmail: targetProfile.personalDetails?.personalEmail || targetProfile.personalEmail || "",
        email: targetProfile.email || "",
        phone: targetProfile.personalDetails?.phone || targetProfile.phone || "",
        emergencyContact: targetProfile.personalDetails?.emergencyContact || targetProfile.emergencyContact || "",
        address: targetProfile.personalDetails?.address || targetProfile.address || "",
        dob: targetProfile.personalDetails?.dob || targetProfile.dob || "",
        
        department: targetProfile.jobDetails?.department || targetProfile.department || "Engineering",
        position: targetProfile.jobDetails?.position || targetProfile.position || "",
        manager: targetProfile.jobDetails?.manager || targetProfile.manager || "",
        employmentType: targetProfile.jobDetails?.employmentType || targetProfile.employmentType || "Full-time",
        workLocation: targetProfile.jobDetails?.workLocation || targetProfile.workLocation || "HQ - Office",
        
        salary: parseSalaryToLakhs(targetProfile.salaryDetails?.baseSalary || targetProfile.salary || ""),
        bankName: targetProfile.salaryDetails?.bankName || targetProfile.bankName || "",
        bankAccount: targetProfile.salaryDetails?.accountNumber || targetProfile.bankAccount || "",
        ifscCode: targetProfile.salaryDetails?.ifscCode || targetProfile.ifscCode || "",
        taxId: targetProfile.salaryDetails?.taxId || targetProfile.taxId || ""
      });
    }
  }, [targetId, targetProfile]);

  // Check if Employee tries to access unauthorized ID and redirect them
  useEffect(() => {
    if (isEmployee && rawTargetId && rawTargetId !== userProfile?.id) {
      // Force URL path back to self
      navigate("/profile", { replace: true });
    }
  }, [rawTargetId, isEmployee, userProfile, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    try {
      await updateEmployee(targetProfile.id, {
        ...formData,
        salary: formatLakhsToSalaryStr(formData.salary)
      });
      setIsEditing(false);
      setSuccessMsg("Profile details updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      alert("Failed to update profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: targetProfile.name || "",
      personalEmail: targetProfile.personalEmail || "",
      email: targetProfile.email || "",
      phone: targetProfile.phone || "",
      emergencyContact: targetProfile.emergencyContact || "",
      address: targetProfile.address || "",
      dob: targetProfile.dob || "",
      
      department: targetProfile.department || "Engineering",
      position: targetProfile.position || "",
      manager: targetProfile.manager || "",
      employmentType: targetProfile.employmentType || "Full-time",
      workLocation: targetProfile.workLocation || "HQ - Office",
      
      salary: targetProfile.salary || "",
      bankName: targetProfile.bankName || "",
      bankAccount: targetProfile.bankAccount || "",
      ifscCode: targetProfile.ifscCode || "",
      taxId: targetProfile.taxId || ""
    });
    setIsEditing(false);
  };

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const isFieldReadOnly = (tabName, fieldName) => {
    if (!isEditing) return true; // not in edit mode
    if (userRole === "admin") return false; // admin has full access

    // Employee limits:
    if (tabName === "personal") {
      // Personal Details: Phone, Address, and Emergency Contact are editable; Name & Emails are locked
      if (fieldName === "phone" || fieldName === "address" || fieldName === "emergencyContact") {
        return false;
      }
    }
    // All other fields in job & financials are strictly locked
    return true;
  };

  const getInitials = (fullName) => {
    if (!fullName) return "U";
    return fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const isSelf = targetProfile?.id === userProfile?.id;

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      
      {/* Page Title & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">
            {isSelf ? "My Profile" : "Employee Profile"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {isSelf 
              ? "Manage your settings, emergency contacts, and banking channels." 
              : `Review credentials and organizational metrics for ${targetProfile?.name}.`
            }
          </p>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-sm text-emerald-400 animate-pulse">
            <Check className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile Header Hero Card */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
          <div className="h-28 bg-gradient-to-r from-violet-900/60 to-indigo-900/40" />
          
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-14 mb-6 gap-4">
              <div className="flex items-end gap-4">
                {targetProfile?.avatarUrl || targetProfile?.avatar ? (
                  <img
                    src={targetProfile.avatarUrl || targetProfile.avatar}
                    alt={targetProfile.name}
                    className="h-24 w-24 rounded-2xl object-cover border-4 border-slate-900 bg-slate-900 shadow-xl"
                  />
                ) : (
                  <div className={`flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-slate-900 text-white font-display text-3xl font-extrabold shadow-xl ${
                    (targetProfile?.role || "employee") === "admin"
                      ? "bg-gradient-to-br from-violet-500 to-indigo-600"
                      : "bg-gradient-to-br from-emerald-500 to-teal-600"
                  }`}>
                    {getInitials(targetProfile?.name)}
                  </div>
                )}
                
                <div className="mb-1 space-y-1">
                  <div className="flex items-center flex-wrap gap-2.5">
                    <h2 className="font-display text-xl md:text-2xl font-extrabold text-white">
                      {targetProfile?.name}
                    </h2>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border capitalize ${
                      (targetProfile?.role || "employee") === "admin"
                        ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}>
                      {targetProfile?.role || "employee"}
                    </span>
                    {targetProfile?.employeeId && (
                      <span className="inline-flex rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-violet-300 border border-violet-500/20">
                        {targetProfile.employeeId}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-350 text-xs md:text-sm font-medium flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-slate-500" />
                    {(targetProfile?.jobDetails?.position || targetProfile?.position || "Position Unset")} &bull; {(targetProfile?.jobDetails?.department || targetProfile?.department)}
                  </p>
                </div>
              </div>

              {/* Master Edit Actions */}
              {(isSelf || userRole === "admin") && (
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading || hrLoading}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 transition-all cursor-pointer"
                      >
                        <Save className="h-3.5 w-3.5" />
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 px-4 py-2.5 text-xs font-semibold text-white transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit Profile
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick Joined Date Badge */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <span>Joined on {targetProfile?.joinDate || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex border-b border-slate-800/80 gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`flex items-center gap-2 pb-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "personal"
                ? "border-violet-500 text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <User className="h-4 w-4" />
            Personal Details
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab("job")}
            className={`flex items-center gap-2 pb-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "job"
                ? "border-violet-500 text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Job & Organization
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("financial")}
            className={`flex items-center gap-2 pb-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "financial"
                ? "border-violet-500 text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <DollarSign className="h-4 w-4" />
            Salary & Financials
          </button>
        </div>

        {/* Tab Panel Content */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          
          {/* TAB 1: Personal Details */}
          {activeTab === "personal" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 className="font-display text-base font-bold text-white">Personal Information</h3>
                <span className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider">Tab 1 of 3</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Full Name */}
                {renderInputRow("Full Name", "name", formData.name, "personal", "text", "Alexander Pierce")}
                
                {/* Personal Email */}
                {renderInputRow("Personal Email", "personalEmail", formData.personalEmail, "personal", "email", "alex@personal.com")}

                {/* Phone */}
                {renderInputRow("Phone Number", "phone", formData.phone, "personal", "text", "+1 (555) 012-3456")}

                {/* Emergency contact */}
                {renderInputRow("Emergency Contact", "emergencyContact", formData.emergencyContact, "personal", "text", "Jane Pierce (+1 555-0987)")}

                {/* Residential address */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-350 flex items-center gap-1.5">
                    <span>Residential Address</span>
                    {isFieldReadOnly("personal", "address") && <Lock className="h-3 w-3 text-slate-500 shrink-0" />}
                  </label>
                  <textarea
                    rows={3}
                    disabled={isFieldReadOnly("personal", "address")}
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter street address, city, and zip..."
                    className={`w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 px-3.5 text-sm text-white placeholder-slate-600 focus:border-violet-500 ${
                      isFieldReadOnly("personal", "address") ? "opacity-60 cursor-not-allowed bg-slate-900/20" : ""
                    }`}
                  />
                </div>

                {/* Date of Birth */}
                {renderInputRow("Date of Birth", "dob", formData.dob, "personal", "date", "")}

              </div>
            </div>
          )}

          {/* TAB 2: Job & Organization */}
          {activeTab === "job" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-bold text-white">Employment & Hierarchy</h3>
                  {isEmployee && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/50 px-2.5 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-800">
                      <LockKeyhole className="h-3 w-3 text-violet-500" />
                      Managed by HR
                    </span>
                  )}
                </div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider">Tab 2 of 3</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Employee ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-350 flex items-center gap-1.5">
                    <span>Employee ID</span>
                    <Lock className="h-3 w-3 text-slate-500 shrink-0" />
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={targetProfile.employeeId || generateCustomEmployeeId(targetProfile.name, targetProfile.joinDate || targetProfile.joinedDate || targetProfile.createdAt || '2024-01-01', employees.findIndex(e => e.id === targetProfile.id) !== -1 ? employees.findIndex(e => e.id === targetProfile.id) + 1 : 1)}
                    className="w-full rounded-xl border border-slate-850 bg-slate-900/20 py-2.5 px-3.5 text-sm text-slate-400 opacity-60 cursor-not-allowed font-mono font-bold"
                  />
                </div>

                {/* Designation */}
                {renderInputRow("Designation / Title", "position", formData.position, "job", "text", "Staff Software Engineer")}

                {/* Department dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-350 flex items-center gap-1.5">
                    <span>Department</span>
                    {isFieldReadOnly("job", "department") && <Lock className="h-3 w-3 text-slate-500 shrink-0" />}
                  </label>
                  <select
                    disabled={isFieldReadOnly("job", "department")}
                    value={formData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    className={`w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 px-3 text-sm text-slate-300 focus:border-violet-500 cursor-pointer ${
                      isFieldReadOnly("job", "department") ? "opacity-60 cursor-not-allowed bg-slate-900/20" : ""
                    }`}
                  >
                    <option value="Human Resources">Human Resources</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                {/* Reporting Manager */}
                {renderInputRow("Reporting Manager", "manager", formData.manager, "job", "text", "Sarah Jenkins")}

                {/* Employment Type dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-350 flex items-center gap-1.5">
                    <span>Employment Type</span>
                    {isFieldReadOnly("job", "employmentType") && <Lock className="h-3 w-3 text-slate-500 shrink-0" />}
                  </label>
                  <select
                    disabled={isFieldReadOnly("job", "employmentType")}
                    value={formData.employmentType}
                    onChange={(e) => handleInputChange("employmentType", e.target.value)}
                    className={`w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 px-3 text-sm text-slate-300 focus:border-violet-500 cursor-pointer ${
                      isFieldReadOnly("job", "employmentType") ? "opacity-60 cursor-not-allowed bg-slate-900/20" : ""
                    }`}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                {/* Work Location */}
                {renderInputRow("Work Location", "workLocation", formData.workLocation, "job", "text", "HQ - California")}

              </div>
            </div>
          )}

          {/* TAB 3: Salary & Financials */}
          {activeTab === "financial" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-bold text-white">Financial Details</h3>
                  {isEmployee && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/50 px-2.5 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-800">
                      <LockKeyhole className="h-3 w-3 text-violet-500" />
                      Locked
                    </span>
                  )}
                </div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider">Tab 3 of 3</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Base Salary */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-355 flex items-center gap-1.5">
                    <span>Base Salary (INR / LPA)</span>
                    {isFieldReadOnly("financial", "salary") && <Lock className="h-3 w-3 text-slate-500 shrink-0" />}
                  </label>
                  <div className="relative">
                    <span className="absolute top-2.5 left-3 text-sm text-slate-500 font-semibold">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      disabled={isFieldReadOnly("financial", "salary")}
                      value={formData.salary}
                      onChange={(e) => handleInputChange("salary", e.target.value)}
                      placeholder="e.g. 18.5"
                      className={`w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 pl-7 pr-3.5 text-sm text-white focus:border-violet-500 ${
                        isFieldReadOnly("financial", "salary") ? "opacity-60 cursor-not-allowed bg-slate-900/20" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Bank Name */}
                {renderInputRow("Bank Name", "bankName", formData.bankName, "financial", "text", "Silicon Valley Bank")}

                {/* Account Number */}
                {renderInputRow("Account Number", "bankAccount", formData.bankAccount, "financial", "text", "998877665544")}

                {/* IFSC/Routing */}
                {renderInputRow("IFSC / Routing Code", "ifscCode", formData.ifscCode, "financial", "text", "SVB0002134")}

                {/* Tax ID/PAN */}
                {renderInputRow("Tax ID / PAN", "taxId", formData.taxId, "financial", "text", "ABCDE1234F")}

              </div>
            </div>
          )}

        </div>

      </form>
    </div>
  );

  // Helper row renderer to make code clean
  function renderInputRow(label, fieldName, value, tabName, type = "text", placeholder = "") {
    const isReadOnly = isFieldReadOnly(tabName, fieldName);
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-350 flex items-center gap-1.5">
          <span>{label}</span>
          {isReadOnly && <Lock className="h-3 w-3 text-slate-505 shrink-0" />}
        </label>
        <input
          type={type}
          disabled={isReadOnly}
          value={value}
          onChange={(e) => handleInputChange(fieldName, e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-slate-800 bg-slate-955/40 py-2.5 px-3.5 text-sm text-white placeholder-slate-600 focus:border-violet-500 ${
            isReadOnly ? "opacity-60 cursor-not-allowed bg-slate-900/20" : ""
          }`}
        />
      </div>
    );
  }
};

export default Profile;
