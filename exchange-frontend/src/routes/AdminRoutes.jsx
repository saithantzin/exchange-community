import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';

export function AdminRouteGuard() {
  const token = localStorage.getItem('admin_token');

  // If no token exists, redirect to the admin login portal
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminLayout />;
}

export default AdminRouteGuard;
