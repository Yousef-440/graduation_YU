import axios from 'axios'

const BASE = '/api/v1/admin'

function client(token) {
  return axios.create({
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

function extractError(err, fallback) {
  if (axios.isAxiosError(err)) {
    return {
      error:       err.response?.data?.message ?? fallback,
      fieldErrors: err.response?.data?.errors  ?? {},
      status:      err.response?.status,
    }
  }
  return { error: 'Network error. Please check your connection.' }
}

export async function addUser(token, payload) {
  try {
    const { data } = await client(token).post(`${BASE}/users`, payload)
    return { data }
  } catch (err) {
    return extractError(err, 'Failed to create user.')
  }
}
