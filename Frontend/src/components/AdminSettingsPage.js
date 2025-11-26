import React, { useEffect, useState, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  TextField, 
  Button, 
  Stack, 
  Switch, 
  FormControlLabel, 
  Snackbar, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import { ThemeContext } from './AppThemeProvider';

const SettingsPage = () => {
  const theme = useTheme();
  const { appearance, setAppearance, contrast, setContrast } = useContext(ThemeContext);

  const [siteTitle, setSiteTitle] = useState(localStorage.getItem('admin.siteTitle') || 'Dream Books');
  const [lowStockThreshold, setLowStockThreshold] = useState(parseInt(localStorage.getItem('admin.lowStock') || '5', 10));
  const [maintenanceMode, setMaintenanceMode] = useState(localStorage.getItem('admin.maintenance') === 'true');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Theme settings
  const [themeSettings, setThemeSettings] = useState({
    appearance: appearance || 'automatic',
    contrast: contrast || 'automatic'
  });

  useEffect(() => {
    // Update local state when context changes
    setThemeSettings({
      appearance: appearance || 'automatic',
      contrast: contrast || 'automatic'
    });
  }, [appearance, contrast]);

  useEffect(() => {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
    const api = axios.create({ baseURL: API_BASE_URL });
    api.interceptors.request.use(cfg => {
      const token = localStorage.getItem('token');
      if (token) cfg.headers['Authorization'] = `Bearer ${token}`;
      return cfg;
    });
    // Load existing settings
    api.get('/admin/settings').then(res => {
      const data = res.data || {};
      if (data['site.title']) setSiteTitle(data['site.title']);
      if (data['low.stock']) setLowStockThreshold(parseInt(data['low.stock'] || '5', 10));
      if (data['maintenance']) setMaintenanceMode(data['maintenance'] === 'true');
    }).catch(() => {});
  }, []);

  const saveSettings = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
      const api = axios.create({ baseURL: API_BASE_URL });
      api.interceptors.request.use(cfg => {
        const token = localStorage.getItem('token');
        if (token) cfg.headers['Authorization'] = `Bearer ${token}`;
        return cfg;
      });
      await api.post('/admin/settings', {
        'site.title': siteTitle,
        'low.stock': String(lowStockThreshold),
        'maintenance': String(maintenanceMode)
      });
      setToast({ open: true, message: 'Settings saved.', severity: 'success' });
    } catch (e) {
      setToast({ open: true, message: 'Failed to save settings.', severity: 'error' });
    }
  };

  const saveThemeSettings = () => {
    try {
      // Update the global theme context
      setAppearance(themeSettings.appearance);
      setContrast(themeSettings.contrast);
      
      // Save to localStorage for persistence
      localStorage.setItem('appearance', themeSettings.appearance);
      localStorage.setItem('contrast', themeSettings.contrast);
      
      // Save to backend for admin settings
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
      const api = axios.create({ baseURL: API_BASE_URL });
      api.interceptors.request.use(cfg => {
        const token = localStorage.getItem('token');
        if (token) cfg.headers['Authorization'] = `Bearer ${token}`;
        return cfg;
      });
      
      api.post('/admin/settings', {
        'theme.appearance': themeSettings.appearance,
        'theme.contrast': themeSettings.contrast
      }).catch(() => {}); // Don't fail if backend save fails
      
      setToast({ open: true, message: 'Theme settings applied globally!', severity: 'success' });
    } catch (e) {
      setToast({ open: true, message: 'Failed to apply theme settings.', severity: 'error' });
    }
  };

  const resetThemeSettings = () => {
    setThemeSettings({
      appearance: 'automatic',
      contrast: 'automatic'
    });
  };

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
      <Paper
        elevation={3}
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Admin Settings
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={4}>
          {/* General Settings */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  General Settings
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    label="Site Title"
                    value={siteTitle}
                    onChange={(e) => setSiteTitle(e.target.value)}
                    helperText="Shown in header and metadata"
                  />
                  <TextField
                    label="Low Stock Threshold"
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(parseInt(e.target.value || '0', 10))}
                    helperText="Show alerts when book quantity falls below this value"
                    inputProps={{ min: 0 }}
                  />
                  <FormControlLabel
                    control={<Switch checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} />}
                    label="Maintenance Mode"
                  />
                  <Stack direction="row" spacing={2}>
                    <Button variant="contained" onClick={saveSettings}>
                      Save Settings
                    </Button>
                    <Button variant="outlined" onClick={() => { 
                      setSiteTitle('Dream Books'); 
                      setLowStockThreshold(5); 
                      setMaintenanceMode(false); 
                    }}>
                      Reset
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Theme Settings */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  Global Theme Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  These settings will apply to the entire application, including both admin and user views.
                </Typography>
                <Stack spacing={3}>
                  <FormControl fullWidth>
                    <InputLabel>Appearance</InputLabel>
                    <Select
                      value={themeSettings.appearance}
                      label="Appearance"
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, appearance: e.target.value }))}
                    >
                      <MenuItem value="automatic">Automatic (System)</MenuItem>
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth>
                    <InputLabel>Contrast</InputLabel>
                    <Select
                      value={themeSettings.contrast}
                      label="Contrast"
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, contrast: e.target.value }))}
                    >
                      <MenuItem value="automatic">Automatic</MenuItem>
                      <MenuItem value="normal">Normal</MenuItem>
                      <MenuItem value="custom">High Contrast</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Stack direction="row" spacing={2}>
                    <Button 
                      variant="contained" 
                      onClick={saveThemeSettings}
                      sx={{ 
                        background: 'linear-gradient(45deg, #6366F1, #06B6D4)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5855EB, #0891B2)'
                        }
                      }}
                    >
                      Apply Theme
                    </Button>
                    <Button variant="outlined" onClick={resetThemeSettings}>
                      Reset Theme
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
          <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default SettingsPage;
