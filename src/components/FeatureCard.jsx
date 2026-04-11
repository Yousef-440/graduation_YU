import { useThemeMode } from '../context/ThemeContext'

export default function FeatureCard({ icon, title, description, color, bgImage }) {
  const { mode } = useThemeMode()
  const isDark = mode === 'dark'

  return (
    <div className="col-md-6">
      <div
        className="h-100 p-4 rounded-4 position-relative overflow-hidden"
        style={{
          background: 'var(--landing-card-bg)',
          border: `1px solid ${color}22`,
          backdropFilter: 'blur(12px)',
          boxShadow: isDark ? `0 4px 30px ${color}15` : `0 4px 20px rgba(0,0,0,0.08)`,
          transition: 'transform 0.25s, box-shadow 0.25s, background 0.25s ease',
          cursor: 'default',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = `0 12px 40px ${color}30`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = isDark ? `0 4px 30px ${color}15` : `0 4px 20px rgba(0,0,0,0.08)`
        }}
      >
        {bgImage && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '45%',
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: isDark ? 0.18 : 0.12,
              borderRadius: '0 16px 16px 0',
            }}
          />
        )}

        <div
          style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        <div className="d-flex align-items-start gap-3 position-relative">
          <div
            className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3"
            style={{
              width: 52,
              height: 52,
              background: `${color}18`,
              border: `1px solid ${color}40`,
              boxShadow: `0 0 14px ${color}25`,
            }}
          >
            <i className={`bi ${icon}`} style={{ fontSize: 24, color: color }} />
          </div>
          <div>
            <h5 className="fw-bold mb-1" style={{ color: 'var(--landing-text-primary)', transition: 'color 0.25s ease' }}>
              {title}
            </h5>
            <p className="mb-0" style={{ color: 'var(--landing-text-secondary)', fontSize: '0.9rem', lineHeight: 1.65, transition: 'color 0.25s ease' }}>
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
