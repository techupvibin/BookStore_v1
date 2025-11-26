import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  User as UserIcon,
  Menu as MenuIcon,
  Palette,
} from 'lucide-react';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import AppRegistrationRoundedIcon from '@mui/icons-material/AppRegistrationRounded';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';

import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ThemeContext } from './AppThemeProvider';
import NotificationBell from './NotificationBell';

// Using Material UI book icon as logo

const Navigation = ({ onDrawerToggle }) => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const theme = useTheme();
  const { appearance, setAppearance } = useContext(ThemeContext);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleThemeToggle = () => {
    const newAppearance = appearance === 'light' ? 'dark' : 'light';
    setAppearance(newAppearance);
    localStorage.setItem('appearance', newAppearance);
  };

  const getThemeIcon = () => {
    switch (appearance) {
      case 'light':
        return <DarkModeIcon />;
      case 'dark':
        return <LightModeIcon />;
      default:
        return <BrightnessAutoIcon />;
    }
  };

  const getThemeTooltip = () => {
    switch (appearance) {
      case 'light':
        return 'Switch to Dark Mode';
      case 'dark':
        return 'Switch to Light Mode';
      default:
        return 'Switch to Light Mode';
    }
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        color: theme.palette.primary.contrastText,
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        backdropFilter: 'saturate(180%) blur(10px)',
        borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: 0
      }}
    >
      <Toolbar sx={{ width: '100%', px: { xs: 1.5, md: 2 }, minHeight: { xs: 64, md: 72 }, gap: { xs: 0.5, md: 1 } }}>
        {/* Mobile menu toggle */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo */}
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', minWidth: 0 }}>
          <MenuBookIcon sx={{ fontSize: 32, color: theme.palette.primary.contrastText, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.01em',
              maxWidth: { xs: '55vw', md: '40vw', lg: '30vw' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: { xs: '0.95rem', md: '1.05rem', lg: '1.15rem' },
              color: theme.palette.primary.contrastText
            }}
          >
            {(window.__SITE_TITLE__) || 'Dream Books Gallery'}
          </Typography>
        </Box>

        {/* Scrolling New Books Text */}
        <Box
          sx={{
            flexGrow: 1,
            display: { xs: 'none', lg: 'flex' },
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            position: 'relative',
            height: '30px',
          }}
        >
          <Typography
            component="div"
            sx={{
              animation: 'scroll-left 20s linear infinite',
              '@keyframes scroll-left': {
                '0%': { transform: 'translateX(100%)' },
                '100%': { transform: 'translateX(-100%)' },
              },
              fontSize: '0.9rem',
              fontWeight: 500,
              color: theme.palette.primary.contrastText,
              opacity: 0.9,
            }}
          >
            ✨ New Books Added Weekly! Explore Our Latest Collection ✨
          </Typography>
        </Box>

        {/* Navigation Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
          <Tooltip title="Home">
            <IconButton
              component={Link}
              to="/"
              sx={{
                color: theme.palette.primary.contrastText,
                transition: 'transform 0.3s ease',
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <HomeRoundedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="All Books">
            <IconButton
              component={Link}
              to="/books"
              sx={{
                color: theme.palette.primary.contrastText,
                transition: 'transform 0.3s ease',
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <LibraryBooksRoundedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="About Us">
            <IconButton
              component={Link}
              to="/about"
              sx={{
                color: theme.palette.primary.contrastText,
                transition: 'transform 0.3s ease',
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <InfoRoundedIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Theme Demo">
            <IconButton
              component={Link}
              to="/theme-demo"
              sx={{
                color: theme.palette.primary.contrastText,
                transition: 'transform 0.3s ease',
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <Palette />
            </IconButton>
          </Tooltip>

          {/* Theme Toggle Button */}
          <Tooltip title={getThemeTooltip()}>
            <IconButton
              onClick={handleThemeToggle}
              sx={{
                color: theme.palette.primary.contrastText,
                transition: 'transform 0.3s ease',
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              {getThemeIcon()}
            </IconButton>
          </Tooltip>

          {isAuthenticated ? (
            <>
              <IconButton 
                color="inherit" 
                onClick={() => navigate('/cart')} 
                aria-label="Cart" 
                sx={{ 
                  mx: 0.25,
                  transition: 'transform 0.3s ease',
                  '&:hover': { 
                    transform: 'scaleX(-1)'
                  }
                }}
              >
                <Badge badgeContent={totalItems} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>

              {/* Notification Bell */}
              <NotificationBell />

              <IconButton 
                color="inherit" 
                component={Link} 
                to="/profile" 
                aria-label="My Account" 
                sx={{ 
                  mx: 0.25,
                  transition: 'transform 0.3s ease',
                  '&:hover': { 
                    transform: 'scaleX(-1)'
                  }
                }}
              >
                <UserIcon />
              </IconButton>

              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 9999,
                  px: { xs: 1.5, md: 2 },
                  fontSize: { xs: '0.85rem', md: '0.9rem', lg: '1rem' },
                  color: '#1976d2',
                  transition: 'transform 0.3s ease',
                  '&:hover': { 
                    backgroundColor: '#FFEBEE',
                    transform: 'scaleX(-1)'
                  }
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Tooltip title="Login">
                <IconButton
                  component={Link}
                  to="/login"
                  sx={{
                    color: '#1976d2',
                    transition: 'transform 0.3s ease',
                    '&:hover': { 
                      backgroundColor: '#E8F5E9',
                      transform: 'scaleX(-1)'
                    }
                  }}
                >
                  <LoginRoundedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Register">
                <IconButton
                  component={Link}
                  to="/register"
                  sx={{
                    color: '#1976d2',
                    transition: 'transform 0.3s ease',
                    '&:hover': { 
                      backgroundColor: '#FFF3E0',
                      transform: 'scaleX(-1)'
                    }
                  }}
                >
                  <AppRegistrationRoundedIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;