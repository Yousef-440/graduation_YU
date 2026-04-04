import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav
      className="navbar navbar-expand-lg fixed-top"
      style={{
        background: 'rgba(5, 10, 25, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0, 255, 120, 0.12)',
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
          <span className="fw-bold fs-5" style={{ color: '#fff', letterSpacing: '0.5px' }}>
            Smart Supply Chain
          </span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          style={{ color: '#aaa' }}
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
                  style={{ color: '#ccd6f6', fontWeight: 500, transition: 'color 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#00ff78')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#ccd6f6')}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div className="d-flex gap-2 mt-2 mt-lg-0">
            <Link
              to="/login"
              className="btn btn-outline-light btn-sm px-3 py-2 rounded-pill"
              style={{ borderColor: 'rgba(255,255,255,0.3)', fontWeight: 500 }}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="btn btn-sm px-3 py-2 rounded-pill fw-semibold"
              style={{
                background: 'linear-gradient(135deg, #00ff78, #00c850)',
                color: '#000',
                boxShadow: '0 0 14px rgba(0,255,120,0.45)',
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
