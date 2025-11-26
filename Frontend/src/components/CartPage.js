import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  IconButton,
  Grid,
  Divider,
  CircularProgress,
  TextField,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { PromoService } from '../services/api';

const CartPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const {
    cartItems,
    totalItems,
    totalAmount,
    loading,
    error,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const { isAuthenticated } = useAuth();

  // Promo hooks must be declared before any early returns
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null); // {discount, discountedTotal, minimumPurchase, requiredMore}
  const [promoError, setPromoError] = useState('');
  const [applying, setApplying] = useState(false);

  const displaySubtotal = useMemo(() => (typeof totalAmount === 'number' ? totalAmount.toFixed(2) : '0.00'), [totalAmount]);
  const displayDiscount = useMemo(() => {
    if (!promoApplied?.discount) return '0.00';
    return Number(promoApplied.discount).toFixed(2);
  }, [promoApplied]);
  const displayTotalAmount = useMemo(() => {
    const base = typeof totalAmount === 'number' ? totalAmount : 0;
    const disc = promoApplied?.discount ? Number(promoApplied.discount) : 0;
    return (base - disc > 0 ? base - disc : 0).toFixed(2);
  }, [totalAmount, promoApplied]);

  const handleApplyPromo = async () => {
    setApplying(true);
    setPromoError('');
    setPromoApplied(null);
    try {
      if (!promoCode || !promoCode.trim()) {
        setPromoError('Enter a promo code');
        return;
      }
      // Pass the cart total to the promo validation
      const resp = await PromoService.applyPromo(promoCode.trim(), totalAmount);
      if (!resp.valid) {
        // If minimum not met, surface a friendly guidance message
        if (resp.message && resp.message.includes('minimum order amount')) {
          setPromoError(resp.message);
        } else {
          setPromoError(resp.message || 'Invalid promo code');
        }
        return;
      }
      setPromoApplied({
        discount: resp.discount,
        discountedTotal: resp.discountedTotal,
        minimumPurchase: resp.minimumPurchase,
        requiredMore: resp.requiredMore,
      });
    } catch (e) {
      console.error('Promo application error:', e);
      setPromoError('Failed to apply promo');
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveItem = (bookId) => {
    removeFromCart(bookId);
  };

  const handleUpdateQuantity = (bookId, newQuantity) => {
    updateCartItemQuantity(bookId, newQuantity);
  };

  const handleCheckout = () => {
    if (isAuthenticated) {
      // Persist promo for checkout
      try {
        if (promoApplied) {
          localStorage.setItem('promo.code', promoCode || '');
          localStorage.setItem('promo.discount', String(promoApplied.discount ?? 0));
        } else {
          localStorage.removeItem('promo.code');
          localStorage.removeItem('promo.discount');
        }
      } catch {}
      navigate('/payment', { state: { cartItems, cartTotal: totalAmount, promoCode: promoApplied ? (promoCode || '') : undefined, promoDiscount: promoApplied?.discount } });
    } else {
      navigate('/login', { state: { from: '/cart' } });
    }
  };

  // Display loading indicator
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Cart...</Typography>
      </Box>
    );
  }

  // Display error message
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Alert severity="error">{error.message || 'Failed to load cart.'}</Alert>
      </Box>
    );
  }

  // Display empty cart message
  if (!cartItems || cartItems.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
          Your cart is empty.
        </Typography>
        <Button variant="contained" component={Link} to="/books">
          Start Shopping
        </Button>
      </Box>
    );
  }

  // ⭐ IMPORTANT: Hooks are above early returns to satisfy react-hooks rules

  return (
    <Box sx={{
      py: 4,
      px: { xs: 2, md: 4 },
      minHeight: '80vh',
    }}>
      <Typography variant="h4" component="h1" align="center" sx={{ fontWeight: 'bold', mb: 4 }}>
        Your Shopping Cart
      </Typography>

      <Grid container spacing={4}>
        {/* Cart Items Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, backgroundColor: theme.palette.background.paper, borderRadius: 2 }}>
            <Stack spacing={3}>
              {cartItems.map(item => (
                <Box key={item.bookId}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: { xs: 2, md: 3 },
                      py: 2,
                      pr: 1,
                    }}
                  >
                    <Box
                      component="img"
                      src={item.bookImageUrl || 'https://placehold.co/100x150/1f2937/F3F4F6?text=No+Image'}
                      alt={item.bookTitle}
                      sx={{
                        width: 100,
                        height: 150,
                        objectFit: 'cover',
                        borderRadius: 1,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                        {item.bookTitle}
                      </Typography>
                      {item.authorNames && ( // Conditionally render author names if available
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          by {item.authorNames.join(', ')}
                        </Typography>
                      )}
                      {item.bookGenre && ( // Conditionally render genre if available
                         <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                           Genre: {item.bookGenre}
                         </Typography>
                      )}
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mt: 1 }}>
                        £{(item.bookPrice * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mr: 1, flexShrink: 0 }}>
                      <IconButton
                        onClick={() => handleUpdateQuantity(item.bookId, item.quantity - 1)}
                        aria-label="decrease quantity"
                        size="small"
                        color="primary"
                        sx={{ border: `1px solid ${theme.palette.primary.main}`, borderRadius: 1 }}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </IconButton>
                      <Typography variant="body1" sx={{ minWidth: '24px', textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        onClick={() => handleUpdateQuantity(item.bookId, item.quantity + 1)}
                        aria-label="increase quantity"
                        size="small"
                        color="primary"
                        sx={{ border: `1px solid ${theme.palette.primary.main}`, borderRadius: 1 }}
                      >
                        <Plus size={16} />
                      </IconButton>
                    </Stack>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveItem(item.bookId)}
                      aria-label="remove item"
                      sx={{ flexShrink: 0 }}
                    >
                      <Trash2 size={20} />
                    </IconButton>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                </Box>
              ))}
            </Stack>
            {cartItems.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Trash2 size={20} />}
                  onClick={clearCart}
                  sx={{ mt: 3 }}
                >
                  Clear Cart
                </Button>
            )}
          </Paper>
        </Grid>

        {/* Cart Summary Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, backgroundColor: theme.palette.background.paper, borderRadius: 2, position: 'sticky', top: theme.spacing(4) }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              Order Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {/* Promo code input */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
              <TextField
                size="small"
                label="Promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                fullWidth
              />
              <Button variant="outlined" onClick={handleApplyPromo} disabled={applying}>
                {applying ? 'Applying...' : 'Apply'}
              </Button>
            </Stack>
            {promoError && <Typography color="error" variant="caption" sx={{ mb: 1, display: 'block' }}>{promoError}</Typography>}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal ({totalItems} items)</Typography>
              <Typography sx={{ fontWeight: 'bold' }}>£{displaySubtotal}</Typography> {/* Use displaySubtotal */}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Shipping</Typography>
              <Typography sx={{ fontWeight: 'bold' }}>Free</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {promoApplied && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="success.main">Promo Discount</Typography>
                <Typography sx={{ fontWeight: 'bold', color: 'success.main' }}>-£{displayDiscount}</Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>£{displayTotalAmount}</Typography> {/* Use displayTotalAmount */}
            </Box>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={cartItems.length === 0 || loading}
              onClick={handleCheckout}
              sx={{ py: 1.5, borderRadius: theme.shape.borderRadius }}
            >
              Proceed to Checkout
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CartPage;