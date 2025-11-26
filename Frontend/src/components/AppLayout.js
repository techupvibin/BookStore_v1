import React from 'react';
import {
  // AppBar, Toolbar, Button, IconButton, removed as Navigation handles this
  Box,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography, // ⭐ Re-added Typography here
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, LogOut, User, Menu } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import Footer from './Footer';
import Navigation from './Navigation';

const AppLayout = ({ children, fullBleed = false }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Define navigation items for the mobile drawer
  const drawerNavItems = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'All Books', path: '/books' },
  ];

  if (isAdmin) {
    drawerNavItems.push({ name: 'Admin Profile', path: '/admin-profile' });
    drawerNavItems.push({ name: 'Manage Books', path: '/admin/books' });
    drawerNavItems.push({ name: 'Manage Categories', path: '/admin/categories' });
    // Add more admin specific routes as needed
  } else if (isAuthenticated) {
    drawerNavItems.push({ name: 'Profile', path: '/profile' });
    drawerNavItems.push({ name: 'My Orders', path: '/order-history' });
    drawerNavItems.push({ name: 'Cart', path: '/cart' });
    // Add more user specific routes as needed
  }

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        BookStore
      </Typography>
      <List>
        {drawerNavItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton sx={{ textAlign: 'center' }} onClick={() => navigate(item.path)}>
              {/* You can add icons here for better UX if desired */}
              {/* <ListItemIcon> { getIconForItem(item.name) } </ListItemIcon> */}
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
        {isAuthenticated && (
          <ListItem disablePadding>
            <ListItemButton onClick={logout}>
              <ListItemIcon><LogOut /></ListItemIcon> {/* Example icon */}
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        )}
        {!isAuthenticated && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/login')}>
              <ListItemIcon><User /></ListItemIcon> {/* Example icon */}
              <ListItemText primary="Login" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      {/* ⭐ Render the Navigation component as the AppBar */}
      <Navigation onDrawerToggle={handleDrawerToggle} />

      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240, backgroundColor: theme.palette.background.paper },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      {fullBleed ? (
        <Box sx={{ flexGrow: 1, px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
      ) : (
        <Container maxWidth="lg" sx={{ flexGrow: 1, my: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
          {children}
        </Container>
      )}
      <Footer />
    </Box>
  );
};

export default AppLayout;
