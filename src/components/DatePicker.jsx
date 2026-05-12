import { useState, useRef, useEffect } from 'react'

const DAYS   = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function toYMD(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseYMD(str) {
  if (!str) return null
  const [y, mo, d] = str.split('-').map(Number)
  return new Date(y, mo - 1, d)
}

const NAV_BTN = {
  width: 28, height: 28, borderRadius: 7,
  border: '1px solid var(--border-medium)',
  background: 'var(--bg-input)',
  color: 'var(--text-body)',
  cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
}

export default function DatePicker({
  value,
  onChange,
  placeholder = 'Select delivery date',
  disablePast = false,
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const parsed = value ? parseYMD(value) : null
  const [viewYear,  setViewYear]  = useState((parsed ?? today).getFullYear())
  const [viewMonth, setViewMonth] = useState((parsed ?? today).getMonth())
  const [open, setOpen] = useState(false)

  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  const pickDay = (day) => {
    if (!day) return
    const d = new Date(viewYear, viewMonth, day)
    if (disablePast && d < today) return
    onChange(toYMD(d))
    setOpen(false)
  }

  const pickToday = () => {
    onChange(toYMD(today))
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setOpen(false)
  }

  const firstDow   = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const isSelected = (day) => {
    if (!day || !parsed) return false
    return parsed.getFullYear() === viewYear && parsed.getMonth() === viewMonth && parsed.getDate() === day
  }

  const isToday = (day) => {
    if (!day) return false
    return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day
  }

  const isPast = (day) => {
    if (!day || !disablePast) return false
    return new Date(viewYear, viewMonth, day) < today
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <style>{`
        @keyframes dpSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* trigger */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: 10,
          background: 'var(--bg-input)',
          border: open ? '1px solid rgba(0,198,255,0.55)' : '1px solid var(--border-medium)',
          color: value ? 'var(--text-input)' : 'var(--text-muted)',
          cursor: 'pointer', fontSize: 13, userSelect: 'none',
          transition: 'border-color 0.2s',
          boxShadow: open ? '0 0 0 3px rgba(0,198,255,0.08)' : 'none',
        }}
      >
        <i className="bi bi-calendar3" style={{ color: '#00c6ff', fontSize: 14, flexShrink: 0 }} />
        <span style={{ flex: 1 }}>{value || placeholder}</span>
        {value && (
          <i
            className="bi bi-x-lg"
            title="Clear"
            onClick={(e) => { e.stopPropagation(); onChange('') }}
            style={{ color: 'var(--text-muted)', fontSize: 10, padding: 2, cursor: 'pointer' }}
          />
        )}
        <i className={`bi bi-chevron-${open ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)', fontSize: 10 }} />
      </div>

      {/* popup */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 9999,
          width: 276, borderRadius: 14,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-section)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.55), 0 4px 12px rgba(0,0,0,0.3)',
          padding: '14px 14px 12px',
          animation: 'dpSlideDown 0.15s ease',
        }}>

          {/* month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <button onClick={prevMonth} style={NAV_BTN}>
              <i className="bi bi-chevron-left" style={{ fontSize: 10 }} />
            </button>
            <span style={{ color: 'var(--text-heading)', fontWeight: 700, fontSize: 13 }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} style={NAV_BTN}>
              <i className="bi bi-chevron-right" style={{ fontSize: 10 }} />
            </button>
          </div>

          {/* weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
            {DAYS.map((d) => (
              <div key={d} style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 10, fontWeight: 600, padding: '3px 0' }}>
                {d}
              </div>
            ))}
          </div>

          {/* day grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {cells.map((day, i) => {
              const sel      = isSelected(day)
              const tod      = isToday(day)
              const disabled = isPast(day)
              return (
                <div
                  key={i}
                  onClick={() => day && !disabled && pickDay(day)}
                  style={{
                    textAlign: 'center',
                    padding: '7px 0',
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: sel ? 700 : 400,
                    cursor: !day || disabled ? 'default' : 'pointer',
                    color: !day
                      ? 'transparent'
                      : disabled
                        ? 'var(--text-muted-dim)'
                        : sel
                          ? '#050e1a'
                          : tod
                            ? '#00c6ff'
                            : 'var(--text-body)',
                    background: sel
                      ? 'linear-gradient(135deg,#00ff78,#00c6ff)'
                      : 'transparent',
                    border: tod && !sel
                      ? '1px solid rgba(0,198,255,0.45)'
                      : '1px solid transparent',
                    opacity: disabled ? 0.35 : 1,
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={(e) => {
                    if (day && !disabled && !sel)
                      e.currentTarget.style.background = 'rgba(0,198,255,0.12)'
                  }}
                  onMouseLeave={(e) => {
                    if (!sel) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {day ?? ''}
                </div>
              )
            })}
          </div>

          {/* footer */}
          <div style={{
            marginTop: 12, paddingTop: 10,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <button onClick={pickToday} style={{
              padding: '5px 14px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              border: '1px solid rgba(0,255,120,0.3)', background: 'rgba(0,255,120,0.08)', color: '#00ff78',
            }}>
              Today
            </button>
            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>
              {value || 'No date selected'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
