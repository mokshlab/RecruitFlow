// === Color Palette ===
export const colors = {
  primary: {
    main: '#0D9488',
    gradient: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
  },
  admin: {
    gradient: 'linear-gradient(135deg, #E8920C 0%, #C67A08 100%)',
    border: '#F5C842',
  },
  text: {
    primary: '#2d3748',
    secondary: '#4a5568',
    light: '#718096',
  },
  background: {
    light: '#f7fafc',
    white: '#ffffff',
  },
  status: {
    success: '#48bb78',
    error: '#f56565',
    warning: '#ed8936',
    info: '#4299e1',
  },
};

// === Common Shadows ===
export const shadows = {
  card: '0 2px 8px rgba(0, 0, 0, 0.08)',
  hover: '0 4px 12px rgba(0, 0, 0, 0.12)',
  focus: '0 0 0 3px rgba(102, 126, 234, 0.2)',
};

// === Spacing ===
export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem',
};

// === Border Radius ===
export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '50%',
};

// === Common Styles ===
export const commonStyles = {
  card: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.card,
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: shadows.hover,
      transform: 'translateY(-2px)',
    },
  },
  gradientText: {
    background: colors.primary.gradient,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 600,
  },
  button: {
    borderRadius: borderRadius.md,
    textTransform: 'none',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  input: {
    '& .MuiOutlinedInput-root': {
      borderRadius: borderRadius.md,
      transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: shadows.card,
      },
      '&.Mui-focused': {
        boxShadow: shadows.focus,
      },
    },
  },
};
