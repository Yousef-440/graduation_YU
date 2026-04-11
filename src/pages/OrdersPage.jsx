import { useState, useEffect, useCallback, useRef } from 'react'
import TextField from '@mui/material/TextField'
import MenuItem  from '@mui/material/MenuItem'
import DashboardNav from '../components/dashboard/DashboardNav'
import { useAuth } from '../context/AuthContext'
import { getOrders, createOrder, cancelOrder } from '../api/orderApi'
import { getSuppliers } from '../api/supplierApi'
import { getProducts } from '../api/productApi'

const STATUS = {
  PENDING:   { label: 'Pending',   color: '#8892b0', bg: 'rgba(136,146,176,0.15)', border: 'rgba(136,146,176,0.3)'  },
  SHIPPED:   { label: 'Shipped',   color: '#00c6ff', bg: 'rgba(0,198,255,0.15)',   border: 'rgba(0,198,255,0.3)'    },
  DELIVERED: { label: 'Delivered', color: '#00ff78', bg: 'rgba(0,255,120,0.15)',   border: 'rgba(0,255,120,0.3)'    },
  CANCELLED: { label: 'Cancelled', color: '#ff4444', bg: 'rgba(255,68,68,0.15)',   border: 'rgba(255,68,68,0.3)'    },
}

const CANCELLABLE = new Set(['PENDING', 'SHIPPED'])

const fmt       = (n) => Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const fmtDate   = (d) => d ? new Date(d).toLocaleDateString() : '—'
const EMPTY_ITEM    = { productId: '', quantity: 1, unitPrice: 0, subtotal: 0 }
const EMPTY_FILTERS = { status: '', supplierId: '', fromDate: '', toDate: '', search: '' }

function CreateOrderForm({ suppliers, products, productsLoading, productsError, onCreated, onCancel }) {
  const { authFetch }               = useAuth()
  const [supplierId, setSupplierId] = useState('')
  const [items, setItems]           = useState([{ ...EMPTY_ITEM }])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')

  const productMap = Object.fromEntries(products.map((p) => [String(p.id), p]))

  const addItem    = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }])
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx))

  const updateItem = (idx, field, value) =>
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it
        const next = { ...it, [field]: value }
        if (field === 'productId') next.unitPrice = productMap[value]?.unitPrice ?? 0
        const qty = parseInt(field === 'quantity' ? value : next.quantity, 10) || 0
        next.subtotal = qty * next.unitPrice
        return next
      })
    )

  const orderTotal = items.reduce((acc, it) => acc + it.subtotal, 0)

  const canSubmit =
    !submitting &&
    !!supplierId &&
    items.every((it) => it.productId && parseInt(it.quantity, 10) >= 1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!supplierId) return setError('Please select a supplier.')
    for (const it of items) {
      if (!it.productId)                                 return setError('Each item must have a product selected.')
      if (!it.quantity || parseInt(it.quantity, 10) < 1) return setError('Quantity must be at least 1 for each item.')
    }
    const payload = {
      supplierId,
      items: items.map((it) => ({ productId: it.productId, quantity: parseInt(it.quantity, 10) })),
    }
    setSubmitting(true)
    const { data, error: err } = await createOrder(authFetch, payload)
    setSubmitting(false)
    if (err) return setError(err)
    onCreated(data)
  }

  const selectStyle   = { width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13, background: 'var(--bg-input)', border: '1px solid var(--border-medium)', color: 'var(--text-input)', outline: 'none' }
  const inputStyle    = { ...selectStyle, width: 90 }
  const readonlyStyle = { ...selectStyle, width: 110, color: 'var(--text-muted)', cursor: 'default', border: '1px solid var(--border-subtle)' }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,80,80,0.25)', color: '#ff8080', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
          Supplier *
        </label>
        <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} style={selectStyle}>
          <option value="" style={{ background: 'var(--bg-surface-solid)' }}>— Select supplier —</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id} style={{ background: 'var(--bg-surface-solid)' }}>{s.name}</option>
          ))}
        </select>
        {suppliers.length === 0 && (
          <p style={{ color: '#ff9900', fontSize: 11, marginTop: 4 }}>
            No suppliers found. <a href="/suppliers" style={{ color: '#00c6ff' }}>Add one first</a>.
          </p>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="d-flex align-items-center justify-content-between mb-2">
          <label style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Order Items *
          </label>
          <button type="button" onClick={addItem}
            style={{ background: 'rgba(0,198,255,0.12)', border: '1px solid rgba(0,198,255,0.3)', color: '#00c6ff', borderRadius: 8, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
          >
            <i className="bi bi-plus-lg me-1" />Add Row
          </button>
        </div>

        <div className="d-flex gap-2 mb-1" style={{ padding: '0 4px' }}>
          {[['Product', 1], ['Qty', 90], ['Unit Price', 110], ['Subtotal', 110], [null, 32]].map(([label, w], i) => (
            <div key={i} style={{ width: w === 1 ? undefined : w, flex: w === 1 ? 1 : undefined, color: 'var(--text-muted)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {label}
            </div>
          ))}
        </div>

        {productsLoading && (
          <div style={{ padding: '10px 4px', color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12, borderColor: '#00c6ff', borderRightColor: 'transparent' }} />
            Loading products…
          </div>
        )}
        {productsError && !productsLoading && (
          <div style={{ padding: '8px 12px', marginBottom: 8, borderRadius: 8, background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,80,80,0.2)', color: '#ff8080', fontSize: 12 }}>
            <i className="bi bi-exclamation-triangle-fill me-2" />{productsError}
          </div>
        )}
        {!productsLoading && !productsError && products.length === 0 && (
          <div style={{ padding: '8px 12px', marginBottom: 8, borderRadius: 8, background: 'rgba(255,153,0,0.08)', border: '1px solid rgba(255,153,0,0.2)', color: '#ff9900', fontSize: 12 }}>
            <i className="bi bi-box-seam me-2" />
            No products available. <a href="/products" style={{ color: '#00c6ff' }}>Add products first</a>.
          </div>
        )}

        {items.map((item, idx) => (
          <div key={idx} className="d-flex align-items-center gap-2 mb-2">
            <select
              value={item.productId}
              onChange={(e) => updateItem(idx, 'productId', e.target.value)}
              disabled={productsLoading || products.length === 0}
              style={{ flex: 1, ...selectStyle, opacity: (productsLoading || products.length === 0) ? 0.5 : 1 }}
            >
              <option value="" style={{ background: 'var(--bg-surface-solid)' }}>— Select product —</option>
              {products.map((p) => (
                <option key={p.id} value={String(p.id)} style={{ background: 'var(--bg-surface-solid)' }}>{p.name}</option>
              ))}
            </select>

            <input type="number" min="1" value={item.quantity}
              onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
              style={inputStyle} />

            <input type="text" readOnly tabIndex={-1}
              value={item.productId ? fmt(item.unitPrice) : '—'}
              style={readonlyStyle} />

            <div style={{ width: 110, color: item.productId ? '#00ff78' : 'var(--text-muted)', fontWeight: item.productId ? 600 : 400, fontSize: 13, padding: '10px 0' }}>
              {item.productId ? fmt(item.subtotal) : '—'}
            </div>

            <button type="button" onClick={() => removeItem(idx)} disabled={items.length === 1}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,80,80,0.3)', background: 'rgba(255,60,60,0.08)', color: '#ff6b6b', cursor: items.length === 1 ? 'not-allowed' : 'pointer', opacity: items.length === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <i className="bi bi-trash3" style={{ fontSize: 12 }} />
            </button>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(0,255,120,0.06)', border: '1px solid rgba(0,255,120,0.15)', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>Estimated Total</span>
        <span style={{ color: '#00ff78', fontSize: 18, fontWeight: 800 }}>{fmt(orderTotal)}</span>
      </div>

      <div className="d-flex gap-3 align-items-center">
        <button type="submit" disabled={!canSubmit}
          style={{
            padding: '11px 28px', borderRadius: 10, border: 'none',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            background: canSubmit ? 'linear-gradient(90deg,#00e06a,#00c6ff)' : 'var(--bg-input)',
            color: canSubmit ? '#050e1a' : 'var(--text-muted)',
            fontWeight: 700, fontSize: 14, transition: 'all 0.2s',
          }}
        >
          {submitting
            ? <><span className="spinner-border spinner-border-sm me-2" style={{ width: 12, height: 12, borderColor: '#050e1a', borderRightColor: 'transparent' }} />Placing Order…</>
            : 'Place Order'
          }
        </button>
        <button type="button" onClick={onCancel}
          style={{ padding: '11px 24px', borderRadius: 10, border: '1px solid var(--border-medium)', background: 'transparent', color: 'var(--text-body)', cursor: 'pointer', fontSize: 13 }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function CancelDialog({ order, cancelling, error, onConfirm, onClose }) {
  if (!order) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={!cancelling ? onClose : undefined}
        style={{ position: 'absolute', inset: 0, background: 'rgba(5,14,26,0.75)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', width: 420, borderRadius: 16, background: 'var(--bg-surface)', border: '1px solid var(--border-section)', boxShadow: 'var(--shadow-surface)', padding: '28px 28px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,68,68,0.12)', border: '1px solid rgba(255,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-x-circle-fill" style={{ color: '#ff4444', fontSize: 18 }} />
          </div>
          <div>
            <h6 style={{ color: 'var(--text-heading)', fontWeight: 700, margin: 0 }}>Cancel Order</h6>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>This action cannot be undone</p>
          </div>
        </div>

        <p style={{ color: 'var(--text-body)', fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
          Are you sure you want to cancel order{' '}
          <strong style={{ color: '#00c6ff' }}>#{order.id.slice(0, 8).toUpperCase()}</strong>{' '}
          from <strong>{order.supplierName}</strong>?
        </p>

        {error && (
          <div style={{ marginBottom: 12, padding: '9px 13px', borderRadius: 8, background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,80,80,0.25)', color: '#ff8080', fontSize: 12 }}>
            <i className="bi bi-exclamation-triangle-fill me-2" />{error}
          </div>
        )}

        <div className="d-flex gap-2 justify-content-end" style={{ marginTop: 20 }}>
          <button onClick={onClose} disabled={cancelling}
            style={{ padding: '9px 20px', borderRadius: 10, border: '1px solid var(--border-medium)', background: 'transparent', color: 'var(--text-body)', cursor: cancelling ? 'not-allowed' : 'pointer', fontSize: 13, opacity: cancelling ? 0.5 : 1 }}>
            Keep Order
          </button>
          <button onClick={onConfirm} disabled={cancelling}
            style={{ padding: '9px 22px', borderRadius: 10, border: 'none', background: cancelling ? 'var(--bg-input)' : 'rgba(255,68,68,0.85)', color: cancelling ? 'var(--text-muted)' : '#fff', cursor: cancelling ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13 }}>
            {cancelling
              ? <><span className="spinner-border spinner-border-sm me-2" style={{ width: 12, height: 12 }} />Cancelling…</>
              : <><i className="bi bi-x-circle me-2" />Confirm Cancel</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

function FilterBar({ filters, suppliers, onChange, onClear }) {
  const hasActive = Object.values(filters).some((v) => v !== '')

  const handle = (field) => (e) => onChange(field, e.target.value)

  return (
    <div style={{
      marginBottom: 20,
      padding: '18px 22px',
      borderRadius: 14,
      background: 'var(--bg-surface-alt)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-surface)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <i className="bi bi-funnel-fill" style={{ color: '#00c6ff', fontSize: 13 }} />
        <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          Filter &amp; Sort
        </span>
        {hasActive && (
          <button onClick={onClear}
            style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: 8, border: '1px solid rgba(255,107,107,0.35)', background: 'rgba(255,80,80,0.08)', color: '#ff8080', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
          >
            <i className="bi bi-x-lg me-1" style={{ fontSize: 10 }} /> Clear Filters
          </button>
        )}
      </div>

      <div className="row g-2">
        <div className="col-md-3">
          <TextField label="Search" name="search" value={filters.search} onChange={handle('search')}
            fullWidth size="small" placeholder="Order ID or supplier…" />
        </div>
        <div className="col-md-2">
          <TextField select label="Status" name="status" value={filters.status} onChange={handle('status')}
            fullWidth size="small">
            <MenuItem value="">All Statuses</MenuItem>
            {Object.entries(STATUS).map(([k, v]) => (
              <MenuItem key={k} value={k}>{v.label}</MenuItem>
            ))}
          </TextField>
        </div>
        <div className="col-md-3">
          <TextField select label="Supplier" name="supplierId" value={filters.supplierId} onChange={handle('supplierId')}
            fullWidth size="small">
            <MenuItem value="">All Suppliers</MenuItem>
            {suppliers.map((s) => (
              <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>
            ))}
          </TextField>
        </div>
        <div className="col-md-2">
          <TextField label="From Date" name="fromDate" type="date" value={filters.fromDate} onChange={handle('fromDate')}
            fullWidth size="small" InputLabelProps={{ shrink: true }} />
        </div>
        <div className="col-md-2">
          <TextField label="To Date" name="toDate" type="date" value={filters.toDate} onChange={handle('toDate')}
            fullWidth size="small" InputLabelProps={{ shrink: true }} />
        </div>
      </div>
    </div>
  )
}

function OrderRow({ order, onCancelRequest }) {
  const [open, setOpen] = useState(false)
  const s = STATUS[order.status] ?? STATUS.PENDING

  return (
    <>
      <tr
        style={{ borderBottom: '1px solid var(--border-row)', cursor: 'pointer', transition: 'background 0.15s' }}
        onClick={() => setOpen((p) => !p)}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-row-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <td style={{ padding: '14px 20px', color: '#00c6ff', fontWeight: 600, background: 'transparent', verticalAlign: 'middle' }}>
          <i className={`bi ${open ? 'bi-chevron-down' : 'bi-chevron-right'} me-2`} style={{ fontSize: 11, color: 'var(--text-muted)' }} />
          {order.id.slice(0, 8).toUpperCase()}
        </td>
        <td style={{ padding: '14px 20px', background: 'transparent', verticalAlign: 'middle', color: 'var(--text-body)' }}>{order.supplierName}</td>
        <td style={{ padding: '14px 20px', background: 'transparent', verticalAlign: 'middle', color: 'var(--text-muted)' }}>{order.createdByName}</td>
        <td style={{ padding: '14px 20px', background: 'transparent', verticalAlign: 'middle', color: '#00ff78', fontWeight: 600 }}>{fmt(order.totalAmount)}</td>
        <td style={{ padding: '14px 20px', background: 'transparent', verticalAlign: 'middle', color: 'var(--text-muted)' }}>
          {fmtDate(order.createdAt)}
        </td>
        <td style={{ padding: '14px 20px', background: 'transparent', verticalAlign: 'middle' }}>
          <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
            {s.label}
          </span>
        </td>
        <td style={{ padding: '14px 16px', background: 'transparent', verticalAlign: 'middle' }} onClick={(e) => e.stopPropagation()}>
          {CANCELLABLE.has(order.status) && (
            <button
              onClick={() => onCancelRequest(order)}
              title="Cancel order"
              style={{ height: 30, padding: '0 12px', borderRadius: 8, border: '1px solid rgba(255,80,80,0.3)', background: 'rgba(255,60,60,0.08)', color: '#ff6b6b', cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <i className="bi bi-x-circle" style={{ fontSize: 12 }} /> Cancel
            </button>
          )}
        </td>
      </tr>

      {open && (
        <tr>
          <td colSpan={7} style={{ padding: '0 20px 16px', background: 'var(--bg-surface-alt)', borderBottom: '1px solid var(--border-row)' }}>
            <table style={{ width: '100%', fontSize: 12, marginTop: 8 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-thead)' }}>
                  {['Product', 'Qty', 'Unit Price', 'Subtotal'].map((h) => (
                    <th key={h} style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '6px 12px', background: 'transparent', borderBottom: 'none' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.id}>
                    <td style={{ padding: '6px 12px', color: 'var(--text-body)' }}>{it.productName}</td>
                    <td style={{ padding: '6px 12px', color: 'var(--text-muted)' }}>{it.quantity}</td>
                    <td style={{ padding: '6px 12px', color: 'var(--text-muted)' }}>{fmt(it.unitPrice)}</td>
                    <td style={{ padding: '6px 12px', color: '#00ff78', fontWeight: 600 }}>{fmt(it.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  )
}

export default function OrdersPage() {
  const { authFetch, accessToken } = useAuth()

  const [orders, setOrders]               = useState([])
  const [suppliers, setSuppliers]         = useState([])
  const [products, setProducts]           = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [depsLoading, setDepsLoading]     = useState(true)
  const [error, setError]                 = useState('')
  const [productsError, setProductsError] = useState('')
  const [showForm, setShowForm]           = useState(false)
  const [toast, setToast]                 = useState({ msg: '', type: 'success' })
  const [filters, setFilters]             = useState(EMPTY_FILTERS)
  const [cancelTarget, setCancelTarget]   = useState(null)
  const [cancelling, setCancelling]       = useState(false)
  const [cancelError, setCancelError]     = useState('')

  const isFirstRender = useRef(true)
  const filterTimer   = useRef(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500)
  }

  useEffect(() => {
    async function loadDeps() {
      setDepsLoading(true)
      const [sRes, pRes] = await Promise.all([
        getSuppliers(accessToken),
        getProducts(accessToken, { size: 1000, sortBy: 'name', direction: 'asc' }),
      ])
      setDepsLoading(false)
      if (!sRes.error) setSuppliers(sRes.data ?? [])
      if (pRes.error)  setProductsError(pRes.error)
      else             setProducts(pRes.data ?? [])
    }
    loadDeps()
  }, [accessToken])

  const loadOrders = useCallback(async (f) => {
    setOrdersLoading(true)
    setError('')
    const params = {}
    if (f.status)        params.status     = f.status
    if (f.supplierId)    params.supplierId = f.supplierId
    if (f.fromDate)      params.fromDate   = f.fromDate
    if (f.toDate)        params.toDate     = f.toDate
    if (f.search?.trim()) params.search    = f.search.trim()
    const oRes = await getOrders(authFetch, params)
    setOrdersLoading(false)
    if (oRes.error) setError(oRes.error)
    else            setOrders(oRes.data)
  }, [authFetch])

  useEffect(() => {
    const delay = isFirstRender.current ? 0 : 350
    isFirstRender.current = false
    clearTimeout(filterTimer.current)
    filterTimer.current = setTimeout(() => loadOrders(filters), delay)
    return () => clearTimeout(filterTimer.current)
  }, [filters])

  const handleFilterChange = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value }))

  const handleClearFilters = () => setFilters(EMPTY_FILTERS)

  const handleCreated = (order) => {
    setOrders((p) => [order, ...p])
    setShowForm(false)
    showToast('Purchase order placed successfully.')
  }

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    setCancelError('')
    const { data, error: err } = await cancelOrder(authFetch, cancelTarget.id)
    setCancelling(false)
    if (err) { setCancelError(err); return }
    setOrders((prev) => prev.map((o) => (o.id === data.id ? data : o)))
    setCancelTarget(null)
    showToast(`Order #${data.id.slice(0, 8).toUpperCase()} has been cancelled.`, 'warning')
  }

  const handleCancelClose = () => {
    if (cancelling) return
    setCancelTarget(null)
    setCancelError('')
  }

  const loading = ordersLoading

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
      <DashboardNav />

      <main style={{ marginLeft: 230, flex: 1, padding: '28px 28px 40px' }}>

        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 style={{ color: 'var(--text-heading)', fontWeight: 800, margin: 0 }}>Purchase Orders</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>Track all procurement orders</p>
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
            {showForm ? 'Cancel' : 'New Order'}
          </button>
        </div>

        {toast.msg && (
          <div style={{
            marginBottom: 16, padding: '11px 16px', borderRadius: 10, fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 8,
            background: toast.type === 'warning' ? 'rgba(255,153,0,0.1)' : 'rgba(0,220,100,0.1)',
            border: `1px solid ${toast.type === 'warning' ? 'rgba(255,153,0,0.25)' : 'rgba(0,220,100,0.25)'}`,
            color: toast.type === 'warning' ? '#ffb400' : '#00e06a',
          }}>
            <i className={`bi ${toast.type === 'warning' ? 'bi-exclamation-circle-fill' : 'bi-check-circle-fill'}`} />
            {toast.msg}
          </div>
        )}

        {showForm && (
          <div style={{ marginBottom: 24, padding: '24px 28px', borderRadius: 16, background: 'var(--bg-surface)', border: '1px solid var(--border-section)', boxShadow: 'var(--shadow-surface)' }}>
            <h6 style={{ color: 'var(--text-heading)', fontWeight: 700, marginBottom: 20 }}>New Purchase Order</h6>
            <CreateOrderForm
              suppliers={suppliers}
              products={products}
              productsLoading={depsLoading}
              productsError={productsError}
              onCreated={handleCreated}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <FilterBar
          filters={filters}
          suppliers={suppliers}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />

        <div style={{ borderRadius: 16, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-surface)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              <span className="spinner-border spinner-border-sm me-2" style={{ borderColor: '#00ff78', borderRightColor: 'transparent' }} />
              Loading orders…
            </div>
          ) : error ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#ff6b6b', fontSize: 13 }}>{error}</div>
          ) : orders.length === 0 ? (
            <div style={{ padding: 56, textAlign: 'center' }}>
              <i className="bi bi-receipt" style={{ fontSize: 40, color: 'var(--text-muted)', display: 'block', marginBottom: 12 }} />
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                {Object.values(filters).some((v) => v !== '')
                  ? 'No orders match the current filters.'
                  : 'No orders yet. Place your first purchase order above.'}
              </p>
            </div>
          ) : (
            <table className="table table-borderless mb-0"
              style={{ fontSize: 13, '--bs-table-bg': 'transparent', '--bs-table-color': 'var(--text-body)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-thead)' }}>
                  {['Order ID', 'Supplier', 'Created By', 'Total', 'Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, padding: '14px 20px', background: 'transparent', borderBottom: 'none' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <OrderRow key={order.id} order={order} onCancelRequest={setCancelTarget} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <CancelDialog
        order={cancelTarget}
        cancelling={cancelling}
        error={cancelError}
        onConfirm={handleCancelConfirm}
        onClose={handleCancelClose}
      />
    </div>
  )
}
