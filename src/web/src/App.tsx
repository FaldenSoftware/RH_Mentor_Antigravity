import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './modules/auth/contexts/AuthContext';
import { ProtectedRoute } from './modules/auth/components/ProtectedRoute';
import LoginPage from './modules/auth/pages/LoginPage';
import RegisterManagerPage from './modules/auth/pages/RegisterManagerPage';
import RegisterLeaderPage from './modules/auth/pages/RegisterLeaderPage';
import { ManagerDashboard } from './modules/dashboard/pages/ManagerDashboard';
import { ClientsPage } from './modules/clients/pages/ClientsPage';
import { AssessmentsPage } from './modules/assessment/pages/AssessmentsPage';
import { AchievementsPage } from './modules/gamification/pages/AchievementsPage';
import { GoalsPage } from './modules/gamification/pages/GoalsPage';
import { ReportsPage } from './modules/reports/pages/ReportsPage';
import { AssessmentRunner } from './modules/assessment/pages/AssessmentRunner';
import { Loader2 } from 'lucide-react';
import './index.css';

// Component to route based on user role
const DashboardRouter = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  // FORCE MANAGER DASHBOARD FOR REVIEW
  // return profile.role === 'manager' ? <ManagerDashboard /> : <LeaderDashboard />;
  return <ManagerDashboard />;
};

import { ToastProvider } from './components/ui/Toast';

// ... existing imports

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register-manager" element={<RegisterManagerPage />} />
            <Route path="/register-leader" element={<RegisterLeaderPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardRouter />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/assessments" element={<AssessmentsPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/assessment/:id" element={<AssessmentRunner />} />
            </Route>

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
