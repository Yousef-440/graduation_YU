import axios from 'axios'

const BASE = '/api/users'

function client(token) {
  return axios.create({
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

export async function getAllUsers(token) {
  try {
    const { data } = await client(token).get('/api/all-users')
    return { data: Array.isArray(data) ? data : [] }
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 204) {
      return { data: [] }
    }
    return { error: 'Failed to load users.' }
  }
}

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

  if (res.status === 400) {
    return { fieldErrors: body.errors ?? {}, message: body.message }
  }

  if (res.status === 409) {
    return { fieldErrors: { email: body.message }, message: body.message }
  }

  return { message: body.message ?? 'Something went wrong. Please try again.' }
}
