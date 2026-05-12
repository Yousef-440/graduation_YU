import { useState, useRef } from 'react'
import DashboardNav        from '../components/dashboard/DashboardNav'
import SummaryCards        from '../components/dashboard/SummaryCards'
import KpiCards            from '../components/dashboard/KpiCards'
import OrderStatusTracker  from '../components/dashboard/OrderStatusTracker'
import RecentOrders        from '../components/dashboard/RecentOrders'
import LateOrdersAlert     from '../components/dashboard/LateOrdersAlert'

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [toast, setToast]           = useState(false)
  const toastTimer                  = useRef(null)

  const now = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const handleRefresh = () => {
    if (refreshing) return
    setRefreshing(true)
    setRefreshKey((k) => k + 1)

    clearTimeout(toastTimer.current)
    setTimeout(() => {
      setRefreshing(false)
      setToast(true)
      toastTimer.current = setTimeout(() => setToast(false), 2500)
    }, 1200)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
      <DashboardNav />

      <main
        style={{
          marginLeft: 230,
          flex: 1,
          padding: '28px 28px 40px',
          overflowY: 'auto',
          minHeight: '100vh',
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 style={{ color: 'var(--text-heading)', fontWeight: 800, margin: 0 }}>
              Supply Chain Dashboard
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>{now}</p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span
              className="badge rounded-pill px-3 py-2"
              style={{
                background: 'rgba(0,255,120,0.12)',
                color: '#00ff78',
                border: '1px solid rgba(0,255,120,0.25)',
                fontSize: 12,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 7, height: 7,
                  borderRadius: '50%',
                  background: '#00ff78',
                  marginRight: 6,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              All Systems Operational
            </span>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh Data"
              style={{
                width: 36, height: 36,
                borderRadius: 10,
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-input)',
                color: refreshing ? '#00c6ff' : 'var(--text-body)',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s',
                opacity: refreshing ? 0.75 : 1,
              }}
              onMouseEnter={(e) => { if (!refreshing) e.currentTarget.style.background = 'var(--bg-row-hover)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-input)' }}
            >
              <i
                className="bi bi-arrow-clockwise"
                style={{
                  fontSize: 15,
                  display: 'inline-block',
                  animation: refreshing ? 'spin 0.7s linear infinite' : 'none',
                }}
              />
            </button>
          </div>
        </div>

        {toast && (
          <div style={{
            marginBottom: 16,
            padding: '10px 16px',
            borderRadius: 10,
            background: 'rgba(0,220,100,0.08)',
            border: '1px solid rgba(0,220,100,0.22)',
            color: '#00e06a',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'fadeIn 0.2s ease',
          }}>
            <i className="bi bi-check-circle-fill" style={{ fontSize: 13 }} />
            Data updated successfully
          </div>
        )}

        <SummaryCards      key={`summary-${refreshKey}`}  />

        <div className="mb-4">
          <OrderStatusTracker key={`tracker-${refreshKey}`} />
        </div>

        <div className="mb-4">
          <KpiCards          key={`kpi-${refreshKey}`}     />
        </div>

        <div className="mb-4">
          <LateOrdersAlert   key={`late-${refreshKey}`}    />
        </div>

        <RecentOrders        key={`orders-${refreshKey}`}  />
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.4); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
