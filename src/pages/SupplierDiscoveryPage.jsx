import { useState, useEffect, useCallback } from 'react'
import TextField        from '@mui/material/TextField'
import Dialog           from '@mui/material/Dialog'
import DialogTitle      from '@mui/material/DialogTitle'
import DialogContent    from '@mui/material/DialogContent'
import DialogActions    from '@mui/material/DialogActions'
import Button           from '@mui/material/Button'
import Snackbar         from '@mui/material/Snackbar'
import Alert            from '@mui/material/Alert'
import Tooltip          from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'

import DashboardNav from '../components/dashboard/DashboardNav'
import { useAuth }  from '../context/AuthContext'
import {
  discoverSuppliers,
  getDiscoveredSuppliers,
  acceptSupplier,
  acceptAllSuppliers,
  deleteDiscoveredSupplier,
} from '../api/supplierDiscoveryApi'

const EMPTY_FORM = { productName: '', country: '', keywords: '' }

function scoreColor(score) {
  if (score >= 70) return { color: '#00e06a', bg: 'rgba(0,220,106,0.10)', border: 'rgba(0,220,106,0.25)' }
  if (score >= 40) return { color: '#ffb400', bg: 'rgba(255,180,0,0.10)',  border: 'rgba(255,180,0,0.25)'  }
  return              { color: '#ff6b6b', bg: 'rgba(255,80,80,0.10)',   border: 'rgba(255,80,80,0.25)'  }
}

function ScoreBadge({ score }) {
  const { color, bg, border } = scoreColor(score ?? 0)
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 52, height: 52, borderRadius: '50%',
      background: bg, border: `2px solid ${border}`, flexShrink: 0,
    }}>
      <span style={{ color, fontWeight: 800, fontSize: 16 }}>{score ?? 0}</span>
    </div>
  )
}

function ReliableBadge({ reliable }) {
  return reliable ? (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px',
      borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: 'rgba(0,220,106,0.10)', border: '1px solid rgba(0,220,106,0.25)', color: '#00e06a',
    }}>
      <i className="bi bi-patch-check-fill" style={{ fontSize: 11 }} />
      Reliable
    </span>
  ) : (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px',
      borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.20)', color: '#ff8080',
    }}>
      <i className="bi bi-x-circle-fill" style={{ fontSize: 11 }} />
      Unverified
    </span>
  )
}

function SupplierDetailDialog({ open, supplier, onClose }) {
  if (!supplier) return null
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className="bi bi-globe2" style={{ color: '#00c6ff', fontSize: 18 }} />
          Supplier Details
        </span>
      </DialogTitle>
      <DialogContent dividers>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <ScoreBadge score={supplier.score} />
          <div>
            <div style={{ color: 'var(--text-heading)', fontWeight: 700, fontSize: 16 }}>{supplier.supplierName || '—'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <ReliableBadge reliable={supplier.reliable} />
              {supplier.country && (
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  <i className="bi bi-geo-alt me-1" />
                  {supplier.country}
                </span>
              )}
            </div>
          </div>
        </div>

        {supplier.aiSummary && (
          <div style={{
            marginBottom: 16, padding: '12px 14px', borderRadius: 10,
            background: 'rgba(0,198,255,0.06)', border: '1px solid rgba(0,198,255,0.15)',
          }}>
            <div style={{ color: '#00c6ff', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
              <i className="bi bi-stars me-1" />AI Summary
            </div>
            <p style={{ color: 'var(--text-body)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{supplier.aiSummary}</p>
          </div>
        )}

        {supplier.whyThisSupplier?.length > 0 && (
          <div style={{
            marginBottom: 16, padding: '12px 14px', borderRadius: 10,
            background: 'rgba(0,255,120,0.04)', border: '1px solid rgba(0,255,120,0.15)',
          }}>
            <div style={{ color: '#00e06a', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 }}>
              <i className="bi bi-patch-check me-1" />Why This Supplier?
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {supplier.whyThisSupplier.map((reason, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <i className="bi bi-check-circle-fill" style={{ color: '#00e06a', fontSize: 13, marginTop: 1, flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-body)', fontSize: 13, lineHeight: 1.5 }}>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: 'bi-globe2',      label: 'Website', value: supplier.website, link: true },
            { icon: 'bi-envelope',    label: 'Email',   value: supplier.email },
            { icon: 'bi-telephone',   label: 'Phone',   value: supplier.phone },
          ].map(({ icon, label, value, link }) => value ? (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className={`bi ${icon}`} style={{ color: 'var(--text-muted)', fontSize: 14, width: 18 }} />
              <span style={{ color: 'var(--text-muted)', fontSize: 12, width: 56 }}>{label}</span>
              {link ? (
                <a href={value} target="_blank" rel="noreferrer"
                  style={{ color: '#00c6ff', fontSize: 13, textDecoration: 'none', wordBreak: 'break-all' }}
                  onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
                >
                  {value}
                </a>
              ) : (
                <span style={{ color: 'var(--text-body)', fontSize: 13 }}>{value}</span>
              )}
            </div>
          ) : null)}

          {supplier.description && (
            <div style={{ marginTop: 6 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
                Description
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0, lineHeight: 1.6, maxHeight: 120, overflow: 'auto' }}>
                {supplier.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit"
          sx={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}
        >
          Close
        </Button>
        {supplier.website && (
          <Button
            component="a" href={supplier.website} target="_blank" rel="noreferrer"
            variant="contained"
            startIcon={<i className="bi bi-box-arrow-up-right" style={{ fontSize: 12 }} />}
          >
            Visit Website
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

function ResultCard({ supplier, onViewDetails }) {
  const { color, bg, border } = scoreColor(supplier.score ?? 0)
  return (
    <div style={{
      borderRadius: 16, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
      padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14,
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = border)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <ScoreBadge score={supplier.score} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: 'var(--text-heading)', fontWeight: 700, fontSize: 15, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {supplier.supplierName || 'Unknown Supplier'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <ReliableBadge reliable={supplier.reliable} />
            {supplier.country && (
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                <i className="bi bi-geo-alt me-1" style={{ fontSize: 11 }} />{supplier.country}
              </span>
            )}
          </div>
        </div>
        <div style={{
          padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          background: bg, border: `1px solid ${border}`, color, whiteSpace: 'nowrap',
        }}>
          Score {supplier.score ?? 0}/100
        </div>
      </div>

      {supplier.aiSummary && (
        <p style={{
          color: 'var(--text-body)', fontSize: 13, margin: 0, lineHeight: 1.6,
          padding: '10px 12px', borderRadius: 8,
          background: 'rgba(0,198,255,0.05)', border: '1px solid rgba(0,198,255,0.12)',
        }}>
          <i className="bi bi-stars me-1" style={{ color: '#00c6ff', fontSize: 12 }} />
          {supplier.aiSummary}
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {supplier.website && (
          <a href={supplier.website} target="_blank" rel="noreferrer"
            style={{ color: '#00c6ff', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            <i className="bi bi-globe2" style={{ fontSize: 12 }} />
            Website
          </a>
        )}
        {supplier.email && (
          <span style={{ color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <i className="bi bi-envelope" style={{ fontSize: 12 }} />{supplier.email}
          </span>
        )}
        {supplier.phone && (
          <span style={{ color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <i className="bi bi-telephone" style={{ fontSize: 12 }} />{supplier.phone}
          </span>
        )}
      </div>

      <button
        onClick={() => onViewDetails(supplier)}
        style={{
          alignSelf: 'flex-start', padding: '7px 16px', borderRadius: 8,
          border: '1px solid var(--border-medium)', background: 'var(--bg-input)',
          color: 'var(--text-body)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-row-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-input)')}
      >
        <i className="bi bi-info-circle me-1" />
        View Details
      </button>
    </div>
  )
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

export default function SupplierDiscoveryPage() {
  const { accessToken }             = useAuth()
  const [form, setForm]             = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [searching, setSearching]   = useState(false)
  const [searchError, setSearchError] = useState('')
  const [results, setResults]       = useState(null)

  const [allSuppliers, setAllSuppliers] = useState([])
  const [loadingAll, setLoadingAll]     = useState(true)
  const [allError, setAllError]         = useState('')

  const [detailTarget, setDetailTarget] = useState(null)
  const [accepting, setAccepting]       = useState(new Set())
  const [acceptingAll, setAcceptingAll] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]         = useState(false)
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' })
  const toast = (msg, severity = 'success') => setSnack({ open: true, msg, severity })

  const loadAll = useCallback(async () => {
    setLoadingAll(true)
    setAllError('')
    const { data, error } = await getDiscoveredSuppliers(accessToken)
    setLoadingAll(false)
    if (error) setAllError(error)
    else setAllSuppliers(data)
  }, [accessToken])

  useEffect(() => { loadAll() }, [loadAll])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    setFormErrors((p) => ({ ...p, [name]: '' }))
    setSearchError('')
  }

  const validate = () => {
    const errs = {}
    if (!form.productName.trim()) errs.productName = 'Product name is required'
    return errs
  }

  const handleDiscover = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    setSearching(true)
    setSearchError('')
    setResults(null)

    const payload = {
      productName: form.productName.trim(),
      ...(form.country.trim()  && { country:  form.country.trim()  }),
      ...(form.keywords.trim() && { keywords: form.keywords.trim() }),
    }

    const { data, error } = await discoverSuppliers(accessToken, payload)
    setSearching(false)

    if (error) { setSearchError(error); return }

    setResults(data)
    setAllSuppliers((prev) => {
      const ids = new Set(prev.map((s) => s.id))
      const newOnes = data.filter((s) => !ids.has(s.id))
      return [...newOnes, ...prev]
    })
    toast(`Found ${data.length} supplier${data.length !== 1 ? 's' : ''}!`)
  }

  const handleAccept = async (id) => {
    setAccepting((prev) => new Set(prev).add(id))
    const { data, error } = await acceptSupplier(accessToken, id)
    setAccepting((prev) => { const s = new Set(prev); s.delete(id); return s })
    if (error) { toast(error, 'error'); return }
    const msg = data?.message ?? 'Done'
    const isAlready = msg.toLowerCase().includes('already')
    toast(msg, isAlready ? 'info' : 'success')
    if (!isAlready) {
      setAllSuppliers((prev) => prev.map((s) => s.id === id ? { ...s, approved: true } : s))
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await deleteDiscoveredSupplier(accessToken, deleteTarget.id)
    setDeleting(false)
    if (error) { toast(error, 'error'); return }
    setAllSuppliers((prev) => prev.filter((s) => s.id !== deleteTarget.id))
    toast(`"${deleteTarget.supplierName || 'Supplier'}" removed from discovered list.`, 'info')
    setDeleteTarget(null)
  }

  const handleAcceptAll = async () => {
    setAcceptingAll(true)
    const { data, error } = await acceptAllSuppliers(accessToken)
    setAcceptingAll(false)
    if (error) { toast(error, 'error'); return }
    toast(data?.message ?? 'Done')
    setAllSuppliers((prev) => prev.map((s) => ({ ...s, approved: true })))
  }

  const TH = {
    color: 'var(--text-muted)', fontSize: 11, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: 0.6,
    padding: '14px 16px', background: 'transparent', borderBottom: 'none',
  }
  const TD = { padding: '13px 16px', background: 'transparent', verticalAlign: 'middle', fontSize: 13 }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
      <DashboardNav />

      <main style={{ marginLeft: 230, flex: 1, padding: '28px 28px 40px' }}>

        {/* ── Header ── */}
        <div className="mb-4">
          <h4 style={{ color: 'var(--text-heading)', fontWeight: 800, margin: 0 }}>
            <i className="bi bi-search-heart me-2" style={{ color: '#00c6ff' }} />
            Supplier Discovery
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
            Search the internet for suppliers using AI — enter a product name to get started
          </p>
        </div>

        {/* ── Search Form ── */}
        <div style={{
          marginBottom: 28, padding: '24px 28px', borderRadius: 16,
          background: 'var(--bg-surface)', border: '1px solid var(--border-section)',
          boxShadow: 'var(--shadow-surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <i className="bi bi-robot" style={{ color: '#00c6ff', fontSize: 16 }} />
            <span style={{ color: 'var(--text-heading)', fontWeight: 700, fontSize: 15 }}>
              AI-Powered Search
            </span>
          </div>

          <form onSubmit={handleDiscover} noValidate>
            <div className="row g-3">
              <div className="col-md-4">
                <TextField
                  label="Product Name *" name="productName" value={form.productName}
                  onChange={handleChange} fullWidth size="small"
                  placeholder="e.g. steel pipes, solar panels…"
                  error={!!formErrors.productName} helperText={formErrors.productName}
                />
              </div>
              <div className="col-md-3">
                <TextField
                  label="Country" name="country" value={form.country}
                  onChange={handleChange} fullWidth size="small"
                  placeholder="e.g. China, Germany…"
                />
              </div>
              <div className="col-md-5">
                <TextField
                  label="Keywords" name="keywords" value={form.keywords}
                  onChange={handleChange} fullWidth size="small"
                  placeholder="e.g. wholesale, certified, ISO…"
                />
              </div>
            </div>

            {searchError && (
              <div style={{
                marginTop: 14, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,80,80,0.25)',
                color: '#ff8080', fontSize: 13,
              }}>
                <i className="bi bi-exclamation-triangle me-2" />
                {searchError}
              </div>
            )}

            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <button type="submit" disabled={searching} style={{
                padding: '11px 28px', borderRadius: 10, border: 'none',
                cursor: searching ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(90deg,#00e06a,#00c6ff)',
                color: '#050e1a', fontWeight: 700, fontSize: 14,
                opacity: searching ? 0.7 : 1,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                {searching ? (
                  <>
                    <CircularProgress size={14} style={{ color: '#050e1a' }} />
                    Searching…
                  </>
                ) : (
                  <>
                    <i className="bi bi-search" />
                    Discover Suppliers
                  </>
                )}
              </button>

              {searching && (
                <span style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>
                  Searching the internet &amp; analyzing with AI — this may take a moment…
                </span>
              )}
            </div>
          </form>
        </div>

        {/* ── Search Results ── */}
        {results !== null && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <i className="bi bi-stars" style={{ color: '#00c6ff', fontSize: 16 }} />
              <span style={{ color: 'var(--text-heading)', fontWeight: 700, fontSize: 15 }}>
                Search Results
              </span>
              <span style={{
                padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: 'rgba(0,198,255,0.10)', border: '1px solid rgba(0,198,255,0.25)', color: '#00c6ff',
              }}>
                {results.length} found
              </span>
            </div>

            {results.length === 0 ? (
              <div style={{
                padding: 40, textAlign: 'center', borderRadius: 16,
                background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
              }}>
                <i className="bi bi-search" style={{ fontSize: 36, color: 'var(--text-muted)', display: 'block', marginBottom: 12 }} />
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                  No suppliers found for this search. Try different keywords or country.
                </p>
              </div>
            ) : (
              <div className="row g-3">
                {results.map((s) => (
                  <div className="col-md-6 col-xl-4" key={s.id}>
                    <ResultCard supplier={s} onViewDetails={setDetailTarget} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── All Discovered Suppliers Table ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <i className="bi bi-clock-history" style={{ color: '#00c6ff', fontSize: 15 }} />
          <span style={{ color: 'var(--text-heading)', fontWeight: 700, fontSize: 15 }}>
            All Discovered Suppliers
          </span>
          {!loadingAll && (
            <span style={{
              padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: 'rgba(0,255,120,0.08)', border: '1px solid rgba(0,255,120,0.18)', color: '#00ff78',
            }}>
              {allSuppliers.length} total
            </span>
          )}
          {allSuppliers.some((s) => !s.approved) && (
            <button
              onClick={handleAcceptAll}
              disabled={acceptingAll}
              style={{
                marginLeft: 'auto', padding: '7px 18px', borderRadius: 10, border: 'none',
                background: acceptingAll ? 'rgba(0,220,106,0.4)' : 'linear-gradient(90deg,#00e06a,#00c6ff)',
                color: '#050e1a', fontWeight: 700, fontSize: 12,
                cursor: acceptingAll ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {acceptingAll ? (
                <><CircularProgress size={12} style={{ color: '#050e1a' }} />Accepting…</>
              ) : (
                <><i className="bi bi-check2-all" />Accept All</>
              )}
            </button>
          )}
        </div>

        <div style={{
          borderRadius: 16, background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-surface)', overflow: 'hidden',
        }}>
          {loadingAll ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              <span className="spinner-border spinner-border-sm me-2"
                style={{ borderColor: '#00ff78', borderRightColor: 'transparent' }} />
              Loading…
            </div>
          ) : allError ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#ff6b6b', fontSize: 13 }}>{allError}</div>
          ) : allSuppliers.length === 0 ? (
            <div style={{ padding: 56, textAlign: 'center' }}>
              <i className="bi bi-globe2" style={{ fontSize: 40, color: 'var(--text-muted)', display: 'block', marginBottom: 12 }} />
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                No discovered suppliers yet. Run a search above to get started.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-borderless mb-0" style={{
                fontSize: 13, '--bs-table-bg': 'transparent',
                '--bs-table-color': 'var(--text-body)', minWidth: 900,
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-thead)' }}>
                    {['Score', 'Supplier Name', 'Country', 'Website', 'Email', 'Phone', 'Reliable', 'Discovered', 'Actions'].map((h) => (
                      <th key={h} style={{ ...TH, ...(h === 'Actions' ? { textAlign: 'center', width: 140 } : {}) }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allSuppliers.map((s) => {
                    const { color, bg, border } = scoreColor(s.score ?? 0)
                    return (
                      <tr key={s.id}
                        style={{ borderBottom: '1px solid var(--border-row)', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-row-hover)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={TD}>
                          <span style={{
                            display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                            background: bg, border: `1px solid ${border}`,
                            color, fontWeight: 700, fontSize: 12,
                          }}>
                            {s.score ?? 0}
                          </span>
                        </td>
                        <td style={{ ...TD, color: '#00c6ff', fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.supplierName || '—'}
                        </td>
                        <td style={{ ...TD, color: 'var(--text-muted)' }}>{s.country || '—'}</td>
                        <td style={{ ...TD, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.website ? (
                            <a href={s.website} target="_blank" rel="noreferrer"
                              style={{ color: '#00c6ff', fontSize: 12, textDecoration: 'none' }}
                              onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
                              onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
                            >
                              {s.website.replace(/https?:\/\/(www\.)?/, '')}
                            </a>
                          ) : '—'}
                        </td>
                        <td style={{ ...TD, color: 'var(--text-muted)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.email || '—'}
                        </td>
                        <td style={{ ...TD, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{s.phone || '—'}</td>
                        <td style={TD}><ReliableBadge reliable={s.reliable} /></td>
                        <td style={{ ...TD, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(s.createdAt)}</td>
                        <td style={{ ...TD, textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <Tooltip title="View details" arrow>
                              <button onClick={() => setDetailTarget(s)} style={{
                                width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(0,198,255,0.2)',
                                background: 'rgba(0,198,255,0.08)', color: '#00c6ff',
                                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,198,255,0.18)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,198,255,0.08)')}
                              >
                                <i className="bi bi-info-circle" style={{ fontSize: 13 }} />
                              </button>
                            </Tooltip>

                            {s.approved ? (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                                background: 'rgba(0,220,106,0.10)', border: '1px solid rgba(0,220,106,0.25)',
                                color: '#00e06a',
                              }}>
                                <i className="bi bi-check2" style={{ fontSize: 12 }} />
                                Accepted
                              </span>
                            ) : (
                              <Tooltip title="Accept supplier" arrow>
                                <button
                                  onClick={() => handleAccept(s.id)}
                                  disabled={accepting.has(s.id)}
                                  style={{
                                    padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                                    border: '1px solid rgba(0,220,106,0.35)',
                                    background: accepting.has(s.id) ? 'rgba(0,220,106,0.05)' : 'rgba(0,220,106,0.08)',
                                    color: '#00e06a', cursor: accepting.has(s.id) ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                  }}
                                  onMouseEnter={(e) => { if (!accepting.has(s.id)) e.currentTarget.style.background = 'rgba(0,220,106,0.18)' }}
                                  onMouseLeave={(e) => { if (!accepting.has(s.id)) e.currentTarget.style.background = 'rgba(0,220,106,0.08)' }}
                                >
                                  {accepting.has(s.id)
                                    ? <CircularProgress size={10} style={{ color: '#00e06a' }} />
                                    : <i className="bi bi-check2-circle" style={{ fontSize: 12 }} />
                                  }
                                  Accept
                                </button>
                              </Tooltip>
                            )}
                            <Tooltip title="Remove from list" arrow>
                              <button
                                onClick={() => setDeleteTarget(s)}
                                style={{
                                  width: 32, height: 32, borderRadius: 8,
                                  border: '1px solid rgba(255,80,80,0.2)',
                                  background: 'rgba(255,80,80,0.08)', color: '#ff6b6b',
                                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,80,80,0.18)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,80,80,0.08)')}
                              >
                                <i className="bi bi-trash3-fill" style={{ fontSize: 12 }} />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <SupplierDetailDialog
        open={!!detailTarget}
        supplier={detailTarget}
        onClose={() => setDetailTarget(null)}
      />

      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)}>
        <DialogTitle>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="bi bi-trash3-fill" style={{ color: '#ff6b6b', fontSize: 18 }} />
            Remove Discovered Supplier
          </span>
        </DialogTitle>
        <DialogContent>
          <p style={{ color: 'var(--text-body)', fontSize: 14, margin: 0 }}>
            Are you sure you want to remove{' '}
            <strong style={{ color: 'var(--text-heading)' }}>
              {deleteTarget?.supplierName || 'this supplier'}
            </strong>{' '}
            from the discovered list?
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '8px 0 0' }}>
            This only removes it from the discovered list. Any accepted copy in your Suppliers table is not affected.
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined" color="inherit" disabled={deleting}
            sx={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)', '&:hover': { borderColor: 'var(--border-medium)' } }}
          >
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={deleting}
            startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : <i className="bi bi-trash3-fill" style={{ fontSize: 12 }} />}
            sx={{ background: 'rgba(255,60,60,0.85)', '&:hover': { background: '#e05050' } }}
          >
            {deleting ? 'Removing…' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((p) => ({ ...p, open: false }))}
          sx={{
            background: snack.severity === 'error' ? 'rgba(255,60,60,0.12)'
              : snack.severity === 'info'  ? 'rgba(0,198,255,0.12)'
              : 'rgba(0,220,100,0.12)',
            border: snack.severity === 'error' ? '1px solid rgba(255,80,80,0.3)'
              : snack.severity === 'info'  ? '1px solid rgba(0,198,255,0.3)'
              : '1px solid rgba(0,220,100,0.3)',
            color: snack.severity === 'error' ? '#ff8080'
              : snack.severity === 'info'  ? '#00c6ff'
              : '#00e06a',
            borderRadius: 2,
            '& .MuiAlert-icon': {
              color: snack.severity === 'error' ? '#ff8080'
                : snack.severity === 'info'  ? '#00c6ff'
                : '#00e06a',
            },
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </div>
  )
}
