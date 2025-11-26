import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  IconButton,
  FormControl,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, LayoutDashboard, Book, Edit, Settings } from 'lucide-react';

// Mock data for admin orders, simulating a backend response
const mockAdminOrders = [
  {
    id: 1,
    books: [{ title: 'Ikigai', description: 'Even if we don\'t know it yet, Ikigai translates as a...', price: 392, quantity: 1 }],
    status: 'Out for delivery',
    mode: 'Card',
    date: '2024-05-20',
  },
  {
    id: 2,
    books: [{ title: 'How to Win Friends and Influence People', description: 'Do you feel stuck in life, not knowing how to make...', price: 233, quantity: 1 }],
    status: 'Order placed',
    mode: 'COD',
    date: '2024-05-18',
  },
  {
    id: 3,
    books: [{ title: 'Mandala Art', description: 'Mandalas are spiritual and ritual diagrams represe...', price: 190, quantity: 1 }],
    status: 'Delivered',
    mode: 'Card',
    date: '2024-05-15',
  },
  {
    id: 4,
    books: [{ title: 'The Tongue In Cheek', description: 'Tongue in Cheek is a rib-tickling ride and everyon...', price: 1008, quantity: 1 }],
    status: 'Canceled',
    mode: 'Card',
    date: '2024-05-10',
  },
];

// Helper component to style the status text based on its value
const StatusLabel = ({ status }) => {
  let color;
  switch (status) {
    case 'Order placed':
      color = '#f59e0b'; // Amber
      break;
    case 'Out for delivery':
      color = '#10b981'; // Green
      break;
    case 'Delivered':
      color = '#60a5fa'; // Blue
      break;
    case 'Canceled':
      color = '#ef4444'; // Red
      break;
    default:
      color = 'text.primary';
  }

  return (
    <Typography
      sx={{
        color: color,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontSize: '0.8rem',
      }}
    >
      {status}
    </Typography>
  );
};

const AdminProfilePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(mockAdminOrders);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', minHeight: '80vh', p: { xs: 2, md: 4 } }}>
      {/* Left Sidebar */}
      <Paper
        elevation={3}
        sx={{
          width: { xs: '100%', md: '250px' },
          flexShrink: 0,
          mr: { xs: 0, md: 4 },
          p: 2,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
        }}
      >
        {/* Admin Profile Info */}
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <User size={64} style={{ color: theme.palette.primary.main, marginBottom: '8px' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Admin</Typography>
          <Typography variant="body2" color="text.secondary">admin123@gmail.com</Typography>
        </Box>
        <Divider sx={{ my: 2 }} />

        {/* Navigation List */}
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/admin-profile')}>
              <ListItemIcon><LayoutDashboard /></ListItemIcon>
              <ListItemText primary="All Orders" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/add-book')}>
              <ListItemIcon><Book /></ListItemIcon>
              <ListItemText primary="Add Book" />
            </ListItemButton>
          </ListItem>
        </List>
        <Box sx={{ mt: 'auto', p: 2 }}>
          <ListItemButton sx={{ mt: 2, borderRadius: 9999 }} onClick={() => navigate('/logout')}>
            <ListItemIcon><LogOut /></ListItemIcon>
            <ListItemText primary="Log Out" />
          </ListItemButton>
        </Box>
      </Paper>

      {/* Main Content Area */}
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
          All Orders History
        </Typography>
        <Divider sx={{ my: 2 }} />
        {orders.length === 0 ? (
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mt: 4 }}>
            No orders found.
          </Typography>
        ) : (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sr.</TableCell>
                  <TableCell>Books</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order, index) => (
                  <TableRow key={order.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {order.books.map((book, bookIndex) => (
                        <Box key={bookIndex}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {book.title}
                          </Typography>
                        </Box>
                      ))}
                    </TableCell>
                    <TableCell>
                      {order.books.map((book, bookIndex) => (
                        <Typography key={bookIndex} variant="body2" color="text.secondary">
                          {book.description.substring(0, 50)}...
                        </Typography>
                      ))}
                    </TableCell>
                    <TableCell>
                      ₹{order.books.reduce((acc, book) => acc + book.price, 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <FormControl variant="outlined" sx={{ minWidth: 150 }}>
                        <Select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          displayEmpty
                          inputProps={{ 'aria-label': 'Without label' }}
                          sx={{
                            borderRadius: '9999px',
                            '& .MuiSelect-select': {
                                padding: '8px 16px',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                color: (theme) => {
                                  switch (order.status) {
                                    case 'Order placed': return '#f59e0b';
                                    case 'Out for delivery': return '#10b981';
                                    case 'Delivered': return '#60a5fa';
                                    case 'Canceled': return '#ef4444';
                                    default: return theme.palette.text.primary;
                                  }
                                },
                            },
                          }}
                        >
                          <MenuItem value="Order placed">
                            <StatusLabel status="Order placed" />
                          </MenuItem>
                          <MenuItem value="Out for delivery">
                            <StatusLabel status="Out for delivery" />
                          </MenuItem>
                          <MenuItem value="Delivered">
                            <StatusLabel status="Delivered" />
                          </MenuItem>
                          <MenuItem value="Canceled">
                            <StatusLabel status="Canceled" />
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <IconButton>
                        <Edit size={20} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default AdminProfilePage;
