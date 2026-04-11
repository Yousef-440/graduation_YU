import { Link } from 'react-router-dom'
import { useThemeMode } from '../context/ThemeContext'

export default function DashboardPreview() {
  const { mode } = useThemeMode()
  const isDark = mode === 'dark'

  const sectionBg = isDark
    ? 'radial-gradient(ellipse at 70% 50%, rgba(0,198,255,0.08) 0%, transparent 60%), linear-gradient(180deg, #020818 0%, #040d1e 100%)'
    : 'radial-gradient(ellipse at 70% 50%, rgba(0,150,200,0.06) 0%, transparent 60%), linear-gradient(180deg, #f0f4f8 0%, #e8eef8 100%)'

  const previewBg = isDark ? 'rgba(5,15,35,0.95)' : 'rgba(255,255,255,0.98)'
  const previewBorder = isDark ? '1px solid rgba(0,198,255,0.2)' : '1px solid rgba(0,150,200,0.2)'
  const previewShadow = isDark ? '0 0 60px rgba(0,100,255,0.22), 0 0 100px rgba(0,255,120,0.06)' : '0 8px 40px rgba(0,0,0,0.12)'
  const headerBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
  const headerBorder = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)'
  const titleBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
  const chartBg = isDark
    ? 'linear-gradient(135deg, #071428 0%, #0a1f3d 50%, #071428 100%)'
    : 'linear-gradient(135deg, #e8f0fb 0%, #d8e8f8 50%, #e8f0fb 100%)'
  const gridColor = isDark ? 'rgba(0,100,255,0.1)' : 'rgba(0,80,200,0.07)'
  const cardItemBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
  const statLabelColor = isDark ? '#8892b0' : '#64748b'
  const statTextColor = isDark ? '#ccd6f6' : '#334155'

  const floatBg = isDark ? 'rgba(5,15,35,0.98)' : 'rgba(255,255,255,0.98)'
  const floatBorder = isDark ? '1px solid rgba(168,85,247,0.2)' : '1px solid rgba(168,85,247,0.18)'
  const floatShadow = isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 8px 30px rgba(0,0,0,0.12)'
  const floatHeaderBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
  const floatHeaderBorder = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)'
  const progTrack = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  return (
    <section
      id="dashboard"
      style={{
        background: sectionBg,
        padding: '90px 0',
        overflow: 'hidden',
        transition: 'background 0.25s ease',
      }}
    >
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-5">
            <span
              className="badge rounded-pill mb-3 px-3 py-2"
              style={{
                background: 'rgba(168,85,247,0.12)',
                color: '#a855f7',
                border: '1px solid rgba(168,85,247,0.3)',
                fontSize: 13,
              }}
            >
              <i className="bi bi-layout-wtf me-1" />
              Dashboard Preview
            </span>

            <h2
              className="fw-bold mb-3"
              style={{
                color: 'var(--landing-text-primary)',
                fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)',
                lineHeight: 1.3,
                transition: 'color 0.25s ease',
              }}
            >
              A Complete Overview of Your Supply Chain
            </h2>

            <p
              className="mb-4"
              style={{ color: 'var(--landing-text-secondary)', fontSize: '0.98rem', lineHeight: 1.75, transition: 'color 0.25s ease' }}
            >
              Monitor key metrics, track shipments, and gain insights into your
              supply chain performance — all from one intuitive dashboard
              designed for speed and clarity.
            </p>

            <ul className="list-unstyled mb-4">
              {[
                { icon: 'bi-check-circle-fill', text: 'Live shipment map with route visualization', color: '#00c850' },
                { icon: 'bi-check-circle-fill', text: 'Automated KPI calculations and trend charts', color: '#00c6ff' },
                { icon: 'bi-check-circle-fill', text: 'Supplier scorecards and performance reports', color: '#ff9900' },
              ].map(({ icon, text, color }) => (
                <li key={text} className="d-flex align-items-center gap-2 mb-2">
                  <i className={`bi ${icon}`} style={{ color, fontSize: 16 }} />
                  <span style={{ color: 'var(--landing-text-secondary)', fontSize: '0.92rem', transition: 'color 0.25s ease' }}>{text}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/register"
              className="btn px-4 py-2 fw-semibold rounded-pill"
              style={{
                background: 'linear-gradient(135deg, #00ff78, #00c850)',
                color: '#000',
                boxShadow: '0 0 18px rgba(0,255,120,0.35)',
              }}
            >
              <i className="bi bi-rocket-takeoff-fill me-2" />
              Get Started
            </Link>
          </div>

          <div className="col-lg-7">
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: previewBorder,
                  boxShadow: previewShadow,
                  background: previewBg,
                  transition: 'background 0.25s ease, box-shadow 0.25s ease',
                }}
              >
                <div
                  className="d-flex align-items-center gap-2 px-3 py-2"
                  style={{ background: headerBg, borderBottom: headerBorder }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
                  <span
                    className="ms-2"
                    style={{ color: statLabelColor, fontSize: 11, background: titleBg, padding: '2px 10px', borderRadius: 4 }}
                  >
                    SMART SUPPLY CHAIN — Dashboard
                  </span>
                  <span className="ms-auto badge" style={{ background: '#00c850', color: '#000', fontSize: 10, fontWeight: 700 }}>
                    LIVE
                  </span>
                </div>

                <div className="p-3">
                  <div
                    style={{
                      height: 200,
                      borderRadius: 10,
                      background: chartBg,
                      position: 'relative',
                      overflow: 'hidden',
                      marginBottom: 12,
                      transition: 'background 0.25s ease',
                    }}
                  >
                    {[...Array(7)].map((_, i) => (
                      <div key={`h${i}`} style={{ position: 'absolute', left: 0, right: 0, top: `${(i + 1) * 13}%`, height: 1, background: gridColor }} />
                    ))}
                    {[...Array(10)].map((_, i) => (
                      <div key={`v${i}`} style={{ position: 'absolute', top: 0, bottom: 0, left: `${(i + 1) * 9}%`, width: 1, background: gridColor }} />
                    ))}
                    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                      <polyline points="40,160 110,110 195,130 285,80 370,100 460,65 540,85" fill="none" stroke="rgba(0,200,100,0.55)" strokeWidth="2" strokeDasharray="6 3" />
                    </svg>
                    {[
                      { x: '10%', y: '78%', c: '#00c850' },
                      { x: '30%', y: '54%', c: '#00c6ff' },
                      { x: '52%', y: '64%', c: '#ff9900' },
                      { x: '70%', y: '40%', c: '#00c850' },
                      { x: '88%', y: '46%', c: '#00c6ff' },
                    ].map(({ x, y, c }, i) => (
                      <div key={i} style={{ position: 'absolute', left: x, top: y, width: 11, height: 11, borderRadius: '50%', background: c, boxShadow: `0 0 8px ${c}`, transform: 'translate(-50%,-50%)' }} />
                    ))}
                  </div>

                  <div className="row g-2 mb-2">
                    {[
                      { label: 'Total Shipments', value: '15', sub: 'On Track', c: '#00c6ff' },
                      { label: 'Delivery Rate', value: '92%', sub: 'This Month', c: '#00c850' },
                      { label: 'Low Stock Items', value: '3', sub: 'Alert', c: '#ff4444' },
                      { label: 'Unit Cost Avg', value: '$12.50', sub: 'Per Item', c: '#ff9900' },
                    ].map(({ label, value, sub, c }) => (
                      <div key={label} className="col-3">
                        <div className="text-center p-2 rounded-3" style={{ background: cardItemBg, border: `1px solid ${c}30`, transition: 'background 0.25s ease' }}>
                          <div style={{ fontSize: 9, color: statLabelColor, textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: c }}>{value}</div>
                          <div style={{ fontSize: 9, color: statLabelColor }}>{sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: -30,
                  right: -30,
                  width: '55%',
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: floatBorder,
                  boxShadow: floatShadow,
                  background: floatBg,
                  zIndex: 2,
                  transition: 'background 0.25s ease, box-shadow 0.25s ease',
                }}
              >
                <div className="px-3 py-2" style={{ borderBottom: floatHeaderBorder, background: floatHeaderBg }}>
                  <span style={{ color: statLabelColor, fontSize: 10 }}>SUPPLIER PERFORMANCE</span>
                </div>
                <div className="p-3">
                  {[
                    { name: 'Supplier A', pct: 94, color: '#00c850' },
                    { name: 'Supplier B', pct: 78, color: '#00c6ff' },
                    { name: 'Supplier C', pct: 61, color: '#ff9900' },
                  ].map(({ name, pct, color }) => (
                    <div key={name} className="mb-2">
                      <div className="d-flex justify-content-between mb-1">
                        <span style={{ color: statTextColor, fontSize: 11 }}>{name}</span>
                        <span style={{ color, fontSize: 11, fontWeight: 600 }}>{pct}%</span>
                      </div>
                      <div style={{ height: 5, background: progTrack, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, boxShadow: `0 0 6px ${color}` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
