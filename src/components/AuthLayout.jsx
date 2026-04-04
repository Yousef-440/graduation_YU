import { Link } from 'react-router-dom'
import '../styles/auth-layout.css'

export default function AuthLayout({ children }) {
  return (
    <div className="al-root">
     
      <div className="al-left">
        
        <div className="al-particles" aria-hidden="true">
          {Array.from({ length: 55 }, (_, i) => (
            <span
              key={i}
              className="al-star"
              style={{
                left:   `${(i * 139.4)  % 100}%`,
                top:    `${(i * 97.13)  % 100}%`,
                width:  `${((i * 31) % 22 + 4) / 10}px`,
                height: `${((i * 31) % 22 + 4) / 10}px`,
                animationDelay:    `${(i * 0.19) % 6}s`,
                animationDuration: `${((i * 23) % 35 + 30) / 10}s`,
              }}
            />
          ))}
        </div>

        <div className="al-orb al-orb-top"    aria-hidden="true" />
        <div className="al-orb al-orb-bottom" aria-hidden="true" />

        <div className="al-brand">
          <div className="al-logo-wrap">
            <div className="al-logo-icon">
              <i className="bi bi-box-seam-fill" />
            </div>
          </div>

          <p className="al-app-name">SMART SUPPLY CHAIN</p>

          <h1 className="al-tagline">
            Track Smarter.<br />
            <span className="al-tagline-accent">Deliver Faster.</span>
          </h1>

          <p className="al-sub">
            Real-time shipment tracking, KPI monitoring, and intelligent
            alerts — all in one platform.
          </p>

          <div className="al-stats">
            {[
              { value: '15K+', label: 'Shipments' },
              { value: '92%',  label: 'On-Time' },
              { value: '3 min', label: 'Alert Time' },
            ].map(({ value, label }) => (
              <div key={label} className="al-stat">
                <span className="al-stat-value">{value}</span>
                <span className="al-stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="al-right">
        <Link
          to="/"
          className="d-flex align-items-center gap-2 text-decoration-none mb-4"
          style={{
            color: '#8892b0',
            fontSize: 13,
            fontWeight: 500,
            alignSelf: 'flex-start',
            transition: 'color 0.18s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#00ff78')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#8892b0')}
        >
          <i className="bi bi-arrow-left" />
          Back
        </Link>
        {children}
      </div>
    </div>
  )
}
