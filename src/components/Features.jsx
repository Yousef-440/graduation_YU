import FeatureCard from './FeatureCard'
import { useThemeMode } from '../context/ThemeContext'

const features = [
  {
    icon: 'bi-geo-alt-fill',
    title: 'Shipment Tracking',
    description:
      'Track all shipments in real-time on an interactive map. Get instant visibility into every delivery across your network.',
    color: '#00c6ff',
    bgImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=60',
  },
  {
    icon: 'bi-bar-chart-line-fill',
    title: 'KPI Monitoring',
    description:
      'Automatically calculate key metrics like delivery rate and inventory turnover. Stay ahead with live performance data.',
    color: '#00c850',
    bgImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=60',
  },
  {
    icon: 'bi-bell-fill',
    title: 'Smart Alerts',
    description:
      'Get notified when stock is low or deliveries are delayed. Never miss a critical supply chain event again.',
    color: '#ff9900',
    bgImage: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=60',
  },
  {
    icon: 'bi-graph-up-arrow',
    title: 'Performance Insights',
    description:
      'Analyze supplier performance and optimize operations with AI-powered recommendations and trend forecasting.',
    color: '#a855f7',
    bgImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=60',
  },
]

export default function Features() {
  const { mode } = useThemeMode()
  const isDark = mode === 'dark'

  const sectionBg = isDark
    ? 'linear-gradient(180deg, #020818 0%, #040d1e 50%, #020818 100%)'
    : 'linear-gradient(180deg, #f0f4f8 0%, #e8eef8 50%, #f0f4f8 100%)'

  return (
    <section
      id="features"
      style={{
        background: sectionBg,
        padding: '90px 0',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.25s ease',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          background: isDark
            ? 'radial-gradient(circle, rgba(0,100,255,0.06) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(0,100,255,0.04) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <div className="container position-relative">
        <div className="text-center mb-5">
          <span
            className="badge rounded-pill mb-3 px-3 py-2"
            style={{
              background: 'rgba(0,198,255,0.12)',
              color: '#00a8e0',
              border: '1px solid rgba(0,198,255,0.3)',
              fontSize: 13,
            }}
          >
            <i className="bi bi-stars me-1" />
            Platform Capabilities
          </span>
          <h2
            className="fw-bold mb-3"
            style={{ color: 'var(--landing-text-primary)', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', transition: 'color 0.25s ease' }}
          >
            Powerful Features for Smarter Logistics
          </h2>
          <p
            className="mx-auto"
            style={{
              color: 'var(--landing-text-secondary)',
              maxWidth: 560,
              fontSize: '1rem',
              lineHeight: 1.7,
              transition: 'color 0.25s ease',
            }}
          >
            Monitor key metrics, track shipments, and gain insights into your
            supply chain performance — all from one intuitive dashboard.
          </p>
        </div>

        <div className="row g-4">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  )
}
