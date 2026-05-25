import axios from 'axios'

const BASE          = '/api/suppliers'
const DISCOVERED    = '/api/discovered-suppliers'

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
      error:  err.response?.data?.message ?? fallback,
      status: err.response?.status,
    }
  }
  return { error: 'Network error. Please check your connection.' }
}

export async function discoverSuppliers(token, payload) {
  try {
    const { data } = await client(token).post(`${BASE}/discover`, payload)
    return { data }
  } catch (err) {
    return extractError(err, 'Discovery failed. Please try again.')
  }
}

export async function getDiscoveredSuppliers(token) {
  try {
    const { data } = await client(token).get(`${BASE}/discovered`)
    return { data }
  } catch (err) {
    return extractError(err, 'Failed to load discovered suppliers.')
  }
}

export async function getDiscoveredSupplierById(token, id) {
  try {
    const { data } = await client(token).get(`${BASE}/discovered/${id}`)
    return { data }
  } catch (err) {
    return extractError(err, 'Failed to load supplier.')
  }
}

export async function acceptSupplier(token, id) {
  try {
    const { data } = await client(token).post(`${DISCOVERED}/${id}/accept`)
    return { data }
  } catch (err) {
    return extractError(err, 'Failed to accept supplier.')
  }
}

export async function acceptAllSuppliers(token) {
  try {
    const { data } = await client(token).post(`${DISCOVERED}/accept-all`)
    return { data }
  } catch (err) {
    return extractError(err, 'Failed to accept suppliers.')
  }
}

export async function deleteDiscoveredSupplier(token, id) {
  try {
    const { data } = await client(token).delete(`${DISCOVERED}/${id}`)
    return { data }
  } catch (err) {
    return extractError(err, 'Failed to delete supplier.')
  }
}
