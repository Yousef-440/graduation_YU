import { useState, useEffect, useCallback, useRef } from 'react'
import TextField from '@mui/material/TextField'
import MenuItem  from '@mui/material/MenuItem'
import DashboardNav from '../components/dashboard/DashboardNav'
import { useAuth }  from '../context/AuthContext'
import { getAuditLogs } from '../api/auditApi'

// ─── constants ───────────────────────────────────────────────────────────────

const ENTITY_TYPES = ['ORDER', 'USER']

const ACTIONS = ['CREATED', 'UPDATED', 'STATUS_CHANGED', 'ACCURACY_UPDATED']

const ACTION_STYLE = {
  CREATED:          { color: '#00ff78', bg: 'rgba(0,255,120,0.1)',   border: 'rgba(0,255,120,0.25)'  },
  UPDATED:          { color: '#00c6ff', bg: 'rgba(0,198,255,0.1)',   border: 'rgba(0,198,255,0.25)'  },
  STATUS_CHANGED:   { color: '#ff9900', bg: 'rgba(255,153,0,0.1)',   border: 'rgba(255,153,0,0.25)'  },
  ACCURACY_UPDATED: { color: '#c66fff', bg: 'rgba(198,111,255,0.1)', border: 'rgba(198,111,255,0.25)'},
}

const ENTITY_STYLE = {
  ORDER: { color: '#00c6ff', bg: 'rgba(0,198,255,0.08)', border: 'rgba(0,198,255,0.2)' },
  USER:  { color: '#00ff78', bg: 'rgba(0,255,120,0.08)', border: 'rgba(0,255,120,0.2)' },
}

const EMPTY_FILTERS = { entityType: '', action: '', fromDate: '', toDate: '' }

const fmtDateTime = (iso) => {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

const TH = {
  color: 'var(--text-muted)', fontSize: 11, fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: 0.6,
  padding: '13px 18px', background: 'transparent', borderBottom: 'none',
}
const TD = { padding: '12px 18px', background: 'transparent', verticalAlign: 'middle', fontSize: 13 }

// ─── component ───────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const { authFetch } = useAuth()

  const [logs, setLogs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [filters, setFilters]   = useState(EMPTY_FILTERS)
  const [page, setPage]         = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const isFirstRender = useRef(true)
  const filterTimer   = useRef(null)

  const load = useCallback(async (f, p) => {
    setLoading(true)
    setError('')
    const params = { page: p, size: 20 }
    if (f.entityType) params.entityType = f.entityType
    if (f.action)     params.action     = f.action
    if (f.fromDate)   params.fromDate   = f.fromDate
    if (f.toDate)     params.toDate     = f.toDate

    const { data, error: err } = await getAuditLogs(authFetch, params)
    setLoading(false)
    if (err) { setError(err); return }
    setLogs(data.content ?? [])
    setTotalPages(data.totalPages ?? 0)
    setTotalElements(data.totalElements ?? 0)
  }, [authFetch])

  useEffect(() => {
    const delay = isFirstRender.current ? 0 : 350
    isFirstRender.current = false
    clearTimeout(filterTimer.current)
    filterTimer.current = setTimeout(() => { setPage(0); load(filters, 0) }, delay)
    return () => clearTimeout(filterTimer.current)
  }, [filters])                             // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load(filters, page)
  }, [page])                                // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (field) => (e) => {
    setFilters((p) => ({ ...p, [field]: e.target.value }))
  }
  const clearFilters = () => setFilters(EMPTY_FILTERS)
  const hasActiveFilters = Object.values(filters).some((v) => v !== '')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
      <DashboardNav />

      <main style={{ marginLeft: 230, flex: 1, padding: '28px 28px 40px' }}>

        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 style={{ color: 'var(--text-heading)', fontWeight: 800, margin: 0 }}>Audit History</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
              {totalElements > 0 ? `${totalElements} event${totalElements !== 1 ? 's' : ''} recorded` : 'System-wide activity log'}
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{
          marginBottom: 20, padding: '18px 22px', borderRadius: 14,
          background: 'var(--bg-surface-alt)', border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <i className="bi bi-funnel-fill" style={{ color: '#00c6ff', fontSize: 13 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Filter
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: 8, border: '1px solid rgba(255,107,107,0.35)', background: 'rgba(255,80,80,0.08)', color: '#ff8080', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
              >
                <i className="bi bi-x-lg me-1" style={{ fontSize: 10 }} /> Clear
              </button>
            )}
          </div>
          <div className="row g-2">
            <div className="col-md-3">
              <TextField select label="Entity Type" value={filters.entityType} onChange={handleFilterChange('entityType')}
                fullWidth size="small">
                <MenuItem value="">All Entities</MenuItem>
                {ENTITY_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </div>
            <div className="col-md-3">
              <TextField select label="Action" value={filters.action} onChange={handleFilterChange('action')}
                fullWidth size="small">
                <MenuItem value="">All Actions</MenuItem>
                {ACTIONS.map((a) => <MenuItem key={a} value={a}>{a.replace(/_/g, ' ')}</MenuItem>)}
              </TextField>
            </div>
            <div className="col-md-3">
              <TextField label="From Date" type="date" value={filters.fromDate} onChange={handleFilterChange('fromDate')}
                fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </div>
            <div className="col-md-3">
              <TextField label="To Date" type="date" value={filters.toDate} onChange={handleFilterChange('toDate')}
                fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ borderRadius: 16, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-surface)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              <span className="spinner-border spinner-border-sm me-2" style={{ borderColor: '#00ff78', borderRightColor: 'transparent' }} />
              Loading audit logs…
            </div>
          ) : error ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#ff6b6b', fontSize: 13 }}>{error}</div>
          ) : logs.length === 0 ? (
            <div style={{ padding: 56, textAlign: 'center' }}>
              <i className="bi bi-clock-history" style={{ fontSize: 40, color: 'var(--text-muted)', display: 'block', marginBottom: 12 }} />
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                {hasActiveFilters ? 'No events match the current filters.' : 'No audit events recorded yet.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-borderless mb-0"
                style={{ fontSize: 13, '--bs-table-bg': 'transparent', '--bs-table-color': 'var(--text-body)', minWidth: 820 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-thead)' }}>
                    {['Entity', 'Action', 'Description', 'Performed By', 'Date'].map((h) => (
                      <th key={h} style={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const es = ENTITY_STYLE[log.entityType] ?? { color: '#8892b0', bg: 'rgba(136,146,176,0.08)', border: 'rgba(136,146,176,0.2)' }
                    const as = ACTION_STYLE[log.action]     ?? { color: '#8892b0', bg: 'rgba(136,146,176,0.08)', border: 'rgba(136,146,176,0.2)' }
                    return (
                      <tr
                        key={log.id}
                        style={{ borderBottom: '1px solid var(--border-row)', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-row-hover)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={TD}>
                          <span style={{ padding: '3px 9px', borderRadius: 10, fontSize: 11, fontWeight: 700, background: es.bg, color: es.color, border: `1px solid ${es.border}` }}>
                            {log.entityType}
                          </span>
                        </td>
                        <td style={TD}>
                          <span style={{ padding: '3px 9px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: as.bg, color: as.color, border: `1px solid ${as.border}` }}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ ...TD, color: 'var(--text-body)', maxWidth: 380 }}>
                          {log.description}
                          {(log.oldValue || log.newValue) && (
                            <span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 8 }}>
                              {log.oldValue && log.newValue
                                ? `(${log.oldValue} → ${log.newValue})`
                                : log.newValue ?? log.oldValue}
                            </span>
                          )}
                        </td>
                        <td style={{ ...TD, color: '#00c6ff', fontWeight: 500 }}>
                          <i className="bi bi-person-circle me-1" style={{ fontSize: 12 }} />
                          {log.performedBy}
                        </td>
                        <td style={{ ...TD, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {fmtDateTime(log.createdAt)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex align-items-center justify-content-between mt-3" style={{ paddingLeft: 4 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              Page {page + 1} of {totalPages}
            </span>
            <div className="d-flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                style={{
                  padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: page === 0 ? 'not-allowed' : 'pointer',
                  border: '1px solid var(--border-medium)', background: 'transparent',
                  color: page === 0 ? 'var(--text-muted)' : 'var(--text-body)', opacity: page === 0 ? 0.5 : 1,
                }}
              >
                <i className="bi bi-chevron-left me-1" /> Prev
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                style={{
                  padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                  border: '1px solid var(--border-medium)', background: 'transparent',
                  color: page >= totalPages - 1 ? 'var(--text-muted)' : 'var(--text-body)', opacity: page >= totalPages - 1 ? 0.5 : 1,
                }}
              >
                Next <i className="bi bi-chevron-right ms-1" />
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
