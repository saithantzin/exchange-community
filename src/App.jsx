import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

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

export default function App() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Sticky Header Navigation */}
      <Navbar />

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

      {/* Persistent Footer */}
      <Footer />
    </div>
  );
}
