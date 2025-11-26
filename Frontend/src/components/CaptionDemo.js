import React, { useState, useContext } from 'react';
import { Box, Typography, Paper, Button, Grid } from '@mui/material';
import { ThemeContext } from './AppThemeProvider';
import ThemeAwareCaption from './ThemeAwareCaption';

const CaptionDemo = () => {
  const { appearance, setAppearance } = useContext(ThemeContext);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    setAppearance(appearance === 'light' ? 'dark' : 'light');
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Theme-Aware Caption System Demo
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={toggleTheme}
        sx={{ mb: 4 }}
      >
        Toggle {appearance === 'light' ? 'Dark' : 'Light'} Theme
      </Button>

      <Grid container spacing={3}>
        {/* CSS Classes Demo */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              CSS Classes
            </Typography>
            
            <div className="caption">
              <p className="caption">Standard caption text</p>
              <p className="caption-primary">Primary caption text</p>
              <p className="caption-secondary">Secondary caption text</p>
              <p className="caption-tertiary">Tertiary caption text</p>
              <p className="caption-disabled">Disabled caption text</p>
              <p className="text-meta">Metadata information</p>
              <p className="text-timestamp">Timestamp: {currentTime.toLocaleTimeString()}</p>
              <p className="text-small">Small text example</p>
              <p className="text-small-primary">Small primary text</p>
            </div>
          </Paper>
        </Grid>

        {/* Material-UI Component Demo */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Material-UI Components
            </Typography>
            
            <Box>
              <ThemeAwareCaption variant="secondary">
                Standard caption text
              </ThemeAwareCaption>
              <br />
              <ThemeAwareCaption variant="primary">
                Primary caption text
              </ThemeAwareCaption>
              <br />
              <ThemeAwareCaption variant="tertiary">
                Tertiary caption text
              </ThemeAwareCaption>
              <br />
              <ThemeAwareCaption variant="disabled">
                Disabled caption text
              </ThemeAwareCaption>
              <br />
              <ThemeAwareCaption variant="meta">
                Metadata information
              </ThemeAwareCaption>
              <br />
              <ThemeAwareCaption variant="timestamp">
                Timestamp: {currentTime.toLocaleTimeString()}
              </ThemeAwareCaption>
            </Box>
          </Paper>
        </Grid>

        {/* Support Chat Demo */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Support Chat Message Demo
            </Typography>
            
            <Box sx={{ 
              maxWidth: 400, 
              mx: 'auto',
              backgroundColor: 'grey.100',
              p: 2,
              borderRadius: 2
            }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Hello! How can I help you today?
              </Typography>
              <ThemeAwareCaption variant="timestamp">
                {currentTime.toLocaleTimeString()}
              </ThemeAwareCaption>
            </Box>
          </Paper>
        </Grid>

        {/* Usage Examples */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Usage Examples
            </Typography>
            
            <Typography variant="body2" paragraph>
              The theme-aware caption system automatically adapts to theme changes. 
              When you toggle between light and dark themes, all caption text colors 
              will update automatically to maintain proper contrast and readability.
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>CSS Classes:</strong> Use classes like <code>.caption</code>, <code>.caption-primary</code>, etc.
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Material-UI:</strong> Use the <code>ThemeAwareCaption</code> component with different variants.
              </Typography>
              <Typography variant="body2">
                <strong>Theme Sync:</strong> Both systems automatically sync with the Material-UI theme system.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CaptionDemo;
