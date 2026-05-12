import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getOrders } from '../../api/orderApi'
import { getProducts } from '../../api/productApi'

function Card({ title, value, sub, icon, color, trend, trendUp, loading }) {
  return (
    <div className="col-xl-4 col-sm-6">
      <div
        className="h-100 p-3 rounded-4 position-relative overflow-hidden"
        style={{
          background:    'var(--bg-surface)',
          border:        `1px solid ${color}22`,
          boxShadow:     `var(--shadow-surface), 0 4px 24px ${color}12`,
          backdropFilter: 'blur(12px)',
          transition:    'transform 0.2s, box-shadow 0.2s',
          cursor:        'default',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `var(--shadow-surface), 0 10px 32px ${color}28` }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = `var(--shadow-surface), 0 4px 24px ${color}12` }}
      >
        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`, pointerEvents: 'none' }} />

        <div className="d-flex align-items-start justify-content-between mb-3">
          <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, margin: 0 }}>{title}</p>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className={`bi ${icon}`} style={{ color, fontSize: 16 }} />
          </div>
        </div>

        <div style={{ fontSize: '1.9rem', fontWeight: 800, color, lineHeight: 1, marginBottom: 4 }}>
          {loading
            ? <span className="spinner-border spinner-border-sm" style={{ borderColor: color, borderRightColor: 'transparent', width: 20, height: 20 }} />
            : value}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 10 }}>{sub}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: trendUp ? '#00ff78' : '#ff6b6b' }}>
          <i className={`bi ${trendUp ? 'bi-arrow-up-short' : 'bi-arrow-down-short'}`} />
          {trend}
        </div>
      </div>
    </div>
  )
}

export default function SummaryCards() {
  const { authFetch, accessToken }            = useAuth()
  const [orderCount, setOrderCount]           = useState(null)
  const [productCount, setProductCount]       = useState(null)
  const [onTimeRate, setOnTimeRate]           = useState(null)
  const [kpiLoading, setKpiLoading]           = useState(true)
  const [ordersLoading, setOrdersLoading]     = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)

  const load = useCallback(async () => {
    const [oRes, pRes, kpiRes] = await Promise.all([
      getOrders(authFetch),
      getProducts(accessToken),
      authFetch('/api/kpis/overview').then(async (r) => {
        let body = null
        try { body = await r.json() } catch {}
        return r.ok ? { data: body } : { error: true }
      }).catch(() => ({ error: true })),
    ])

    if (!oRes.error) setOrderCount(oRes.data.length)
    setOrdersLoading(false)

    if (!pRes.error) setProductCount(pRes.data.length)
    setProductsLoading(false)

    if (!kpiRes.error && kpiRes.data?.onTimeDeliveryRate != null)
      setOnTimeRate(`${Math.round(kpiRes.data.onTimeDeliveryRate)}%`)
    else
      setOnTimeRate('--')
    setKpiLoading(false)
  }, [authFetch, accessToken])

  useEffect(() => { load() }, [load])

  const cards = [
    { title: 'Purchase Orders',  value: orderCount   ?? '—', sub: 'Total orders placed',  icon: 'bi-receipt',       color: '#00c6ff', trend: 'Live from backend', trendUp: true, loading: ordersLoading   },
    { title: 'On-Time Delivery', value: onTimeRate   ?? '—', sub: 'On-Time Delivery Rate', icon: 'bi-check2-circle', color: '#00ff78', trend: 'Live from backend', trendUp: true, loading: kpiLoading      },
    { title: 'Products',         value: productCount ?? '—', sub: 'Items in catalogue',    icon: 'bi-box-seam',      color: '#ff9900', trend: 'Live from backend', trendUp: true, loading: productsLoading },
  ]

  return (
    <div className="row g-3 mb-4">
      {cards.map((c) => (
        <Card key={c.title} {...c} />
      ))}
    </div>
  )
}
