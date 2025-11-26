import React, { useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Chip,
  Alert,
  useTheme,
  Container,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  LightMode,
  DarkMode,
  BrightnessAuto,
  Palette,
  Settings,
  CheckCircle,
  Info,
  Warning,
  Error,
} from '@mui/icons-material';
import { ThemeContext } from './AppThemeProvider';

const ThemeDemoPage = () => {
  const theme = useTheme();
  const { appearance, setAppearance, contrast, setContrast } = useContext(ThemeContext);

  const handleAppearanceChange = (event) => {
    const newAppearance = event.target.value;
    setAppearance(newAppearance);
    localStorage.setItem('appearance', newAppearance);
  };

  const handleContrastChange = (event) => {
    const newContrast = event.target.value;
    setContrast(newContrast);
    localStorage.setItem('contrast', newContrast);
  };

  const getThemeIcon = () => {
    switch (appearance) {
      case 'light':
        return <LightMode />;
      case 'dark':
        return <DarkMode />;
      default:
        return <BrightnessAuto />;
    }
  };

  const getThemeDescription = () => {
    switch (appearance) {
      case 'light':
        return 'Clean, bright interface with high contrast for optimal readability';
      case 'dark':
        return 'Easy on the eyes with reduced blue light emission';
      default:
        return 'Automatically adapts to your system preferences';
    }
  };

  const getContrastDescription = () => {
    switch (contrast) {
      case 'normal':
        return 'Standard contrast for comfortable reading';
      case 'custom':
        return 'Enhanced contrast for better accessibility';
      default:
        return 'Automatically adjusts based on theme';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 4 }}>
        🎨 Theme System Demonstration
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body1">
          This page demonstrates the global theme system. Changes made here will affect the entire application, 
          including both admin and user views. The theme is synchronized across all components and persisted globally.
        </Typography>
      </Alert>

      <Grid container spacing={4}>
        {/* Theme Controls */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Palette />
              Theme Controls
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel>Appearance Mode</InputLabel>
                <Select
                  value={appearance}
                  label="Appearance Mode"
                  onChange={handleAppearanceChange}
                >
                  <MenuItem value="automatic">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BrightnessAuto />
                      Automatic (System)
                    </Box>
                  </MenuItem>
                  <MenuItem value="light">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LightMode />
                      Light
                    </Box>
                  </MenuItem>
                  <MenuItem value="dark">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DarkMode />
                      Dark
                    </Box>
                  </MenuItem>
                </Select>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {getThemeDescription()}
                </Typography>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Contrast Level</InputLabel>
                <Select
                  value={contrast}
                  label="Contrast Level"
                  onChange={handleContrastChange}
                >
                  <MenuItem value="automatic">Automatic</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="custom">High Contrast</MenuItem>
                </Select>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {getContrastDescription()}
                </Typography>
              </FormControl>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2">Current Theme:</Typography>
                <Chip
                  icon={getThemeIcon()}
                  label={appearance === 'automatic' ? 'System' : appearance}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Theme Preview */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Settings />
              Live Preview
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Stack spacing={2}>
              <Typography variant="body1">
                This card demonstrates how the current theme affects components:
              </Typography>
              
              <Card sx={{ backgroundColor: theme.palette.background.paper }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sample Card
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This card uses the current theme's background and text colors.
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button variant="contained" size="small">Primary</Button>
                    <Button variant="outlined" size="small">Secondary</Button>
                    <Chip label="Sample Chip" size="small" />
                  </Box>
                </CardContent>
              </Card>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip icon={<CheckCircle />} label="Success" color="success" />
                <Chip icon={<Info />} label="Info" color="info" />
                <Chip icon={<Warning />} label="Warning" color="warning" />
                <Chip icon={<Error />} label="Error" color="error" />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Theme Information */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Theme System Features
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', backgroundColor: theme.palette.background.default }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      🌍 Global Synchronization
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Theme changes are applied instantly across the entire application, 
                      including admin panels, user interfaces, and all components.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', backgroundColor: theme.palette.background.default }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      💾 Persistent Storage
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Theme preferences are saved locally and synchronized with the backend 
                      for consistent experience across sessions and devices.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', backgroundColor: theme.palette.background.default }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      🎯 Accessibility Focused
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      High contrast options and automatic system preference detection 
                      ensure the interface is accessible to all users.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quick Theme Actions
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<LightMode />}
                onClick={() => {
                  setAppearance('light');
                  localStorage.setItem('appearance', 'light');
                }}
                disabled={appearance === 'light'}
              >
                Force Light Mode
              </Button>
              
              <Button
                variant="contained"
                startIcon={<DarkMode />}
                onClick={() => {
                  setAppearance('dark');
                  localStorage.setItem('appearance', 'dark');
                }}
                disabled={appearance === 'dark'}
              >
                Force Dark Mode
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<BrightnessAuto />}
                onClick={() => {
                  setAppearance('automatic');
                  localStorage.setItem('appearance', 'automatic');
                }}
                disabled={appearance === 'automatic'}
              >
                Reset to Auto
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ThemeDemoPage;
