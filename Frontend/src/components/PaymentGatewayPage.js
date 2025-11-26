import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Grid,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CreditCard, Wallet, Truck } from 'lucide-react';

import PaymentForm from './PaymentForm';
import GooglePayButton from './GooglePayButton';
import { useCart } from '../contexts/CartContext'; // Import useCart
import { useOrders } from '../contexts/OrdersContext'; // Import useOrders

// Configure Axios instance for API calls
const api = axios.create({ baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api' });

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
}, error => Promise.reject(error));

const PaymentGatewayPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // ⭐ REVISION: Directly use cart data from useCart hook as the source of truth
  const { cartItems, totalAmount, loading: cartLoading, error: cartError, clearCart, getCart } = useCart();
  const { fetchOrders } = useOrders();

  const [paymentMode, setPaymentMode] = useState('card');
  const [promoCode, setPromoCode] = useState(() => {
    try { return localStorage.getItem('promo.code') || ''; } catch { return ''; }
  });
  const [shippingAddress, setShippingAddress] = useState('');
  const [loadingPayment, setLoadingPayment] = useState(false); // Separate loading state for payment actions
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  // Use the totalAmount directly from the cart context as the orderTotal
  // This ensures consistency and prevents stale data from location.state
  const orderTotal = totalAmount;

  // Effect to handle initial cart loading state and empty cart message
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0 && orderTotal <= 0) {
        setMessage('Your cart is empty. Please add items before proceeding to payment.');
        setMessageType('warning');
    } else if (!cartLoading && orderTotal > 0) {
        // Clear message if cart is no longer empty and valid
        setMessage('');
    }
  }, [cartLoading, cartItems, orderTotal]); // Dependencies to re-run when cart state changes

  const handleCODPayment = async () => {
    setLoadingPayment(true);
    setMessage('');
    setMessageType('info');

    // Rely on orderTotal which comes from cart context
    if (orderTotal <= 0) {
      setMessage('Your cart is empty or total is zero. Please add valid items before placing an order.');
      setMessageType('error');
      setLoadingPayment(false);
      return;
    }

    if (!shippingAddress || shippingAddress.trim() === '') {
      setMessage('Please enter a shipping address for Cash on Delivery.');
      setMessageType('error');
      setLoadingPayment(false);
      return;
    }

    try {
      // ⭐ REVISION: Use the specific backend endpoint for COD
      const response = await api.post('/payment/checkout/cod', {
        shippingAddress: shippingAddress,
        totalAmount: orderTotal, // Pass the correct total amount
        // Backend will fetch actual cart items, no need to send `items` from frontend
      });

      const newOrder = response.data;
      setMessage('Order placed successfully with Cash on Delivery!');
      setMessageType('success');

      await clearCart(); // Clear cart on successful order
      await fetchOrders(); // Refresh order history

      navigate('/receipt', { state: { order: newOrder } });

    } catch (error) {
      console.error("COD payment failed:", error);
      setMessage(error.response?.data?.message || 'Failed to place COD order. Please try again.');
      setMessageType('error');
    } finally {
      setLoadingPayment(false);
    }
  };


  const handleGooglePayPayment = async () => {
    setLoadingPayment(true);
    setMessage('');
    setMessageType('info');

    // Rely on orderTotal
    if (orderTotal <= 0) {
      setMessage('Your cart is empty or total is zero. Please add valid items before placing an order.');
      setMessageType('error');
      setLoadingPayment(false);
      return;
    }

    if (!shippingAddress || shippingAddress.trim() === '') {
      setMessage('Please enter a shipping address for Google Pay.');
      setMessageType('error');
      setLoadingPayment(false);
      return;
    }

    try {
      console.log('Initiating Google Pay payment...');
      const mockPaymentToken = "google-pay-token-12345"; // This should eventually come from a real Google Pay integration

      // ⭐ REVISION: Use the specific backend endpoint for Google Pay (assuming it exists)
      const response = await api.post('/payment/checkout/google-pay', { // Assuming this endpoint exists
        shippingAddress: shippingAddress,
        paymentMethod: 'Google Pay',
        totalAmount: orderTotal,
        paymentToken: mockPaymentToken, // Placeholder for actual payment token
      });

      const newOrder = response.data;
      setMessage('Order placed successfully with Google Pay!');
      setMessageType('success');

      await clearCart();
      await fetchOrders();

      navigate('/receipt', { state: { order: newOrder } });

    } catch (error) {
      console.error("Google Pay payment failed:", error);
      setMessage(error.response?.data?.message || 'Failed to place Google Pay order. Please try again.');
      setMessageType('error');
    } finally {
      setLoadingPayment(false);
    }
  };

  const handlePaymentSuccess = async (orderData) => {
    setMessage(`Order placed successfully! Order No: ${orderData.id}`);
    setMessageType('success');

    await clearCart(); // Clear cart after successful payment
    await fetchOrders(); // Refresh order history

    navigate('/receipt', { state: { order: orderData } });
  };


  // Display loading indicator while cart is loading
  if (cartLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6">Loading order details...</Typography>
      </Box>
    );
  }

  // Display cart error if any
  if (cartError) {
      return (
          <Container maxWidth="sm" sx={{ mt: 8 }}>
              <Alert severity="error">
                  Error loading cart: {cartError.message || 'Please try again.'}
              </Alert>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button variant="contained" onClick={getCart}> {/* Call getCart to retry */}
                      Retry Loading Cart
                  </Button>
              </Box>
          </Container>
      );
  }

  // ⭐ REVISION: Display empty cart message if totalAmount is 0 after loading
  if (orderTotal <= 0 && cartItems.length === 0 && !cartLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="warning">
          Your cart is empty. Please add items to your cart before proceeding to payment.
        </Alert>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" component={Link} to="/books">
            Continue Shopping
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper elevation={5} sx={{ p: { xs: 3, md: 6 }, borderRadius: 2, backgroundColor: theme.palette.background.paper }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
          Payment Gateway
        </Typography>
        <Typography variant="h6" align="center" sx={{ mb: 4 }}>
          Total: £{orderTotal.toFixed(2)} {/* Use £ for GBP */}
        </Typography>

        {message && <Alert severity={messageType} sx={{ mb: 3 }}>{message}</Alert>}

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'semibold', color: 'text.primary' }}>
              Shipping Information
            </Typography>
            <TextField
              label="Full Shipping Address"
              multiline
              rows={4}
              variant="outlined"
              fullWidth
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: 'primary.main' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                },
                '& .MuiInputLabel-root': { color: 'text.secondary' },
                '& .MuiInputBase-input': { color: 'text.primary' },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'semibold', color: 'text.primary', mt: 2 }}>
              Select Payment Method
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" sx={{ mb: 4 }}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  border: paymentMode === 'card' ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                  flexGrow: 1,
                  textAlign: 'center',
                  '&:hover': { borderColor: theme.palette.primary.light },
                }}
                onClick={() => setPaymentMode('card')}
              >
                <CreditCard size={48} color={theme.palette.primary.main} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>Credit/Debit Card</Typography>
              </Paper>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  border: paymentMode === 'googlePay' ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                  flexGrow: 1,
                  textAlign: 'center',
                  '&:hover': { borderColor: theme.palette.primary.light },
                }}
                onClick={() => setPaymentMode('googlePay')}
              >
                <Wallet size={48} color={theme.palette.primary.main} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>Google Pay</Typography>
              </Paper>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  border: paymentMode === 'cod' ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                  flexGrow: 1,
                  textAlign: 'center',
                  '&:hover': { borderColor: theme.palette.primary.light },
                }}
                onClick={() => setPaymentMode('cod')}
              >
                <Truck size={48} color={theme.palette.primary.main} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>Cash on Delivery</Typography>
              </Paper>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            {paymentMode === 'card' ? (
              <>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="overline" color="text.secondary">Enter Card Details</Typography>
                </Divider>
                <PaymentForm
                  orderAmount={orderTotal}
                  shippingAddress={shippingAddress}
                  onPaymentSuccess={handlePaymentSuccess}
                  stripeApiKey={process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY}
                />
              </>
            ) : paymentMode === 'googlePay' ? (
              <>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="overline" color="text.secondary">Confirm Google Pay</Typography>
                </Divider>
                <GooglePayButton
                  orderAmount={orderTotal}
                  shippingAddress={shippingAddress}
                  onPaymentSuccess={handlePaymentSuccess}
                  stripeApiKey={process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY}
                />
              </>
            ) : paymentMode === 'cod' ? (
              <>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="overline" color="text.secondary">Confirm Cash on Delivery</Typography>
                </Divider>
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={loadingPayment || orderTotal <= 0} // Disable if amount is zero
                  onClick={handleCODPayment}
                  sx={{ py: 1.5 }}
                >
                  {loadingPayment ? <CircularProgress size={24} /> : 'Place COD Order'}
                </Button>
              </>
            ) : null}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PaymentGatewayPage;