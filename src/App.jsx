import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider, useAuth }    from './context/AuthContext'
import { AppThemeProvider }         from './context/ThemeContext'
import Navbar           from './components/Navbar'
import Hero             from './components/Hero'
import Features         from './components/Features'
import DashboardPreview from './components/DashboardPreview'
import CTA              from './components/CTA'
import LoginPage            from './pages/LoginPage'
import RegisterPage         from './pages/RegisterPage'
import DashboardPage        from './pages/DashboardPage'
import ForgotPasswordPage   from './pages/ForgotPasswordPage'
import SuppliersPage        from './pages/SuppliersPage'
import ProductsPage         from './pages/ProductsPage'
import OrdersPage           from './pages/OrdersPage'

function LandingPage() {
  return (
    <div style={{ background: 'var(--landing-bg)', minHeight: '100vh', transition: 'background 0.25s ease' }}>
      <Navbar />
      <Hero />
      <Features />
      <DashboardPreview />
      <CTA />
      <footer
        style={{
          background: 'var(--landing-footer-bg)',
          borderTop: '1px solid var(--landing-footer-border)',
          padding: '24px 0',
          textAlign: 'center',
          color: 'var(--landing-text-secondary)',
          fontSize: '0.85rem',
          transition: 'background 0.25s ease, border-color 0.25s ease',
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
          background: 'var(--bg-page)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
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
      <Route path="/login"            element={<LoginPage />} />
      <Route path="/register"         element={<RegisterPage />} />
      <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/suppliers" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
      <Route path="/products"  element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
      <Route path="/orders"    element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </AppThemeProvider>
    </BrowserRouter>
  )
}
