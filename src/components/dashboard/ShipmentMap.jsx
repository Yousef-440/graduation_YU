import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useThemeMode } from '../../context/ThemeContext'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const makeIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};
      box-shadow:0 0 10px ${color};
      border:2px solid rgba(255,255,255,0.8);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })

const shipments = [
  { id: 'SH-001', pos: [51.505, -0.09],    label: 'London → Dubai',  status: 'In Transit', color: '#00c6ff' },
  { id: 'SH-002', pos: [25.2048, 55.2708], label: 'Dubai Hub',       status: 'At Port',    color: '#ff9900' },
  { id: 'SH-003', pos: [1.3521, 103.8198], label: 'Singapore Depot', status: 'Delivered',  color: '#00ff78' },
  { id: 'SH-004', pos: [40.7128, -74.006], label: 'New York → LA',   status: 'In Transit', color: '#00c6ff' },
  { id: 'SH-005', pos: [48.8566, 2.3522],  label: 'Paris Warehouse', status: 'Low Stock',  color: '#ff4444' },
]

const routes = [
  [[51.505, -0.09],    [25.2048, 55.2708]],
  [[25.2048, 55.2708], [1.3521, 103.8198]],
  [[40.7128, -74.006], [34.0522, -118.244]],
]

export default function ShipmentMap() {
  const { mode } = useThemeMode()
  const isDark   = mode === 'dark'

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  return (
    <div className="rounded-4 overflow-hidden"
      style={{ border: '1px solid rgba(0,198,255,0.2)', boxShadow: isDark ? '0 4px 30px rgba(0,100,255,0.12)' : '0 4px 20px rgba(0,0,0,0.08)' }}
    >
      <div className="d-flex align-items-center justify-content-between px-4 py-3"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div>
          <h6 style={{ color: 'var(--text-heading)', fontWeight: 700, margin: 0 }}>Live Shipment Tracking</h6>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>Real-time positions across all active routes</p>
        </div>
        <div className="d-flex gap-3">
          {[
            { label: 'In Transit', color: '#00c6ff' },
            { label: 'At Port',    color: '#ff9900' },
            { label: 'Delivered',  color: '#00ff78' },
            { label: 'Alert',      color: '#ff4444' },
          ].map(({ label, color }) => (
            <div key={label} className="d-flex align-items-center gap-1">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <MapContainer center={[20, 20]} zoom={2}
        style={{ height: 380, width: '100%' }}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer url={tileUrl} attribution="&copy; CartoDB" />

        {routes.map((pos, i) => (
          <Polyline key={i} positions={pos}
            pathOptions={{ color: '#00c6ff', weight: 2, opacity: 0.5, dashArray: '6 4' }} />
        ))}

        {shipments.map(({ id, pos, label, status, color }) => (
          <Marker key={id} position={pos} icon={makeIcon(color)}>
            <Popup>
              <div style={{ minWidth: 140 }}>
                <strong style={{ color: '#050e1a' }}>{id}</strong>
                <br />{label}<br />
                <span style={{ color, fontWeight: 600 }}>{status}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
