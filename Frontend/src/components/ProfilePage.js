import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Drawer,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { User, Heart, Clock, Settings, LogOut, Menu as MenuIcon } from 'lucide-react';
import NotificationsIcon from '@mui/icons-material/Notifications'; // Correct import for Bell icon
import { ThemeContext } from './AppThemeProvider';
import SettingsPage from './SettingsPage';
import OrderHistoryPage from './OrderHistoryPage';
import FavouritesPage from './FavouritesPage';
import NotificationsPage from './NotificationsPage';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const theme = useTheme();
  const { appearance } = useContext(ThemeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const { user: authUser } = useAuth();
  const [user, setUser] = useState({ username: '', email: '' });
  const [selectedSection, setSelectedSection] = useState('profile');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (authUser) setUser(authUser);
    else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    }
  }, [authUser]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSectionChange = (section) => {
    if (section === 'logout') {
      navigate('/logout');
    } else {
      setSelectedSection(section);
    }
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 'profile':
        return (
          <>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Your Profile
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" sx={{ mt: 1 }}>
              Username: <b>{user.username || '—'}</b>
            </Typography>
            {user.email && (
              <Typography variant="body1">Email: <b>{user.email}</b></Typography>
            )}
          </>
        );
      case 'favourites':
        return <FavouritesPage />;
      case 'order-history':
        return <OrderHistoryPage />;
      case 'settings':
        return <SettingsPage />;
      case 'notifications':
        return <NotificationsPage />;
      default:
        return null;
    }
  };

  // Theme-aware background colors
  const getBackgroundColor = () => {
    return theme.palette.mode === 'dark'
      ? 'rgba(15, 23, 42, 0.95)' // Dark slate with transparency
      : 'rgba(255, 255, 255, 0.95)'; // White with transparency
  };

  const getSidebarBackgroundColor = () => {
    return theme.palette.mode === 'dark'
      ? 'rgba(30, 41, 59, 0.95)' // Darker slate for sidebar
      : 'rgba(255, 255, 255, 0.95)'; // White for sidebar
  };

  const sidebarContent = (
    <Box sx={{
      p: 2,
      height: '100%',
      backgroundColor: getSidebarBackgroundColor(),
      borderRadius: 2,
      color: theme.palette.text.primary
    }}>
      {/* User Profile Info */}
      <Box sx={{ textAlign: 'center', p: 2 }}>
        <User
          size={64}
          style={{
            color: theme.palette.primary.main,
            marginBottom: '8px'
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: theme.palette.text.primary
          }}
        >
          {user.username || 'User'}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary
          }}
        >
          {user.email || 'email@example.com'}
        </Typography>
      </Box>
      <Divider sx={{ my: 2 }} />

      {/* Navigation List */}
      <List>
        {/* Profile */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleSectionChange('profile')}
            selected={selectedSection === 'profile'}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              },
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              }
            }}
          >
            <ListItemIcon sx={{
              color: selectedSection === 'profile'
                ? theme.palette.primary.contrastText
                : theme.palette.text.secondary
            }}>
              <User />
            </ListItemIcon>
            <ListItemText
              primary="Profile"
              sx={{
                color: selectedSection === 'profile'
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary
              }}
            />
          </ListItemButton>
        </ListItem>

        {/* Notifications */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleSectionChange('notifications')}
            selected={selectedSection === 'notifications'}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              },
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              }
            }}
          >
            <ListItemIcon sx={{
              color: selectedSection === 'notifications'
                ? theme.palette.primary.contrastText
                : theme.palette.text.secondary
            }}>
              <NotificationsIcon />
            </ListItemIcon>
            <ListItemText
              primary="Notifications"
              sx={{
                color: selectedSection === 'notifications'
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary
              }}
            />
          </ListItemButton>
        </ListItem>

        {/* Favourites */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleSectionChange('favourites')}
            selected={selectedSection === 'favourites'}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              },
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              }
            }}
          >
            <ListItemIcon sx={{
              color: selectedSection === 'favourites'
                ? theme.palette.primary.contrastText
                : theme.palette.text.secondary
            }}>
              <Heart />
            </ListItemIcon>
            <ListItemText
              primary="Favourites"
              sx={{
                color: selectedSection === 'favourites'
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary
              }}
            />
          </ListItemButton>
        </ListItem>

        {/* Order History */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleSectionChange('order-history')}
            selected={selectedSection === 'order-history'}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              },
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              }
            }}
          >
            <ListItemIcon sx={{
              color: selectedSection === 'order-history'
                ? theme.palette.primary.contrastText
                : theme.palette.text.secondary
            }}>
              <Clock />
            </ListItemIcon>
            <ListItemText
              primary="Order History"
              sx={{
                color: selectedSection === 'order-history'
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary
              }}
            />
          </ListItemButton>
        </ListItem>

        {/* Settings */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleSectionChange('settings')}
            selected={selectedSection === 'settings'}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              },
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              }
            }}
          >
            <ListItemIcon sx={{ 
              color: selectedSection === 'settings' 
                ? theme.palette.primary.contrastText 
                : theme.palette.text.secondary 
            }}>
              <Settings />
            </ListItemIcon>
            <ListItemText 
              primary="Settings" 
              sx={{ 
                color: selectedSection === 'settings' 
                  ? theme.palette.primary.contrastText 
                  : theme.palette.text.primary 
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      <Box sx={{ mt: 'auto', p: 2 }}>
        <ListItemButton 
          sx={{ 
            mt: 2, 
            borderRadius: 9999,
            color: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.light,
              color: theme.palette.error.contrastText,
            }
          }} 
          onClick={() => handleSectionChange('logout')}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <LogOut />
          </ListItemIcon>
          <ListItemText primary="Log Out" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: { xs: 0, md: 4 },
        backgroundImage: `url("https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          minHeight: '80vh',
          p: { xs: 2, md: 4 },
          width: '100%',
          maxWidth: '1400px',
          backgroundColor: getBackgroundColor(),
          backdropFilter: 'blur(5px)',
          borderRadius: 2,
        }}
      >
        {isMobile && (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ 
              position: 'fixed', 
              top: 16, 
              left: 16, 
              zIndex: theme.zIndex.drawer + 1, 
              display: { xs: 'block', md: 'none' },
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ 
            display: { xs: 'block', md: 'none' }, 
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 260,
              backgroundColor: getSidebarBackgroundColor(),
            } 
          }}
        >
          {sidebarContent}
        </Drawer>

        {/* Desktop Sidebar */}
        <Paper
          elevation={3}
          sx={{
            width: { xs: '100%', md: '250px' },
            flexShrink: 0,
            mr: { xs: 0, md: 4 },
            mb: { xs: 2, md: 0 },
            p: 0,
            backgroundColor: getSidebarBackgroundColor(),
            borderRadius: 2,
            display: { xs: 'none', md: 'block' }
          }}
        >
          {sidebarContent}
        </Paper>

        {/* Main Content Area */}
        <Paper
          elevation={3}
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 4 },
            backgroundColor: getBackgroundColor(),
            borderRadius: 2,
            color: theme.palette.text.primary,
          }}
        >
          {renderContent()}
        </Paper>
      </Box>
    </Box>
  );
};

export default ProfilePage;