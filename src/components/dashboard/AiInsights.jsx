import { useState, useEffect } from 'react'
import { useAuth }         from '../../context/AuthContext'
import { getAiInsights }   from '../../api/insightApi'

const TYPE_CONFIG = {
  WARNING:        { color: '#ff6b6b', bg: 'rgba(255,80,80,0.08)',   border: 'rgba(255,80,80,0.20)',   icon: 'bi-exclamation-triangle-fill', label: 'Warning'        },
  SUCCESS:        { color: '#00e06a', bg: 'rgba(0,220,106,0.08)',   border: 'rgba(0,220,106,0.20)',   icon: 'bi-check-circle-fill',         label: 'Success'        },
  INFO:           { color: '#00c6ff', bg: 'rgba(0,198,255,0.08)',   border: 'rgba(0,198,255,0.20)',   icon: 'bi-info-circle-fill',          label: 'Info'           },
  RECOMMENDATION: { color: '#ffb400', bg: 'rgba(255,180,0,0.08)',   border: 'rgba(255,180,0,0.20)',   icon: 'bi-lightbulb-fill',            label: 'Recommendation' },
}

function typeConfig(type) {
  return TYPE_CONFIG[type] ?? {
    color: 'var(--text-muted)', bg: 'var(--bg-input)',
    border: 'var(--border-subtle)', icon: 'bi-dot', label: type,
  }
}

function fmtTime(iso) {
  if (!iso) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

function InsightCard({ item }) {
  const cfg = typeConfig(item.type)
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '14px 16px', borderRadius: 12,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      transition: 'transform 0.15s',
    }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(3px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: `${cfg.color}18`, border: `1px solid ${cfg.color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <i className={`bi ${cfg.icon}`} style={{ color: cfg.color, fontSize: 15 }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            padding: '1px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: 0.5,
            background: `${cfg.color}18`, color: cfg.color,
          }}>
            {cfg.label}
          </span>
        </div>
        <p style={{ color: 'var(--text-body)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
          {item.insight}
        </p>
      </div>

      <span style={{ color: 'var(--text-muted)', fontSize: 10, whiteSpace: 'nowrap', flexShrink: 0, marginTop: 2 }}>
        {fmtTime(item.createdAt)}
      </span>
    </div>
  )
}

export default function AiInsights({ refreshKey }) {
  const { accessToken }       = useAuth()
  const [insights, setInsights] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    getAiInsights(accessToken).then(({ data, error: err }) => {
      if (cancelled) return
      setLoading(false)
      if (err) setError(err)
      else setInsights(data)
    })
    return () => { cancelled = true }
  }, [accessToken, refreshKey])

  return (
    <div style={{
      padding: '20px 24px', borderRadius: 16,
      background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-surface)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: 'rgba(0,198,255,0.12)', border: '1px solid rgba(0,198,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className="bi bi-stars" style={{ color: '#00c6ff', fontSize: 16 }} />
        </div>
        <div>
          <h6 style={{ color: 'var(--text-heading)', fontWeight: 700, margin: 0, fontSize: 14 }}>
            AI Insights &amp; Suggestions
          </h6>
          <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: 0 }}>
            Generated hourly by AI based on your supply chain data
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          <span className="spinner-border spinner-border-sm me-2"
            style={{ borderColor: '#00c6ff', borderRightColor: 'transparent' }} />
          Analyzing your data…
        </div>
      ) : error ? (
        <div style={{ padding: '16px', borderRadius: 10, background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', color: '#ff8080', fontSize: 13 }}>
          <i className="bi bi-exclamation-triangle me-2" />{error}
        </div>
      ) : insights.length === 0 ? (
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          <i className="bi bi-stars" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />
          No insights yet. They will appear after the first AI analysis.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {insights.map((item) => (
            <InsightCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
