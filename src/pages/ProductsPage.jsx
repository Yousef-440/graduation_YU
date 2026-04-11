import { useState, useEffect, useCallback, useRef } from 'react'
import Dialog           from '@mui/material/Dialog'
import DialogTitle      from '@mui/material/DialogTitle'
import DialogContent    from '@mui/material/DialogContent'
import DialogActions    from '@mui/material/DialogActions'
import TextField        from '@mui/material/TextField'
import MenuItem         from '@mui/material/MenuItem'
import Button           from '@mui/material/Button'
import IconButton       from '@mui/material/IconButton'
import Tooltip          from '@mui/material/Tooltip'
import Snackbar         from '@mui/material/Snackbar'
import Alert            from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

import DashboardNav from '../components/dashboard/DashboardNav'
import { useAuth }  from '../context/AuthContext'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/productApi'

const EMPTY_CREATE = {
  name: '', sku: '', description: '',
  unitPrice: '', stockQuantity: '0', reorderLevel: '0',
}
const EMPTY_FILTER = {
  name: '', sku: '', status: '',
  minPrice: '', maxPrice: '',
  minStock: '', maxStock: '',
  sortBy: 'createdAt', direction: 'desc',
}
const PAGE_SIZE = 20

const STATUS_CONFIG = {
  IN_STOCK:     { label: 'In Stock',     bg: 'rgba(0,255,120,0.1)',  border: 'rgba(0,255,120,0.25)',  color: '#00ff78' },
  LOW_STOCK:    { label: 'Low Stock',    bg: 'rgba(255,180,0,0.1)', border: 'rgba(255,180,0,0.3)',   color: '#ffb400' },
  OUT_OF_STOCK: { label: 'Out of Stock', bg: 'rgba(255,80,80,0.1)', border: 'rgba(255,80,80,0.25)', color: '#ff6b6b' },
}

const SORT_FIELDS = [
  { value: 'createdAt',     label: 'Date Added'   },
  { value: 'updatedAt',     label: 'Last Updated' },
  { value: 'name',          label: 'Name'         },
  { value: 'unitPrice',     label: 'Unit Price'   },
  { value: 'stockQuantity', label: 'Stock Qty'    },
]

function validateEdit(form) {
  const errors = {}
  if (!form.name?.trim())                  errors.name      = 'Product name is required'
  else if (form.name.trim().length > 200)  errors.name      = 'Max 200 characters'
  if (!form.sku?.trim())                   errors.sku       = 'SKU is required'
  else if (form.sku.trim().length > 100)   errors.sku       = 'Max 100 characters'
  if (form.unitPrice === '')               errors.unitPrice = 'Unit price is required'
  else if (parseFloat(form.unitPrice) < 0) errors.unitPrice = 'Must be 0 or greater'
  if (form.stockQuantity !== '' && parseInt(form.stockQuantity) < 0) errors.stockQuantity = 'Must be 0 or greater'
  if (form.reorderLevel  !== '' && parseInt(form.reorderLevel)  < 0) errors.reorderLevel  = 'Must be 0 or greater'
  return errors
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

const fmt = (n) => Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

function buildParams(filter, page) {
  const p = { page, size: PAGE_SIZE, sortBy: filter.sortBy, direction: filter.direction }
  if (filter.name.trim())     p.name     = filter.name.trim()
  if (filter.sku.trim())      p.sku      = filter.sku.trim()
  if (filter.status)          p.status   = filter.status
  if (filter.minPrice !== '') p.minPrice = filter.minPrice
  if (filter.maxPrice !== '') p.maxPrice = filter.maxPrice
  if (filter.minStock !== '') p.minStock = filter.minStock
  if (filter.maxStock !== '') p.maxStock = filter.maxStock
  return p
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.IN_STOCK
  return (
    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, whiteSpace: 'nowrap' }}>
      {cfg.label}
    </span>
  )
}

function EditDialog({ open, product, onClose, onSaved, token }) {
  const [form, setForm]         = useState({})
  const [errors, setErrors]     = useState({})
  const [apiError, setApiError] = useState('')
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    if (product) {
      setForm({
        name:          product.name          ?? '',
        sku:           product.sku           ?? '',
        description:   product.description   ?? '',
        unitPrice:     product.unitPrice     ?? '',
        stockQuantity: product.stockQuantity ?? 0,
        reorderLevel:  product.reorderLevel  ?? 0,
      })
      setErrors({})
      setApiError('')
    }
  }, [product])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    setErrors((p) => ({ ...p, [name]: '' }))
    setApiError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const clientErrors = validateEdit(form)
    if (Object.keys(clientErrors).length) { setErrors(clientErrors); return }

    const payload = {
      name:          form.name.trim(),
      sku:           form.sku.trim(),
      description:   form.description.trim() || null,
      unitPrice:     parseFloat(form.unitPrice),
      stockQuantity: parseInt(form.stockQuantity, 10),
      reorderLevel:  parseInt(form.reorderLevel,  10),
    }

    setSaving(true)
    const { data, error, fieldErrors, status } = await updateProduct(token, product.id, payload)
    setSaving(false)

    if (error) {
      if (status === 409 || error.toLowerCase().includes('sku'))
        setErrors((p) => ({ ...p, sku: error }))
      else if (fieldErrors && Object.keys(fieldErrors).length)
        setErrors(fieldErrors)
      else
        setApiError(error)
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
            Edit Product
          </span>
        </DialogTitle>
        <DialogContent>
          {apiError && (
            <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,80,80,0.25)', color: '#ff8080', fontSize: 13 }}>
              {apiError}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 4 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <TextField label="Product Name *" name="name" value={form.name} onChange={handleChange}
                error={!!errors.name} helperText={errors.name} size="small" autoFocus style={{ flex: 2 }} />
              <TextField label="SKU *" name="sku" value={form.sku} onChange={handleChange}
                error={!!errors.sku} helperText={errors.sku} size="small" style={{ flex: 1 }} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <TextField label="Unit Price ($) *" name="unitPrice" type="number" value={form.unitPrice}
                onChange={handleChange} error={!!errors.unitPrice} helperText={errors.unitPrice}
                inputProps={{ min: 0, step: '0.01' }} size="small" style={{ flex: 1 }} />
              <TextField label="Stock Quantity" name="stockQuantity" type="number" value={form.stockQuantity}
                onChange={handleChange} error={!!errors.stockQuantity} helperText={errors.stockQuantity}
                inputProps={{ min: 0 }} size="small" style={{ flex: 1 }} />
              <TextField label="Reorder Level" name="reorderLevel" type="number" value={form.reorderLevel}
                onChange={handleChange} error={!!errors.reorderLevel} helperText={errors.reorderLevel}
                inputProps={{ min: 0 }} size="small" style={{ flex: 1 }} />
            </div>
            <TextField label="Description" name="description" value={form.description}
              onChange={handleChange} size="small" fullWidth multiline rows={3} />
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

function DeleteDialog({ open, product, onClose, onDeleted, token }) {
  const [deleting, setDeleting] = useState(false)
  const [apiError, setApiError] = useState('')

  useEffect(() => { if (open) setApiError('') }, [open])

  const handleConfirm = async () => {
    setDeleting(true)
    const { error } = await deleteProduct(token, product.id)
    setDeleting(false)
    if (error) { setApiError(error); return }
    onDeleted(product.id)
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className="bi bi-trash3-fill" style={{ color: '#ff6b6b', fontSize: 18 }} />
          Delete Product
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
          <strong style={{ color: 'var(--text-heading)' }}>{product?.name}</strong>?
          <br />
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            The product will be soft-deleted and can be recovered by an administrator.
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
  const [form, setForm]         = useState(EMPTY_CREATE)
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
    const clientErrors = {}
    if (!form.name.trim())  clientErrors.name      = 'Product name is required'
    if (!form.sku.trim())   clientErrors.sku       = 'SKU is required'
    if (!form.unitPrice)    clientErrors.unitPrice = 'Unit price is required'
    if (Object.keys(clientErrors).length) { setErrors(clientErrors); return }

    const payload = {
      name:          form.name.trim(),
      sku:           form.sku.trim(),
      description:   form.description.trim() || null,
      unitPrice:     parseFloat(form.unitPrice),
      stockQuantity: parseInt(form.stockQuantity, 10) || 0,
      reorderLevel:  parseInt(form.reorderLevel,  10) || 0,
    }

    setSaving(true)
    const { data, error, fieldErrors, status } = await createProduct(token, payload)
    setSaving(false)

    if (error) {
      if (status === 409 || error.toLowerCase().includes('sku'))
        setErrors((p) => ({ ...p, sku: error }))
      else if (fieldErrors && Object.keys(fieldErrors).length)
        setErrors(fieldErrors)
      else
        setApiError(error)
      return
    }
    setForm(EMPTY_CREATE)
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
          <TextField label="Product Name *" name="name" value={form.name} onChange={handleChange}
            error={!!errors.name} helperText={errors.name} fullWidth size="small" />
        </div>
        <div className="col-md-6">
          <TextField label="SKU *" name="sku" value={form.sku} onChange={handleChange}
            error={!!errors.sku} helperText={errors.sku} fullWidth size="small" />
        </div>
        <div className="col-md-4">
          <TextField label="Unit Price ($) *" name="unitPrice" type="number" value={form.unitPrice}
            onChange={handleChange} error={!!errors.unitPrice} helperText={errors.unitPrice}
            inputProps={{ min: 0, step: '0.01' }} fullWidth size="small" />
        </div>
        <div className="col-md-4">
          <TextField label="Stock Quantity" name="stockQuantity" type="number" value={form.stockQuantity}
            onChange={handleChange} inputProps={{ min: 0 }} fullWidth size="small" />
        </div>
        <div className="col-md-4">
          <TextField label="Reorder Level" name="reorderLevel" type="number" value={form.reorderLevel}
            onChange={handleChange} inputProps={{ min: 0 }} fullWidth size="small" />
        </div>
        <div className="col-12">
          <TextField label="Description" name="description" value={form.description}
            onChange={handleChange} fullWidth size="small" />
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
        {saving ? 'Saving…' : 'Add Product'}
      </button>
    </form>
  )
}

export default function ProductsPage() {
  const { accessToken }         = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [pageError, setPageError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [filter, setFilter]               = useState(EMPTY_FILTER)
  const [page, setPage]                   = useState(0)
  const [totalPages, setTotalPages]       = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [editTarget, setEditTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' })
  const toast = (msg, severity = 'success') => setSnack({ open: true, msg, severity })

  const isFilterMount = useRef(true)
  const isPageMount   = useRef(true)

  const load = useCallback(async (f, p) => {
    setLoading(true)
    setPageError('')
    const { data, error, totalPages: tp, totalElements: te } =
      await getProducts(accessToken, buildParams(f, p))
    setLoading(false)
    if (error) { setPageError(error); return }
    setProducts(data ?? [])
    setTotalPages(tp ?? 1)
    setTotalElements(te ?? 0)
  }, [accessToken])

  useEffect(() => {
    if (isFilterMount.current) { isFilterMount.current = false; load(filter, 0); return }
    setPage(0)
    const t = setTimeout(() => load(filter, 0), 400)
    return () => clearTimeout(t)
  }, [filter, load])

  useEffect(() => {
    if (isPageMount.current) { isPageMount.current = false; return }
    load(filter, page)
  }, [page])

  const isFilterActive = Object.entries(filter)
    .filter(([k]) => !['sortBy', 'direction'].includes(k))
    .some(([, v]) => String(v).trim() !== '')

  const pageStart = totalElements === 0 ? 0 : page * PAGE_SIZE + 1
  const pageEnd   = Math.min((page + 1) * PAGE_SIZE, totalElements)

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilter((p) => ({ ...p, [name]: value }))
  }
  const clearFilter = () => setFilter(EMPTY_FILTER)

  const handleCreated = (product) => {
    setProducts((p) => [product, ...p])
    setTotalElements((n) => n + 1)
    setShowForm(false)
    toast(`Product "${product.name}" added successfully.`)
  }
  const handleSaved = (updated) => {
    setProducts((p) => p.map((x) => (x.id === updated.id ? updated : x)))
    setEditTarget(null)
    toast(`Product "${updated.name}" updated successfully.`)
  }
  const handleDeleted = (id) => {
    const name = deleteTarget?.name
    setProducts((p) => p.filter((x) => x.id !== id))
    setTotalElements((n) => Math.max(0, n - 1))
    setDeleteTarget(null)
    toast(`Product "${name}" deleted.`, 'info')
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
            <h4 style={{ color: 'var(--text-heading)', fontWeight: 800, margin: 0 }}>Products</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>Catalogue of procurable items</p>
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
            {showForm ? 'Cancel' : 'New Product'}
          </button>
        </div>

        <div style={{ marginBottom: 20, padding: '18px 22px', borderRadius: 14, background: 'var(--bg-surface-alt)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <i className="bi bi-funnel-fill" style={{ color: '#00c6ff', fontSize: 13 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Filter &amp; Sort
            </span>
            {isFilterActive && (
              <button
                onClick={clearFilter}
                style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: 8, border: '1px solid rgba(255,107,107,0.35)', background: 'rgba(255,80,80,0.08)', color: '#ff8080', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
              >
                <i className="bi bi-x-lg me-1" style={{ fontSize: 10 }} /> Clear Filters
              </button>
            )}
          </div>

          <div className="row g-2">
            <div className="col-md-3">
              <TextField label="Name" name="name" value={filter.name} onChange={handleFilterChange}
                fullWidth size="small" placeholder="Search by name…" />
            </div>
            <div className="col-md-2">
              <TextField label="SKU" name="sku" value={filter.sku} onChange={handleFilterChange}
                fullWidth size="small" placeholder="Exact SKU…" />
            </div>
            <div className="col-md-2">
              <TextField select label="Status" name="status" value={filter.status} onChange={handleFilterChange}
                fullWidth size="small">
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="IN_STOCK">In Stock</MenuItem>
                <MenuItem value="LOW_STOCK">Low Stock</MenuItem>
                <MenuItem value="OUT_OF_STOCK">Out of Stock</MenuItem>
              </TextField>
            </div>
            <div className="col-md-3">
              <TextField select label="Sort By" name="sortBy" value={filter.sortBy} onChange={handleFilterChange}
                fullWidth size="small">
                {SORT_FIELDS.map((f) => (
                  <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
                ))}
              </TextField>
            </div>
            <div className="col-md-2">
              <TextField select label="Direction" name="direction" value={filter.direction} onChange={handleFilterChange}
                fullWidth size="small">
                <MenuItem value="desc"><span><i className="bi bi-sort-down-alt me-1" />Descending</span></MenuItem>
                <MenuItem value="asc"><span><i className="bi bi-sort-up-alt me-1" />Ascending</span></MenuItem>
              </TextField>
            </div>
          </div>

          <div className="row g-2 mt-1">
            <div className="col-md-3">
              <div style={{ display: 'flex', gap: 6 }}>
                <TextField label="Min Price" name="minPrice" type="number" value={filter.minPrice}
                  onChange={handleFilterChange} size="small" inputProps={{ min: 0, step: '0.01' }}
                  placeholder="0.00" style={{ flex: 1 }} />
                <TextField label="Max Price" name="maxPrice" type="number" value={filter.maxPrice}
                  onChange={handleFilterChange} size="small" inputProps={{ min: 0, step: '0.01' }}
                  placeholder="∞" style={{ flex: 1 }} />
              </div>
            </div>
            <div className="col-md-3">
              <div style={{ display: 'flex', gap: 6 }}>
                <TextField label="Min Stock" name="minStock" type="number" value={filter.minStock}
                  onChange={handleFilterChange} size="small" inputProps={{ min: 0 }}
                  placeholder="0" style={{ flex: 1 }} />
                <TextField label="Max Stock" name="maxStock" type="number" value={filter.maxStock}
                  onChange={handleFilterChange} size="small" inputProps={{ min: 0 }}
                  placeholder="∞" style={{ flex: 1 }} />
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <div style={{ marginBottom: 24, padding: '24px 28px', borderRadius: 16, background: 'var(--bg-surface)', border: '1px solid var(--border-section)', boxShadow: 'var(--shadow-surface)' }}>
            <h6 style={{ color: 'var(--text-heading)', fontWeight: 700, marginBottom: 20 }}>New Product</h6>
            <CreateForm token={accessToken} onCreated={handleCreated} />
          </div>
        )}

        <div style={{ borderRadius: 16, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-surface)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              <span className="spinner-border spinner-border-sm me-2" style={{ borderColor: '#00ff78', borderRightColor: 'transparent' }} />
              Loading products…
            </div>
          ) : pageError ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#ff6b6b', fontSize: 13 }}>{pageError}</div>
          ) : products.length === 0 ? (
            <div style={{ padding: 56, textAlign: 'center' }}>
              <i className="bi bi-box-seam" style={{ fontSize: 40, color: 'var(--text-muted)', display: 'block', marginBottom: 12 }} />
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                {isFilterActive ? 'No products match your filters.' : 'No products yet. Add your first one above.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-borderless mb-0"
                style={{ fontSize: 13, '--bs-table-bg': 'transparent', '--bs-table-color': 'var(--text-body)', minWidth: 950 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-thead)' }}>
                    {['Name', 'SKU', 'Unit Price', 'Stock Qty', 'Reorder Lvl', 'Status', 'Added', 'Actions'].map((h) => (
                      <th key={h} style={{ ...TH, ...(h === 'Actions' ? { textAlign: 'center', width: 100 } : {}) }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}
                      style={{ borderBottom: '1px solid var(--border-row)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-row-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ ...TD, color: '#00c6ff', fontWeight: 600 }}>{p.name}</td>
                      <td style={TD}>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-body)', background: 'var(--bg-input)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                          {p.sku}
                        </span>
                      </td>
                      <td style={{ ...TD, color: '#00ff78', fontWeight: 600 }}>{fmt(p.unitPrice)}</td>
                      <td style={{ ...TD, color: 'var(--text-body)', textAlign: 'center' }}>{p.stockQuantity}</td>
                      <td style={{ ...TD, color: 'var(--text-muted)', textAlign: 'center' }}>{p.reorderLevel}</td>
                      <td style={TD}><StatusBadge status={p.status} /></td>
                      <td style={{ ...TD, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(p.createdAt)}</td>
                      <td style={{ ...TD, textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: 4 }}>
                          <Tooltip title="Edit product" arrow>
                            <IconButton size="small" onClick={() => setEditTarget(p)}
                              sx={{ color: '#00c6ff', background: 'rgba(0,198,255,0.08)', border: '1px solid rgba(0,198,255,0.2)', borderRadius: '8px', width: 32, height: 32, '&:hover': { background: 'rgba(0,198,255,0.18)', borderColor: 'rgba(0,198,255,0.4)' } }}
                            >
                              <i className="bi bi-pencil-fill" style={{ fontSize: 12 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete product" arrow>
                            <IconButton size="small" onClick={() => setDeleteTarget(p)}
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

        {!loading && !pageError && totalElements > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 16, padding: '12px 18px', borderRadius: 12,
            background: 'var(--bg-pagination)', border: '1px solid var(--border-pagination)',
            boxShadow: 'var(--shadow-surface)',
          }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              Showing{' '}
              <span style={{ color: 'var(--text-body)', fontWeight: 600 }}>{pageStart}–{pageEnd}</span>
              {' '}of{' '}
              <span style={{ color: 'var(--text-body)', fontWeight: 600 }}>{totalElements}</span>
              {' '}products
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                style={{ padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid var(--border-medium)', background: 'var(--bg-input)', color: page === 0 ? 'var(--text-disabled)' : 'var(--text-body)', cursor: page === 0 ? 'not-allowed' : 'pointer' }}
              >
                <i className="bi bi-chevron-left me-1" />Prev
              </button>
              <span style={{ color: 'var(--text-body)', fontSize: 13, minWidth: 90, textAlign: 'center' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                style={{ padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid var(--border-medium)', background: 'var(--bg-input)', color: page >= totalPages - 1 ? 'var(--text-disabled)' : 'var(--text-body)', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
              >
                Next<i className="bi bi-chevron-right ms-1" />
              </button>
            </div>
          </div>
        )}

      </main>

      <EditDialog open={!!editTarget} product={editTarget} token={accessToken}
        onClose={() => setEditTarget(null)} onSaved={handleSaved} />

      <DeleteDialog open={!!deleteTarget} product={deleteTarget} token={accessToken}
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
