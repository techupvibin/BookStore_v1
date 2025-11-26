import React, { createContext, useEffect, useState, useMemo } from 'react';
import { ThemeProvider, createTheme, CssBaseline, responsiveFontSizes } from '@mui/material';

// Context to allow access to theme settings across the app
export const ThemeContext = createContext();

const AppThemeProvider = ({ children }) => {
  const [appearance, setAppearance] = useState(localStorage.getItem('appearance') || 'automatic');
  const [contrast, setContrast] = useState(localStorage.getItem('contrast') || 'automatic');
  const [systemPrefersDark, setSystemPrefersDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Load theme settings from backend on app startup
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
        const response = await fetch(`${API_BASE_URL}/admin/settings`);
        if (response.ok) {
          const data = await response.json();
          if (data && typeof data === 'object') {
            // Load theme settings if they exist
            if (data['theme.appearance']) {
              setAppearance(data['theme.appearance']);
              localStorage.setItem('appearance', data['theme.appearance']);
            }
            if (data['theme.contrast']) {
              setContrast(data['theme.contrast']);
              localStorage.setItem('contrast', data['theme.contrast']);
            }
          }
        }
      } catch (error) {
        // Silently fail if backend is not available
        console.log('Could not load theme settings from backend:', error.message);
      }
    };

    loadThemeSettings();
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Determine effective mode: light or dark
  const effectiveMode = useMemo(() => {
    if (appearance === 'automatic') {
      return systemPrefersDark ? 'dark' : 'light';
    }
    return appearance;
  }, [appearance, systemPrefersDark]);

  // Create MUI theme
  const theme = useMemo(() => {
    const isDark = effectiveMode === 'dark';

    const brandPrimary = '#6366F1'; // indigo-500
    const brandSecondary = '#06B6D4'; // cyan-500

    const paletteBase = {
      mode: effectiveMode,
      primary: { main: brandPrimary, contrastText: '#ffffff' },
      secondary: { main: brandSecondary, contrastText: '#06202a' },
      success: { main: '#22c55e' },
      warning: { main: '#f59e0b' },
      error: { main: '#ef4444' },
      info: { main: '#3b82f6' },
      background: {
        default: isDark ? '#0b1220' : '#f8fafc',
        paper: isDark ? '#0f172a' : '#ffffff',
      },
      text: {
        primary: isDark ? '#e5e7eb' : '#0f172a',
        secondary: isDark ? '#9aa4b2' : '#475569',
      },
      divider: isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(15, 23, 42, 0.12)'
    };

    const contrastOverrides =
      contrast === 'custom'
        ? {
            background: {
              default: isDark ? '#0a0f1a' : '#f1f5f9',
              paper: isDark ? '#0e1526' : '#ffffff',
            },
            text: {
              primary: isDark ? '#ffffff' : '#0b1220',
              secondary: isDark ? '#cbd5e1' : '#334155',
            },
          }
        : {};

    let baseTheme = createTheme({
      palette: { ...paletteBase, ...contrastOverrides },
      shape: { borderRadius: 12 },
      spacing: 8,
      typography: {
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
        h1: { fontWeight: 700, fontSize: '2.625rem', letterSpacing: '-0.02em' },
        h2: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.01em' },
        h3: { fontWeight: 600, fontSize: '1.75rem' },
        h4: { fontWeight: 600, fontSize: '1.5rem' },
        h5: { fontWeight: 600, fontSize: '1.25rem' },
        subtitle1: { fontWeight: 500 },
        body1: { fontSize: '1rem', lineHeight: 1.65 },
        body2: { fontSize: '0.9375rem', lineHeight: 1.6 },
        button: { fontWeight: 600 },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundImage: isDark
                ? 'radial-gradient(circle at 10% 10%, rgba(99,102,241,0.07), transparent 30%), radial-gradient(circle at 90% 20%, rgba(6,182,212,0.06), transparent 30%)'
                : 'none',
            },
          },
        },
        MuiContainer: {
          defaultProps: { maxWidth: 'xl' },
        },
        MuiButton: {
          defaultProps: { size: 'medium', variant: 'contained' },
          styleOverrides: {
            root: { borderRadius: 10, textTransform: 'none', paddingLeft: 16, paddingRight: 16 },
          },
        },
        MuiTextField: {
          defaultProps: { size: 'small', fullWidth: true },
        },
        MuiTableCell: {
          defaultProps: { size: 'medium' },
          styleOverrides: { head: { fontWeight: 600 } },
        },
        MuiPaper: {
          styleOverrides: { root: { borderRadius: 12 } },
        },
        MuiCard: {
          styleOverrides: { root: { borderRadius: 14 } },
        },
        MuiToolbar: {
          styleOverrides: { root: { minHeight: 64 } },
        },
        MuiAppBar: {
          styleOverrides: {
            colorPrimary: {
              background: isDark
                ? 'linear-gradient(90deg, #0ea5e9, #6366f1)'
                : 'linear-gradient(90deg, #6366f1, #06b6d4)'
            }
          }
        }
      },
    });

    // Make typography responsive across all screen sizes
    baseTheme = responsiveFontSizes(baseTheme);

    return baseTheme;
  }, [effectiveMode, contrast]);

  // Persist user settings
  useEffect(() => {
    localStorage.setItem('appearance', appearance);
    localStorage.setItem('contrast', contrast);
  }, [appearance, contrast]);

  // Sync CSS data-theme attribute with Material-UI theme
  useEffect(() => {
    // Set the data-theme attribute on document.documentElement to sync with CSS theme system
    document.documentElement.setAttribute('data-theme', effectiveMode);
  }, [effectiveMode]);

  return (
    <ThemeContext.Provider value={{ appearance, setAppearance, contrast, setContrast }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default AppThemeProvider;
