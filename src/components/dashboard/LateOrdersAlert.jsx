import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'

const fmtDate = (d) => {
  if (!d) return '—'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d))
}

const STATUS_COLOR = {
  PENDING:    '#8892b0',
  PROCESSING: '#00c6ff',
  SHIPPED:    '#ff9900',
  CANCELLED:  '#ff4444',
}

export default function LateOrdersAlert() {
  const { authFetch }     = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await authFetch('/api/orders/late')
      const body = await res.json().catch(() => null)
      if (res.ok) setOrders(Array.isArray(body) ? body : [])
      else setError('Failed to load alerts')
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [authFetch])

  useEffect(() => { load() }, [load])

  return (
    <div
      className="rounded-4 p-4"
      style={{
        background:  'var(--bg-surface)',
        border:      orders.length > 0
          ? '1px solid rgba(255,153,0,0.35)'
          : '1px solid var(--border-subtle)',
        boxShadow:   'var(--shadow-surface)',
      }}
    >
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              width: 34, height: 34, borderRadius: 9,
              background: orders.length > 0 ? 'rgba(255,153,0,0.12)' : 'rgba(0,255,120,0.1)',
              border:     orders.length > 0 ? '1px solid rgba(255,153,0,0.3)' : '1px solid rgba(0,255,120,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <i
              className={`bi ${orders.length > 0 ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'}`}
              style={{ fontSize: 15, color: orders.length > 0 ? '#ff9900' : '#00ff78' }}
            />
          </div>
          <div>
            <h6 style={{ color: 'var(--text-heading)', fontWeight: 700, margin: 0 }}>Late Orders Alerts</h6>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>Orders past expected delivery date</p>
          </div>
        </div>

        {!loading && orders.length > 0 && (
          <span
            style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: 'rgba(255,80,80,0.12)',
              color: '#ff6b6b',
              border: '1px solid rgba(255,80,80,0.3)',
            }}
          >
            <i className="bi bi-exclamation-circle me-1" />
            {orders.length} Late {orders.length === 1 ? 'Order' : 'Orders'}
          </span>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          <span className="spinner-border spinner-border-sm me-2" style={{ borderColor: '#ff9900', borderRightColor: 'transparent' }} />
          Checking for delays…
        </div>
      ) : error ? (
        <div style={{ padding: '16px 0', textAlign: 'center', color: '#ff6b6b', fontSize: 13 }}>{error}</div>
      ) : orders.length === 0 ? (
        <div
          style={{
            padding: '18px 20px', borderRadius: 10,
            background: 'rgba(0,255,120,0.06)',
            border: '1px solid rgba(0,255,120,0.15)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}
        >
          <i className="bi bi-check2-circle" style={{ color: '#00ff78', fontSize: 18 }} />
          <span style={{ color: '#00e06a', fontSize: 13, fontWeight: 600 }}>All orders are on time ✅</span>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            className="table table-borderless mb-0"
            style={{ fontSize: 13, '--bs-table-bg': 'transparent', '--bs-table-color': 'var(--text-body)' }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,153,0,0.2)' }}>
                {['Order ID', 'Supplier', 'Expected Date', 'Status', 'Days Late'].map((h) => (
                  <th
                    key={h}
                    style={{
                      color: 'var(--text-muted)', fontSize: 10, fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: 0.6,
                      padding: '8px 14px', background: 'transparent', borderBottom: 'none',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const urgency = o.daysLate >= 7 ? '#ff4444' : o.daysLate >= 3 ? '#ff6b6b' : '#ff9900'
                const statusColor = STATUS_COLOR[o.status] ?? '#8892b0'
                return (
                  <tr
                    key={o.orderId}
                    style={{ borderBottom: '1px solid rgba(255,153,0,0.08)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,153,0,0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '10px 14px', color: '#00c6ff', fontWeight: 600, verticalAlign: 'middle' }}>
                      #{o.orderId}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-body)', verticalAlign: 'middle' }}>
                      {o.supplierName}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {fmtDate(o.expectedDeliveryDate)}
                    </td>
                    <td style={{ padding: '10px 14px', verticalAlign: 'middle' }}>
                      <span
                        style={{
                          padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                          background: `${statusColor}18`, color: statusColor,
                          border: `1px solid ${statusColor}35`,
                        }}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', verticalAlign: 'middle' }}>
                      <span
                        style={{
                          padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                          background: `${urgency}18`, color: urgency,
                          border: `1px solid ${urgency}35`,
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                        }}
                      >
                        <i className="bi bi-clock-fill" style={{ fontSize: 10 }} />
                        {o.daysLate} {o.daysLate === 1 ? 'day' : 'days'} late
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
