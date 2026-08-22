import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Phone, Mail, Building, Briefcase, Calendar, ShieldCheck, Check, Edit3, X } from "lucide-react";

export const Profile = () => {
  const { userProfile, updateProfileDetails } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userProfile?.name || "");
  const [phone, setPhone] = useState(userProfile?.phone || "");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setSuccessMsg("");
    try {
      await updateProfileDetails({
        name,
        phone
      });
      setIsEditing(false);
      setSuccessMsg("Profile details updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert("Failed to update profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(userProfile?.name || "");
    setPhone(userProfile?.phone || "");
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">My Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your personal information and contact details.</p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-sm text-emerald-400">
          <Check className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main card */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        
        {/* Banner area */}
        <div className="h-32 bg-gradient-to-r from-violet-900 to-indigo-900" />
        
        {/* Profile Card Header */}
        <div className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-16 mb-6 gap-4">
            <div className="flex items-end gap-4">
              <img
                src={userProfile?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"}
                alt={userProfile?.name}
                className="h-28 w-28 rounded-2xl object-cover border-4 border-slate-900 bg-slate-900 shadow-xl"
              />
              <div className="mb-2">
                <h2 className="font-display text-2xl font-extrabold text-white">
                  {userProfile?.name}
                </h2>
                <p className="text-violet-400 text-sm font-semibold">{userProfile?.position}</p>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 px-4 py-2 text-sm font-semibold text-white transition-all active:scale-[0.98]"
              >
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Details panel */}
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Display Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-850 bg-slate-950/60 py-2.5 px-3.5 text-sm text-white focus:border-violet-500 focus:bg-slate-950"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Contact Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-xl border border-slate-850 bg-slate-950/60 py-2.5 px-3.5 text-sm text-white focus:border-violet-500 focus:bg-slate-950"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-800/60 pt-4 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-xl border border-slate-850 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-900 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 transition-all disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            // Static display list
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/20 p-5 rounded-2xl border border-slate-800/40">
              
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Employment Information</h3>
                
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Building className="h-4 w-4 text-slate-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500">Department</p>
                    <p className="font-semibold text-white">{userProfile?.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Briefcase className="h-4 w-4 text-slate-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500">Role Title</p>
                    <p className="font-semibold text-white">{userProfile?.position}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500">Date of Joining</p>
                    <p className="font-semibold text-white">{userProfile?.joinDate || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Contact & Credentials</h3>
                
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500">Work Email</p>
                    <p className="font-semibold text-white">{userProfile?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500">Phone</p>
                    <p className="font-semibold text-white">{userProfile?.phone || "Not set"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-slate-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500">System Role</p>
                    <p className="font-semibold text-white capitalize">{userProfile?.role}</p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Profile;
