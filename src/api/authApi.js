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
    if (res.status >= 500) {
      return { error: 'Network error.', networkError: true }
    }
    const body = await res.json()
    if (res.ok) return { data: body }
    return { error: body.message ?? 'Session expired.', authError: true }
  } catch {
    return { error: 'Network error.', networkError: true }
  }
}

export async function forgotPassword(email) {
  try {
    const res = await fetch(`${BASE}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (res.ok || res.status === 204) return { data: true }
    const body = await res.json().catch(() => ({}))
    return { error: body.message ?? 'Failed to send OTP. Please try again.' }
  } catch {
    return { error: 'Network error. Please check your connection.' }
  }
}

export async function verifyOtp(email, otp) {
  try {
    const res = await fetch(`${BASE}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    })
    const body = await res.json()
    if (res.ok) return { data: body }
    return { error: body.message ?? 'Invalid or expired OTP.' }
  } catch {
    return { error: 'Network error. Please check your connection.' }
  }
}

export async function resetPassword(resetToken, newPassword, confirmPassword) {
  try {
    const res = await fetch(`${BASE}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetToken, newPassword, confirmPassword }),
    })
    if (res.ok || res.status === 204) return { data: true }
    const body = await res.json().catch(() => ({}))
    return { error: body.message ?? 'Failed to reset password. Please try again.' }
  } catch {
    return { error: 'Network error. Please check your connection.' }
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
  }
}
