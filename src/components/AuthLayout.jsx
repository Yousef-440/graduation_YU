import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/auth-layout.css'

export default function AuthLayout({ children }) {
  const [hover, setHover] = useState(false)

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
          className="text-decoration-none mb-4"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 18px 8px 10px',
            borderRadius: 50,
            background: hover
              ? 'rgba(0,255,120,0.08)'
              : 'rgba(255,255,255,0.04)',
            border: hover
              ? '1px solid rgba(0,255,120,0.28)'
              : '1px solid rgba(255,255,255,0.09)',
            boxShadow: hover
              ? '0 0 18px rgba(0,255,120,0.1)'
              : 'none',
            color: hover ? '#00ff78' : '#8892b0',
            fontSize: 13,
            fontWeight: 500,
            transition: 'all 0.22s ease',
          }}
        >
          <span style={{
            width: 28, height: 28,
            borderRadius: '50%',
            background: hover ? 'rgba(0,255,120,0.15)' : 'rgba(255,255,255,0.06)',
            border: hover ? '1px solid rgba(0,255,120,0.3)' : '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.22s ease',
          }}>
            <i
              className="bi bi-arrow-left"
              style={{
                fontSize: 13,
                transform: hover ? 'translateX(-2px)' : 'translateX(0)',
                transition: 'transform 0.22s ease',
              }}
            />
          </span>
          Back to Home
        </Link>
        {children}
      </div>
    </div>
  )
}
