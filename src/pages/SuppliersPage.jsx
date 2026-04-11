import { useState, useEffect, useCallback, useRef } from 'react'
import Dialog         from '@mui/material/Dialog'
import DialogTitle    from '@mui/material/DialogTitle'
import DialogContent  from '@mui/material/DialogContent'
import DialogActions  from '@mui/material/DialogActions'
import TextField      from '@mui/material/TextField'
import Button         from '@mui/material/Button'
import IconButton     from '@mui/material/IconButton'
import Tooltip        from '@mui/material/Tooltip'
import Snackbar       from '@mui/material/Snackbar'
import Alert          from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

import DashboardNav from '../components/dashboard/DashboardNav'
import { useAuth }  from '../context/AuthContext'
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../api/supplierApi'

const EMPTY_FORM   = { name: '', contactEmail: '', phone: '', address: '' }
const EMPTY_FILTER = { name: '', contactEmail: '', phone: '', address: '' }
const EMAIL_RE     = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(form) {
  const errors = {}
  if (!form.name?.trim())                  errors.name = 'Name is required'
  else if (form.name.trim().length > 150)  errors.name = 'Max 150 characters'
  if (form.contactEmail && !EMAIL_RE.test(form.contactEmail))
    errors.contactEmail = 'Invalid email address'
  else if (form.contactEmail && form.contactEmail.length > 150)
    errors.contactEmail = 'Max 150 characters'
  if (form.phone && form.phone.length > 30)
    errors.phone = 'Max 30 characters'
  return errors
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

function EditDialog({ open, supplier, onClose, onSaved, token }) {
  const [form, setForm]         = useState(EMPTY_FORM)
  const [errors, setErrors]     = useState({})
  const [apiError, setApiError] = useState('')
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    if (supplier) {
      setForm({
        name:         supplier.name         ?? '',
        contactEmail: supplier.contactEmail ?? '',
        phone:        supplier.phone        ?? '',
        address:      supplier.address      ?? '',
      })
      setErrors({})
      setApiError('')
    }
  }, [supplier])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    setErrors((p) => ({ ...p, [name]: '' }))
    setApiError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const clientErrors = validate(form)
    if (Object.keys(clientErrors).length) { setErrors(clientErrors); return }

    setSaving(true)
    const { data, error, fieldErrors, status } = await updateSupplier(token, supplier.id, form)
    setSaving(false)

    if (error) {
      if (status === 409) {
        const msg = error.toLowerCase()
        if (msg.includes('email'))       setErrors((p) => ({ ...p, contactEmail: error }))
        else if (msg.includes('phone'))  setErrors((p) => ({ ...p, phone: error }))
        else                             setApiError(error)
      } else if (fieldErrors && Object.keys(fieldErrors).length) {
        setErrors(fieldErrors)
      } else {
        setApiError(error)
      }
      return
    }
    onSaved(data)
  }

  return (
    <Dialog open={open} onClose={onClose} disableRestoreFocus>
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="bi bi-pencil-square" style={{ color: '#00c6ff', fontSize: 18 }} />
            Edit Supplier
          </span>
        </DialogTitle>

        <DialogContent>
          {apiError && (
            <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,80,80,0.25)', color: '#ff8080', fontSize: 13 }}>
              {apiError}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 4 }}>
            <TextField label="Supplier Name *" name="name" value={form.name} onChange={handleChange}
              error={!!errors.name} helperText={errors.name} fullWidth autoFocus size="small" />
            <TextField label="Contact Email" name="contactEmail" type="email" value={form.contactEmail}
              onChange={handleChange} error={!!errors.contactEmail} helperText={errors.contactEmail}
              fullWidth size="small" />
            <div style={{ display: 'flex', gap: 12 }}>
              <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange}
                error={!!errors.phone} helperText={errors.phone} size="small" style={{ flex: 1 }} />
              <TextField label="Address" name="address" value={form.address} onChange={handleChange}
                error={!!errors.address} helperText={errors.address} size="small" style={{ flex: 2 }} />
            </div>
          </div>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" color="inherit" disabled={saving}
            sx={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)', '&:hover': { borderColor: 'var(--border-medium)' } }}
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

function DeleteDialog({ open, supplier, onClose, onDeleted, token }) {
  const [deleting, setDeleting] = useState(false)
  const [apiError, setApiError] = useState('')

  useEffect(() => { if (open) setApiError('') }, [open])

  const handleConfirm = async () => {
    setDeleting(true)
    const { error } = await deleteSupplier(token, supplier.id)
    setDeleting(false)
    if (error) { setApiError(error); return }
    onDeleted(supplier.id)
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className="bi bi-trash3-fill" style={{ color: '#ff6b6b', fontSize: 18 }} />
          Delete Supplier
        </span>
      </DialogTitle>
      <DialogContent>
        {apiError && (
          <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,80,80,0.25)', color: '#ff8080', fontSize: 13 }}>
            {apiError}
          </div>
        )}
        <p style={{ color: 'var(--text-body)', fontSize: 14, margin: 0 }}>
          Are you sure you want to delete{' '}
          <strong style={{ color: 'var(--text-heading)' }}>{supplier?.name}</strong>?
          <br />
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            This action will soft-delete the supplier and can be recovered by an administrator.
          </span>
        </p>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" disabled={deleting}
          sx={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)', '&:hover': { borderColor: 'var(--border-medium)' } }}
        >
          Cancel
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="error" disabled={deleting}
          startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : null}
          sx={{ background: 'rgba(255,60,60,0.85)', '&:hover': { background: '#e05050' } }}
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function CreateForm({ token, onCreated }) {
  const [form, setForm]         = useState(EMPTY_FORM)
  const [errors, setErrors]     = useState({})
  const [apiError, setApiError] = useState('')
  const [saving, setSaving]     = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    setErrors((p) => ({ ...p, [name]: '' }))
    setApiError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const clientErrors = validate(form)
    if (Object.keys(clientErrors).length) { setErrors(clientErrors); return }

    setSaving(true)
    const { data, error, fieldErrors, status } = await createSupplier(token, form)
    setSaving(false)

    if (error) {
      if (status === 409) {
        const msg = error.toLowerCase()
        if (msg.includes('email'))       setErrors((p) => ({ ...p, contactEmail: error }))
        else if (msg.includes('phone'))  setErrors((p) => ({ ...p, phone: error }))
        else                             setApiError(error)
      } else if (fieldErrors && Object.keys(fieldErrors).length) {
        setErrors(fieldErrors)
      } else {
        setApiError(error)
      }
      return
    }
    setForm(EMPTY_FORM)
    setErrors({})
    onCreated(data)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {apiError && (
        <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,80,80,0.25)', color: '#ff8080', fontSize: 13 }}>
          {apiError}
        </div>
      )}
      <div className="row g-3">
        <div className="col-md-6">
          <TextField label="Supplier Name *" name="name" value={form.name} onChange={handleChange}
            error={!!errors.name} helperText={errors.name} fullWidth size="small" />
        </div>
        <div className="col-md-6">
          <TextField label="Contact Email" name="contactEmail" type="email" value={form.contactEmail}
            onChange={handleChange} error={!!errors.contactEmail} helperText={errors.contactEmail}
            fullWidth size="small" />
        </div>
        <div className="col-md-4">
          <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange}
            error={!!errors.phone} helperText={errors.phone} fullWidth size="small" />
        </div>
        <div className="col-md-8">
          <TextField label="Address" name="address" value={form.address} onChange={handleChange}
            error={!!errors.address} helperText={errors.address} fullWidth size="small" />
        </div>
      </div>
      <button type="submit" disabled={saving}
        style={{
          marginTop: 20, padding: '11px 28px', borderRadius: 10, border: 'none',
          cursor: saving ? 'not-allowed' : 'pointer',
          background: 'linear-gradient(90deg,#00e06a,#00c6ff)',
          color: '#050e1a', fontWeight: 700, fontSize: 14, opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? 'Saving…' : 'Add Supplier'}
      </button>
    </form>
  )
}

export default function SuppliersPage() {
  const { accessToken }           = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [pageError, setPageError] = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [filter, setFilter]       = useState(EMPTY_FILTER)
  const [editTarget, setEditTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' })
  const toast = (msg, severity = 'success') => setSnack({ open: true, msg, severity })

  const isFirstRender = useRef(true)

  const load = useCallback(async (activeFilter) => {
    setLoading(true)
    setPageError('')
    const params = Object.fromEntries(
      Object.entries(activeFilter).filter(([, v]) => v.trim() !== '')
    )
    const { data, error } = await getSuppliers(accessToken, params)
    setLoading(false)
    if (error) setPageError(error)
    else setSuppliers(data)
  }, [accessToken])

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; load(filter); return }
    const t = setTimeout(() => load(filter), 400)
    return () => clearTimeout(t)
  }, [filter, load])

  const isFilterActive = Object.values(filter).some((v) => v.trim() !== '')

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilter((p) => ({ ...p, [name]: value }))
  }
  const clearFilter = () => setFilter(EMPTY_FILTER)

  const handleCreated = (s) => {
    setSuppliers((p) => [s, ...p])
    setShowForm(false)
    toast(`Supplier "${s.name}" added successfully.`)
  }
  const handleSaved = (updated) => {
    setSuppliers((p) => p.map((s) => (s.id === updated.id ? updated : s)))
    setEditTarget(null)
    toast(`Supplier "${updated.name}" updated successfully.`)
  }
  const handleDeleted = (id) => {
    setSuppliers((p) => p.filter((s) => s.id !== id))
    const name = deleteTarget?.name
    setDeleteTarget(null)
    toast(`Supplier "${name}" deleted.`, 'info')
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

        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 style={{ color: 'var(--text-heading)', fontWeight: 800, margin: 0 }}>Suppliers</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>Manage your supplier network</p>
          </div>
          <button
            onClick={() => setShowForm((p) => !p)}
            style={{
              padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: showForm ? 'var(--bg-input)' : 'linear-gradient(90deg,#00e06a,#00c6ff)',
              color: showForm ? 'var(--text-body)' : '#050e1a', fontWeight: 700, fontSize: 13,
            }}
          >
            <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-2`} />
            {showForm ? 'Cancel' : 'New Supplier'}
          </button>
        </div>

        <div style={{ marginBottom: 20, padding: '18px 22px', borderRadius: 14, background: 'var(--bg-surface-alt)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <i className="bi bi-funnel-fill" style={{ color: '#00c6ff', fontSize: 13 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Filter Suppliers
            </span>
            {isFilterActive && (
              <button
                onClick={clearFilter}
                style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: 8, border: '1px solid rgba(255,107,107,0.35)', background: 'rgba(255,80,80,0.08)', color: '#ff8080', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
              >
                <i className="bi bi-x-lg me-1" style={{ fontSize: 10 }} />Clear
              </button>
            )}
          </div>
          <div className="row g-2">
            {[
              { label: 'Name',    name: 'name',         placeholder: 'Search by name…'  },
              { label: 'Email',   name: 'contactEmail', placeholder: 'Search by email…' },
              { label: 'Phone',   name: 'phone',        placeholder: 'Search by phone…' },
              { label: 'Address', name: 'address',      placeholder: 'Search by address…' },
            ].map(({ label, name, placeholder }) => (
              <div className="col-md-3" key={name}>
                <TextField label={label} name={name} value={filter[name]}
                  onChange={handleFilterChange} fullWidth size="small" placeholder={placeholder} />
              </div>
            ))}
          </div>
        </div>

        {showForm && (
          <div style={{ marginBottom: 24, padding: '24px 28px', borderRadius: 16, background: 'var(--bg-surface)', border: '1px solid var(--border-section)', boxShadow: 'var(--shadow-surface)' }}>
            <h6 style={{ color: 'var(--text-heading)', fontWeight: 700, marginBottom: 20 }}>New Supplier</h6>
            <CreateForm token={accessToken} onCreated={handleCreated} />
          </div>
        )}

        <div style={{ borderRadius: 16, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-surface)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              <span className="spinner-border spinner-border-sm me-2" style={{ borderColor: '#00ff78', borderRightColor: 'transparent' }} />
              Loading suppliers…
            </div>
          ) : pageError ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#ff6b6b', fontSize: 13 }}>{pageError}</div>
          ) : suppliers.length === 0 ? (
            <div style={{ padding: 56, textAlign: 'center' }}>
              <i className="bi bi-building" style={{ fontSize: 40, color: 'var(--text-muted)', display: 'block', marginBottom: 12 }} />
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                {isFilterActive ? 'No suppliers match your filters.' : 'No suppliers yet. Add your first one above.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-borderless mb-0"
                style={{ fontSize: 13, '--bs-table-bg': 'transparent', '--bs-table-color': 'var(--text-body)', minWidth: 900 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-thead)' }}>
                    {['Name', 'Email', 'Phone', 'Address', 'Created', 'Updated', 'Actions'].map((h) => (
                      <th key={h} style={{ ...TH, ...(h === 'Actions' ? { textAlign: 'center', width: 100 } : {}) }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr key={s.id}
                      style={{ borderBottom: '1px solid var(--border-row)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-row-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ ...TD, color: '#00c6ff', fontWeight: 600 }}>{s.name}</td>
                      <td style={{ ...TD, color: 'var(--text-body)' }}>{s.contactEmail || '—'}</td>
                      <td style={{ ...TD, color: 'var(--text-body)' }}>{s.phone || '—'}</td>
                      <td style={{ ...TD, color: 'var(--text-muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.address || '—'}
                      </td>
                      <td style={{ ...TD, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(s.createdAt)}</td>
                      <td style={{ ...TD, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(s.updatedAt)}</td>
                      <td style={{ ...TD, textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: 4 }}>
                          <Tooltip title="Edit supplier" arrow>
                            <IconButton size="small" onClick={() => setEditTarget(s)}
                              sx={{ color: '#00c6ff', background: 'rgba(0,198,255,0.08)', border: '1px solid rgba(0,198,255,0.2)', borderRadius: '8px', width: 32, height: 32, '&:hover': { background: 'rgba(0,198,255,0.18)', borderColor: 'rgba(0,198,255,0.4)' } }}
                            >
                              <i className="bi bi-pencil-fill" style={{ fontSize: 12 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete supplier" arrow>
                            <IconButton size="small" onClick={() => setDeleteTarget(s)}
                              sx={{ color: '#ff6b6b', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: '8px', width: 32, height: 32, '&:hover': { background: 'rgba(255,80,80,0.18)', borderColor: 'rgba(255,80,80,0.4)' } }}
                            >
                              <i className="bi bi-trash3-fill" style={{ fontSize: 12 }} />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <EditDialog open={!!editTarget} supplier={editTarget} token={accessToken}
        onClose={() => setEditTarget(null)} onSaved={handleSaved} />

      <DeleteDialog open={!!deleteTarget} supplier={deleteTarget} token={accessToken}
        onClose={() => setDeleteTarget(null)} onDeleted={handleDeleted} />

      <Snackbar open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((p) => ({ ...p, open: false }))}
          sx={{
            background: snack.severity === 'success' ? 'rgba(0,220,100,0.12)' : snack.severity === 'info' ? 'rgba(0,198,255,0.12)' : 'rgba(255,60,60,0.12)',
            border: `1px solid ${snack.severity === 'success' ? 'rgba(0,220,100,0.3)' : snack.severity === 'info' ? 'rgba(0,198,255,0.3)' : 'rgba(255,80,80,0.3)'}`,
            color: snack.severity === 'success' ? '#00e06a' : snack.severity === 'info' ? '#00c6ff' : '#ff8080',
            borderRadius: 2,
            '& .MuiAlert-icon': { color: snack.severity === 'success' ? '#00e06a' : snack.severity === 'info' ? '#00c6ff' : '#ff8080' },
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </div>
  )
}
