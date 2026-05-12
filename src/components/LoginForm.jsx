import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/auth-form.css'

export default function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(form.email, form.password)
      if (result.success) {
        navigate('/dashboard', { replace: true })
      } else {
        setError(result.error ?? 'Login failed. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="af-card">
      <div className="af-header">
        <h2 className="af-title">Login</h2>
        <p className="af-sub">Welcome back — sign in to continue.</p>
      </div>

      {error && (
        <div className="af-alert" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="af-field">
          <label className="af-label" htmlFor="login-email">
            Email
          </label>
          <div className="af-input-wrap">
            <i className="bi bi-envelope af-input-icon" />
            <input
              id="login-email"
              type="email"
              name="email"
              className="af-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="af-field">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <label className="af-label mb-0" htmlFor="login-password">
              Password
            </label>
            <Link to="/forgot-password" className="af-forgot">
              Forgot password?
            </Link>
          </div>
          <div className="af-input-wrap">
            <i className="bi bi-lock af-input-icon" />
            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              name="password"
              className="af-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="af-eye"
              onClick={() => setShowPass((p) => !p)}
              tabIndex={-1}
              aria-label="Toggle password visibility"
            >
              <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`} />
            </button>
          </div>
        </div>

        <button type="submit" className="af-btn w-100 mt-2" disabled={loading}>
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              />
              Signing in…
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

    </div>
  )
}
