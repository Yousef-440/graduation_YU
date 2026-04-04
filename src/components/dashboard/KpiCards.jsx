const kpis = [
  {
    name:   'On-Time Delivery Rate',
    formula:'(Orders on time / Total orders) × 100',
    value:  '92%',
    target: '95%',
    pct:    92,
    color:  '#00ff78',
    icon:   'bi-check2-all',
    status: 'Good',
  },
  {
    name:   'Inventory Turnover',
    formula:'COGS / Average Inventory',
    value:  '6.4×',
    target: '8×',
    pct:    80,
    color:  '#00c6ff',
    icon:   'bi-arrow-repeat',
    status: 'Average',
  },
  {
    name:   'Order Accuracy',
    formula:'(Correct orders / Total orders) × 100',
    value:  '97.3%',
    target: '99%',
    pct:    97,
    color:  '#a855f7',
    icon:   'bi-clipboard2-check',
    status: 'Good',
  },
  {
    name:   'Cycle Time',
    formula:'Actual delivery date − PO issue date',
    value:  '4.2 days',
    target: '3 days',
    pct:    60,
    color:  '#ff9900',
    icon:   'bi-clock',
    status: 'Needs Work',
  },
  {
    name:   'Cost Per Unit',
    formula:'Total procurement cost / Units received',
    value:  '$12.50',
    target: '$11.00',
    pct:    74,
    color:  '#ff6b6b',
    icon:   'bi-currency-dollar',
    status: 'Needs Work',
  },
]

const statusColor = { 'Good': '#00ff78', 'Average': '#ff9900', 'Needs Work': '#ff6b6b' }

export default function KpiCards() {
  return (
    <div
      className="rounded-4 p-4"
      style={{
        background: 'rgba(10,20,42,0.8)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h6 style={{ color: '#e6f1ff', fontWeight: 700, margin: 0 }}>KPI Overview</h6>
          <p style={{ color: '#8892b0', fontSize: 12, margin: 0 }}>Auto-calculated from order data</p>
        </div>
        <span
          className="badge rounded-pill px-3 py-2"
          style={{ background: 'rgba(0,255,120,0.12)', color: '#00ff78', border: '1px solid rgba(0,255,120,0.3)', fontSize: 11 }}
        >
          <i className="bi bi-lightning-charge-fill me-1" />
          Live
        </span>
      </div>

      <div className="d-flex flex-column gap-3">
        {kpis.map(({ name, formula, value, target, pct, color, icon, status }) => (
          <div
            key={name}
            className="p-3 rounded-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}18` }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2">
                <div
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${color}18`,
                    border: `1px solid ${color}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <i className={`bi ${icon}`} style={{ color, fontSize: 14 }} />
                </div>
                <div>
                  <div style={{ color: '#ccd6f6', fontSize: 13, fontWeight: 600 }}>{name}</div>
                  <div style={{ color: '#8892b0', fontSize: 10 }}>{formula}</div>
                </div>
              </div>
              <div className="text-end">
                <div style={{ color, fontWeight: 800, fontSize: 15 }}>{value}</div>
                <span
                  className="badge rounded-pill"
                  style={{
                    background: `${statusColor[status]}18`,
                    color: statusColor[status],
                    border: `1px solid ${statusColor[status]}35`,
                    fontSize: 10,
                  }}
                >
                  {status}
                </span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${pct}%`, height: '100%',
                    background: color,
                    borderRadius: 3,
                    boxShadow: `0 0 8px ${color}60`,
                    transition: 'width 0.8s ease',
                  }}
                />
              </div>
              <div style={{ color: '#8892b0', fontSize: 10, whiteSpace: 'nowrap' }}>
                Target: {target}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
