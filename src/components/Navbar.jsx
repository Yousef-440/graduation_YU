import { Link } from 'react-router-dom'
import { useThemeMode } from '../context/ThemeContext'

export default function Navbar() {
  const { mode, toggleMode } = useThemeMode()
  const isDark = mode === 'dark'

  return (
    <nav
      className="navbar navbar-expand-lg fixed-top"
      style={{
        background: 'var(--landing-nav-bg)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--landing-nav-border)',
        transition: 'background 0.25s ease, border-color 0.25s ease',
      }}
    >
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #00ff78, #00c6ff)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <i className="bi bi-box-seam-fill text-dark fw-bold" style={{ fontSize: 18 }} />
          </div>
          <span className="fw-bold fs-5" style={{ color: 'var(--landing-text-primary)', letterSpacing: '0.5px' }}>
            Supply Chain Management
          </span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          style={{ color: 'var(--landing-text-secondary)' }}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto gap-1">
            {[
              { label: 'Home',      href: '/#home'      },
              { label: 'Features',  href: '/#features'  },
              { label: 'Dashboard', href: '/#dashboard' },
            ].map(({ label, href }) => (
              <li className="nav-item" key={label}>
                <a
                  className="nav-link px-3 py-2 rounded"
                  href={href}
                  style={{ color: 'var(--landing-nav-text)', fontWeight: 500, transition: 'color 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#00ff78')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--landing-nav-text)')}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
            <button
              onClick={toggleMode}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                border: isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(0,0,0,0.12)',
                borderRadius: 8,
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: isDark ? '#fbbf24' : '#64748b',
                fontSize: 15,
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              <i className={`bi ${isDark ? 'bi-sun-fill' : 'bi-moon-fill'}`} />
            </button>

            <Link
              to="/login"
              className="btn btn-sm px-3 py-2 rounded-pill"
              style={{
                borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.18)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.18)'}`,
                color: 'var(--landing-text-primary)',
                fontWeight: 500,
                background: 'transparent',
              }}
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
