import React, { useState, useEffect } from 'react';
import {
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';

const GooglePayButton = ({ amount, onSuccess, onError, disabled = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGooglePayAvailable, setIsGooglePayAvailable] = useState(false);

  useEffect(() => {
    // Check if Google Pay is available
    const checkGooglePayAvailability = () => {
      if (window.google && window.google.payments) {
        setIsGooglePayAvailable(true);
      } else {
        // For demo purposes, we'll assume it's available
        setIsGooglePayAvailable(true);
      }
    };

    checkGooglePayAvailability();
  }, []);

  const handleGooglePayClick = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate Google Pay payment process
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate 90% success rate
          if (Math.random() > 0.1) {
            resolve();
          } else {
            reject(new Error('Payment failed'));
          }
        }, 2000);
      });

      // Payment successful
      onSuccess && onSuccess({
        paymentMethod: 'google_pay',
        amount: amount,
        transactionId: `gpay_${Date.now()}`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setError(err.message || 'Google Pay payment failed');
      onError && onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isGooglePayAvailable) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        Google Pay is not available in your browser or region.
      </Alert>
    );
  }

  return (
    <Box>
      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={handleGooglePayClick}
        disabled={disabled || isLoading}
        startIcon={
          isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <GoogleIcon />
          )
        }
        sx={{
          backgroundColor: '#000',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#333',
          },
          '&:disabled': {
            backgroundColor: '#ccc',
            color: '#666',
          },
          py: 1.5,
          fontSize: '1.1rem',
          fontWeight: 'bold',
          textTransform: 'none',
          borderRadius: 2,
        }}
      >
        {isLoading ? 'Processing...' : `Pay with Google Pay - $${amount}`}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Secure payment powered by Google Pay
      </Typography>
    </Box>
  );
};

export default GooglePayButton;
