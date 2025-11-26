import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Divider,
  Card,
  CardContent,
  CardActions,
  Button,
  Stack,
  Snackbar,
  Alert,
  TablePagination,
  useMediaQuery,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../contexts/OrdersContext';
import {
  Clock,
  X,
  Package,
  CreditCard,
  Calendar,
  ShoppingBag,
  Receipt,
  CheckCircle,
} from 'lucide-react';

// StatusLabel component with consistent styling and an additional 'Delivered' case
const StatusLabel = ({ status }) => {
  let color;
  let icon;

  switch (status) {
    case 'Order placed':
      color = '#f59e0b';
      icon = <Clock size={16} />;
      break;
    case 'Out for delivery':
      color = '#10b981';
      icon = <Package size={16} />;
      break;
    case 'Delivered':
      color = '#22c55e'; // Green for success
      icon = <CheckCircle size={16} />;
      break;
    case 'Canceled':
      color = '#ef4444';
      icon = <X size={16} />;
      break;
    default:
      color = '#6b7280'; // Gray for unknown status
      icon = <Clock size={16} />;
  }

  return (
    <Chip
      icon={icon}
      label={status}
      sx={{
        color: color,
        backgroundColor: `${color}15`,
        border: `1px solid ${color}`,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontSize: '0.8rem',
      }}
    />
  );
};

const OrderHistoryPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const { orderHistory, loading, fetchOrders } = useOrders();
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const rows = useMemo(
    () =>
      (orderHistory || []).map((o) => ({
        id: o.orderNumber || o.id,
        orderId: o.id,
        books: (o.books || []).map((b) => ({ book: b.bookTitle, quantity: b.quantity })),
        total: Number(o.totalAmount ?? 0),
        status: o.status,
        mode: o.paymentMethod,
        orderDate: (o.orderDate || '').toString().replace('T', ' ').slice(0, 19),
      })),
    [orderHistory]
  );

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [rows, page, rowsPerPage]);

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const next = parseInt(event.target.value, 10);
    setRowsPerPage(next);
    setPage(0);
  };

  const canCancel = (status) => {
    if (!status) return false;
    const s = String(status).toUpperCase();
    return s !== 'DELIVERED' && s !== 'CANCELED';
  };

  const handleCancel = async (orderId) => {
    try {
      const reason = window.prompt('Please provide a reason for cancellation (optional):') || '';
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error('Cancel failed');
      await fetchOrders();
      setToast({ open: true, message: 'Order canceled.', severity: 'success' });
    } catch (_) {
      setToast({ open: true, message: 'Failed to cancel order.', severity: 'error' });
    }
  };

  const handleInvoice = async (orderId, displayId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/orders/${orderId}/invoice`, {
        method: 'GET',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      if (!res.ok) throw new Error('Invoice download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${displayId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setToast({ open: true, message: 'Invoice downloaded.', severity: 'success' });
    } catch (_) {
      setToast({ open: true, message: 'Failed to download invoice.', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading orders...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
        Your Order History
      </Typography>
      <Divider sx={{ my: 3 }} />

      {rows.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <ShoppingBag size={64} color={theme.palette.text.secondary} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            You haven't placed any orders yet.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Start shopping to see your order history here!
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {pagedRows.map((order) => (
              <Grid item key={order.id} xs={12} sm={6} lg={4}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    boxShadow: theme.shadows[3],
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    {/* Order Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                        #{order.id}
                      </Typography>
                      <StatusLabel status={order.status} />
                    </Box>

                    {/* Order Details */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Calendar size={16} style={{ marginRight: '8px', color: theme.palette.text.secondary }} />
                        <Typography variant="body2" color="text.secondary">
                          {order.orderDate}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CreditCard size={16} style={{ marginRight: '8px', color: theme.palette.text.secondary }} />
                        <Typography variant="body2" color="text.secondary">
                          {order.mode}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Books Section */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.text.primary }}>
                        Books Ordered:
                      </Typography>
                      {order.books.map((book, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 0.5,
                            p: 1,
                            backgroundColor: theme.palette.mode === 'dark' 
                              ? theme.palette.grey[800] 
                              : theme.palette.grey[200],
                            borderRadius: 1,
                            border: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              flex: 1, 
                              mr: 1,
                              color: theme.palette.mode === 'dark' 
                                ? theme.palette.common.white 
                                : theme.palette.common.black,
                              fontWeight: 'medium'
                            }}
                          >
                            {book.book}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 'bold',
                              backgroundColor: 'primary.light',
                              color: 'primary.contrastText',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem'
                            }}
                          >
                            Qty: {book.quantity}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Total Price */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        backgroundColor: theme.palette.success.main, // Use success color for total
                        borderRadius: 1,
                        color: theme.palette.success.contrastText, // Ensure text is visible
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Total Amount:
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        £{order.total.toFixed(2)}
                      </Typography>
                    </Box>
                  </CardContent>

                  {/* Action Buttons */}
                  <CardActions sx={{ justifyContent: 'center', p: 2, pt: 0 }}>
                    <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Receipt size={16} />}
                        onClick={() => handleInvoice(order.orderId, order.id)}
                        sx={{
                          flex: 1,
                          borderRadius: 9999,
                          textTransform: 'none',
                          borderColor: theme.palette.primary.main,
                          color: theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: theme.palette.primary.main,
                            color: 'white',
                          },
                        }}
                      >
                        Invoice
                      </Button>
                      {canCancel(order.status) && (
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          startIcon={<X size={16} />}
                          onClick={() => handleCancel(order.orderId)}
                          sx={{
                            flex: 1,
                            borderRadius: 9999,
                            textTransform: 'none',
                            '&:hover': {
                              backgroundColor: theme.palette.error.dark,
                            },
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </Stack>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <TablePagination
              component="div"
              count={rows.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[4, 8, 12]}
              labelRowsPerPage="Orders per page"
            />
          </Box>
        </>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderHistoryPage;