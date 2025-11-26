import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert, Button, Select, MenuItem,
  FormControl, InputLabel, Snackbar, TablePagination
} from '@mui/material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// -------------------------------------------------------------------------
// --- API Service for Orders (Using Axios) ---
// -------------------------------------------------------------------------
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

const orderService = {
  fetchAllOrders: () => api.get('/admin/orders'),
  updateOrderStatus: (orderId, newStatus) => api.put(`/admin/orders/${orderId}/status`, { newStatus: newStatus }),
  fetchOrderDetails: (orderId) => api.get(`/admin/orders/${orderId}`),
  // ⭐ NEW: Method to fetch all orders for dashboard metrics.
  // This is a simplified approach, in a larger app you would use a dedicated backend endpoint for these stats.
  fetchDashboardStats: () => api.get('/admin/orders'),
  // ⭐ NEW: Send invoice email to user
  sendInvoice: (orderId) => api.post(`/admin/orders/${orderId}/send-invoice`),
};

// -------------------------------------------------------------------------
// --- Main AdminOrdersManagementPage Component ---
// -------------------------------------------------------------------------
const AdminOrdersManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();
  const navigate = useNavigate();

  const ORDER_STATUSES = [
    "NEW_ORDER", "PROCESSING", "PACKED", "DISPATCHED",
    "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELED"
  ];

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.fetchAllOrders();
      setOrders(response.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      const errorMessage = err.response?.status === 403
        ? "Access Denied: You don't have permission to view orders."
        : err.response?.data?.message || err.message || "Failed to load orders. Please check backend connection.";
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onStatusChange = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, orderStatus: newStatus } : order
      )
    );
  };

  const handleSaveStatus = async (orderId) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) {
      showSnackbar(`Order with ID ${orderId} not found in local state.`, 'error');
      return;
    }

    setLoading(true);
    try {
      await orderService.updateOrderStatus(orderId, orderToUpdate.orderStatus);
      
      // Enhanced success message with notification info
      const statusMessage = getStatusDisplayName(orderToUpdate.orderStatus);
      showSnackbar(
        `Order ${orderId} status updated to "${statusMessage}"! The customer has been notified.`, 
        'success'
      );
      setError(null);
    } catch (err) {
      console.error("Error saving order status:", err);
      let errorMessage = "Failed to save order status.";
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = `Invalid status or request for Order ${orderId}.`;
        } else if (err.response.status === 403) {
          errorMessage = "Access Denied: You don't have permission to update order status.";
        } else if (err.response.status === 404) {
          errorMessage = `Order ${orderId} or status update endpoint not found.`;
        } else if (err.response.status === 500) {
          errorMessage = "Server Error: Failed to save status due to an internal issue.";
        } else {
          errorMessage = err.response.data?.message || err.message || errorMessage;
        }
      }
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get user-friendly status display names
  const getStatusDisplayName = (status) => {
    const statusMap = {
      'NEW_ORDER': 'New Order',
      'PROCESSING': 'Processing',
      'PACKED': 'Packed',
      'DISPATCHED': 'Dispatched',
      'IN_TRANSIT': 'In Transit',
      'OUT_FOR_DELIVERY': 'Out for Delivery',
      'DELIVERED': 'Delivered',
      'CANCELED': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const handleViewDetails = (orderId) => {
    navigate(`/admin/order-details/${orderId}`);
  };

  const handleSendInvoice = async (orderId) => {
    setLoading(true);
    try {
      const response = await orderService.sendInvoice(orderId);
      console.log('Send invoice response:', response);
      
      if (response.data && response.data.message) {
        showSnackbar(response.data.message, 'success');
      } else {
        showSnackbar(`Invoice sent for order ${orderId}.`, 'success');
      }
    } catch (err) {
      console.error('Send invoice failed', err);
      
      let errorMessage = 'Failed to send invoice.';
      
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = err.response.data?.error || 'Bad request: Invalid order data';
        } else if (err.response.status === 404) {
          errorMessage = 'Order not found';
        } else if (err.response.status === 500) {
          errorMessage = err.response.data?.error || 'Server error: Failed to process invoice';
        } else {
          errorMessage = err.response.data?.error || `Error ${err.response.status}: ${err.response.statusText}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading orders...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={fetchOrders} variant="contained" sx={{ mt: 2 }}>
          Retry Loading Orders
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 2.5 }, bgcolor: 'background.default', minHeight: 'calc(100vh - 64px - 24px)' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2.5 }}>
        Orders Management
      </Typography>

      {orders.length === 0 ? (
        <Alert severity="info">No orders found.</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, bgcolor: 'background.paper', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 1200 }} aria-label="orders table">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Order ID</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Order Number</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>User</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Total Amount</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Order Date</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => (
                <TableRow
                  key={order.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:nth-of-type(odd)': { bgcolor: theme.palette.background.default } }}
                >
                  <TableCell component="th" scope="row" sx={{ color: 'text.primary', py: 1.5 }}>
                    {order.id}
                  </TableCell>
                  <TableCell sx={{ color: 'text.primary', py: 1.5 }}>{order.orderNumber || 'N/A'}</TableCell>
                  <TableCell sx={{ color: 'text.primary', py: 1.5 }}>{order.user?.username || 'N/A'}</TableCell>
                  <TableCell sx={{ color: 'text.primary', py: 1.5 }}>
                    ${(typeof order.totalAmount === 'number' ? order.totalAmount : 0).toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: 'text.primary', py: 1.5 }}>
                    {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 140 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={order.orderStatus && ORDER_STATUSES.includes(order.orderStatus) ? order.orderStatus : ''}
                        label="Status"
                        onChange={(e) => onStatusChange(order.id, e.target.value)}
                        sx={{ color: 'text.primary' }}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <MenuItem key={status} value={status}>
                            {getStatusDisplayName(status)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleSaveStatus(order.id)}
                      sx={{ mr: 1, px: 1.5, py: 0.5 }}
                    >
                      Save Status
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewDetails(order.id)}
                      sx={{ mr: 1, px: 1.5, py: 0.5 }}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleSendInvoice(order.id)}
                      sx={{ px: 1.5, py: 0.5 }}
                    >
                      Send Invoice
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={orders.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </TableContainer>
      )}

      <Snackbar
        open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminOrdersManagementPage;