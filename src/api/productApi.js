import axios from 'axios'

const BASE = '/api/products'

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
    const data = err.response?.data
    const msg  = data?.message ?? data?.title ?? data?.detail ?? data?.error ?? fallback
    console.error(`[productApi] ${err.response?.status} – ${msg}`, data)
    return { error: msg, fieldErrors: data?.errors ?? {}, status: err.response?.status }
  }
  return { error: 'Network error. Please check your connection.' }
}

export async function getProducts(token, params = {}) {
  try {
    const { data } = await client(token).get(BASE, { params })
    if (data && Array.isArray(data.content)) {
      return {
        data:          data.content,
        totalElements: data.totalElements,
        totalPages:    data.totalPages,
        page:          data.number,
        size:          data.size,
      }
    }
    const list = Array.isArray(data) ? data : (data?.data ?? [])
    return { data: list, totalElements: list.length, totalPages: 1, page: 0, size: list.length }
  } catch (err) {
    return extractError(err, 'Failed to load products.')
  }
}

export async function createProduct(token, payload) {
  try {
    const { data } = await client(token).post(BASE, payload)
    return { data }
  } catch (err) {
    return extractError(err, 'Failed to create product.')
  }
}

export async function updateProduct(token, id, payload) {
  try {
    const { data } = await client(token).patch(`${BASE}/${id}`, payload)
    return { data }
  } catch (err) {
    return extractError(err, 'Failed to update product.')
  }
}

export async function deleteProduct(token, id) {
  try {
    await client(token).delete(`${BASE}/${id}`)
    return {}
  } catch (err) {
    return extractError(err, 'Failed to delete product.')
  }
}
