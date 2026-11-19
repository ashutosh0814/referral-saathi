import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ReferralsPage from './pages/ReferralsPage';
import ReferralDetailPage from './pages/ReferralDetailPage';
import RemindersPage from './pages/RemindersPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Auth Route */}
      <Route path="/auth" element={<AuthPage />} />
      
      {/* Legacy routes - redirect to /auth */}
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/register" element={<Navigate to="/auth" replace />} />

      {/* Protected Routes - Wrapped in AppLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/referrals" element={<ReferralsPage />} />
        <Route path="/referrals/:referralId" element={<ReferralDetailPage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Root redirect */}
      <Route
        path="/"
        element={
          user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />
        }
      />

      {/* Catch all - redirect based on auth status */}
      <Route
        path="*"
        element={
          user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />
        }
      />
    </Routes>
  );
}

export default App;
