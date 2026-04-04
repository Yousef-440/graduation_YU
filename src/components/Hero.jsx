import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section
      id="home"
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at 20% 50%, rgba(0,100,255,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(0,255,120,0.12) 0%, transparent 55%), linear-gradient(135deg, #020818 0%, #050d20 50%, #030b1a 100%)',
        paddingTop: 100,
        paddingBottom: 60,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '5%',
          width: 320,
          height: 320,
          background: 'radial-gradient(circle, rgba(0,100,255,0.12) 0%, transparent 70%)',
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
          background: 'radial-gradient(circle, rgba(0,255,120,0.10) 0%, transparent 70%)',
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
                color: '#00ff78',
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
                color: '#fff',
              }}
            >
              Smart Supply Chain{' '}
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
              style={{ color: '#8892b0', fontSize: '1.05rem', lineHeight: 1.7 }}
            >
              Track shipments, monitor performance, and make smarter decisions
              — all in one place. Gain real-time visibility across your entire
              supply chain with powerful analytics.
            </p>

            <div className="d-flex flex-wrap gap-3">
              <Link
                to="/register"
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
                    style={{ fontSize: '1.4rem', color: '#00ff78' }}
                  >
                    {value}
                  </div>
                  <div style={{ color: '#8892b0', fontSize: '0.82rem' }}>
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
                border: '1px solid rgba(0,255,120,0.2)',
                boxShadow:
                  '0 0 50px rgba(0,100,255,0.2), 0 0 80px rgba(0,255,120,0.08)',
                background: 'rgba(5,15,35,0.9)',
              }}
            >
              <div
                className="d-flex align-items-center gap-2 px-3 py-2"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#ff5f57',
                  }}
                />
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#ffbd2e',
                  }}
                />
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#28c840',
                  }}
                />
                <span
                  className="ms-2"
                  style={{
                    color: '#8892b0',
                    fontSize: 11,
                    background: 'rgba(255,255,255,0.06)',
                    padding: '2px 10px',
                    borderRadius: 4,
                  }}
                >
                  SMART SUPPLY CHAIN
                </span>
                <span
                  className="ms-auto badge"
                  style={{
                    background: '#00ff78',
                    color: '#000',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  LIVE
                </span>
              </div>

              <div
                style={{
                  height: 200,
                  background:
                    'linear-gradient(135deg, #071428 0%, #0a1f3d 50%, #071428 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {[...Array(8)].map((_, i) => (
                  <div
                    key={`h${i}`}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: `${(i + 1) * 12}%`,
                      height: 1,
                      background: 'rgba(0,100,255,0.12)',
                    }}
                  />
                ))}
                {[...Array(12)].map((_, i) => (
                  <div
                    key={`v${i}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: `${(i + 1) * 8}%`,
                      width: 1,
                      background: 'rgba(0,100,255,0.12)',
                    }}
                  />
                ))}

                <svg
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <polyline
                    points="60,140 130,100 200,120 290,70 370,90 450,60 530,80"
                    fill="none"
                    stroke="rgba(0,255,120,0.6)"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                  />
                </svg>

                {[
                  { x: '18%', y: '70%', color: '#00ff78' },
                  { x: '36%', y: '52%', color: '#00c6ff' },
                  { x: '55%', y: '63%', color: '#ff9900' },
                  { x: '72%', y: '38%', color: '#00ff78' },
                  { x: '88%', y: '44%', color: '#00c6ff' },
                ].map(({ x, y, color }, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: x,
                      top: y,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: color,
                      boxShadow: `0 0 8px ${color}`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                ))}
              </div>

              <div
                className="d-flex gap-2 p-3"
                style={{ background: 'rgba(5,15,35,0.95)' }}
              >
                {[
                  { label: 'Total Shipments', value: '15', sub: 'On Track', color: '#00c6ff' },
                  { label: 'Delivery Rate', value: '92%', sub: 'This Month', color: '#00ff78' },
                  { label: 'Low Stock', value: '3', sub: 'Items Alert', color: '#ff4444' },
                  { label: 'Unit Cost', value: '$12.50', sub: 'Avg', color: '#ff9900' },
                ].map(({ label, value, sub, color }) => (
                  <div
                    key={label}
                    className="flex-fill text-center p-2 rounded"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${color}33`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: '#8892b0',
                        marginBottom: 2,
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: color,
                      }}
                    >
                      {value}
                    </div>
                    <div style={{ fontSize: 9, color: '#8892b0' }}>{sub}</div>
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
