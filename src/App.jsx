import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar           from './components/Navbar'
import Hero             from './components/Hero'
import Features         from './components/Features'
import DashboardPreview from './components/DashboardPreview'
import CTA              from './components/CTA'
import LoginPage        from './pages/LoginPage'
import RegisterPage     from './pages/RegisterPage'
import DashboardPage    from './pages/DashboardPage'

function LandingPage() {
  return (
    <div style={{ background: '#020818', minHeight: '100vh' }}>
      <Navbar />
      <Hero />
      <Features />
      <DashboardPreview />
      <CTA />
      <footer
        style={{
          background: '#010510',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '24px 0',
          textAlign: 'center',
          color: '#8892b0',
          fontSize: '0.85rem',
        }}
      >
        © 2026 Smart Supply Chain. All rights reserved.
      </footer>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { accessToken, loading } = useAuth()

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#060c18',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8892b0',
          fontSize: 14,
        }}
      >
        <span
          className="spinner-border spinner-border-sm me-2"
          role="status"
          aria-hidden="true"
          style={{ borderColor: '#00ff78', borderRightColor: 'transparent' }}
        />
        Loading…
      </div>
    )
  }

  if (!accessToken) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
