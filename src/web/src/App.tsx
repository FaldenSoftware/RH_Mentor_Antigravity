import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './modules/auth/contexts/AuthContext'
import { ProtectedRoute } from './modules/auth/components/ProtectedRoute'
import LoginPage from './modules/auth/pages/LoginPage'
import RegisterManagerPage from './modules/auth/pages/RegisterManagerPage'
import RegisterLeaderPage from './modules/auth/pages/RegisterLeaderPage'
import DashboardLayout from './modules/shared/components/DashboardLayout'
import DashboardPage from './modules/dashboard/pages/DashboardPage'
import MembersPage from './modules/organization/pages/MembersPage'
import ManagerAssessmentList from './modules/assessment/pages/ManagerAssessmentList'
import LeaderAssignmentList from './modules/assessment/pages/LeaderAssignmentList'
import TakeTestPage from './modules/assessment/pages/TakeTestPage'
import AssessmentResultPage from './modules/assessment/pages/AssessmentResultPage'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register-manager" element={<RegisterManagerPage />} />
          <Route path="/register-leader" element={<RegisterLeaderPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="members" element={<MembersPage />} />

              {/* Assessment Routes */}
              <Route path="assessments" element={<ManagerAssessmentList />} />
              <Route path="my-assessments" element={<LeaderAssignmentList />} />
              <Route path="test/:assignmentId" element={<TakeTestPage />} />
              <Route path="result/:assignmentId" element={<AssessmentResultPage />} />
            </Route>
          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
