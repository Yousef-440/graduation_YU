import axios from 'axios'

function client(token) {
  return axios.create({
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

export async function getAiInsights(token) {
  try {
    const { data } = await client(token).get('/api/dashboard/ai-insights')
    return { data }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return { error: err.response?.data?.message ?? 'Failed to load insights.' }
    }
    return { error: 'Network error.' }
  }
}
