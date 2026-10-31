import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Shield,
  ChevronDown,
  User,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function AdminNavbar({ onToggleMobile }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Retrieve logged-in admin user info if stored, else default
  const storedUser = localStorage.getItem('admin_user');
  const adminUser = storedUser
    ? JSON.parse(storedUser)
    : { name: 'Kyaw Swar Hein', email: 'admin@recirculate.mm', role: 'Super Administrator' };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  return (
    <header className="h-16 bg-[#DDD1BF] border-b border-[#c8bba7] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="p-2 -ml-1 text-[#2C1D15] hover:bg-black/5 rounded-lg md:hidden transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Quick actions, notifications, and profile dropdown */}
      <div className="flex items-center gap-3">
        {/* Link to public community site */}
        <Link
          to="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/70 border border-[#c8bba7] text-[#2C1D15] hover:bg-white transition-colors"
        >
          <span>Live Site</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#5C4033]" />
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-lg text-[#2C1D15] hover:bg-black/5 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-600 ring-2 ring-[#DDD1BF]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#EBE2D8] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-[#EBE2D8] flex items-center justify-between">
                <span className="font-bold text-xs text-[#2C1D15]">Moderation Notifications</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                  2 Pending
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-[#EBE2D8]">
                <div className="p-3 hover:bg-[#F9F6F0] transition-colors cursor-pointer">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-[#2C1D15]">New Dispute Reported</p>
                      <p className="text-[11px] text-[#5C4033] mt-0.5">Item condition mismatch flagged on Exchange #EX-9014.</p>
                      <span className="text-[10px] text-[#8C7A6B] mt-1 block">15 minutes ago</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 hover:bg-[#F9F6F0] transition-colors cursor-pointer">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-[#2C1D15]">Two-Sided Delivery Verified</p>
                      <p className="text-[11px] text-[#5C4033] mt-0.5">Both parties in Mandalay-Yangon exchange confirmed parcel receipt.</p>
                      <span className="text-[10px] text-[#8C7A6B] mt-1 block">1 hour ago</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-2 border-t border-[#EBE2D8] text-center">
                <Link
                  to="/admin/reports"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-[#5C4033] hover:text-[#2C1D15]"
                >
                  View all disputes & reports →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-black/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-[#5C4033] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {adminUser.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-[#2C1D15] leading-tight">
                {adminUser.name}
              </span>
              <span className="text-[10px] text-[#5C4033] font-medium leading-tight">
                {adminUser.role || 'Admin'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#5C4033] hidden md:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#EBE2D8] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-[#EBE2D8]">
                <p className="font-bold text-xs text-[#2C1D15] truncate">{adminUser.name}</p>
                <p className="text-[11px] text-[#8C7A6B] truncate">{adminUser.email}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/admin/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#2C1D15] hover:bg-[#F9F6F0] transition-colors"
                >
                  <User className="w-4 h-4 text-[#5C4033]" />
                  <span>Admin Profile & Security</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-[#EBE2D8]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
