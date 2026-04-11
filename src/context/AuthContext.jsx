import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { login as apiLogin, refresh as apiRefresh, logout as apiLogout } from '../api/authApi'

const AuthContext = createContext(null)

function parseJwtPayload(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null)
  const [user, setUser]               = useState(null)
  const [loading, setLoading]         = useState(true)

  const tokenRef = useRef(null)

  const storeTokens = useCallback((tokens) => {
    tokenRef.current = tokens.accessToken
    setAccessToken(tokens.accessToken)
    if (tokens.refreshToken && tokens.refreshToken !== 'undefined') {
      localStorage.setItem('refreshToken', tokens.refreshToken)
    }
    const payload = parseJwtPayload(tokens.accessToken)
    setUser({
      email: payload?.sub ?? '',
      role:  tokens.role ?? payload?.role ?? '',
    })
  }, [])

  const clearTokens = useCallback(() => {
    tokenRef.current = null
    setAccessToken(null)
    setUser(null)
    localStorage.removeItem('refreshToken')
  }, [])

  useEffect(() => {
    const storedRefresh = localStorage.getItem('refreshToken')
    if (!storedRefresh || storedRefresh === 'undefined') {
      localStorage.removeItem('refreshToken')
      setLoading(false)
      return
    }
    apiRefresh(storedRefresh)
      .then(({ data, networkError }) => {
        if (data) {
          storeTokens(data)
        } else if (!networkError) {
          clearTokens()
        }
      })
      .finally(() => setLoading(false))
  }, [storeTokens, clearTokens])

  const login = useCallback(async (email, password) => {
    const { data, error } = await apiLogin(email, password)
    if (data) {
      storeTokens(data)
      return { success: true }
    }
    return { success: false, error }
  }, [storeTokens])

  const logout = useCallback(async () => {
    const token = tokenRef.current
    clearTokens()
    if (token) await apiLogout(token)
  }, [clearTokens])

  const authFetch = useCallback(async (url, options = {}) => {
    const execute = (token) =>
      fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

    let res = await execute(tokenRef.current)

    if (res.status === 401) {
      const storedRefresh = localStorage.getItem('refreshToken')
      if (storedRefresh) {
        const { data } = await apiRefresh(storedRefresh)
        if (data) {
          storeTokens(data)
          res = await execute(data.accessToken)
        } else {
          clearTokens()
        }
      } else {
        clearTokens()
      }
    }

    return res
  }, [storeTokens, clearTokens])

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
