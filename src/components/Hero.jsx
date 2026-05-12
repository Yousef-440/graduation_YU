import { Link } from 'react-router-dom'
import { useThemeMode } from '../context/ThemeContext'

export default function Hero() {
  const { mode } = useThemeMode()
  const isDark = mode === 'dark'

  const heroBg = isDark
    ? 'radial-gradient(ellipse at 20% 50%, rgba(0,100,255,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(0,255,120,0.12) 0%, transparent 55%), linear-gradient(135deg, #020818 0%, #050d20 50%, #030b1a 100%)'
    : 'radial-gradient(ellipse at 20% 50%, rgba(0,100,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(0,200,100,0.08) 0%, transparent 55%), linear-gradient(135deg, #f0f4f8 0%, #e8f0fb 50%, #edf4f0 100%)'

  const chartBg = isDark
    ? 'linear-gradient(135deg, #071428 0%, #0a1f3d 50%, #071428 100%)'
    : 'linear-gradient(135deg, #e8f0fb 0%, #d8e8f8 50%, #e8f0fb 100%)'

  const gridLineColor = isDark ? 'rgba(0,100,255,0.12)' : 'rgba(0,80,200,0.08)'

  return (
    <section
      id="home"
      style={{
        minHeight: '100vh',
        background: heroBg,
        paddingTop: 100,
        paddingBottom: 60,
        overflow: 'hidden',
        position: 'relative',
        transition: 'background 0.25s ease',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '5%',
          width: 320,
          height: 320,
          background: isDark
            ? 'radial-gradient(circle, rgba(0,100,255,0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(0,100,255,0.07) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '8%',
          width: 260,
          height: 260,
          background: isDark
            ? 'radial-gradient(circle, rgba(0,255,120,0.10) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(0,200,100,0.07) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <span
              className="badge rounded-pill mb-3 px-3 py-2"
              style={{
                background: 'rgba(0,255,120,0.12)',
                color: '#00c850',
                border: '1px solid rgba(0,255,120,0.3)',
                fontSize: 13,
                letterSpacing: '0.5px',
              }}
            >
              <i className="bi bi-lightning-charge-fill me-1" />
              Next-Gen Supply Chain Platform
            </span>

            <h1
              className="fw-bold mb-3"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                lineHeight: 1.2,
                color: 'var(--landing-text-primary)',
                transition: 'color 0.25s ease',
              }}
            >
              Supply Chain Management{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #00ff78, #00c6ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Tracker & KPI System
              </span>
            </h1>

            <p
              className="mb-4"
              style={{ color: 'var(--landing-text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, transition: 'color 0.25s ease' }}
            >
              Track shipments, monitor performance, and make smarter decisions
              — all in one place. Gain real-time visibility across your entire
              supply chain with powerful analytics.
            </p>

            <div className="d-flex flex-wrap gap-3">
              <Link
                to="/login"
                className="btn px-4 py-2 fw-semibold rounded-pill"
                style={{
                  background: 'linear-gradient(135deg, #00ff78, #00c850)',
                  color: '#000',
                  boxShadow: '0 0 22px rgba(0,255,120,0.45)',
                  fontSize: '1rem',
                }}
              >
                <i className="bi bi-rocket-takeoff-fill me-2" />
                Get Started
              </Link>
            </div>

            <div className="d-flex flex-wrap gap-4 mt-5">
              {[
                { value: '15K+', label: 'Shipments Tracked' },
                { value: '92%', label: 'On-Time Delivery' },
                { value: '3 Min', label: 'Avg Alert Time' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div
                    className="fw-bold"
                    style={{ fontSize: '1.4rem', color: '#00c850' }}
                  >
                    {value}
                  </div>
                  <div style={{ color: 'var(--landing-text-secondary)', fontSize: '0.82rem', transition: 'color 0.25s ease' }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-6">
            <div
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                border: isDark ? '1px solid rgba(0,255,120,0.2)' : '1px solid rgba(0,180,100,0.2)',
                boxShadow: isDark
                  ? '0 0 50px rgba(0,100,255,0.2), 0 0 80px rgba(0,255,120,0.08)'
                  : '0 8px 40px rgba(0,0,0,0.12)',
                background: 'var(--landing-hero-preview-bg)',
                transition: 'background 0.25s ease, box-shadow 0.25s ease',
              }}
            >
              <div
                className="d-flex align-items-center gap-2 px-3 py-2"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
                <span
                  className="ms-2"
                  style={{
                    color: 'var(--landing-text-secondary)',
                    fontSize: 11,
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                    padding: '2px 10px',
                    borderRadius: 4,
                  }}
                >
                  SMART SUPPLY CHAIN
                </span>
                <span
                  className="ms-auto badge"
                  style={{ background: '#00c850', color: '#000', fontSize: 10, fontWeight: 700 }}
                >
                  LIVE
                </span>
              </div>

              <div
                style={{
                  height: 200,
                  background: chartBg,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'background 0.25s ease',
                }}
              >
                {[...Array(8)].map((_, i) => (
                  <div key={`h${i}`} style={{ position: 'absolute', left: 0, right: 0, top: `${(i + 1) * 12}%`, height: 1, background: gridLineColor }} />
                ))}
                {[...Array(12)].map((_, i) => (
                  <div key={`v${i}`} style={{ position: 'absolute', top: 0, bottom: 0, left: `${(i + 1) * 8}%`, width: 1, background: gridLineColor }} />
                ))}

                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                  <polyline
                    points="60,140 130,100 200,120 290,70 370,90 450,60 530,80"
                    fill="none"
                    stroke="rgba(0,200,100,0.6)"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                  />
                </svg>

                {[
                  { x: '18%', y: '70%', color: '#00c850' },
                  { x: '36%', y: '52%', color: '#00c6ff' },
                  { x: '55%', y: '63%', color: '#ff9900' },
                  { x: '72%', y: '38%', color: '#00c850' },
                  { x: '88%', y: '44%', color: '#00c6ff' },
                ].map(({ x, y, color }, i) => (
                  <div key={i} style={{ position: 'absolute', left: x, top: y, width: 12, height: 12, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, transform: 'translate(-50%, -50%)' }} />
                ))}
              </div>

              <div className="d-flex gap-2 p-3" style={{ background: 'var(--landing-hero-stats-bg)', transition: 'background 0.25s ease' }}>
                {[
                  { label: 'Total Shipments', value: '15', sub: 'On Track', color: '#00c6ff' },
                  { label: 'Delivery Rate', value: '92%', sub: 'This Month', color: '#00c850' },
                  { label: 'Low Stock', value: '3', sub: 'Items Alert', color: '#ff4444' },
                  { label: 'Unit Cost', value: '$12.50', sub: 'Avg', color: '#ff9900' },
                ].map(({ label, value, sub, color }) => (
                  <div
                    key={label}
                    className="flex-fill text-center p-2 rounded"
                    style={{ background: 'var(--landing-preview-item-bg)', border: `1px solid ${color}33`, transition: 'background 0.25s ease' }}
                  >
                    <div style={{ fontSize: 10, color: 'var(--landing-text-secondary)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: color }}>{value}</div>
                    <div style={{ fontSize: 9, color: 'var(--landing-text-secondary)' }}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
