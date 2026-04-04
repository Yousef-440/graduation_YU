import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/userApi'
import '../styles/auth-form.css'

export default function RegisterForm() {
  const navigate = useNavigate()

  const [form, setForm]             = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [globalError, setGlobalError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    // clear per-field error as the user types
    if (fieldErrors[name] || (name === 'confirm' && fieldErrors.confirmPassword)) {
      setFieldErrors((p) => ({ ...p, [name]: '', confirmPassword: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGlobalError('')
    setFieldErrors({})

    setLoading(true)
    try {
      const { user, fieldErrors: fe, message } = await registerUser({
        name:            form.name,
        email:           form.email,
        password:        form.password,
        confirmPassword: form.confirm,
      })

      if (user) {
        navigate('/login')
        return
      }

      if (fe && Object.keys(fe).length > 0) {
        setFieldErrors(fe)
      } else {
        setGlobalError(message ?? 'Registration failed.')
      }
    } catch {
      setGlobalError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const err        = (field) => fieldErrors[field] || ''
  const confirmErr = fieldErrors.confirmPassword || fieldErrors.confirm || ''

  return (
    <div className="af-card">
      <div className="af-header">
        <h2 className="af-title">Create Account</h2>
        <p className="af-sub">Join thousands of supply chain professionals.</p>
      </div>

      {globalError && (
        <div className="af-alert" role="alert">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>

        {/* Name */}
        <div className="af-field">
          <label className="af-label" htmlFor="reg-name">Full Name</label>
          <div className={`af-input-wrap${err('name') ? ' af-input-wrap--error' : ''}`}>
            <i className="bi bi-person af-input-icon" />
            <input
              id="reg-name"
              type="text"
              name="name"
              className={`af-input${err('name') ? ' af-input--error' : ''}`}
              placeholder="John Smith"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>
          {err('name') && <p className="af-field-error">{err('name')}</p>}
        </div>

        {/* Email */}
        <div className="af-field">
          <label className="af-label" htmlFor="reg-email">Email</label>
          <div className={`af-input-wrap${err('email') ? ' af-input-wrap--error' : ''}`}>
            <i className="bi bi-envelope af-input-icon" />
            <input
              id="reg-email"
              type="email"
              name="email"
              className={`af-input${err('email') ? ' af-input--error' : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>
          {err('email') && <p className="af-field-error">{err('email')}</p>}
        </div>

        {/* Password */}
        <div className="af-field">
          <label className="af-label" htmlFor="reg-password">Password</label>
          <div className={`af-input-wrap${err('password') ? ' af-input-wrap--error' : ''}`}>
            <i className="bi bi-lock af-input-icon" />
            <input
              id="reg-password"
              type={showPass ? 'text' : 'password'}
              name="password"
              className={`af-input${err('password') ? ' af-input--error' : ''}`}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
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
          {err('password') && <p className="af-field-error">{err('password')}</p>}
        </div>

        {/* Confirm Password */}
        <div className="af-field">
          <label className="af-label" htmlFor="reg-confirm">Confirm Password</label>
          <div className={`af-input-wrap${confirmErr ? ' af-input-wrap--error' : ''}`}>
            <i className="bi bi-shield-lock af-input-icon" />
            <input
              id="reg-confirm"
              type={showPass ? 'text' : 'password'}
              name="confirm"
              className={`af-input${confirmErr ? ' af-input--error' : ''}`}
              placeholder="••••••••"
              value={form.confirm}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>
          {confirmErr && <p className="af-field-error">{confirmErr}</p>}
        </div>

        <button type="submit" className="af-btn w-100 mt-2" disabled={loading}>
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              />
              Creating account…
            </>
          ) : (
            'Sign Up'
          )}
        </button>
      </form>

      <p className="af-switch">
        Already have an account?{' '}
        <Link to="/login" className="af-switch-link">
          Login
        </Link>
      </p>
    </div>
  )
}
