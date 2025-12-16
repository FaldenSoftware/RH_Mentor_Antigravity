
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LoginPage from './pages/auth/LoginPage'
import RegisterManagerPage from './pages/auth/RegisterManagerPage'
import './index.css' // Ensure tailwind is loaded

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register-manager" element={<RegisterManagerPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Dashboard route will come later */}
          <Route path="/dashboard" element={<div>Dashboard (Protected)</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
