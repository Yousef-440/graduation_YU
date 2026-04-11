import { Link } from 'react-router-dom'
import { useThemeMode } from '../context/ThemeContext'

export default function CTA() {
  const { mode } = useThemeMode()
  const isDark = mode === 'dark'

  const sectionBg = isDark
    ? 'radial-gradient(ellipse at 50% 60%, rgba(0,255,120,0.1) 0%, rgba(0,100,255,0.08) 40%, transparent 70%), linear-gradient(180deg, #040d1e 0%, #020818 100%)'
    : 'radial-gradient(ellipse at 50% 60%, rgba(0,200,100,0.07) 0%, rgba(0,100,255,0.05) 40%, transparent 70%), linear-gradient(180deg, #e8eef8 0%, #f0f4f8 100%)'

  return (
    <section
      style={{
        background: sectionBg,
        padding: '90px 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.25s ease',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          height: 500,
          borderRadius: '50%',
          border: isDark ? '1px solid rgba(0,255,120,0.08)' : '1px solid rgba(0,200,100,0.1)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700,
          height: 700,
          borderRadius: '50%',
          border: isDark ? '1px solid rgba(0,100,255,0.06)' : '1px solid rgba(0,100,255,0.07)',
          pointerEvents: 'none',
        }}
      />

      <div className="container position-relative">
        <span
          className="badge rounded-pill mb-3 px-3 py-2"
          style={{
            background: 'rgba(0,255,120,0.12)',
            color: '#00c850',
            border: '1px solid rgba(0,255,120,0.3)',
            fontSize: 13,
          }}
        >
          <i className="bi bi-arrow-up-right-circle-fill me-1" />
          Get Started Today
        </span>

        <h2
          className="fw-bold mb-3"
          style={{
            color: 'var(--landing-text-primary)',
            fontSize: 'clamp(1.6rem, 3vw, 2.5rem)',
            lineHeight: 1.3,
            transition: 'color 0.25s ease',
          }}
        >
          Start Managing Your Supply Chain{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #00ff78, #00c6ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Smarter Today
          </span>
        </h2>

        <p
          className="mx-auto mb-4"
          style={{
            color: 'var(--landing-text-secondary)',
            maxWidth: 500,
            fontSize: '1rem',
            lineHeight: 1.7,
            transition: 'color 0.25s ease',
          }}
        >
          Join thousands of logistics professionals using Smart Supply Chain to
          streamline operations and boost performance.
        </p>

        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link
            to="/register"
            className="btn px-5 py-3 fw-bold rounded-pill"
            style={{
              background: 'linear-gradient(135deg, #00ff78, #00c850)',
              color: '#000',
              fontSize: '1rem',
              boxShadow: '0 0 28px rgba(0,255,120,0.45)',
              letterSpacing: '0.3px',
            }}
          >
            <i className="bi bi-person-plus-fill me-2" />
            Sign Up Now
          </Link>
        </div>

        <div
          className="d-flex justify-content-center gap-4 mt-5 flex-wrap"
          style={{ color: 'var(--landing-text-secondary)', fontSize: '0.82rem', transition: 'color 0.25s ease' }}
        >
          {[
            { icon: 'bi-shield-check-fill', text: 'No credit card required', color: '#00c850' },
            { icon: 'bi-lightning-charge-fill', text: 'Setup in 2 minutes', color: '#00c6ff' },
            { icon: 'bi-arrow-counterclockwise', text: '14-day free trial', color: '#ff9900' },
          ].map(({ icon, text, color }) => (
            <span key={text} className="d-flex align-items-center gap-1">
              <i className={`bi ${icon}`} style={{ color }} />
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
