import React, { useState, useEffect, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import {
  Button,
  CircularProgress,
  Alert,
  Box,
  Typography
} from '@mui/material';

// Stripe instance will be created inside PaymentForm using provided key

// Configure Axios instance with interceptors for JWT token
const api = axios.create({ baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
}, error => Promise.reject(error));

// Helper to stringify any error safely
const toMessage = (err) => {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err.message) return err.message;
  if (err.error) return typeof err.error === 'string' ? err.error : JSON.stringify(err.error);
  try { return JSON.stringify(err); } catch { return String(err); }
};

// CheckoutForm handles Stripe elements and payment confirmation
const CheckoutForm = ({ onPaymentSuccess, orderAmount, shippingAddress }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentSeverity, setPaymentSeverity] = useState('info');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    if (!shippingAddress || shippingAddress.trim() === '') {
        setErrorMessage('Please enter a shipping address.');
        return;
    }

    // ⭐ CRITICAL FIX: Ensure amount is positive before processing
    if (orderAmount <= 0) {
        setErrorMessage('Order total must be greater than zero to process payment.');
        setPaymentSeverity('error');
        setIsProcessing(false);
        return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setPaymentMessage(''); // Clear previous messages

    try {
        const { error: submitError } = await elements.submit();

        if (submitError) {
            setErrorMessage(toMessage(submitError));
            setIsProcessing(false);
            return;
        }

        // Confirm the payment with Stripe
        const { paymentIntent, error: confirmError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/order-processing`, // Temporary processing page
            },
            redirect: 'if_required' // Handle redirects if necessary
        });

        if (confirmError) {
            setErrorMessage(toMessage(confirmError));
            setPaymentSeverity('error');
            setPaymentMessage(toMessage(confirmError));
            setIsProcessing(false);
            return;
        }

        if (paymentIntent.status === 'succeeded') {
            // Payment succeeded on Stripe's side. Now, finalize the order on your backend.
            try {
                // Call backend endpoint for finalizing card payments
                const response = await api.post('/payment/checkout/card', {
                    paymentIntentId: paymentIntent.id,
                    shippingAddress: shippingAddress,
                    totalAmount: orderAmount, // Pass the actual total amount
                    paymentMethod: 'Credit Card', // Explicitly state payment method
                    promoCode: (localStorage.getItem('promo.code') || undefined)
                });

                onPaymentSuccess(response.data); // Notify parent of success with order data
            } catch (backendError) {
                console.error("Backend order finalization failed:", backendError);
                setErrorMessage('Payment confirmed, but failed to finalize order on server.');
                setPaymentSeverity('error');
                const backendMsg = backendError?.response?.data?.error || backendError?.response?.data?.message;
                setPaymentMessage(backendMsg ? toMessage(backendMsg) : 'Payment confirmed, but failed to finalize order. Please contact support.');
            }
        } else {
            // Handle other payment statuses (e.g., 'requires_action', 'processing')
            setErrorMessage(`Payment status: ${paymentIntent.status}`);
            setPaymentSeverity('warning');
            setPaymentMessage(`Payment is ${paymentIntent.status}. It might take a moment to finalize.`);
        }

    } catch (apiError) {
        console.error("Stripe API or network error:", apiError);
        setErrorMessage('An unexpected error occurred during payment. Please try again.');
        setPaymentSeverity('error');
        setPaymentMessage(toMessage(apiError));
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: 'tabs' }} />
      <Button
        variant="contained"
        color="primary"
        type="submit"
        fullWidth
        disabled={isProcessing || !stripe || !elements || !shippingAddress || shippingAddress.trim() === '' || orderAmount <= 0} // Disable if amount is zero or less
        sx={{ mt: 3, py: 1.5 }}
      >
        <span id="button-text">
          {isProcessing ? <CircularProgress size={24} color="inherit" /> : `Pay £${orderAmount?.toFixed(2) || '0.00'}`}
        </span>
      </Button>
      {paymentMessage && (
        <Alert severity={paymentSeverity} sx={{ mt: 2 }}>
          {paymentMessage}
        </Alert>
      )}
    </form>
  );
};

// PaymentForm wraps Stripe Elements
const PaymentForm = ({ orderAmount, shippingAddress, onPaymentSuccess, stripeApiKey }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [loadingClientSecret, setLoadingClientSecret] = useState(true);
  const [clientSecretError, setClientSecretError] = useState(null);

  // Use provided key first, then env; prevents empty key errors in local dev
  const stripePromise = useMemo(() => {
    const key = stripeApiKey || process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '';
    return key ? loadStripe(key) : null;
  }, [stripeApiKey]);

  useEffect(() => {
    const fetchClientSecret = async () => {
      setLoadingClientSecret(true);
      setClientSecretError(null);
      try {
        // Send orderAmount to backend to create payment intent
        const response = await api.post('/payment/create-payment-intent', {
            amount: Math.round(orderAmount * 100), // Stripe expects amount in cents
        });
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error("Error fetching client secret:", error);
        const msg = error?.response?.data?.error || error?.response?.data?.message || toMessage(error);
        setClientSecretError(msg);
      } finally {
        setLoadingClientSecret(false);
      }
    };

    // ⭐ IMPORTANT FIX: Only fetch client secret if orderAmount is valid and positive
    if (orderAmount > 0) {
        fetchClientSecret();
    } else {
        setLoadingClientSecret(false); // If amount is zero, stop loading and don't try to fetch
        setClientSecretError('Cannot process payment for an empty or zero-total order.'); // Display clear error
    }
  }, [orderAmount, shippingAddress]); // Depend on orderAmount and shippingAddress

  const appearance = { theme: 'stripe' };
  const options = {
    clientSecret,
    appearance,
  };

  if (loadingClientSecret) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Initializing payment...</Typography>
      </Box>
    );
  }

  if (clientSecretError) {
    return <Alert severity="error">{clientSecretError}</Alert>;
  }

  // Only render Elements and CheckoutForm if clientSecret is available
  return (
    <div>
      {clientSecret ? (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm
            onPaymentSuccess={onPaymentSuccess}
            orderAmount={orderAmount}
            shippingAddress={shippingAddress}
          />
        </Elements>
      ) : (
        // Display a more informative message if clientSecret is not available due to zero total
        <Alert severity="warning">
          Payment is not available for an empty or zero-total order. Please ensure your cart has items.
        </Alert>
      )}
    </div>
  );
};

export default PaymentForm;

