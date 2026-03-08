// src/theme.js

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0D9488',    // Deep Teal — trust, growth, calm joy
      dark: '#115E59',
      light: '#5EEAD4',
    },
    secondary: {
      main: '#E8920C',    // Amber Gold — serotonin, warmth, optimism
    },
    background: {
      default: '#FFFBEB',  // Warm cream — inviting, not clinical
      paper: '#ffffff',
    },
    text: {
      primary: '#1C1917',  // Warm near-black
      secondary: '#78716C',  // Warm gray
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          transition: 'all 0.2s ease',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(13, 148, 136, 0.2)',
          },
        },
      },
    },
  },
});

export default theme;