import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const data = [
  { month: 'Nov', onTime: 78, accuracy: 94, cycleTime: 5.8 },
  { month: 'Dec', onTime: 83, accuracy: 95, cycleTime: 5.2 },
  { month: 'Jan', onTime: 80, accuracy: 93, cycleTime: 5.5 },
  { month: 'Feb', onTime: 87, accuracy: 96, cycleTime: 4.9 },
  { month: 'Mar', onTime: 89, accuracy: 97, cycleTime: 4.5 },
  { month: 'Apr', onTime: 92, accuracy: 97, cycleTime: 4.2 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'rgba(7,14,28,0.95)',
        border: '1px solid rgba(0,255,120,0.2)',
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: 12,
      }}
    >
      <p style={{ color: '#e6f1ff', fontWeight: 700, margin: '0 0 6px' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, margin: '2px 0' }}>
          {p.name}: <strong>{p.value}{p.name === 'Cycle Time (d)' ? '' : '%'}</strong>
        </p>
      ))}
    </div>
  )
}

export default function PerformanceChart() {
  return (
    <div
      className="rounded-4 p-4"
      style={{
        background: 'rgba(10,20,42,0.8)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h6 style={{ color: '#e6f1ff', fontWeight: 700, margin: 0 }}>
            Supplier Performance
          </h6>
          <p style={{ color: '#8892b0', fontSize: 12, margin: 0 }}>Last 6 months trend</p>
        </div>
        <span
          className="badge rounded-pill px-3 py-2"
          style={{
            background: 'rgba(0,198,255,0.12)',
            color: '#00c6ff',
            border: '1px solid rgba(0,198,255,0.3)',
            fontSize: 11,
          }}
        >
          <i className="bi bi-graph-up me-1" />
          Monthly
        </span>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#8892b0', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#8892b0', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#8892b0', paddingTop: 12 }}
          />
          <Line
            type="monotone"
            dataKey="onTime"
            name="On-Time %"
            stroke="#00ff78"
            strokeWidth={2.5}
            dot={{ fill: '#00ff78', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            name="Accuracy %"
            stroke="#00c6ff"
            strokeWidth={2.5}
            dot={{ fill: '#00c6ff', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="cycleTime"
            name="Cycle Time (d)"
            stroke="#ff9900"
            strokeWidth={2.5}
            strokeDasharray="5 3"
            dot={{ fill: '#ff9900', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
