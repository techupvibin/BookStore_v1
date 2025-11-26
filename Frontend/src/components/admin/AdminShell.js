import React, { useContext } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Book,
  Category,
  People,
  ShoppingCart,
  Payment,
  Settings,
  Support,
  LocalOffer,
  AccountCircle,
  Logout,
  LightMode,
  DarkMode,
  BrightnessAuto,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../AppThemeProvider';

const drawerWidth = 280;

const AdminShell = ({ children, title, menuItems, selectedKey, onSelect }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { appearance, setAppearance } = useContext(ThemeContext);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Handle logout logic here
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
        return <DarkMode />;
      case 'dark':
        return <LightMode />;
      default:
        return <BrightnessAuto />;
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

  const getIcon = (key) => {
    const iconMap = {
      dashboard: <Dashboard />,
      books: <Book />,
      categories: <Category />,
      users: <People />,
      orders: <ShoppingCart />,
      payments: <Payment />,
      settings: <Settings />,
      support: <Support />,
      promos: <LocalOffer />,
    };
    return iconMap[key] || <Dashboard />;
  };

  const drawer = (
    <Box sx={{ 
      height: '100%',
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary
    }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          noWrap 
          component="div"
          sx={{ 
            color: theme.palette.text.primary,
            fontWeight: 600
          }}
        >
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: theme.palette.divider }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton
              selected={selectedKey === item.key}
              onClick={() => onSelect(item.key)}
              sx={{
                borderRadius: 1,
                mx: 1,
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
                color: selectedKey === item.key 
                  ? theme.palette.primary.contrastText 
                  : theme.palette.text.secondary 
              }}>
                {getIcon(item.key)}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                sx={{ 
                  color: selectedKey === item.key 
                    ? theme.palette.primary.contrastText 
                    : theme.palette.text.primary 
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex',
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh'
    }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 2px 8px rgba(0,0,0,0.3)' 
            : '0 2px 8px rgba(0,0,0,0.1)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              color: theme.palette.text.primary
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              color: theme.palette.text.primary,
              fontWeight: 600
            }}
          >
            {title}
          </Typography>
          
          {/* Theme Toggle Button */}
          <Tooltip title={getThemeTooltip()}>
            <IconButton
              size="large"
              edge="end"
              aria-label="toggle theme"
              onClick={handleThemeToggle}
              sx={{ 
                color: theme.palette.text.primary,
                mr: 1,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                }
              }}
            >
              {getThemeIcon()}
            </IconButton>
          </Tooltip>
          
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            sx={{ color: theme.palette.text.primary }}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              sx: {
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 4px 20px rgba(0,0,0,0.5)' 
                  : '0 4px 20px rgba(0,0,0,0.15)',
              }
            }}
          >
            <MenuItem 
              onClick={() => navigate('/admin/profile')}
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                }
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.text.secondary }}>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem 
              onClick={handleLogout}
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                }
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.text.secondary }}>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: theme.palette.background.paper,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: theme.palette.background.paper,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 2.5, md: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default AdminShell;
