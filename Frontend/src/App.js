import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// Removed: createTheme, ThemeProvider, CssBaseline as they are now handled by AppThemeProvider
import { Box, CircularProgress } from '@mui/material';

// Import custom components
import HomePage from './components/HomePage';
import AboutUsPage from './components/AboutUsPage';
import AllBooksPage from './components/AllBooksPage';
import ContactUsPage from './components/ContactUsPage';
import LoginPage from './components/LoginPage';
import RegistrationForm from './components/RegistrationForm';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import BookDetailPage from './components/BookDetailPage';
import CartPage from './components/CartPage';
import ProfilePage from './components/ProfilePage';
import AppLayout from './components/AppLayout';
import SettingsPage from './components/SettingsPage'; // ⭐ Correct General User SettingsPage
import ThemeDemoPage from './components/ThemeDemoPage'; // Theme demonstration page

// Payment and Order Related Components
import PaymentGatewayPage from './components/PaymentGatewayPage';
import OrderSuccessPage from './components/OrderSuccessPage';
import BillingReceiptPage from './components/BillingReceiptPage';
import OrderHistoryPage from './components/OrderHistoryPage';
import FavouritesPage from './components/FavouritesPage'; // ⭐ Ensure this is imported for profile page

// Admin Components
import AdminBooksManagementPage from './components/AdminBooksManagementPage';
import AdminCategoriesManagementPage from './components/AdminCategoriesManagementPage';
import AdminUsersManagementPage from './components/AdminUsersManagementPage';
import AdminDashboardPage from './components/AdminDashboardPage';
import AdminSettingsPage from './components/AdminSettingsPage'; // This is for ADMIN specific settings
import AdminSupportPage from './components/AdminSupportPage';
import AdminPromosPage from './components/AdminPromosPage';

// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider }  from './contexts/FavoritesContext';
import { OrdersProvider } from './contexts/OrdersContext';
import { SearchProvider } from './contexts/SearchContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AppThemeProvider from './components/AppThemeProvider'; // ⭐ IMPORT YOUR APP THEME PROVIDER HERE
import OAuth2RedirectHandler from './components/OAuth2RedirectHandler';

// Import global CSS for external libraries
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './index.css';

// --- PrivateRoute Component ---
const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    // Redirect to home if user is authenticated but doesn't have the required role
    return <Navigate to="/" replace />; // Use 'replace' to prevent going back to unauthorized page
  }

  return children;
};

// --- Main App Component ---
function App() {
  // Hydrate global/admin settings on app load
  useEffect(() => {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
    fetch(`${API_BASE_URL}/admin/settings`)
      .then(res => (res.ok ? res.json() : Promise.resolve({})))
      .then(data => {
        if (data && typeof data === 'object') {
          if (data['site.title']) {
            window.__SITE_TITLE__ = data['site.title'];
          }
          if (data['low.stock']) {
            try { localStorage.setItem('admin.lowStock', String(data['low.stock'])); } catch {}
          }
          if (data['maintenance']) {
            try { localStorage.setItem('admin.maintenance', String(data['maintenance'])); } catch {}
          }
        }
      })
      .catch(() => {});
  }, []);
  return (
    // ⭐ REVISION: Wrap the entire application with AppThemeProvider
    // AppThemeProvider internally provides ThemeProvider and CssBaseline
    <AppThemeProvider>
      <Router>
        {/* All context providers wrap the routes */}
        <AuthProvider>
          <NotificationProvider>
            <SearchProvider>
              <OrdersProvider>
                <CartProvider>
                  <FavoritesProvider>
                  <Routes>
                    {/* Public Routes - Accessible without authentication */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegistrationForm />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

                    {/* Standard App Routes - Wrapped with AppLayout for consistent UI */}
                    <Route path="/" element={<AppLayout fullBleed><HomePage /></AppLayout>} />
                    <Route path="/about" element={<AppLayout><AboutUsPage /></AppLayout>} />
                    <Route path="/books" element={<AppLayout><AllBooksPage /></AppLayout>} />
                    <Route path="/contact" element={<AppLayout><ContactUsPage /></AppLayout>} />
                    <Route path="/books/:bookId" element={<AppLayout><BookDetailPage /></AppLayout>} />
                    <Route path="/theme-demo" element={<AppLayout><ThemeDemoPage /></AppLayout>} />

                    {/* Authenticated User Routes - Require login and consistent UI */}
                    <Route path="/cart" element={<AppLayout><PrivateRoute><CartPage /></PrivateRoute></AppLayout>} />
                    <Route path="/profile" element={<AppLayout><PrivateRoute><ProfilePage /></PrivateRoute></AppLayout>} />
                    {/* ⭐ REVISION: Route for general user settings, which uses ThemeContext */}
                    <Route path="/settings" element={<AppLayout><PrivateRoute><SettingsPage /></PrivateRoute></AppLayout>} />
                    <Route path="/payment" element={<AppLayout><PrivateRoute><PaymentGatewayPage /></PrivateRoute></AppLayout>} />
                    <Route path="/order-success" element={<AppLayout><PrivateRoute><OrderSuccessPage /></PrivateRoute></AppLayout>} />
                    <Route path="/receipt" element={<AppLayout><PrivateRoute><BillingReceiptPage /></PrivateRoute></AppLayout>} />
                    <Route path="/order-history" element={<AppLayout><PrivateRoute><OrderHistoryPage /></PrivateRoute></AppLayout>} />

                    {/* Admin Routes - Require ADMIN role */}
                    <Route
                        path="/admin/*" // Catch all sub-paths under /admin
                        element={
                            <AppLayout> {/* Wrap admin routes with AppLayout for consistent header/footer/sidebar */}
                                <PrivateRoute requiredRole="ROLE_ADMIN">
                                    <AdminDashboardPage />
                                </PrivateRoute>
                            </AppLayout>
                        }
                    />
                    <Route path="/admin/settings" element={<AppLayout><PrivateRoute requiredRole="ROLE_ADMIN"><AdminSettingsPage /></PrivateRoute></AppLayout>} />
                    <Route path="/admin/support" element={<AppLayout><PrivateRoute requiredRole="ROLE_ADMIN"><AdminSupportPage /></PrivateRoute></AppLayout>} />
                    <Route path="/admin/promos" element={<AppLayout><PrivateRoute requiredRole="ROLE_ADMIN"><AdminPromosPage /></PrivateRoute></AppLayout>} />


                    {/* Catch-all route for unmatched paths - redirects to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                  </FavoritesProvider>
                </CartProvider>
              </OrdersProvider>
            </SearchProvider>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </AppThemeProvider>
  );
}

export default App;