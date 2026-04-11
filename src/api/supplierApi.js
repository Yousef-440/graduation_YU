import axios from 'axios'

const BASE = '/api/suppliers'

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

export async function getSuppliers(token, params = {}) {
  try {
    const { data } = await client(token).get(BASE, { params })
    return { data }
  } catch (err) {
    return extractError(err, 'Failed to load suppliers.')
  }
}

export async function createSupplier(token, payload) {
  try {
    const { data } = await client(token).post(BASE, payload)
    return { data }
  } catch (err) {
    return extractError(err, 'Failed to create supplier.')
  }
}

export async function updateSupplier(token, id, payload) {
  try {
    const { data } = await client(token).put(`${BASE}/${id}`, payload)
    return { data }
  } catch (err) {
    return extractError(err, 'Failed to update supplier.')
  }
}

export async function deleteSupplier(token, id) {
  try {
    await client(token).delete(`${BASE}/${id}`)
    return { data: true }
  } catch (err) {
    return extractError(err, 'Failed to delete supplier.')
  }
}
