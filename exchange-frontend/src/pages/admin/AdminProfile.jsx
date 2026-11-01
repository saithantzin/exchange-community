import React, { useState } from 'react';
import {
  User,
  Shield,
  Key,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  Save,
  Lock
} from 'lucide-react';

export default function AdminProfile() {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('admin_user');
    return saved
      ? JSON.parse(saved)
      : {
          name: 'Kyaw Swar Hein',
          email: 'admin@recirculate.mm',
          phone: '09798123456',
          role: 'Super Administrator',
          department: 'Platform Trust & Safety Team',
          joinedDate: '2023-01-01'
        };
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('admin_user', JSON.stringify(profile));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordSaved(true);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div>
        <h2 className="text-lg font-bold text-[#2C1D15]">Administrator Profile & Credentials</h2>
        <p className="text-xs text-[#5C4033] mt-0.5">
          Manage system security access, contact information, and moderation authentication keys.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left card: User badge */}
        <div className="bg-white border border-[#EBE2D8] rounded-xl p-6 shadow-xs flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-[#5C4033] text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            {profile.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-base text-[#2C1D15]">{profile.name}</h3>
            <span className="inline-block mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {profile.role}
            </span>
            <p className="text-xs text-[#8C7A6B] mt-2">{profile.department}</p>
          </div>

          <div className="w-full pt-4 border-t border-[#EBE2D8] text-xs text-left space-y-2 text-[#5C4033]">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#8C7A6B]" />
              <span className="truncate">{profile.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#8C7A6B]" />
              <span>{profile.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#8C7A6B]" />
              <span>Full Access Level</span>
            </div>
          </div>
        </div>

        {/* Right 2 columns: Edit Profile & Password Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="bg-white border border-[#EBE2D8] rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-[#2C1D15]">General Account Information</h3>

            {profileSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Profile details successfully updated!</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C1D15] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#EBE2D8] rounded-lg bg-[#F9F6F0] text-[#2C1D15] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2C1D15] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#EBE2D8] rounded-lg bg-[#F9F6F0] text-[#2C1D15] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C1D15] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#EBE2D8] rounded-lg bg-[#F9F6F0] text-[#2C1D15] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2C1D15] mb-1">Department</label>
                  <input
                    type="text"
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#EBE2D8] rounded-lg bg-[#F9F6F0] text-[#2C1D15] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#5C4033] text-white hover:bg-[#2C1D15] transition-colors shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white border border-[#EBE2D8] rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-[#2C1D15]">Update Security Password</h3>

            {passwordSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Password changed successfully.</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2C1D15] mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs border border-[#EBE2D8] rounded-lg bg-[#F9F6F0] text-[#2C1D15] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C1D15] mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 text-xs border border-[#EBE2D8] rounded-lg bg-[#F9F6F0] text-[#2C1D15] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2C1D15] mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Repeat new password"
                    className="w-full px-3 py-2 text-xs border border-[#EBE2D8] rounded-lg bg-[#F9F6F0] text-[#2C1D15] focus:outline-none focus:ring-1 focus:ring-[#5C4033]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#5C4033] text-white hover:bg-[#2C1D15] transition-colors shadow-xs"
                >
                  <Lock className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
