import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getOrders } from '../../api/orderApi'

const STATUS = {
  PENDING:   { label: 'Pending',   color: '#8892b0', bg: 'rgba(136,146,176,0.15)', border: 'rgba(136,146,176,0.3)' },
  APPROVED:  { label: 'Approved',  color: '#00c6ff', bg: 'rgba(0,198,255,0.15)',   border: 'rgba(0,198,255,0.3)'   },
  RECEIVED:  { label: 'Received',  color: '#00ff78', bg: 'rgba(0,255,120,0.15)',   border: 'rgba(0,255,120,0.3)'   },
  CANCELLED: { label: 'Cancelled', color: '#ff4444', bg: 'rgba(255,68,68,0.15)',   border: 'rgba(255,68,68,0.3)'   },
}

const PROGRESS = { PENDING: 10, APPROVED: 50, RECEIVED: 100, CANCELLED: 0 }
const fmt = (n) => Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export default function RecentOrders() {
  const { authFetch }         = useAuth()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const load = useCallback(async () => {
    const { data, error: err } = await getOrders(authFetch)
    setLoading(false)
    if (err) setError(err)
    else setOrders(data.slice(0, 5))
  }, [authFetch])

  useEffect(() => { load() }, [load])

  return (
    <div className="rounded-4 p-4"
      style={{
        background:    'var(--bg-surface)',
        border:        '1px solid var(--border-subtle)',
        backdropFilter: 'blur(12px)',
        boxShadow:     'var(--shadow-surface)',
      }}
    >
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h6 style={{ color: 'var(--text-heading)', fontWeight: 700, margin: 0 }}>Recent Purchase Orders</h6>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>Latest 5 active orders</p>
        </div>
        <Link to="/orders" className="btn btn-sm rounded-pill px-3"
          style={{ background: 'linear-gradient(135deg,#00ff78,#00c850)', color: '#050e1a', fontWeight: 700, fontSize: 12, border: 'none', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
        >
          <i className="bi bi-plus-lg me-1" />New PO
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          <span className="spinner-border spinner-border-sm me-2" style={{ borderColor: '#00ff78', borderRightColor: 'transparent' }} />
          Loading orders…
        </div>
      ) : error ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: '#ff6b6b', fontSize: 13 }}>{error}</div>
      ) : orders.length === 0 ? (
        <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          No orders yet. <Link to="/orders" style={{ color: '#00c6ff' }}>Create your first one</Link>.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-borderless mb-0"
            style={{ fontSize: 13, '--bs-table-bg': 'transparent', '--bs-table-color': 'var(--text-body)' }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-thead)' }}>
                {['Order ID', 'Supplier', 'Total', 'Progress', 'Status'].map((h) => (
                  <th key={h} style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, paddingBottom: 10, background: 'transparent', borderBottom: 'none' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const s   = STATUS[order.status] ?? STATUS.PENDING
                const pct = PROGRESS[order.status] ?? 10
                return (
                  <tr key={order.id}
                    style={{ borderBottom: '1px solid var(--border-row)', transition: 'background 0.15s', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-row-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ color: '#00c6ff', fontWeight: 600, verticalAlign: 'middle', paddingTop: 14, paddingBottom: 14, background: 'transparent' }}>
                      {order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td style={{ color: 'var(--text-body)', verticalAlign: 'middle', background: 'transparent' }}>{order.supplierName}</td>
                    <td style={{ color: '#00ff78', fontWeight: 600, verticalAlign: 'middle', background: 'transparent' }}>{fmt(order.totalAmount)}</td>
                    <td style={{ verticalAlign: 'middle', minWidth: 120, background: 'transparent' }}>
                      <div style={{ height: 5, background: 'var(--progress-track)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: s.color, borderRadius: 3, boxShadow: `0 0 6px ${s.color}80` }} />
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{pct}%</span>
                    </td>
                    <td style={{ verticalAlign: 'middle', background: 'transparent' }}>
                      <span className="badge rounded-pill px-2 py-1"
                        style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: 11 }}>
                        {s.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
