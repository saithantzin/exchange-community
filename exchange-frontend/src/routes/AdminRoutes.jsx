import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import { useAuth } from '../context/AuthContext';

export function AdminRouteGuard() {
  const { currentUser } = useAuth();
  const location = useLocation();

  const token = localStorage.getItem('admin_token') || localStorage.getItem('recirculate_token');
  const isAdmin = currentUser?.role === 'admin' || Boolean(localStorage.getItem('admin_token'));

  // If no admin session exists, redirect to the unified login page
  if (!token || !isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <AdminLayout />;
}

export default AdminRouteGuard;
