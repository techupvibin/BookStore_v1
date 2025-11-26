import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { Typography, Box, CircularProgress, Alert, Grid, Paper } from '@mui/material';
import axios from 'axios';
import {
  Book as BookIcon, List as ListIcon, Users, Settings,
  Package, CreditCard, LogOut, LayoutDashboard, DollarSign, TrendingUp, Layers
} from 'lucide-react';
import AdminShell from './admin/AdminShell';
import AdminBooksManagementPage from './AdminBooksManagementPage';
import AdminCategoriesManagementPage from './AdminCategoriesManagementPage';
import AdminUsersManagementPage from './AdminUsersManagementPage';
import AdminOrdersManagementPage from './AdminOrdersManagementPage';
import AdminPaymentHistoryPage from './AdminPaymentHistoryPage';
import AdminSettingsPage from './AdminSettingsPage';
import { useAuth } from '../contexts/AuthContext';

// Dashboard with KPI cards
const AdminDashboard = ({ onNavigate }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [revenueStats, setRevenueStats] = useState(null);

  useEffect(() => {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
    const api = axios.create({ baseURL: API_BASE_URL });
    api.interceptors.request.use(cfg => {
      const token = localStorage.getItem('token');
      if (token) cfg.headers['Authorization'] = `Bearer ${token}`;
      return cfg;
    });

    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const [bRes, cRes, uRes, oRes] = await Promise.all([
          api.get('/books'),
          api.get('/categories'),
          api.get('/admin/users'),
          api.get('/admin/orders'),
        ]);
        setBooks(bRes.data || []);
        setCategories(cRes.data || []);
        setUsers(uRes.data || []);
        setOrders(oRes.data || []);
      } catch (e) {
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const metrics = useMemo(() => {
    const totalBooks = books.length;
    const categoriesCount = categories.length;
    const systemUsers = users.length;
    const stocks = books.reduce((sum, b) => sum + Number(b.quantity ?? 0), 0);

    let earnings = 0;
    let totalTx = 0;
    let sales24 = 0;
    const now = Date.now();
    // build last 7 days buckets
    const dayMs = 24 * 60 * 60 * 1000;
    const start = new Date();
    start.setHours(0,0,0,0);
    const buckets = new Array(7).fill(0);
         console.log('🔍 Processing orders for revenue calculation:', orders.length, 'orders');
     orders.forEach((o, index) => {
       const amount = Number(o?.totalAmount ?? o?.total ?? 0);
       const status = String(o?.status || o?.orderStatus || '').toUpperCase();
       // Fix: Only DELIVERED orders should count as completed/revenue-generating
       const paid = status === 'DELIVERED';
       
       console.log(`Order ${index + 1}: Status=${status}, Amount=£${amount}, Paid=${paid}`);
       
       if (paid) {
         earnings += amount;
         totalTx += 1;
         console.log(`✅ Added £${amount} to earnings. Total: £${earnings}`);
       }
      const dt = o?.orderDate ? new Date(o.orderDate).getTime() : null;
      if (paid && dt && now - dt <= 24 * 60 * 60 * 1000) {
        sales24 += amount;
      }
      if (paid && dt) {
        const dayIndex = Math.floor((start.getTime() - new Date(new Date(dt).setHours(0,0,0,0)).getTime()) / dayMs);
        // Map today to index 6, yesterday 5, ... up to 0
        const idx = 6 - (-dayIndex);
        if (idx >= 0 && idx < 7) {
          buckets[idx] += amount;
                 }
       }
     });
     
     console.log('💰 Final Revenue Summary:', {
       totalOrders: orders.length,
       completedOrders: totalTx,
       totalRevenue: earnings,
       sales24h: sales24
     });
     
     return { totalBooks, categoriesCount, systemUsers, stocks, earnings, totalTx, sales24, sales7: buckets };
  }, [books, categories, users, orders]);

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const Card = ({ title, value, onClick, icon: IconComp, iconColor = '#6366f1', sparkline }) => (
    <Paper
      elevation={2}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } }}
      sx={{
        p: 2,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 4 } : undefined,
        height: 120,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {IconComp && (
          <Box sx={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <IconComp size={20} />
          </Box>
        )}
        <Box>
          <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
          {Array.isArray(sparkline) && sparkline.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 24 }}>
              {sparkline.map((v, i) => {
                const max = Math.max(1, Math.max(...sparkline));
                const h = Math.max(2, Math.round((v / max) * 24));
                return <Box key={i} sx={{ width: 6, height: h, bgcolor: iconColor, borderRadius: 1, opacity: 0.85 }} />
              })}
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>Dashboard</Typography>
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card title="Total Book" value={metrics.totalBooks} icon={BookIcon} iconColor="#3b82f6" onClick={() => onNavigate && onNavigate('books')} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card title="Earnings" value={`£${metrics.earnings.toFixed(2)}`} icon={DollarSign} iconColor="#10b981" onClick={() => onNavigate && onNavigate('paymentHistory')} sparkline={metrics.sales7} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card title="Total Transaction" value={metrics.totalTx} icon={CreditCard} iconColor="#ef4444" onClick={() => onNavigate && onNavigate('paymentHistory')} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card title="Categories" value={metrics.categoriesCount} icon={Layers} iconColor="#f59e0b" onClick={() => onNavigate && onNavigate('categories')} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card title="System Users" value={metrics.systemUsers} icon={Users} iconColor="#64748b" onClick={() => onNavigate && onNavigate('users')} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card title="Stocks" value={metrics.stocks} icon={Package} iconColor="#06b6d4" onClick={() => onNavigate && onNavigate('books')} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card title="Sales (24hrs)" value={`£${metrics.sales24.toFixed(2)}`} icon={TrendingUp} iconColor="#22c55e" onClick={() => onNavigate && onNavigate('paymentHistory')} sparkline={metrics.sales7} />
        </Grid>
      </Grid>
    </Box>
  );
};

    const drawerWidth = 240;

    const AdminDashboardPage = () => {
      const navigate = useNavigate();
      const { user, isAuthenticated, hasRole, logout } = useAuth();
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      // ⭐ UPDATED: Set the initial section to 'dashboard'
      const [currentSection, setCurrentSection] = useState('dashboard');

      const muiTheme = useTheme();


      const handleLogout = () => {
        logout();
        navigate('/login');
      };

      const renderContent = () => {
        // ⭐ NEW: Render the AdminDashboard component when currentSection is 'dashboard'
        switch (currentSection) {
          case 'dashboard':
            return <AdminDashboard />;
          case 'books':
            return <AdminBooksManagementPage />;
          case 'categories':
            return <AdminCategoriesManagementPage />;
          case 'users':
            return <AdminUsersManagementPage />;
          case 'orders':
            return <AdminOrdersManagementPage />;
          case 'paymentHistory':
            return <AdminPaymentHistoryPage />;
          case 'settings':
            return <AdminSettingsPage />;
          default:
            return <AdminDashboard />;
        }
      };

      const menuItems = [
        { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
        { key: 'books', label: 'Books', icon: <BookIcon /> },
        { key: 'categories', label: 'Categories', icon: <ListIcon /> },
        { key: 'users', label: 'Users', icon: <Users /> },
        { key: 'orders', label: 'Orders', icon: <Package /> },
        { key: 'paymentHistory', label: 'Transactions', icon: <CreditCard /> },
        { key: 'settings', label: 'Admin Settings', icon: <Settings /> },
      ];

      const handleCardNavigate = (key) => setCurrentSection(key);

      return (
        <AdminShell title="Admin Panel" menuItems={menuItems} selectedKey={currentSection} onSelect={setCurrentSection}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            currentSection === 'dashboard' ? <AdminDashboard onNavigate={handleCardNavigate} /> : renderContent()
          )}
        </AdminShell>
      );
    };

    export default AdminDashboardPage;