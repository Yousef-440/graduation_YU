import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useThemeMode } from '../../context/ThemeContext'

const data = [
  { month: 'Nov', onTime: 78, accuracy: 94, cycleTime: 5.8 },
  { month: 'Dec', onTime: 83, accuracy: 95, cycleTime: 5.2 },
  { month: 'Jan', onTime: 80, accuracy: 93, cycleTime: 5.5 },
  { month: 'Feb', onTime: 87, accuracy: 96, cycleTime: 4.9 },
  { month: 'Mar', onTime: 89, accuracy: 97, cycleTime: 4.5 },
  { month: 'Apr', onTime: 92, accuracy: 97, cycleTime: 4.2 },
]

function CustomTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background:   isDark ? 'rgba(7,14,28,0.95)' : 'rgba(255,255,255,0.97)',
      border:       isDark ? '1px solid rgba(0,255,120,0.2)' : '1px solid rgba(0,0,0,0.1)',
      borderRadius: 10,
      padding:      '10px 14px',
      fontSize:     12,
      boxShadow:    isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      <p style={{ color: isDark ? '#e6f1ff' : '#0f172a', fontWeight: 700, margin: '0 0 6px' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, margin: '2px 0' }}>
          {p.name}: <strong>{p.value}{p.name === 'Cycle Time (d)' ? '' : '%'}</strong>
        </p>
      ))}
    </div>
  )
}

export default function PerformanceChart() {
  const { mode } = useThemeMode()
  const isDark   = mode === 'dark'

  const tickColor    = isDark ? '#8892b0' : '#64748b'
  const gridColor    = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)'
  const axisLine     = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const legendColor  = isDark ? '#8892b0' : '#64748b'

  return (
    <div className="rounded-4 p-4"
      style={{
        background:    'var(--bg-surface)',
        border:        '1px solid var(--border-subtle)',
        backdropFilter: 'blur(12px)',
        boxShadow:     'var(--shadow-surface)',
      }}
    >
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h6 style={{ color: 'var(--text-heading)', fontWeight: 700, margin: 0 }}>Supplier Performance</h6>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>Last 6 months trend</p>
        </div>
        <span className="badge rounded-pill px-3 py-2"
          style={{ background: 'rgba(0,198,255,0.12)', color: '#00c6ff', border: '1px solid rgba(0,198,255,0.3)', fontSize: 11 }}
        >
          <i className="bi bi-graph-up me-1" />Monthly
        </span>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="month"
            tick={{ fill: tickColor, fontSize: 11 }}
            axisLine={{ stroke: axisLine }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: tickColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip isDark={isDark} />} />
          <Legend wrapperStyle={{ fontSize: 12, color: legendColor, paddingTop: 12 }} />
          <Line type="monotone" dataKey="onTime"    name="On-Time %"     stroke="#00ff78" strokeWidth={2.5} dot={{ fill: '#00ff78', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="accuracy"  name="Accuracy %"    stroke="#00c6ff" strokeWidth={2.5} dot={{ fill: '#00c6ff', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="cycleTime" name="Cycle Time (d)" stroke="#ff9900" strokeWidth={2.5} strokeDasharray="5 3" dot={{ fill: '#ff9900', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
