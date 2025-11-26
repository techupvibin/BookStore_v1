import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert, TextField, Stack, Button, TablePagination
} from '@mui/material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';

const AdminPaymentHistoryPage = () => {
  const [payments, setPayments] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
        const api = axios.create({ baseURL: API_BASE_URL });
        api.interceptors.request.use(cfg => {
          const token = localStorage.getItem('token');
          if (token) cfg.headers['Authorization'] = `Bearer ${token}`;
          return cfg;
        });
        const response = await api.get('/admin/orders');
        setPayments(response.data);
      } catch (err) {
        console.error("Error fetching payments:", err);
        const msg = err?.response?.status === 403
          ? 'Access denied. Please ensure you are logged in as an admin.'
          : 'Failed to load payment history. Please check backend connection.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    if (!startDate && !endDate) return payments;
    const startMs = startDate ? new Date(startDate + 'T00:00:00').getTime() : null;
    const endMs = endDate ? new Date(endDate + 'T23:59:59').getTime() : null;
    return payments.filter(p => {
      const t = p?.orderDate ? new Date(p.orderDate).getTime() : null;
      if (!t) return false;
      if (startMs && t < startMs) return false;
      if (endMs && t > endMs) return false;
      return true;
    });
  }, [payments, startDate, endDate]);

  const metrics = useMemo(() => {
    const totalCount = filteredPayments.length;
    let totalRevenue = 0;
    let succeededCount = 0;
    let refundCount = 0;

    filteredPayments.forEach(p => {
      const amt = Number(p?.totalAmount ?? p?.amount ?? 0);
      const status = String(p?.orderStatus || p?.status || '').toUpperCase();
      if (status === 'DELIVERED' || status === 'PAID' || status === 'COMPLETED') {
        totalRevenue += amt;
        succeededCount += 1;
      }
      if (status === 'REFUNDED' || status === 'REFUND') {
        refundCount += 1;
      }
    });

    const avgOrder = succeededCount > 0 ? totalRevenue / succeededCount : 0;
    return { totalCount, totalRevenue, succeededCount, avgOrder, refundCount };
  }, [filteredPayments]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading payment history...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: 'background.default', minHeight: 'calc(100vh - 64px - 24px)' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
        Sales Transactions
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField label="Start date" type="date" size="small" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <TextField label="End date" type="date" size="small" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        {(startDate || endDate) && (
          <Button variant="outlined" onClick={() => { setStartDate(''); setEndDate(''); }}>Clear</Button>
        )}
      </Stack>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Total Revenue</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>£{metrics.totalRevenue.toFixed(2)}</Typography>
        </Paper>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Transactions</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{metrics.totalCount}</Typography>
        </Paper>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Avg Order Value</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>£{metrics.avgOrder.toFixed(2)}</Typography>
        </Paper>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Refunds</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{metrics.refundCount}</Typography>
        </Paper>
      </Box>

      {filteredPayments.length === 0 ? (
        <Alert severity="info">No payment records found.</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, bgcolor: 'background.paper' }}>
          <Table sx={{ minWidth: 650 }} aria-label="transactions table">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Order ID</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Order Number</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>User</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Total</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Order Date</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Payment Method</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((payment) => (
                <TableRow
                  key={payment.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:nth-of-type(odd)': { bgcolor: theme.palette.background.default } }}
                >
                  <TableCell component="th" scope="row" sx={{ color: 'text.primary', py: 1.5 }}>
                    {payment.id}
                  </TableCell>
                  <TableCell sx={{ color: 'text.primary', py: 1.5 }}>{payment.orderNumber || 'N/A'}</TableCell>
                  <TableCell sx={{ color: 'text.primary', py: 1.5 }}>{payment.user?.username || 'N/A'}</TableCell>
                  <TableCell sx={{ color: 'text.primary', py: 1.5 }}>£{Number(payment.totalAmount ?? 0).toFixed(2)}</TableCell>
                  <TableCell sx={{ color: 'text.primary', py: 1.5 }}>{payment.orderDate ? new Date(payment.orderDate).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell sx={{ color: 'text.primary', py: 1.5 }}>{payment.paymentMethod || 'N/A'}</TableCell>
                  <TableCell sx={{ color: 'text.primary', py: 1.5 }}>{payment.status || payment.orderStatus}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredPayments.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminPaymentHistoryPage;

