import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Create a context for the user's order history
const OrdersContext = createContext(null);

const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api'}/orders`;

// Configure a reusable Axios instance for API calls
const api = axios.create({ baseURL: API_BASE_URL });

// Add a request interceptor to attach the JWT token to every request
api.interceptors.request.use(config => {
    // Support Remember Me (localStorage) and session-only tokens
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));


export const OrdersProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [orderHistory, setOrderHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // This function fetches the order history from the backend
    const fetchOrders = useCallback(async () => {
        // Only attempt to fetch if the user is logged in
        if (!isAuthenticated) {
            setOrderHistory([]); // Clear state if user logs out
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // ⭐ This is the crucial API call to the backend
            const response = await api.get('');
            setOrderHistory(response.data || []);
        } catch (err) {
            console.error("Failed to fetch order history:", err);
            setError(err);
            setOrderHistory([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // The useEffect hook calls fetchOrders when the component first mounts
    // or when the authentication state changes.
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // The value provided to the consumers of the context
    const value = {
        orderHistory,
        loading,
        error,
        fetchOrders, // We expose this so other components can manually refresh the list
    };

    return (
        <OrdersContext.Provider value={value}>
            {children}
        </OrdersContext.Provider>
    );
};

// Custom hook to use the orders context
export const useOrders = () => {
    const context = useContext(OrdersContext);
    if (!context) {
        throw new Error('useOrders must be used within an OrdersProvider');
    }
    return context;
};

export default OrdersProvider;