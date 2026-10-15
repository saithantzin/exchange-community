import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderTree,
  PackageCheck,
  Repeat,
  AlertTriangle,
  History,
  UserCog,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

export default function AdminSidebar({ isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Member Management', path: '/admin/members', icon: Users },
    { name: 'Category Management', path: '/admin/categories', icon: FolderTree },
    { name: 'Item Management', path: '/admin/items', icon: PackageCheck },
    { name: 'Exchange Monitoring', path: '/admin/exchanges', icon: Repeat },
    { name: 'Reports & Disputes', path: '/admin/reports', icon: AlertTriangle },
    { name: 'Exchange History', path: '/admin/history', icon: History },
    { name: 'Admin Profile', path: '/admin/profile', icon: UserCog }
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen bg-[#2C1D15] text-[#DDD1BF] border-r border-[#3d291e] transition-all duration-300 flex flex-col justify-between ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-[#3d291e]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-[#DDD1BF] text-[#2C1D15] flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6 text-[#2C1D15]" />
              </div>
              {(!isCollapsed || mobileOpen) && (
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-base text-white tracking-tight truncate">
                    ReCirculate
                  </span>
                  <span className="text-[10px] tracking-wider text-[#DDD1BF]/70 uppercase font-semibold">
                    Admin Portal
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 rounded-lg text-[#DDD1BF]/70 hover:text-white hover:bg-[#3d291e] transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-[#5C4033] text-white shadow-xs'
                        : 'text-[#DDD1BF]/80 hover:bg-[#3d291e] hover:text-white'
                    } ${isCollapsed && !mobileOpen ? 'justify-center px-0' : ''}`
                  }
                  title={isCollapsed && !mobileOpen ? item.name : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                  {(!isCollapsed || mobileOpen) && (
                    <span className="truncate">{item.name}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: User Side Link & Logout */}
        <div className="p-3 border-t border-[#3d291e] space-y-1">
          <NavLink
            to="/"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#DDD1BF]/70 hover:text-white hover:bg-[#3d291e] transition-colors ${
              isCollapsed && !mobileOpen ? 'justify-center px-0' : ''
            }`}
            title={isCollapsed && !mobileOpen ? 'Back to User Portal' : undefined}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            {(!isCollapsed || mobileOpen) && <span>Back to Community</span>}
          </NavLink>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 transition-colors ${
              isCollapsed && !mobileOpen ? 'justify-center px-0' : ''
            }`}
            title={isCollapsed && !mobileOpen ? 'Logout' : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {(!isCollapsed || mobileOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
