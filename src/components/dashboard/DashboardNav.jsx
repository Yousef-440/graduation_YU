import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth }      from '../../context/AuthContext'
import { useThemeMode } from '../../context/ThemeContext'

const links = [
  { label: 'Dashboard',       icon: 'bi-speedometer2', to: '/dashboard' },
  { label: 'Suppliers',       icon: 'bi-building',     to: '/suppliers' },
  { label: 'Products',        icon: 'bi-box-seam',     to: '/products'  },
  { label: 'Purchase Orders', icon: 'bi-receipt',      to: '/orders'    },
]

export default function DashboardNav() {
  const { pathname }      = useLocation()
  const navigate          = useNavigate()
  const { user, logout }  = useAuth()
  const { mode, toggleMode } = useThemeMode()

  const isDark = mode === 'dark'

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      style={{
        width: 230,
        minHeight: '100vh',
        background: 'var(--bg-nav)',
        borderRight: '1px solid var(--border-nav)',
        boxShadow: 'var(--shadow-nav)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
        paddingTop: 24,
      }}
    >
      <div className="d-flex align-items-center justify-content-between px-4 mb-4">
        <Link to="/dashboard" className="d-flex align-items-center gap-2 text-decoration-none">
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#00ff78,#00c6ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <i className="bi bi-box-seam-fill" style={{ color: '#050e1a', fontSize: 18 }} />
          </div>
          <span style={{ color: 'var(--text-heading)', fontWeight: 700, fontSize: 14, letterSpacing: 0.5 }}>
            Smart Supply
          </span>
        </Link>

        <button
          onClick={toggleMode}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: 32, height: 32,
            borderRadius: 8,
            border: '1px solid var(--border-medium)',
            background: 'var(--bg-input)',
            color: isDark ? '#ffcc44' : '#64748b',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-row-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-input)')}
        >
          <i className={`bi ${isDark ? 'bi-sun-fill' : 'bi-moon-fill'}`} style={{ fontSize: 14 }} />
        </button>
      </div>

      <p
        style={{
          color: 'var(--text-muted-dim)',
          fontSize: 10, fontWeight: 700,
          letterSpacing: 1.5, textTransform: 'uppercase',
          paddingLeft: 20, marginBottom: 8,
        }}
      >
        Main Menu
      </p>

      <nav className="d-flex flex-column gap-1 px-2">
        {links.map(({ label, icon, to }) => {
          const active = pathname === to
          return (
            <Link
              key={to}
              to={to}
              className="d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none"
              style={{
                color:      active ? '#00ff78' : 'var(--text-muted)',
                background: active ? 'var(--nav-link-active)' : 'transparent',
                border:     active ? '1px solid var(--nav-link-active-border)' : '1px solid transparent',
                fontWeight: active ? 600 : 400,
                fontSize: 14,
                transition: 'all 0.18s',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = 'var(--nav-link-hover)'
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent'
              }}
            >
              <i className={`bi ${icon}`} style={{ fontSize: 16, minWidth: 18 }} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto px-4 pb-4">
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 12,
            background: 'var(--nav-link-active)',
            border: '1px solid var(--border-section)',
          }}
        >
          <div className="d-flex align-items-center gap-2 mb-2">
            <div
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg,#00ff78,#00c6ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <i className="bi bi-person-fill" style={{ color: '#050e1a', fontSize: 15 }} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  color: 'var(--text-heading)', fontSize: 12, fontWeight: 600,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}
              >
                {user?.email ?? '—'}
              </div>
              <div style={{ color: '#00c6ff', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {user?.role ? user.role.replace(/_/g, ' ') : 'Logged in'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="d-flex align-items-center gap-2 text-decoration-none border-0 bg-transparent p-0"
            style={{ color: '#ff6b6b', fontSize: 12, cursor: 'pointer' }}
          >
            <i className="bi bi-box-arrow-right" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
