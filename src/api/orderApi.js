const BASE = '/api/orders'

function extractMessage(body, fallback) {
  if (!body || typeof body !== 'object') return fallback
  return body.message ?? body.title ?? body.detail ?? body.error ?? fallback
}

function buildUrl(base, params = {}) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v)
  })
  const query = qs.toString()
  return query ? `${base}?${query}` : base
}

export async function getOrders(authFetch, params = {}) {
  try {
    const res = await authFetch(buildUrl(BASE, params))
    let body = null
    try { body = await res.json() } catch {}
    if (res.ok) return { data: Array.isArray(body) ? body : (body?.data ?? body ?? []) }
    return { error: extractMessage(body, `Request failed (${res.status}).`) }
  } catch {
    return { error: 'Network error. Please check your connection.' }
  }
}

export async function createOrder(authFetch, payload) {
  try {
    const res = await authFetch(BASE, { method: 'POST', body: JSON.stringify(payload) })
    let body = null
    try { body = await res.json() } catch {}
    if (res.ok) return { data: body }
    return { error: extractMessage(body, 'Failed to create order.'), fieldErrors: body?.errors ?? {} }
  } catch {
    return { error: 'Network error. Please check your connection.' }
  }
}

export async function cancelOrder(authFetch, id) {
  try {
    const res = await authFetch(`${BASE}/${id}/cancel`, { method: 'PUT' })
    let body = null
    try { body = await res.json() } catch {}
    if (res.ok) return { data: body }
    return { error: extractMessage(body, 'Failed to cancel order.') }
  } catch {
    return { error: 'Network error. Please check your connection.' }
  }
}

export async function updateOrderStatus(authFetch, id, newStatus) {
  try {
    const res = await authFetch(`${BASE}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ newStatus }),
    })
    let body = null
    try { body = await res.json() } catch {}
    if (res.ok) return { data: body }
    return { error: extractMessage(body, 'Failed to update order status.') }
  } catch {
    return { error: 'Network error. Please check your connection.' }
  }
}

export async function updateOrderAccuracy(authFetch, id, isAccurate) {
  try {
    const res = await authFetch(`${BASE}/${id}/accuracy`, {
      method: 'PUT',
      body: JSON.stringify({ isAccurate }),
    })
    let body = null
    try { body = await res.json() } catch {}
    if (res.ok) return { data: body }
    return { error: extractMessage(body, 'Failed to update accuracy.') }
  } catch {
    return { error: 'Network error. Please check your connection.' }
  }
}

export async function bulkUpdateOrderStatus(authFetch, currentStatus, newStatus) {
  try {
    const res = await authFetch(`${BASE}/status/bulk`, {
      method: 'PATCH',
      body: JSON.stringify({ currentStatus, newStatus }),
    })
    let body = null
    try { body = await res.json() } catch {}
    if (res.ok) return { data: body }
    return { error: extractMessage(body, 'Failed to bulk update orders.') }
  } catch {
    return { error: 'Network error. Please check your connection.' }
  }
}
