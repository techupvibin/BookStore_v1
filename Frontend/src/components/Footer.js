import React from 'react';
import {
  Box,
  Typography,
  Container,
  Link,
  Grid,
} from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        background: '#111827', // Changed from linear-gradient to a solid dark color
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2} justifyContent="center" alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body2" align="left">
              © {new Date().getFullYear()} Dream Books Gallery. All rights reserved.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, gap: 2 }}>
              <Link color="inherit" href="/about" underline="hover">
                About Us
              </Link>
              <Link color="inherit" href="/privacy-policy" underline="hover">
                Privacy Policy
              </Link>
              <Link color="inherit" href="/terms-of-service" underline="hover">
                Terms of Service
              </Link>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;