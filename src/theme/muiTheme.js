import { createTheme } from '@mui/material/styles'

const sharedComponents = {
  MuiButton: {
    styleOverrides: {
      root: { textTransform: 'none', fontWeight: 600, borderRadius: 10 },
      containedPrimary: {
        background: 'linear-gradient(90deg,#00e06a,#00c6ff)',
        color: '#050e1a',
        '&:hover': {
          background: 'linear-gradient(90deg,#00c85a,#00aaee)',
          boxShadow: '0 0 20px rgba(0,220,100,0.35)',
        },
      },
    },
  },
  MuiDialogContent: {
    styleOverrides: { root: { paddingTop: '12px !important' } },
  },
  MuiSnackbar: {
    styleOverrides: { root: { zIndex: 9999 } },
  },
}

export function buildMuiTheme(mode) {
  if (mode === 'light') {
    return createTheme({
      palette: {
        mode: 'light',
        primary:    { main: '#00b359' },
        error:      { main: '#ef4444' },
        background: { default: '#f0f4f8', paper: '#ffffff' },
        text:       { primary: '#0f172a', secondary: '#64748b' },
      },
      shape: { borderRadius: 12 },
      components: {
        ...sharedComponents,
        MuiDialog: {
          styleOverrides: {
            paper: {
              background:     'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(24px)',
              border:         '1px solid rgba(0,0,0,0.1)',
              borderRadius:   16,
              minWidth:       480,
              boxShadow:      '0 8px 40px rgba(0,0,0,0.15)',
            },
          },
        },
        MuiDialogTitle: {
          styleOverrides: { root: { color: '#0f172a', fontWeight: 700, paddingBottom: 8 } },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                background: 'rgba(0,0,0,0.03)',
                '& fieldset':             { borderColor: 'rgba(0,0,0,0.15)' },
                '&:hover fieldset':       { borderColor: 'rgba(0,179,89,0.6)' },
                '&.Mui-focused fieldset': { borderColor: '#00b359', borderWidth: 2 },
              },
              '& .MuiInputLabel-root':             { color: '#64748b', fontSize: 13 },
              '& .MuiInputLabel-root.Mui-focused': { color: '#00b359' },
              '& .MuiOutlinedInput-input':         { color: '#0f172a', fontSize: 13 },
              '& .MuiFormHelperText-root':         { fontSize: 11 },
              '& .MuiSelect-icon':                 { color: '#64748b' },
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              color: '#0f172a',
              fontSize: 13,
              '&:hover': { background: 'rgba(0,179,89,0.08)' },
            },
          },
        },
      },
    })
  }

  return createTheme({
    palette: {
      mode: 'dark',
      primary:    { main: '#00e06a' },
      error:      { main: '#ff6b6b' },
      background: { default: '#060c18', paper: '#0d1a2d' },
      text:       { primary: '#e6f1ff', secondary: '#8892b0' },
    },
    shape: { borderRadius: 12 },
    components: {
      ...sharedComponents,
      MuiDialog: {
        styleOverrides: {
          paper: {
            background:     'rgba(10,20,42,0.97)',
            backdropFilter: 'blur(24px)',
            border:         '1px solid rgba(255,255,255,0.1)',
            borderRadius:   16,
            minWidth:       480,
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: { root: { color: '#e6f1ff', fontWeight: 700, paddingBottom: 8 } },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              background: 'rgba(255,255,255,0.04)',
              '& fieldset':             { borderColor: 'rgba(255,255,255,0.12)' },
              '&:hover fieldset':       { borderColor: 'rgba(0,220,100,0.45)' },
              '&.Mui-focused fieldset': { borderColor: '#00e06a', borderWidth: 2 },
            },
            '& .MuiInputLabel-root':             { color: '#8892b0', fontSize: 13 },
            '& .MuiInputLabel-root.Mui-focused': { color: '#00e06a' },
            '& .MuiOutlinedInput-input':         { color: '#dce8ff', fontSize: 13 },
            '& .MuiFormHelperText-root':         { fontSize: 11 },
            '& .MuiSelect-icon':                 { color: '#8892b0' },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: '#dce8ff',
            fontSize: 13,
            '&:hover': { background: 'rgba(0,220,100,0.1)' },
          },
        },
      },
    },
  })
}
