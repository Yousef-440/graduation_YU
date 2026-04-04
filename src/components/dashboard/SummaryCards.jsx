const cards = [
  {
    title:    'Active Shipments',
    value:    '15',
    sub:      'In transit right now',
    icon:     'bi-truck',
    color:    '#00c6ff',
    trend:    '+3 since yesterday',
    trendUp:  true,
  },
  {
    title:    'On-Time Delivery',
    value:    '92%',
    sub:      'On-Time Delivery Rate',
    icon:     'bi-check2-circle',
    color:    '#00ff78',
    trend:    '+2% vs last month',
    trendUp:  true,
  },
  {
    title:    'Inventory Alerts',
    value:    '3',
    sub:      'Items below reorder level',
    icon:     'bi-exclamation-triangle-fill',
    color:    '#ff4444',
    trend:    '2 critical, 1 warning',
    trendUp:  false,
  },
  {
    title:    'Avg Cycle Time',
    value:    '4.2d',
    sub:      'Order to delivery',
    icon:     'bi-clock-history',
    color:    '#ff9900',
    trend:    '-0.5d vs last month',
    trendUp:  true,
  },
]

export default function SummaryCards() {
  return (
    <div className="row g-3 mb-4">
      {cards.map(({ title, value, sub, icon, color, trend, trendUp }) => (
        <div className="col-xl-3 col-sm-6" key={title}>
          <div
            className="h-100 p-3 rounded-4 position-relative overflow-hidden"
            style={{
              background: 'rgba(10,20,42,0.8)',
              border: `1px solid ${color}22`,
              boxShadow: `0 4px 24px ${color}12`,
              backdropFilter: 'blur(12px)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = `0 10px 32px ${color}28`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = `0 4px 24px ${color}12`
            }}
          >
            <div
              style={{
                position: 'absolute', top: -20, right: -20,
                width: 100, height: 100,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
                pointerEvents: 'none',
              }}
            />

            <div className="d-flex align-items-start justify-content-between mb-3">
              <p style={{ color: '#8892b0', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, margin: 0 }}>
                {title}
              </p>
              <div
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${color}18`,
                  border: `1px solid ${color}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <i className={`bi ${icon}`} style={{ color, fontSize: 16 }} />
              </div>
            </div>

            <div style={{ fontSize: '1.9rem', fontWeight: 800, color, lineHeight: 1, marginBottom: 4 }}>
              {value}
            </div>
            <div style={{ color: '#8892b0', fontSize: 12, marginBottom: 10 }}>{sub}</div>

            <div
              style={{
                fontSize: 11, fontWeight: 600,
                color: trendUp ? '#00ff78' : '#ff6b6b',
              }}
            >
              <i className={`bi ${trendUp ? 'bi-arrow-up-short' : 'bi-arrow-down-short'}`} />
              {trend}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
