import DashboardNav      from '../components/dashboard/DashboardNav'
import SummaryCards      from '../components/dashboard/SummaryCards'
import KpiCards          from '../components/dashboard/KpiCards'
import PerformanceChart  from '../components/dashboard/PerformanceChart'
import ShipmentMap       from '../components/dashboard/ShipmentMap'
import RecentOrders      from '../components/dashboard/RecentOrders'

export default function DashboardPage() {
  const now = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

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
              className="btn btn-sm rounded-pill px-3"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-body)',
                fontSize: 13,
              }}
            >
              <i className="bi bi-arrow-clockwise me-1" />
              Refresh
            </button>
          </div>
        </div>

        <SummaryCards />

        <div className="mb-4">
          <ShipmentMap />
        </div>

        <div className="row g-4 mb-4">
          <div className="col-lg-7">
            <PerformanceChart />
          </div>
          <div className="col-lg-5">
            <KpiCards />
          </div>
        </div>

        <RecentOrders />
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.4); }
        }
        .leaflet-container {
          background: var(--bg-surface-solid) !important;
        }
      `}</style>
    </div>
  )
}
