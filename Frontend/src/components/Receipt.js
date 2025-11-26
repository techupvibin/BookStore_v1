import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Box, Button, List, ListItem, ListItemText } from '@mui/material';

const Receipt = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
            No order details found.
          </Typography>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button variant="contained" onClick={() => navigate('/books')}>
              Back to Store
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={5} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Order Placed Successfully!
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary">
          Thank you for your purchase.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Order Details:</Typography>
          <List>
            <ListItem disablePadding>
              <ListItemText primary={`Order Number: ${order.orderNumber}`} />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText primary={`Total Amount: £${order.totalAmount.toFixed(2)}`} />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText primary={`Payment Method: ${order.paymentMethod}`} />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText primary={`Shipping Address: ${order.shippingAddress}`} />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText primary="Items:" />
            </ListItem>
            {order.orderItems.map(item => (
              <ListItem key={item.book.id} sx={{ pl: 4 }}>
                <ListItemText primary={`- ${item.book.title} x ${item.quantity}`} />
              </ListItem>
            ))}
          </List>
        </Box>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button variant="contained" onClick={() => navigate('/books')}>
            Continue Shopping
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Receipt;