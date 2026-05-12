import { useState, useEffect, useCallback, Fragment } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getOrders, updateOrderStatus, bulkUpdateOrderStatus } from '../../api/orderApi'

const DEFAULT_STEPS = [
  {
    key:         'PENDING',
    label:       'Pending',
    icon:        'bi-hourglass-split',
    color:       '#8892b0',
    glow:        'rgba(136,146,176,0.3)',
    bg:          'rgba(136,146,176,0.12)',
    border:      'rgba(136,146,176,0.35)',
    description: 'Awaiting approval',
  },
  {
    key:         'PROCESSING',
    label:       'Processing',
    icon:        'bi-gear-fill',
    color:       '#00c6ff',
    glow:        'rgba(0,198,255,0.3)',
    bg:          'rgba(0,198,255,0.12)',
    border:      'rgba(0,198,255,0.35)',
    description: 'Under processing',
  },
  {
    key:         'SHIPPED',
    label:       'Shipped',
    icon:        'bi-truck',
    color:       '#ff9900',
    glow:        'rgba(255,153,0,0.3)',
    bg:          'rgba(255,153,0,0.12)',
    border:      'rgba(255,153,0,0.35)',
    description: 'In transit',
  },
  {
    key:         'DELIVERED',
    label:       'Delivered',
    icon:        'bi-check-circle-fill',
    color:       '#00ff78',
    glow:        'rgba(0,255,120,0.3)',
    bg:          'rgba(0,255,120,0.12)',
    border:      'rgba(0,255,120,0.35)',
    description: 'Successfully received',
  },
]

const NEXT_STATUS = {
  PENDING:    'PROCESSING',
  PROCESSING: 'SHIPPED',
  SHIPPED:    'DELIVERED',
}

const ROLE_PERMISSIONS = {
  PENDING:    'PROCUREMENT_OFFICER',
  PROCESSING: 'STOREKEEPER',
  SHIPPED:    'STOREKEEPER',
}

function canAdvance(statusKey, userRole) {
  const required   = ROLE_PERMISSIONS[statusKey]
  if (!required)   return false
  const normalized = (userRole ?? '').replace(/^ROLE_/, '').toUpperCase()
  return normalized === 'ADMIN' || normalized === required
}

const ALERT_STYLES = {
  danger:  { bg: 'rgba(255,60,60,0.15)',  border: 'rgba(255,80,80,0.35)',  color: '#ff6b6b', icon: 'bi-exclamation-triangle-fill' },
  warning: { bg: 'rgba(255,153,0,0.15)', border: 'rgba(255,153,0,0.35)', color: '#ff9900', icon: 'bi-exclamation-circle-fill'   },
  info:    { bg: 'rgba(0,198,255,0.15)', border: 'rgba(0,198,255,0.35)', color: '#00c6ff', icon: 'bi-info-circle-fill'           },
  success: { bg: 'rgba(0,255,120,0.15)', border: 'rgba(0,255,120,0.35)', color: '#00ff78', icon: 'bi-check-circle-fill'          },
}

const fmt = (n) => Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

function deriveAlerts(counts) {
  const p = counts.PENDING    ?? 0
  const a = counts.PROCESSING ?? 0
  const s = counts.SHIPPED    ?? 0
  const r = counts.DELIVERED  ?? 0
  const alerts = {}

  if      (p > 8) alerts.PENDING    = { text: 'High Backlog',     type: 'danger'  }
  else if (p > 3) alerts.PENDING    = { text: 'Queue Growing',    type: 'warning' }
  else if (p > 0) alerts.PENDING    = { text: 'Orders Waiting',   type: 'info'    }

  if      (a > 5) alerts.PROCESSING = { text: 'Processing Delay', type: 'warning' }
  else if (a > 0) alerts.PROCESSING = { text: 'In Progress',      type: 'info'    }

  if (s > 0)      alerts.SHIPPED    = { text: 'Shipments Active', type: 'info'    }
  if (r > 0)      alerts.DELIVERED  = { text: `${r} Completed`,   type: 'success' }

  return alerts
}

function deriveActiveKey(steps, counts) {
  const priority = ['SHIPPED', 'PROCESSING', 'PENDING', 'DELIVERED']
  for (const key of priority) {
    if ((counts[key] ?? 0) > 0) return key
  }
  return null
}

// ─── Bulk Confirm Dialog ──────────────────────────────────────────────────────

function BulkConfirmDialog({ fromStep, toStep, count, loading, onConfirm, onClose }) {
  if (!fromStep || !toStep) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        onClick={!loading ? onClose : undefined}
        style={{ position: 'absolute', inset: 0, background: 'rgba(5,14,26,0.78)', backdropFilter: 'blur(4px)' }}
      />
      <div style={{
        position:     'relative',
        width:         440,
        borderRadius:  16,
        background:   'var(--bg-surface)',
        border:       '1px solid var(--border-section)',
        boxShadow:    'var(--shadow-surface)',
        padding:      '28px 28px 24px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 11,
            background: toStep.bg, border: `1px solid ${toStep.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className={`bi ${toStep.icon}`} style={{ color: toStep.color, fontSize: 18 }} />
          </div>
          <div>
            <h6 style={{ color: 'var(--text-heading)', fontWeight: 700, margin: 0 }}>Move All Orders</h6>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>
              This will update {count} order{count !== 1 ? 's' : ''} at once
            </p>
          </div>
        </div>

        {/* Body */}
        <div style={{
          padding:      '14px 16px',
          borderRadius:  10,
          background:   'var(--bg-surface-alt)',
          border:       '1px solid var(--border-subtle)',
          marginBottom:  20,
          fontSize:      13,
          color:        'var(--text-body)',
          lineHeight:    1.6,
        }}>
          Move all{' '}
          <strong style={{ color: fromStep.color }}>{count} {fromStep.label}</strong>{' '}
          order{count !== 1 ? 's' : ''} to{' '}
          <strong style={{ color: toStep.color }}>{toStep.label}</strong>?
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding:      '9px 22px',
              borderRadius:  10,
              border:       '1px solid var(--border-medium)',
              background:   'transparent',
              color:        'var(--text-body)',
              cursor:        loading ? 'not-allowed' : 'pointer',
              fontSize:      13,
              opacity:       loading ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding:      '9px 24px',
              borderRadius:  10,
              border:       'none',
              background:    loading ? 'var(--bg-input)' : toStep.bg,
              color:         loading ? 'var(--text-muted)' : toStep.color,
              cursor:        loading ? 'not-allowed' : 'pointer',
              fontWeight:    700,
              fontSize:      13,
              display:      'flex',
              alignItems:   'center',
              gap:           7,
              border:       `1px solid ${loading ? 'var(--border-subtle)' : toStep.border}`,
              transition:   'all 0.2s',
            }}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  style={{ width: 12, height: 12, borderColor: toStep.color, borderRightColor: 'transparent' }}
                />
                Moving…
              </>
            ) : (
              <>
                <i className={`bi ${toStep.icon}`} style={{ fontSize: 12 }} />
                Move All to {toStep.label}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Step Column ─────────────────────────────────────────────────────────────

function StepColumn({ step, count, isActive, loading, alert, selected, onClick, onBulkClick, bulkingKey, userRole }) {
  const [hovered, setHovered] = useState(false)

  const isEmpty      = count === 0
  const isClickable  = !isEmpty && !loading
  const nextStatusKey = NEXT_STATUS[step.key]
  const nextStep      = nextStatusKey ? DEFAULT_STEPS.find((s) => s.key === nextStatusKey) : null
  const allowed       = canAdvance(step.key, userRole)
  const bulkDisabled  = isEmpty || loading || bulkingKey === step.key || !allowed

  return (
    <div
      style={{
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        width:          132,
        flexShrink:     0,
        cursor:         isClickable ? 'pointer' : 'default',
        opacity:        isEmpty ? 0.4 : 1,
        transition:     'opacity 0.3s',
      }}
      onClick={isClickable ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Circle icon */}
      <div style={{
        position:       'relative',
        width:           62,
        height:          62,
        borderRadius:   '50%',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        background:      isEmpty ? 'var(--bg-input)' : step.bg,
        border:         `2px solid ${selected ? step.color : isEmpty ? 'var(--border-subtle)' : step.border}`,
        boxShadow:       (selected || isActive) && !isEmpty
          ? `0 0 0 5px ${step.glow}, 0 0 28px ${step.glow}`
          : 'none',
        transform:       hovered && !isEmpty ? 'scale(1.1)' : 'scale(1)',
        transition:      'transform 0.25s ease, box-shadow 0.3s ease, border-color 0.25s',
      }}>
        {(selected || isActive) && !isEmpty && (
          <div style={{
            position:      'absolute',
            inset:         -9,
            borderRadius:  '50%',
            border:        `2px solid ${step.color}`,
            animation:     'ost-ring 2s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
        )}
        <i
          className={`bi ${step.icon}`}
          style={{ fontSize: 24, color: isEmpty ? 'var(--text-muted)' : step.color, transition: 'color 0.25s' }}
        />
      </div>

      {/* Count */}
      <div style={{
        marginTop:  14,
        fontSize:  '1.85rem',
        fontWeight:  800,
        color:       isEmpty ? 'var(--text-muted)' : step.color,
        lineHeight:  1,
        minHeight:   34,
        display:    'flex',
        alignItems: 'center',
      }}>
        {loading
          ? <span className="spinner-border spinner-border-sm"
              style={{ width: 18, height: 18, borderColor: step.color, borderRightColor: 'transparent' }} />
          : count}
      </div>

      {/* Label */}
      <div style={{
        marginTop:     5,
        fontSize:      13,
        fontWeight:    700,
        color:         isEmpty ? 'var(--text-muted)' : 'var(--text-heading)',
        textAlign:    'center',
        letterSpacing: 0.2,
      }}>
        {step.label}
      </div>

      {/* Description */}
      <div style={{
        marginTop:  3,
        fontSize:   11,
        color:      'var(--text-muted)',
        textAlign:  'center',
        minHeight:   30,
        lineHeight:  1.4,
      }}>
        {step.description}
      </div>

      {/* Alert badge */}
      <div style={{ marginTop: 10, width: '100%', minHeight: 30 }}>
        {alert && !isEmpty && (() => {
          const s = ALERT_STYLES[alert.type] ?? ALERT_STYLES.info
          return (
            <div style={{
              padding:        '5px 8px',
              borderRadius:    8,
              background:      s.bg,
              border:         `1px solid ${s.border}`,
              color:           s.color,
              fontSize:        10,
              fontWeight:      700,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:             5,
              textAlign:      'center',
            }}>
              <i className={`bi ${s.icon}`} style={{ fontSize: 10, flexShrink: 0 }} />
              <span>{alert.text}</span>
            </div>
          )
        })()}
      </div>

      {/* Click hint */}
      {isClickable && (
        <div style={{
          marginTop:     4,
          fontSize:      10,
          fontWeight:    600,
          letterSpacing: 0.3,
          color:         selected ? step.color : 'var(--text-muted)',
          transition:    'color 0.2s',
        }}>
          {selected ? 'Hide ▲' : 'Manage ▼'}
        </div>
      )}

      {/* Move All button — only for stages that have a next step */}
      {nextStep && (
        <button
          onClick={(e) => { e.stopPropagation(); onBulkClick(step.key) }}
          disabled={bulkDisabled}
          title={
            !allowed     ? `Insufficient role for this transition` :
            isEmpty      ? 'No orders at this stage' :
            `Move all ${count} orders to ${nextStep.label}`
          }
          style={{
            marginTop:      10,
            width:          '100%',
            padding:        '6px 0',
            borderRadius:    8,
            border:         `1px solid ${bulkDisabled ? 'var(--border-subtle)' : nextStep.border}`,
            background:      bulkDisabled ? 'var(--bg-input)' : nextStep.bg,
            color:           bulkDisabled ? 'var(--text-muted)' : nextStep.color,
            cursor:          bulkDisabled ? 'not-allowed' : 'pointer',
            fontSize:        10,
            fontWeight:      700,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:             4,
            opacity:         bulkDisabled ? 0.45 : 1,
            transition:     'all 0.2s',
            whiteSpace:     'nowrap',
          }}
        >
          {bulkingKey === step.key ? (
            <span
              className="spinner-border spinner-border-sm"
              style={{ width: 10, height: 10, borderColor: nextStep.color, borderRightColor: 'transparent' }}
            />
          ) : (
            <i className="bi bi-collection-fill" style={{ fontSize: 9 }} />
          )}
          {bulkingKey === step.key ? 'Moving…' : `Move All → ${nextStep.label}`}
        </button>
      )}
    </div>
  )
}

// ─── Step Connector ───────────────────────────────────────────────────────────

function StepConnector({ fromStep, toStep, counts }) {
  const fromCount = counts[fromStep.key] ?? 0
  const toCount   = counts[toStep.key]   ?? 0
  const hasFlow   = fromCount > 0 || toCount > 0

  return (
    <div style={{
      flex:        1,
      minWidth:    24,
      display:    'flex',
      alignItems: 'center',
      paddingTop:  30,
      alignSelf:  'flex-start',
      paddingLeft:  4,
      paddingRight: 2,
    }}>
      <div style={{
        flex:         1,
        height:       2,
        background:   hasFlow
          ? `linear-gradient(90deg, ${fromStep.color}, ${toStep.color})`
          : 'var(--border-subtle)',
        borderRadius: 2,
        transition:   'background 0.4s ease',
      }} />
      <div style={{
        width:        0,
        height:       0,
        borderTop:   '5px solid transparent',
        borderBottom:'5px solid transparent',
        borderLeft:  `8px solid ${hasFlow ? toStep.color : 'rgba(136,146,176,0.25)'}`,
        marginLeft:   1,
        flexShrink:   0,
        transition:  'border-color 0.4s ease',
      }} />
    </div>
  )
}

// ─── Per-order list panel ─────────────────────────────────────────────────────

function OrderList({ step, orders, updatingId, onAdvance, onClose, userRole }) {
  const nextStatusKey = NEXT_STATUS[step.key]
  const nextStep      = DEFAULT_STEPS.find((s) => s.key === nextStatusKey) ?? null
  const allowed       = canAdvance(step.key, userRole)

  return (
    <div style={{
      marginTop:    20,
      padding:     '16px 20px',
      borderRadius: 12,
      background:  'rgba(0,0,0,0.18)',
      border:      `1px solid ${step.border}`,
      animation:   'ost-slide-in 0.2s ease',
    }}>
      {/* Panel header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className={`bi ${step.icon}`} style={{ color: step.color, fontSize: 14 }} />
          <span style={{ color: 'var(--text-heading)', fontWeight: 700, fontSize: 13 }}>
            {step.label} Orders
          </span>
          <span style={{
            padding:      '1px 8px',
            borderRadius:  20,
            fontSize:      10,
            fontWeight:    700,
            background:    step.bg,
            color:         step.color,
            border:       `1px solid ${step.border}`,
          }}>
            {orders.length}
          </span>
        </div>
        <button
          onClick={onClose}
          title="Close"
          style={{
            width:          26,
            height:         26,
            borderRadius:   7,
            border:        '1px solid var(--border-subtle)',
            background:    'transparent',
            color:         'var(--text-muted)',
            cursor:        'pointer',
            fontSize:       12,
            display:       'flex',
            alignItems:    'center',
            justifyContent:'center',
          }}
        >
          <i className="bi bi-x-lg" />
        </button>
      </div>

      {orders.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', margin: '16px 0 8px' }}>
          No orders at this stage.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        '10px 14px',
                borderRadius:    10,
                background:     'var(--bg-surface)',
                border:         '1px solid var(--border-subtle)',
                gap:             12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                <span style={{ color: '#00c6ff', fontWeight: 700, fontSize: 12, fontFamily: 'monospace', flexShrink: 0 }}>
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
                <span style={{ color: 'var(--text-body)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {order.supplierName}
                </span>
              </div>

              <span style={{ color: '#00ff78', fontWeight: 600, fontSize: 12, flexShrink: 0 }}>
                {fmt(order.totalAmount)}
              </span>

              {nextStep ? (
                allowed ? (
                  <button
                    onClick={() => onAdvance(order.id, nextStatusKey)}
                    disabled={updatingId === order.id}
                    title={`Advance to ${nextStep.label}`}
                    style={{
                      height:      30,
                      padding:    '0 12px',
                      borderRadius: 8,
                      border:     `1px solid ${nextStep.border}`,
                      background:   nextStep.bg,
                      color:        nextStep.color,
                      cursor:       updatingId === order.id ? 'not-allowed' : 'pointer',
                      fontSize:     11,
                      fontWeight:   700,
                      display:     'flex',
                      alignItems:  'center',
                      gap:          5,
                      flexShrink:   0,
                      opacity:      updatingId === order.id ? 0.6 : 1,
                      transition:  'opacity 0.2s',
                      whiteSpace:  'nowrap',
                    }}
                  >
                    {updatingId === order.id ? (
                      <>
                        <span className="spinner-border spinner-border-sm"
                          style={{ width: 10, height: 10, borderColor: nextStep.color, borderRightColor: 'transparent' }} />
                        Updating…
                      </>
                    ) : (
                      <>→ {nextStep.label}</>
                    )}
                  </button>
                ) : (
                  <span style={{
                    padding:      '3px 10px',
                    borderRadius:  20,
                    fontSize:      10,
                    fontWeight:    700,
                    background:   'var(--bg-input)',
                    color:        'var(--text-muted)',
                    border:       '1px solid var(--border-subtle)',
                    flexShrink:    0,
                    display:      'flex',
                    alignItems:   'center',
                    gap:           4,
                  }}>
                    <i className="bi bi-lock-fill" style={{ fontSize: 9 }} /> Not allowed
                  </span>
                )
              ) : (
                <span style={{
                  padding:      '3px 10px',
                  borderRadius:  20,
                  fontSize:      10,
                  fontWeight:    700,
                  background:    step.bg,
                  color:         step.color,
                  border:       `1px solid ${step.border}`,
                  flexShrink:    0,
                }}>
                  Final Stage
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OrderStatusTracker({ steps = DEFAULT_STEPS }) {
  const { authFetch, user } = useAuth()
  const userRole = (user?.role ?? '').replace(/^ROLE_/, '').toUpperCase()

  const [orders,      setOrders]      = useState([])
  const [counts,      setCounts]      = useState({})
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [selectedKey, setSelectedKey] = useState(null)
  const [updatingId,  setUpdatingId]  = useState(null)
  const [bulkingKey,  setBulkingKey]  = useState(null)
  const [confirmBulk, setConfirmBulk] = useState({ fromKey: null })
  const [toast,       setToast]       = useState({ msg: '', type: 'success' })

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'success' }), 4000)
  }, [])

  const load = useCallback(async () => {
    const { data, error: err } = await getOrders(authFetch)
    setLoading(false)
    if (err) { setError(err); return }
    setOrders(data)
    const grouped = {}
    for (const order of data) {
      grouped[order.status] = (grouped[order.status] ?? 0) + 1
    }
    setCounts(grouped)
  }, [authFetch])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!loading && selectedKey && (counts[selectedKey] ?? 0) === 0) {
      setSelectedKey(null)
    }
  }, [counts, selectedKey, loading])

  const handleStepClick = (key) => {
    setSelectedKey((prev) => (prev === key ? null : key))
  }

  // ── Single-order advance ──────────────────────────────────────────────────
  const handleAdvance = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    const { data, error: err } = await updateOrderStatus(authFetch, orderId, newStatus)
    setUpdatingId(null)

    if (err) { showToast(err, 'error'); return }

    const updatedOrders = orders.map((o) => (o.id === data.id ? data : o))
    setOrders(updatedOrders)
    const grouped = {}
    for (const o of updatedOrders) grouped[o.status] = (grouped[o.status] ?? 0) + 1
    setCounts(grouped)

    const targetStep = steps.find((s) => s.key === newStatus)
    showToast(`Order #${data.id.slice(0, 8).toUpperCase()} advanced to ${targetStep?.label ?? newStatus}.`)
  }

  // ── Bulk advance ──────────────────────────────────────────────────────────
  const handleBulkClick = (fromKey) => {
    setConfirmBulk({ fromKey })
  }

  const handleBulkConfirm = async () => {
    const { fromKey } = confirmBulk
    if (!fromKey) return
    const toKey = NEXT_STATUS[fromKey]
    setBulkingKey(fromKey)
    setConfirmBulk({ fromKey: null })

    const { data, error: err } = await bulkUpdateOrderStatus(authFetch, fromKey, toKey)
    setBulkingKey(null)

    if (err) { showToast(err, 'error'); return }

    const toStep = steps.find((s) => s.key === toKey)
    showToast(`${data.updatedCount} order(s) moved to ${toStep?.label ?? toKey}.`)
    await load()
  }

  // ── Derived state ─────────────────────────────────────────────────────────
  const alerts           = deriveAlerts(counts)
  const activeKey        = deriveActiveKey(steps, counts)
  const total            = Object.values(counts).reduce((s, n) => s + n, 0)
  const cancelled        = counts.CANCELLED ?? 0
  const selectedStep     = steps.find((s) => s.key === selectedKey) ?? null
  const ordersAtSelected = selectedKey ? orders.filter((o) => o.status === selectedKey) : []

  const confirmFromStep  = confirmBulk.fromKey ? steps.find((s) => s.key === confirmBulk.fromKey) : null
  const confirmToKey     = confirmBulk.fromKey ? NEXT_STATUS[confirmBulk.fromKey] : null
  const confirmToStep    = confirmToKey ? steps.find((s) => s.key === confirmToKey) : null
  const confirmCount     = confirmBulk.fromKey ? (counts[confirmBulk.fromKey] ?? 0) : 0

  return (
    <div
      className="rounded-4 p-4"
      style={{
        background:     'var(--bg-surface)',
        border:         '1px solid var(--border-subtle)',
        backdropFilter: 'blur(12px)',
        boxShadow:      'var(--shadow-surface)',
      }}
    >
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h6 style={{ color: 'var(--text-heading)', fontWeight: 700, margin: 0 }}>Order Pipeline</h6>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>
            {loading ? 'Loading…' : `${total} total orders across all stages`}
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {!loading && cancelled > 0 && (
            <span
              className="badge rounded-pill px-2 py-1"
              style={{ background: 'rgba(255,60,60,0.12)', color: '#ff6b6b', border: '1px solid rgba(255,80,80,0.3)', fontSize: 10 }}
            >
              <i className="bi bi-x-circle me-1" />{cancelled} Cancelled
            </span>
          )}
          <span
            className="badge rounded-pill px-3 py-2"
            style={{ background: 'rgba(0,255,120,0.12)', color: '#00ff78', border: '1px solid rgba(0,255,120,0.3)', fontSize: 11 }}
          >
            <i className="bi bi-lightning-charge-fill me-1" />Live
          </span>
        </div>
      </div>

      {/* Toast */}
      {toast.msg && (
        <div style={{
          marginBottom: 16,
          padding:      '9px 14px',
          borderRadius:  10,
          fontSize:      12,
          display:      'flex',
          alignItems:   'center',
          gap:           8,
          background:   toast.type === 'error' ? 'rgba(255,60,60,0.12)' : 'rgba(0,220,100,0.1)',
          border:       `1px solid ${toast.type === 'error' ? 'rgba(255,80,80,0.3)' : 'rgba(0,220,100,0.25)'}`,
          color:         toast.type === 'error' ? '#ff6b6b' : '#00e06a',
        }}>
          <i className={`bi ${toast.type === 'error' ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'}`} />
          {toast.msg}
        </div>
      )}

      {error ? (
        <div style={{ padding: '24px 0', textAlign: 'center', color: '#ff6b6b', fontSize: 13 }}>
          {error}
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 580 }}>
              {steps.map((step, idx) => (
                <Fragment key={step.key}>
                  <StepColumn
                    step={step}
                    count={counts[step.key] ?? 0}
                    isActive={activeKey === step.key}
                    loading={loading}
                    alert={alerts[step.key] ?? null}
                    selected={selectedKey === step.key}
                    onClick={() => handleStepClick(step.key)}
                    onBulkClick={handleBulkClick}
                    bulkingKey={bulkingKey}
                    userRole={userRole}
                  />
                  {idx < steps.length - 1 && (
                    <StepConnector fromStep={step} toStep={steps[idx + 1]} counts={counts} />
                  )}
                </Fragment>
              ))}
            </div>
          </div>

          {selectedStep && (
            <OrderList
              step={selectedStep}
              orders={ordersAtSelected}
              updatingId={updatingId}
              onAdvance={handleAdvance}
              onClose={() => setSelectedKey(null)}
              userRole={userRole}
            />
          )}
        </>
      )}

      {/* Bulk confirmation modal */}
      <BulkConfirmDialog
        fromStep={confirmFromStep}
        toStep={confirmToStep}
        count={confirmCount}
        loading={bulkingKey !== null}
        onConfirm={handleBulkConfirm}
        onClose={() => setConfirmBulk({ fromKey: null })}
      />

      <style>{`
        @keyframes ost-ring {
          0%   { transform: scale(1);    opacity: 0.65; }
          50%  { transform: scale(1.22); opacity: 0.15; }
          100% { transform: scale(1);    opacity: 0.65; }
        }
        @keyframes ost-slide-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  )
}
