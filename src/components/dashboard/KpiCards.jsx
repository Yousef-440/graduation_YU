import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'

const KPI_CONFIG = [
  {
    key:     'onTimeDeliveryRate',
    name:    'On-Time Delivery Rate',
    formula: '(Orders on time / Total orders) × 100',
    icon:    'bi-check2-all',
    color:   '#00ff78',
    format:  (v) => `${Number(v).toFixed(0)}%`,
  },
  {
    key:     'orderAccuracy',
    name:    'Order Accuracy',
    formula: '(Correct orders / Total orders) × 100',
    icon:    'bi-clipboard2-check',
    color:   '#a855f7',
    format:  (v) => `${Number(v).toFixed(2)}%`,
  },
  {
    key:     'cycleTime',
    name:    'Cycle Time',
    formula: 'Actual delivery date − PO issue date',
    icon:    'bi-clock',
    color:   '#ff9900',
    format:  (v) => `${Number(v).toFixed(1)} days`,
  },
  {
    key:     'costPerUnit',
    name:    'Cost Per Unit',
    formula: 'Total procurement cost / Units received',
    icon:    'bi-currency-dollar',
    color:   '#ff6b6b',
    format:  (v) => `$${Number(v).toFixed(2)}`,
  },
]

export default function KpiCards() {
  const { authFetch }       = useAuth()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await authFetch('/api/kpis/overview')
      let body = null
      try { body = await res.json() } catch {}
      if (res.ok) setData(body)
      else setError('No data available')
    } catch {
      setError('No data available')
    } finally {
      setLoading(false)
    }
  }, [authFetch])

  useEffect(() => { load() }, [load])

  return (
    <div className="rounded-4 p-4"
      style={{
        background:     'var(--bg-surface)',
        border:         '1px solid var(--border-subtle)',
        backdropFilter: 'blur(12px)',
        boxShadow:      'var(--shadow-surface)',
      }}
    >
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h6 style={{ color: 'var(--text-heading)', fontWeight: 700, margin: 0 }}>KPI Overview</h6>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>Auto-calculated from order data</p>
        </div>
        <span className="badge rounded-pill px-3 py-2"
          style={{ background: 'rgba(0,255,120,0.12)', color: '#00ff78', border: '1px solid rgba(0,255,120,0.3)', fontSize: 11 }}
        >
          <i className="bi bi-lightning-charge-fill me-1" />Live
        </span>
      </div>

      {loading ? (
        <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          <span className="spinner-border spinner-border-sm me-2" style={{ borderColor: '#00ff78', borderRightColor: 'transparent' }} />
          Loading KPIs…
        </div>
      ) : error ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: '#ff6b6b', fontSize: 13 }}>{error}</div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {KPI_CONFIG.map(({ key, name, formula, icon, color, format }) => (
            <div key={key} className="p-3 rounded-3"
              style={{ background: 'var(--bg-kpi-item)', border: `1px solid ${color}18` }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`bi ${icon}`} style={{ color, fontSize: 14 }} />
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-body)', fontSize: 13, fontWeight: 600 }}>{name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>{formula}</div>
                  </div>
                </div>
                <div style={{ color, fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
                  {data?.[key] != null ? format(data[key]) : '—'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
