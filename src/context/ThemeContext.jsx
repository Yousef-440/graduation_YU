import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { buildMuiTheme } from '../theme/muiTheme'

const ThemeCtx = createContext({ mode: 'dark', toggleMode: () => {} })

export function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('themeMode') ?? 'dark'
    document.documentElement.setAttribute('data-theme', saved)
    return saved
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
    localStorage.setItem('themeMode', mode)
  }, [mode])

  const toggleMode = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'))

  const muiTheme = useMemo(() => buildMuiTheme(mode), [mode])

  return (
    <ThemeCtx.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={muiTheme}>
        {children}
      </ThemeProvider>
    </ThemeCtx.Provider>
  )
}

export const useThemeMode = () => useContext(ThemeCtx)
