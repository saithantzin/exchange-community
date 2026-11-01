import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Guest Pages
import HomePage from './pages/guest/HomePage';
import BrowseItemsPage from './pages/guest/BrowseItemsPage';
import ItemDetailsPage from './pages/guest/ItemDetailsPage';
import LoginPage from './pages/guest/LoginPage';
import RegisterPage from './pages/guest/RegisterPage';
import HowItWorksPage from './pages/guest/HowItWorksPage';

// Member Pages
import MemberDashboardPage from './pages/member/MemberDashboardPage';
import MyItemsPage from './pages/member/MyItemsPage';
import AddEditItemPage from './pages/member/AddEditItemPage';
import SmartMatchingPage from './pages/member/SmartMatchingPage';
import ExchangeRequestsPage from './pages/member/ExchangeRequestsPage';
import ExchangeDetailsPage from './pages/member/ExchangeDetailsPage';
import ExchangeHistoryPage from './pages/member/ExchangeHistoryPage';
import ReportsDisputesPage from './pages/member/ReportsDisputesPage';
import ProfileSettingsPage from './pages/member/ProfileSettingsPage';
import NotificationsPage from './pages/member/NotificationsPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Members from './pages/admin/Members';
import Categories from './pages/admin/Categories';
import Items from './pages/admin/Items';
import Exchanges from './pages/admin/Exchanges';
import ExchangeDetails from './pages/admin/ExchangeDetails';
import ReportsDisputes from './pages/admin/ReportsDisputes';
import ExchangeHistory from './pages/admin/ExchangeHistory';
import AdminProfile from './pages/admin/AdminProfile';
import AdminRouteGuard from './routes/AdminRoutes';

export default function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Dedicated Admin routing subtree without user navbar/footer
  if (isAdminPath) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminRouteGuard />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="categories" element={<Categories />} />
          <Route path="items" element={<Items />} />
          <Route path="exchanges" element={<Exchanges />} />
          <Route path="exchanges/:id" element={<ExchangeDetails />} />
          <Route path="reports" element={<ReportsDisputes />} />
          <Route path="history" element={<ExchangeHistory />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Routes>
    );
  }

  // Public & Member Platform Routing
  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Sticky Header Navigation (Hidden on Login & Register) */}
      {!isAuthPage && <Navbar />}

      {/* Main Routed Content */}
      <main className="flex-grow-1">
        <Routes>
          {/* Public / Guest Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowseItemsPage />} />
          <Route path="/item/:id" element={<ItemDetailsPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Member Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MemberDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-items"
            element={
              <ProtectedRoute>
                <MyItemsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-item"
            element={
              <ProtectedRoute>
                <AddEditItemPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-item/:id"
            element={
              <ProtectedRoute>
                <AddEditItemPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <SmartMatchingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <ExchangeRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exchange/:id"
            element={
              <ProtectedRoute>
                <ExchangeDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <ExchangeHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsDisputesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Persistent Footer (Hidden on Login & Register) */}
      {!isAuthPage && <Footer />}
    </div>
  );
}
