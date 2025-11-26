import React, { useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ThemeContext } from './AppThemeProvider';

const SettingsPage = () => {
  const theme = useTheme();
  const { appearance, setAppearance, contrast, setContrast } = useContext(ThemeContext);

  const handleSave = () => {
    alert('Settings applied and saved!');
  };

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {/* Website Appearance Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Website Appearance
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose which color scheme you’d like to use.
          </Typography>

          <RadioGroup value={appearance} onChange={(e) => setAppearance(e.target.value)} row>
            <FormControlLabel value="automatic" control={<Radio />} label="Automatic" />
            <FormControlLabel value="light" control={<Radio />} label="Light" />
            <FormControlLabel value="dark" control={<Radio />} label="Dark" />
          </RadioGroup>
        </Box>

        {/* Contrast Control Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Contrast Control
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Configure contrast for better readability.
          </Typography>

          <RadioGroup value={contrast} onChange={(e) => setContrast(e.target.value)} row>
            <FormControlLabel value="automatic" control={<Radio />} label="Automatic" />
            <FormControlLabel value="off" control={<Radio />} label="Off" />
            <FormControlLabel value="custom" control={<Radio />} label="Custom" />
          </RadioGroup>
        </Box>

        <Button variant="contained" color="primary" onClick={handleSave}>
          Save Settings
        </Button>
      </Paper>
    </Box>
  );
};

export default SettingsPage;
