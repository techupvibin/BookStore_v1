import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CheckCircle } from 'lucide-react';

const BillingReceiptPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // Retrieve the order details from the navigation state
  const { order } = location.state || {};

  // If there is no order data, show a message and a link to go back
  if (!order) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={5} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="text.secondary">
            No order details found.
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/books')}>
            Go to Books Page
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper elevation={5} sx={{ p: { xs: 3, md: 6 }, borderRadius: 2, backgroundColor: theme.palette.background.paper }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircle size={64} style={{ color: theme.palette.success.main, marginBottom: '16px' }} />
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Payment Successful!
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Your order has been placed successfully.
          </Typography>
        </Box>
        <Divider sx={{ my: 4 }} />

        {/* Order Details */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Order Summary</Typography>
          <List>
            {(order.books || order.orderItems || []).map((item, index) => {
              const title = item?.book?.title || item?.bookTitle || item?.book || 'Item';
              const qty = item?.quantity || 1;
              const price = Number(item?.priceAtPurchase ?? item?.price ?? 0);
              return (
                <ListItem key={index} disablePadding>
                  <ListItemText
                    primary={<Typography variant="body1">{title} (x{qty})</Typography>}
                    sx={{ py: 1 }}
                  />
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    £{(price * qty).toFixed(2)}
                  </Typography>
                </ListItem>
              );
            })}
          </List>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total:</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
              £{Number(order.totalAmount ?? order.total ?? 0).toFixed(2)}
            </Typography>
          </Box>
        </Box>

        {/* Payment and Shipping Details */}
        <Divider sx={{ my: 4 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Payment Details</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}><b>Order No:</b> {order.orderNumber || order.id}</Typography>
          <Typography variant="body1" sx={{ mt: 1 }}><b>Payment Method:</b> {order.paymentMethod || order.mode}</Typography>
          <Typography variant="body1" sx={{ mt: 1 }}><b>Status:</b> {order.status}</Typography>
          <Typography variant="body1" sx={{ mt: 1 }}><b>Date:</b> {order.orderDate}</Typography>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button variant="contained" size="large" onClick={() => navigate('/order-history')}>
            View Order History
          </Button>
          <Button variant="outlined" size="large" sx={{ ml: 2 }} onClick={() => navigate('/books')}>
            Continue Shopping
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default BillingReceiptPage;