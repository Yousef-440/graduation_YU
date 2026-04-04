const orders = [
  { po: 'PO-2024-001', supplier: 'AlphaLogistics',   date: '2024-03-28', expected: '2024-04-02', status: 'In Transit',  pct: 65 },
  { po: 'PO-2024-002', supplier: 'BlueStar Freight',  date: '2024-03-25', expected: '2024-03-30', status: 'Delivered',   pct: 100 },
  { po: 'PO-2024-003', supplier: 'CargoLink Ltd',     date: '2024-03-20', expected: '2024-03-27', status: 'Delayed',     pct: 40 },
  { po: 'PO-2024-004', supplier: 'Delta Transport',   date: '2024-03-29', expected: '2024-04-05', status: 'Pending',     pct: 10 },
  { po: 'PO-2024-005', supplier: 'EastWest Cargo',    date: '2024-03-26', expected: '2024-04-01', status: 'Shipped',     pct: 80 },
]

const statusStyle = {
  'In Transit': { bg: 'rgba(0,198,255,0.15)',  color: '#00c6ff', border: 'rgba(0,198,255,0.3)' },
  'Delivered':  { bg: 'rgba(0,255,120,0.15)',  color: '#00ff78', border: 'rgba(0,255,120,0.3)' },
  'Delayed':    { bg: 'rgba(255,68,68,0.15)',  color: '#ff4444', border: 'rgba(255,68,68,0.3)' },
  'Pending':    { bg: 'rgba(136,146,176,0.15)',color: '#8892b0', border: 'rgba(136,146,176,0.3)' },
  'Shipped':    { bg: 'rgba(255,153,0,0.15)',  color: '#ff9900', border: 'rgba(255,153,0,0.3)' },
}

const progressColor = {
  'In Transit': '#00c6ff',
  'Delivered':  '#00ff78',
  'Delayed':    '#ff4444',
  'Pending':    '#8892b0',
  'Shipped':    '#ff9900',
}

export default function RecentOrders() {
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
          <h6 style={{ color: '#e6f1ff', fontWeight: 700, margin: 0 }}>Recent Purchase Orders</h6>
          <p style={{ color: '#8892b0', fontSize: 12, margin: 0 }}>Latest 5 active orders</p>
        </div>
        <button
          className="btn btn-sm rounded-pill px-3"
          style={{
            background: 'linear-gradient(135deg,#00ff78,#00c850)',
            color: '#050e1a',
            fontWeight: 700,
            fontSize: 12,
            border: 'none',
          }}
        >
          <i className="bi bi-plus-lg me-1" />
          New PO
        </button>
      </div>

      <div className="table-responsive">
        <table
          className="table table-borderless mb-0"
          style={{
            fontSize: 13,
            '--bs-table-bg': 'transparent',
            '--bs-table-striped-bg': 'transparent',
            '--bs-table-hover-bg': 'transparent',
            '--bs-table-color': '#ccd6f6',
          }}
        >
          <thead style={{ background: 'transparent' }}>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['PO Number', 'Supplier', 'Order Date', 'Expected', 'Progress', 'Status'].map((h) => (
                <th
                  key={h}
                  style={{
                    color: '#8892b0',
                    fontWeight: 600,
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    paddingBottom: 10,
                    background: 'transparent',
                    borderBottom: 'none',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(({ po, supplier, date, expected, status, pct }) => {
              const s = statusStyle[status]
              const pc = progressColor[status]
              return (
                <tr
                  key={po}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ color: '#00c6ff', fontWeight: 600, verticalAlign: 'middle', paddingTop: 14, paddingBottom: 14, background: 'transparent' }}>{po}</td>
                  <td style={{ color: '#ccd6f6', verticalAlign: 'middle', background: 'transparent' }}>{supplier}</td>
                  <td style={{ color: '#8892b0', verticalAlign: 'middle', background: 'transparent' }}>{date}</td>
                  <td style={{ color: '#8892b0', verticalAlign: 'middle', background: 'transparent' }}>{expected}</td>
                  <td style={{ verticalAlign: 'middle', minWidth: 120, background: 'transparent' }}>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: pc, borderRadius: 3, boxShadow: `0 0 6px ${pc}80` }} />
                    </div>
                    <span style={{ color: '#8892b0', fontSize: 10 }}>{pct}%</span>
                  </td>
                  <td style={{ verticalAlign: 'middle', background: 'transparent' }}>
                    <span
                      className="badge rounded-pill px-2 py-1"
                      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: 11 }}
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
