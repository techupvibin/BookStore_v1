import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'; // Added useMemo
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const getCart = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      setCart(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError(err);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      getCart();
    }
  }, [authLoading, getCart]);

  const addToCart = useCallback(async (bookId, quantity = 1) => {
    if (!isAuthenticated) {
      showSnackbar('Please log in to add items to your cart.', 'warning');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/cart/add', { bookId, quantity });
      setCart(response.data);
      showSnackbar('Item added to cart!', 'success');
    } catch (err) {
      console.error('Failed to add item to cart:', err);
      setError(err);
      showSnackbar(err.response?.data?.message || 'Failed to add item to cart.', 'error');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, showSnackbar]);

  const buyNow = useCallback(async (bookId, quantity = 1) => {
    if (!isAuthenticated) {
      showSnackbar('Please log in to proceed with your purchase.', 'warning');
      return;
    }
    try {
      await addToCart(bookId, quantity);
      showSnackbar('Redirecting to checkout...', 'success');
      setTimeout(() => navigate('/payment'), 1000); // 1-second delay for snackbar
    } catch (err) {
      console.error('Failed to process "Buy Now":', err);
      showSnackbar(err.message || 'Failed to process purchase.', 'error');
    }
  }, [isAuthenticated, addToCart, navigate, showSnackbar]);

  const updateCartItemQuantity = useCallback(async (bookId, newQuantity) => {
    try {
      const response = await api.put(`/cart/update`, { bookId, quantity: newQuantity });
      setCart(response.data);
      showSnackbar('Cart updated successfully!', 'success');
    } catch (err) {
      console.error('Failed to update cart quantity:', err);
      showSnackbar('Failed to update cart.', 'error');
    }
  }, [showSnackbar]);

  const removeFromCart = useCallback(async (bookId) => {
    try {
      const response = await api.delete(`/cart/remove/${bookId}`);
      setCart(response.data);
      showSnackbar('Item removed from cart!', 'success');
    } catch (err) {
      console.error('Failed to remove item from cart:', err);
      showSnackbar('Failed to remove item.', 'error');
    }
  }, [showSnackbar]);

  const clearCart = useCallback(async () => {
    try {
      const response = await api.delete('/cart/clear');
      setCart(response.data);
      showSnackbar('Cart has been cleared!', 'success');
    } catch (err) {
      console.error('Failed to clear cart:', err);
      showSnackbar('Failed to clear cart.', 'error');
    }
  }, [showSnackbar]);

  const cartItems = useMemo(() => cart?.cartItems || [], [cart]);

  // ⭐ FIX: Calculate total amount based on current cart items
  const totalAmount = useMemo(() => {
    if (!cartItems || cartItems.length === 0) {
      return 0;
    }
    return cartItems.reduce((total, item) => total + (item.bookPrice * item.quantity), 0);
  }, [cartItems]);

  const totalItems = useMemo(() => {
    if (!cartItems || cartItems.length === 0) {
      return 0;
    }
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const contextValue = {
    cartItems,
    addToCart,
    buyNow,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    loading,
    error,
    getCart, // ⭐ FIX: Expose getCart
    totalAmount, // ⭐ FIX: Expose calculated totalAmount
    totalItems, // ⭐ FIX: Expose calculated totalItems
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </CartContext.Provider>
  );
};