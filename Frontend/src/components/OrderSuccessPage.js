import React from 'react';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData; // Get order data passed from PaymentForm

  // You can optionally fetch the order details from your backend here
  // using orderData.id if it's available, for more robustness.
  // Example: useEffect(() => { if (orderId) { fetchOrderDetails(orderId); } }, [orderId]);

  return (
    <Box sx={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 4,
      bgcolor: 'background.default',
      fontFamily: 'Inter, sans-serif'
    }}>
      <Paper elevation={3} sx={{
        p: 6,
        borderRadius: 3,
        bgcolor: 'background.paper',
        maxWidth: 'sm',
        width: '100%',
        textAlign: 'center',
        border: '1px solid rgba(76, 175, 80, 0.3)' // Green border for success
      }}>
        <Typography variant="h1" sx={{ fontSize: '4rem', color: '#4caf50', mb: 3 }}>
          🎉
        </Typography>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
          Payment Successful!
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          Your order has been placed successfully. Thank you for your purchase!
          {orderData && (
            <Typography component="span" sx={{ display: 'block', mt: 1, fontWeight: 'bold' }}>
              Order Number: {orderData.orderNumber || 'N/A'}
            </Typography>
          )}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/order-history')} // Navigate to user's order history
            sx={{ borderRadius: 9999, py: 1.5, px: 4 }}
          >
            View My Orders
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => navigate('/books')} // Navigate back to the books page
            sx={{ borderRadius: 9999, py: 1.5, px: 4 }}
          >
            Continue Shopping
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OrderSuccessPage;
