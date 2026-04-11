import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { forgotPassword, verifyOtp, resetPassword } from '../api/authApi'
import '../styles/auth-form.css'

function StepEmail({ onNext }) {
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await forgotPassword(email)
    setLoading(false)
    if (result.error) return setError(result.error)
    onNext(email)
  }

  return (
    <div className="af-card">
      <div className="af-header">
        <div className="fp-step-icon">
          <i className="bi bi-envelope-open" />
        </div>
        <h2 className="af-title">Forgot Password</h2>
        <p className="af-sub">Enter your email and we'll send you a 6-digit code.</p>
      </div>

      {error && <div className="af-alert" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="af-field">
          <label className="af-label" htmlFor="fp-email">Email address</label>
          <div className="af-input-wrap">
            <i className="bi bi-envelope af-input-icon" />
            <input
              id="fp-email"
              type="email"
              className="af-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              autoComplete="email"
              required
            />
          </div>
        </div>

        <button type="submit" className="af-btn w-100 mt-2" disabled={loading}>
          {loading ? (
            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Sending…</>
          ) : 'Send Code'}
        </button>
      </form>

      <p className="af-switch">
        Remember your password?{' '}
        <Link to="/login" className="af-switch-link">Sign in</Link>
      </p>
    </div>
  )
}

function StepOtp({ email, onNext, onBack }) {
  const [digits, setDigits]   = useState(Array(6).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const inputs = useRef([])

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]
    next[idx] = val
    setDigits(next)
    setError('')
    if (val && idx < 5) inputs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setDigits(pasted.split(''))
      inputs.current[5]?.focus()
    }
    e.preventDefault()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otp = digits.join('')
    if (otp.length < 6) return setError('Please enter all 6 digits.')
    setError('')
    setLoading(true)
    const result = await verifyOtp(email, otp)
    setLoading(false)
    if (result.error) return setError(result.error)
    onNext(result.data.resetToken)
  }

  return (
    <div className="af-card">
      <div className="af-header">
        <div className="fp-step-icon">
          <i className="bi bi-shield-lock" />
        </div>
        <h2 className="af-title">Enter Code</h2>
        <p className="af-sub">
          We sent a 6-digit code to<br />
          <span className="fp-email-highlight">{email}</span>
        </p>
      </div>

      {error && <div className="af-alert" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="fp-otp-wrap" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className={`fp-otp-box${error ? ' af-input--error' : ''}`}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoFocus={i === 0}
            />
          ))}
        </div>

        <button type="submit" className="af-btn w-100 mt-3" disabled={loading}>
          {loading ? (
            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Verifying…</>
          ) : 'Verify Code'}
        </button>
      </form>

      <div className="fp-resend-row">
        <span className="af-sub">Didn't receive it?</span>
        <button className="fp-resend-btn" onClick={onBack} type="button">
          Resend code
        </button>
      </div>
    </div>
  )
}

function StepReset({ resetToken, onNext }) {
  const [form, setForm]       = useState({ newPassword: '', confirmPassword: '' })
  const [show, setShow]       = useState({ new: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword.length < 8) return setError('Password must be at least 8 characters.')
    if (form.newPassword !== form.confirmPassword) return setError('Passwords do not match.')
    setError('')
    setLoading(true)
    const result = await resetPassword(resetToken, form.newPassword, form.confirmPassword)
    setLoading(false)
    if (result.error) return setError(result.error)
    onNext()
  }

  return (
    <div className="af-card">
      <div className="af-header">
        <div className="fp-step-icon">
          <i className="bi bi-key" />
        </div>
        <h2 className="af-title">New Password</h2>
        <p className="af-sub">Choose a strong password for your account.</p>
      </div>

      {error && <div className="af-alert" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="af-field">
          <label className="af-label" htmlFor="fp-new-pass">New Password</label>
          <div className="af-input-wrap">
            <i className="bi bi-lock af-input-icon" />
            <input
              id="fp-new-pass"
              type={show.new ? 'text' : 'password'}
              name="newPassword"
              className="af-input"
              placeholder="Min. 8 characters"
              value={form.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
            <button type="button" className="af-eye" onClick={() => setShow((p) => ({ ...p, new: !p.new }))} tabIndex={-1}>
              <i className={`bi ${show.new ? 'bi-eye-slash' : 'bi-eye'}`} />
            </button>
          </div>
        </div>

        <div className="af-field">
          <label className="af-label" htmlFor="fp-confirm-pass">Confirm Password</label>
          <div className="af-input-wrap">
            <i className="bi bi-lock-fill af-input-icon" />
            <input
              id="fp-confirm-pass"
              type={show.confirm ? 'text' : 'password'}
              name="confirmPassword"
              className="af-input"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
            <button type="button" className="af-eye" onClick={() => setShow((p) => ({ ...p, confirm: !p.confirm }))} tabIndex={-1}>
              <i className={`bi ${show.confirm ? 'bi-eye-slash' : 'bi-eye'}`} />
            </button>
          </div>
        </div>

        <button type="submit" className="af-btn w-100 mt-2" disabled={loading}>
          {loading ? (
            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Saving…</>
          ) : 'Reset Password'}
        </button>
      </form>
    </div>
  )
}

function StepSuccess() {
  const navigate = useNavigate()
  return (
    <div className="af-card" style={{ textAlign: 'center' }}>
      <div className="fp-success-icon">
        <i className="bi bi-check-circle-fill" />
      </div>
      <h2 className="af-title" style={{ marginBottom: 10 }}>Password Reset!</h2>
      <p className="af-sub" style={{ marginBottom: 28 }}>
        Your password has been updated successfully.<br />
        You can now sign in with your new password.
      </p>
      <button className="af-btn w-100" onClick={() => navigate('/login', { replace: true })}>
        Go to Sign In
      </button>
    </div>
  )
}

export default function ForgotPasswordPage() {
  const [step, setStep]             = useState('email')
  const [email, setEmail]           = useState('')
  const [resetToken, setResetToken] = useState('')

  return (
    <>
      <style>{`
        .fp-step-icon {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: rgba(0,220,100,0.12);
          border: 1px solid rgba(0,220,100,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; color: #00e06a;
          margin: 0 auto 16px;
        }
        .fp-email-highlight {
          color: #00e06a; font-weight: 600;
        }
        .fp-otp-wrap {
          display: flex; gap: 10px; justify-content: center; margin: 8px 0 4px;
        }
        .fp-otp-box {
          width: 48px; height: 56px;
          background: var(--af-input-bg);
          border: 1px solid var(--af-input-border);
          border-radius: 12px;
          color: var(--af-input-text); font-size: 1.5rem; font-weight: 700;
          text-align: center; outline: none;
          caret-color: #00ff78;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.25s, color 0.25s;
          -webkit-text-fill-color: var(--af-input-text);
        }
        .fp-otp-box:focus {
          border-color: rgba(0,220,100,0.55);
          box-shadow: 0 0 0 3px rgba(0,220,100,0.13);
        }
        .fp-resend-row {
          display: flex; align-items: center; justify-content: center;
          gap: 6px; margin-top: 18px;
          font-size: 0.86rem;
        }
        .fp-resend-btn {
          background: none; border: none; padding: 0;
          color: #00e06a; font-weight: 600; font-size: 0.86rem;
          cursor: pointer; transition: color 0.18s;
        }
        .fp-resend-btn:hover { color: #5cff85; text-decoration: underline; }
        .fp-success-icon {
          font-size: 56px; color: #00e06a;
          margin-bottom: 16px;
          text-shadow: 0 0 28px rgba(0,220,100,0.45);
        }
      `}</style>

      <AuthLayout>
        {step === 'email' && (
          <StepEmail onNext={(e) => { setEmail(e); setStep('otp') }} />
        )}
        {step === 'otp' && (
          <StepOtp
            email={email}
            onNext={(token) => { setResetToken(token); setStep('reset') }}
            onBack={() => setStep('email')}
          />
        )}
        {step === 'reset' && (
          <StepReset resetToken={resetToken} onNext={() => setStep('success')} />
        )}
        {step === 'success' && <StepSuccess />}
      </AuthLayout>
    </>
  )
}
