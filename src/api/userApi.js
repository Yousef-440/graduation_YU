const BASE = '/api/users'

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string, confirmPassword: string }} data
 * @returns {Promise<{ user?: object, fieldErrors?: object, message?: string }>}
 */
export async function registerUser(data) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const body = await res.json()

  if (res.ok) {
    return { user: body }
  }

  // 400 – validation errors (per-field map from GlobalExceptionHandler)
  if (res.status === 400) {
    return { fieldErrors: body.errors ?? {}, message: body.message }
  }

  // 409 – email already exists
  if (res.status === 409) {
    return { fieldErrors: { email: body.message }, message: body.message }
  }

  return { message: body.message ?? 'Something went wrong. Please try again.' }
}
