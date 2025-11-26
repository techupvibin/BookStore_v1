// src/components/LoginPage.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
  Container,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import { useTheme } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {jwtDecode} from 'jwt-decode'; // ⭐ ADDED IMPORT for decoding JWT
import bgImg from '../backgroundimage.jpg';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const navigate = useNavigate();
  const theme = useTheme();
  const { login, isAuthenticated, hasRole } = useAuth();
  const [rememberMe, setRememberMe] = useState(true);

  // If already logged in, redirect appropriately
  useEffect(() => {
    if (isAuthenticated) {
      const target = hasRole('ROLE_ADMIN') ? '/admin' : '/';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, hasRole, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSnackbarOpen(false);

    if (!credentials.username || !credentials.password) {
      showSnackbar('Username and password are required.', 'error');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error(`Server returned invalid response. Status: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || `Login failed with status: ${response.status}`);
      }

      // ⭐ FIX: Check only for the 'token' property
      if (data.token) {
        try {
          // Decode the token to get user data from the claims
          const decodedToken = jwtDecode(data.token);
          const userData = {
            username: decodedToken.sub,
            roles: decodedToken.roles || [], // Ensure roles is always an array
            // You can add more user data here if needed
          };

          // Persist based on Remember Me
          if (rememberMe) {
            login(data.token, userData);
          } else {
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('user', JSON.stringify(userData));
            login(data.token, userData);
          }
          
          showSnackbar('✅ Login successful! Redirecting...', 'success');

          // Check for the admin role to determine the redirect path
          const isAdmin = userData.roles && userData.roles.includes('ROLE_ADMIN');
          const redirectPath = isAdmin ? '/admin' : '/';

          // Add a small delay to show the success message
          setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 1000);
          
        } catch (decodeError) {
          console.error('Failed to decode JWT token:', decodeError);
          showSnackbar('❌ Login successful but token processing failed', 'warning');
          // Still try to login with basic data
          const userData = { username: credentials.username, roles: [] };
          login(data.token, userData);
          navigate('/', { replace: true });
        }
      } else {
        throw new Error('Backend response is missing a token.');
      }

    } catch (error) {
      console.error('Login failed:', error.message);
      showSnackbar('❌ Login failed: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100vw',
      backgroundImage: `url(${bgImg})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
    }}>
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper elevation={0} sx={{
        p: 4,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.25)',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)'
      }}>
        <Typography component="h1" variant="h5" align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
          Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              label="Username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControlLabel
              control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} color="primary" />}
              label="Remember me"
            />
            <TextField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={submitting}
              sx={{ py: 1.2, mt: 2 }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
            <Divider>or</Divider>
            <Button
              component="a"
              href="http://localhost:8080/oauth2/authorization/google"
              variant="outlined"
              fullWidth
              startIcon={<GoogleIcon sx={{ color: '#ea4335' }} />}
              sx={{
                py: 1.2,
                color: '#fff',
                textTransform: 'none',
                fontWeight: 700,
                borderColor: 'rgba(255,255,255,0.85)',
                '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.12)' }
              }}
            >
              <Box component="span" sx={{ color: '#fff' }}>Continue with </Box>
              <Box component="span" sx={{ color: '#ea4335', fontWeight: 800 }}>G</Box>
              <Box component="span" sx={{ color: '#fff' }}>oogle</Box>
            </Button>
            <Box mt={1} textAlign="center" sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <MuiLink component={Link} to="/register" variant="body2" sx={{ color: '#fff' }}>
                Don't have an account? Register
              </MuiLink>
              <MuiLink component={Link} to="/forgot-password" variant="body2" sx={{ color: '#fff',paddingLeft:2 }}>
                Forgot password?
              </MuiLink>
            </Box>
          </Stack>
        </Box>
      </Paper>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
    </Box>
  );
};

export default LoginPage;