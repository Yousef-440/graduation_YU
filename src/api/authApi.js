const BASE = '/api/auth'

export async function login(email, password) {
  try {
    const res = await fetch(`${BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const body = await res.json()
    if (res.ok) return { data: body }
    return { error: body.message ?? 'Login failed. Please try again.' }
  } catch {
    return { error: 'Network error. Please check your connection.' }
  }
}

export async function refresh(refreshToken) {
  try {
    const res = await fetch(`${BASE}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    const body = await res.json()
    if (res.ok) return { data: body }
    return { error: body.message ?? 'Session expired.' }
  } catch {
    return { error: 'Network error.' }
  }
}

export async function logout(accessToken) {
  try {
    await fetch(`${BASE}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
  } catch {
    // ignore — tokens are cleared client-side regardless
  }
}
