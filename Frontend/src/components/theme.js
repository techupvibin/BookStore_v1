// theme.js
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Import Inter font for better typography
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// Design System Constants
const DESIGN_TOKENS = {
  // Spacing Scale (8px base unit)
  spacing: {
    xs: 4,    // 4px
    sm: 8,    // 8px
    md: 16,   // 16px
    lg: 24,   // 24px
    xl: 32,   // 32px
    xxl: 48,  // 48px
  },
  
  // Border Radius Scale
  borderRadius: {
    xs: 4,    // 4px
    sm: 8,    // 8px
    md: 12,   // 12px
    lg: 16,   // 16px
    xl: 24,   // 24px
    round: 50, // 50% for circular elements
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  }
};

// Color Palette System
const createColorPalette = (mode) => {
  const isDark = mode === 'dark';
  
  return {
    mode,
    // Primary Colors - Professional Blue
    primary: {
      50: isDark ? '#eff6ff' : '#eff6ff',
      100: isDark ? '#dbeafe' : '#dbeafe',
      200: isDark ? '#bfdbfe' : '#bfdbfe',
      300: isDark ? '#93c5fd' : '#93c5fd',
      400: isDark ? '#60a5fa' : '#60a5fa',
      500: isDark ? '#3b82f6' : '#3b82f6', // Main
      600: isDark ? '#2563eb' : '#2563eb',
      700: isDark ? '#1d4ed8' : '#1d4ed8',
      800: isDark ? '#1e40af' : '#1e40af',
      900: isDark ? '#1e3a8a' : '#1e3a8a',
      main: isDark ? '#3b82f6' : '#3b82f6',
      light: isDark ? '#60a5fa' : '#60a5fa',
      dark: isDark ? '#1d4ed8' : '#1d4ed8',
      contrastText: '#ffffff',
    },
    
    // Secondary Colors - Modern Teal
    secondary: {
      50: isDark ? '#f0fdfa' : '#f0fdfa',
      100: isDark ? '#ccfbf1' : '#ccfbf1',
      200: isDark ? '#99f6e4' : '#99f6e4',
      300: isDark ? '#5eead4' : '#5eead4',
      400: isDark ? '#2dd4bf' : '#2dd4bf',
      500: isDark ? '#14b8a6' : '#14b8a6', // Main
      600: isDark ? '#0d9488' : '#0d9488',
      700: isDark ? '#0f766e' : '#0f766e',
      800: isDark ? '#115e59' : '#115e59',
      900: isDark ? '#134e4a' : '#134e4a',
      main: isDark ? '#14b8a6' : '#14b8a6',
      light: isDark ? '#2dd4bf' : '#2dd4bf',
      dark: isDark ? '#0f766e' : '#0f766e',
      contrastText: '#ffffff',
    },
    
    // Background Colors
    background: {
      default: isDark ? '#0f172a' : '#f8fafc',
      paper: isDark ? '#1e293b' : '#ffffff',
      subtle: isDark ? '#334155' : '#f1f5f9',
      elevated: isDark ? '#475569' : '#e2e8f0',
    },
    
    // Text Colors
    text: {
      primary: isDark ? '#f1f5f9' : '#0f172a',
      secondary: isDark ? '#94a3b8' : '#475569',
      disabled: isDark ? '#64748b' : '#94a3b8',
      hint: isDark ? '#64748b' : '#94a3b8',
    },
    
    // Semantic Colors
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#ffffff',
    },
    
    // Divider
    divider: isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(15, 23, 42, 0.12)',
    
    // Action Colors
    action: {
      hover: isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(15, 23, 42, 0.04)',
      selected: isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(15, 23, 42, 0.08)',
      disabled: isDark ? 'rgba(148, 163, 184, 0.38)' : 'rgba(15, 23, 42, 0.38)',
      disabledBackground: isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(15, 23, 42, 0.12)',
    },
  };
};

// Typography System
const createTypography = (mode) => {
  const isDark = mode === 'dark';
  
  return {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    
    // Font weights
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightSemiBold: 600,
    fontWeightBold: 700,
    
    // Headings
    h1: {
      fontSize: '2.5rem', // 40px
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      color: isDark ? '#f1f5f9' : '#0f172a',
      '@media (min-width:600px)': { fontSize: '3rem' }, // 48px
      '@media (min-width:900px)': { fontSize: '3.5rem' }, // 56px
      '@media (min-width:1200px)': { fontSize: '4rem' }, // 64px
    },
    h2: {
      fontSize: '2rem', // 32px
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      color: isDark ? '#f1f5f9' : '#0f172a',
      '@media (min-width:600px)': { fontSize: '2.25rem' }, // 36px
      '@media (min-width:900px)': { fontSize: '2.5rem' }, // 40px
      '@media (min-width:1200px)': { fontSize: '3rem' }, // 48px
    },
    h3: {
      fontSize: '1.75rem', // 28px
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      color: isDark ? '#f1f5f9' : '#0f172a',
      '@media (min-width:600px)': { fontSize: '2rem' }, // 32px
      '@media (min-width:900px)': { fontSize: '2.25rem' }, // 36px
    },
    h4: {
      fontSize: '1.5rem', // 24px
      fontWeight: 600,
      lineHeight: 1.4,
      color: isDark ? '#f1f5f9' : '#0f172a',
      '@media (min-width:600px)': { fontSize: '1.75rem' }, // 28px
    },
    h5: {
      fontSize: '1.25rem', // 20px
      fontWeight: 600,
      lineHeight: 1.4,
      color: isDark ? '#f1f5f9' : '#0f172a',
      '@media (min-width:600px)': { fontSize: '1.5rem' }, // 24px
    },
    h6: {
      fontSize: '1.125rem', // 18px
      fontWeight: 600,
      lineHeight: 1.4,
      color: isDark ? '#f1f5f9' : '#0f172a',
      '@media (min-width:600px)': { fontSize: '1.25rem' }, // 20px
    },
    
    // Body text
    body1: {
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: 1.6,
      color: isDark ? '#e2e8f0' : '#334155',
      '@media (min-width:600px)': { fontSize: '1.0625rem' }, // 17px
    },
    body2: {
      fontSize: '0.9375rem', // 15px
      fontWeight: 400,
      lineHeight: 1.6,
      color: isDark ? '#94a3b8' : '#475569',
      '@media (min-width:600px)': { fontSize: '1rem' }, // 16px
    },
    
    // Subtitle
    subtitle1: {
      fontSize: '1.125rem', // 18px
      fontWeight: 500,
      lineHeight: 1.5,
      color: isDark ? '#cbd5e1' : '#475569',
      '@media (min-width:600px)': { fontSize: '1.25rem' }, // 20px
    },
    subtitle2: {
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.5,
      color: isDark ? '#94a3b8' : '#64748b',
    },
    
    // Button
    button: {
      fontSize: '0.9375rem', // 15px
      fontWeight: 600,
      lineHeight: 1.5,
      textTransform: 'none',
      '@media (min-width:600px)': { fontSize: '1rem' }, // 16px
    },
    
    // Caption
    caption: {
      fontSize: '0.8125rem', // 13px
      fontWeight: 400,
      lineHeight: 1.4,
      color: isDark ? '#64748b' : '#94a3b8',
    },
    
    // Overline
    overline: {
      fontSize: '0.75rem', // 12px
      fontWeight: 500,
      lineHeight: 1.4,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: isDark ? '#64748b' : '#94a3b8',
    },
  };
};

// Component Overrides
const createComponentOverrides = (mode) => {
  const isDark = mode === 'dark';
  
  return {
    // Global container settings
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: DESIGN_TOKENS.spacing.md, // 16px
          paddingRight: DESIGN_TOKENS.spacing.md, // 16px
          '@media (min-width:600px)': {
            paddingLeft: DESIGN_TOKENS.spacing.lg, // 24px
            paddingRight: DESIGN_TOKENS.spacing.lg, // 24px
          },
          '@media (min-width:900px)': {
            paddingLeft: DESIGN_TOKENS.spacing.xl, // 32px
            paddingRight: DESIGN_TOKENS.spacing.xl, // 32px
          },
        },
      },
      defaultProps: {
        maxWidth: 'xl', // 1920px
      },
    },
    
    // Button consistency
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: DESIGN_TOKENS.borderRadius.md, // 12px
          textTransform: 'none',
          fontWeight: 600,
          padding: `${DESIGN_TOKENS.spacing.sm}px ${DESIGN_TOKENS.spacing.lg}px`, // 8px 24px
          fontSize: '0.9375rem', // 15px
          lineHeight: 1.5,
          transition: `all ${DESIGN_TOKENS.transitions.normal}`,
          minHeight: 44, // Accessibility requirement
          '@media (min-width:600px)': {
            fontSize: '1rem', // 16px
            padding: `${DESIGN_TOKENS.spacing.md}px ${DESIGN_TOKENS.spacing.xl}px`, // 16px 32px
          },
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: DESIGN_TOKENS.shadows.lg,
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        sizeSmall: {
          padding: `${DESIGN_TOKENS.spacing.xs}px ${DESIGN_TOKENS.spacing.md}px`, // 4px 16px
          fontSize: '0.875rem', // 14px
          minHeight: 36,
        },
        sizeLarge: {
          padding: `${DESIGN_TOKENS.spacing.md}px ${DESIGN_TOKENS.spacing.xxl}px`, // 16px 48px
          fontSize: '1.0625rem', // 17px
          minHeight: 52,
        },
      },
    },
    
    // Paper/Card consistency
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: DESIGN_TOKENS.borderRadius.lg, // 16px
          backgroundImage: 'none',
          transition: `box-shadow ${DESIGN_TOKENS.transitions.normal}`,
        },
        elevation1: {
          boxShadow: DESIGN_TOKENS.shadows.sm,
        },
        elevation2: {
          boxShadow: DESIGN_TOKENS.shadows.md,
        },
        elevation3: {
          boxShadow: DESIGN_TOKENS.shadows.lg,
        },
        elevation4: {
          boxShadow: DESIGN_TOKENS.shadows.xl,
        },
      },
    },
    
    // Card consistency
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: DESIGN_TOKENS.borderRadius.lg, // 16px
          overflow: 'hidden',
          transition: `transform ${DESIGN_TOKENS.transitions.normal}, box-shadow ${DESIGN_TOKENS.transitions.normal}`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: DESIGN_TOKENS.shadows.xl,
          },
        },
      },
    },
    
    // AppBar consistency
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: isDark 
            ? 'linear-gradient(90deg, #1e293b 0%, #3b82f6 100%)'
            : 'linear-gradient(90deg, #3b82f6 0%, #14b8a6 100%)',
          boxShadow: DESIGN_TOKENS.shadows.md,
        },
      },
    },
    
    // TextField consistency
    MuiTextField: {
      defaultProps: {
        size: 'medium',
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: DESIGN_TOKENS.borderRadius.md, // 12px
          },
        },
      },
    },
    
    // Table consistency
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(15, 23, 42, 0.12)',
          padding: `${DESIGN_TOKENS.spacing.md}px`, // 16px
          '@media (min-width:600px)': {
            padding: `${DESIGN_TOKENS.spacing.lg}px`, // 24px
          },
        },
        head: {
          fontWeight: 600,
          backgroundColor: isDark ? 'rgba(148, 163, 184, 0.04)' : 'rgba(15, 23, 42, 0.02)',
        },
      },
    },
    
    // Chip consistency
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: DESIGN_TOKENS.borderRadius.round, // 50%
          fontWeight: 500,
        },
      },
    },
    
    // Dialog consistency
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: DESIGN_TOKENS.borderRadius.lg, // 16px
        },
      },
    },
    
    // Menu consistency
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: DESIGN_TOKENS.borderRadius.md, // 12px
          boxShadow: DESIGN_TOKENS.shadows.lg,
        },
      },
    },
    
    // Tooltip consistency
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: DESIGN_TOKENS.borderRadius.sm, // 8px
          fontSize: '0.875rem', // 14px
          padding: `${DESIGN_TOKENS.spacing.xs}px ${DESIGN_TOKENS.spacing.sm}px`, // 4px 8px
        },
      },
    },
    
    // Switch consistency
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-track': {
            borderRadius: DESIGN_TOKENS.borderRadius.round, // 50%
          },
          '& .MuiSwitch-thumb': {
            borderRadius: DESIGN_TOKENS.borderRadius.round, // 50%
          },
        },
      },
    },
    
    // Slider consistency
    MuiSlider: {
      styleOverrides: {
        root: {
          '& .MuiSlider-thumb': {
            borderRadius: DESIGN_TOKENS.borderRadius.round, // 50%
          },
        },
      },
    },
  };
};

// Create the base theme
const createBaseTheme = (mode = 'light') => {
  const baseTheme = createTheme({
    palette: createColorPalette(mode),
    typography: createTypography(mode),
    spacing: DESIGN_TOKENS.spacing.md, // 8px base unit
    shape: {
      borderRadius: DESIGN_TOKENS.borderRadius.md, // 12px default
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
    components: createComponentOverrides(mode),
    // Custom design tokens accessible via theme
    designTokens: DESIGN_TOKENS,
  });
  
  // Apply responsive font sizes
  return responsiveFontSizes(baseTheme);
};

// Export the theme creation function
export const createAppTheme = createBaseTheme;

// Export design tokens for direct use
export { DESIGN_TOKENS };

// Export default theme (light mode)
export default createBaseTheme('light');
