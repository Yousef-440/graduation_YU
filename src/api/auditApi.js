const BASE = '/api/audit-logs'

function buildUrl(params = {}) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v)
  })
  const query = qs.toString()
  return query ? `${BASE}?${query}` : BASE
}

function extractMessage(body, fallback) {
  if (!body || typeof body !== 'object') return fallback
  return body.message ?? body.error ?? fallback
}

export async function getAuditLogs(authFetch, params = {}) {
  try {
    const res = await authFetch(buildUrl(params))
    let body = null
    try { body = await res.json() } catch {}
    if (res.ok) return { data: body }
    return { error: extractMessage(body, `Request failed (${res.status}).`) }
  } catch {
    return { error: 'Network error. Please check your connection.' }
  }
}
