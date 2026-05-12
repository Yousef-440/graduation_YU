import { useState, useEffect } from 'react'
import TextField        from '@mui/material/TextField'
import MenuItem         from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar         from '@mui/material/Snackbar'
import Alert            from '@mui/material/Alert'

import DashboardNav from '../components/dashboard/DashboardNav'
import { useAuth }  from '../context/AuthContext'
import { addUser }  from '../api/adminApi'
import { getAllUsers } from '../api/userApi'

const ROLES = [
  { value: 'ADMIN',                label: 'Admin' },
  { value: 'PROCUREMENT_OFFICER',  label: 'Procurement Officer' },
  { value: 'STOREKEEPER',          label: 'Storekeeper' },
]

const ROLE_STYLE = {
  ADMIN:                { label: 'Admin',                color: '#00c6ff', bg: 'rgba(0,198,255,0.12)',   border: 'rgba(0,198,255,0.3)'   },
  PROCUREMENT_OFFICER:  { label: 'Procurement Officer',  color: '#00ff78', bg: 'rgba(0,255,120,0.12)',   border: 'rgba(0,255,120,0.3)'   },
  STOREKEEPER:          { label: 'Storekeeper',          color: '#ff9900', bg: 'rgba(255,153,0,0.12)',   border: 'rgba(255,153,0,0.3)'   },
}

const TABLE_COLS = ['Name', 'Email', 'Role', 'Created Date']

const fmtDate = (d) => {
  if (!d) return '—'
  try { return new Date(d).toISOString().slice(0, 10) } catch { return '—' }
}

const EMPTY_FORM = { name: '', email: '', role: '' }
const EMAIL_RE   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(form) {
  const errors = {}
  if (!form.name?.trim())                 errors.name  = 'Name is required'
  else if (form.name.trim().length > 100) errors.name  = 'Max 100 characters'
  if (!form.email?.trim())                errors.email = 'Email is required'
  else if (!EMAIL_RE.test(form.email))    errors.email = 'Invalid email address'
  if (!form.role)                         errors.role  = 'Role is required'
  return errors
}

export default function UsersPage() {
  const { accessToken, user } = useAuth()

  const [form, setForm]         = useState(EMPTY_FORM)
  const [errors, setErrors]     = useState({})
  const [apiError, setApiError] = useState('')
  const [saving, setSaving]     = useState(false)
  const [snack, setSnack]       = useState({ open: false, msg: '', severity: 'success' })

  const [users, setUsers]           = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError]   = useState('')

  const toast = (msg, severity = 'success') => setSnack({ open: true, msg, severity })

  useEffect(() => {
    async function load() {
      setUsersLoading(true)
      setUsersError('')
      const { data, error } = await getAllUsers(accessToken)
      setUsersLoading(false)
      if (error) setUsersError(error)
      else       setUsers(data)
    }
    load()
  }, [accessToken])

  if (user?.role !== 'ADMIN') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
        <DashboardNav />
        <main style={{ marginLeft: 230, flex: 1, padding: '28px 28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <i className="bi bi-shield-lock-fill" style={{ fontSize: 48, color: '#ff6b6b', display: 'block', marginBottom: 16 }} />
            <h5 style={{ color: 'var(--text-heading)', fontWeight: 700, marginBottom: 8 }}>Access Denied</h5>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
              Only administrators can manage users.
            </p>
          </div>
        </main>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    setErrors((p) => ({ ...p, [name]: '' }))
    setApiError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const clientErrors = validate(form)
    if (Object.keys(clientErrors).length) { setErrors(clientErrors); return }

    setSaving(true)
    const { data, error, fieldErrors, status } = await addUser(accessToken, form)
    setSaving(false)

    if (error) {
      if (status === 409) {
        setErrors((p) => ({ ...p, email: error }))
      } else if (fieldErrors && Object.keys(fieldErrors).length) {
        setErrors(fieldErrors)
      } else {
        setApiError(error)
      }
      return
    }

    setForm(EMPTY_FORM)
    setErrors({})
    toast(`User created. Login credentials sent to ${form.email}.`)
    setUsers((prev) => [data, ...prev])
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
      <DashboardNav />

      <main style={{ marginLeft: 230, flex: 1, padding: '28px 28px 40px' }}>

        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 style={{ color: 'var(--text-heading)', fontWeight: 800, margin: 0 }}>Users</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>Manage system users and their roles</p>
          </div>
        </div>

        {/* Create user form */}
        <div
          style={{
            maxWidth: 560,
            padding: '28px 32px',
            borderRadius: 16,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-section)',
            boxShadow: 'var(--shadow-surface)',
            marginBottom: 32,
          }}
        >
          <div className="d-flex align-items-center gap-2 mb-4">
            <div
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg,#00ff78,#00c6ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <i className="bi bi-person-plus-fill" style={{ color: '#050e1a', fontSize: 16 }} />
            </div>
            <h6 style={{ color: 'var(--text-heading)', fontWeight: 700, margin: 0 }}>Add New User</h6>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {apiError && (
              <div style={{ marginBottom: 18, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,80,80,0.25)', color: '#ff8080', fontSize: 13 }}>
                {apiError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <TextField
                label="Full Name *"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                fullWidth
                size="small"
                autoFocus
              />

              <TextField
                label="Email Address *"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                fullWidth
                size="small"
              />

              <TextField
                select
                label="Role *"
                name="role"
                value={form.role}
                onChange={handleChange}
                error={!!errors.role}
                helperText={errors.role}
                fullWidth
                size="small"
              >
                {ROLES.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </TextField>
            </div>

            <div style={{ marginTop: 8 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '16px 0 20px' }}>
                <i className="bi bi-info-circle me-1" />
                A random password will be generated and emailed to the user.
              </p>

              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%', padding: '11px 0', borderRadius: 10, border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(90deg,#00e06a,#00c6ff)',
                  color: '#050e1a', fontWeight: 700, fontSize: 14,
                  opacity: saving ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {saving && <CircularProgress size={14} style={{ color: '#050e1a' }} />}
                {saving ? 'Creating user…' : 'Create User & Send Email'}
              </button>
            </div>
          </form>
        </div>

        {/* Users table */}
        <div style={{ borderRadius: 16, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-surface)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="bi bi-people-fill" style={{ color: '#00c6ff', fontSize: 15 }} />
            <span style={{ color: 'var(--text-heading)', fontWeight: 700, fontSize: 14 }}>All Users</span>
            {!usersLoading && !usersError && (
              <span style={{ marginLeft: 'auto', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(0,198,255,0.1)', color: '#00c6ff', border: '1px solid rgba(0,198,255,0.25)' }}>
                {users.length} {users.length === 1 ? 'user' : 'users'}
              </span>
            )}
          </div>

          {usersLoading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              <span className="spinner-border spinner-border-sm me-2" style={{ borderColor: '#00ff78', borderRightColor: 'transparent' }} />
              Loading users…
            </div>
          ) : usersError || users.length === 0 ? (
            <div style={{ padding: 56, textAlign: 'center' }}>
              <i className="bi bi-people" style={{ fontSize: 40, color: 'var(--text-muted)', display: 'block', marginBottom: 12 }} />
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 13 }}>No users available</p>
            </div>
          ) : (
            <table
              className="table table-borderless mb-0"
              style={{ fontSize: 13, '--bs-table-bg': 'transparent', '--bs-table-color': 'var(--text-body)' }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-thead)' }}>
                  {TABLE_COLS.map((h) => (
                    <th
                      key={h}
                      style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, padding: '14px 20px', background: 'transparent', borderBottom: 'none' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const role = ROLE_STYLE[u.role] ?? { label: u.role, color: '#8892b0', bg: 'rgba(136,146,176,0.12)', border: 'rgba(136,146,176,0.3)' }
                  return (
                    <tr
                      key={u.id}
                      style={{ borderBottom: '1px solid var(--border-row)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-row-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 20px', background: 'transparent', verticalAlign: 'middle', color: 'var(--text-heading)', fontWeight: 600 }}>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#00ff78,#00c6ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#050e1a' }}>
                            {u.name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', background: 'transparent', verticalAlign: 'middle', color: 'var(--text-body)' }}>
                        {u.email}
                      </td>
                      <td style={{ padding: '14px 20px', background: 'transparent', verticalAlign: 'middle' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: role.bg, color: role.color, border: `1px solid ${role.border}` }}>
                          {role.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', background: 'transparent', verticalAlign: 'middle', color: 'var(--text-muted)' }}>
                        {fmtDate(u.createdAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((p) => ({ ...p, open: false }))}
          sx={{
            background: 'rgba(0,220,100,0.12)',
            border: '1px solid rgba(0,220,100,0.3)',
            color: '#00e06a',
            borderRadius: 2,
            '& .MuiAlert-icon': { color: '#00e06a' },
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </div>
  )
}
