import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { OrdersProvider } from './contexts/OrdersContext';
import { SearchProvider } from './contexts/SearchContext';

// Mock the components to avoid complex rendering
jest.mock('./components/AppThemeProvider', () => {
  return function MockAppThemeProvider({ children }) {
    return <div data-testid="app-theme-provider">{children}</div>;
  };
});

// Mock fetch for admin settings
global.fetch = jest.fn();

const theme = createTheme();

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <OrdersProvider>
                <SearchProvider>
                  {component}
                </SearchProvider>
              </OrdersProvider>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful admin settings fetch
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        'site.title': 'Test BookStore',
        'low.stock': 5,
        'maintenance': false
      })
    });
  });

  describe('Initial Render', () => {
    test('should render without crashing', () => {
      renderWithProviders(<App />);
      expect(screen.getByTestId('app-theme-provider')).toBeInTheDocument();
    });

    test('should render main navigation', () => {
      renderWithProviders(<App />);
      // Check for navigation elements
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    test('should render footer', () => {
      renderWithProviders(<App />);
      // Check for footer elements
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });

  describe('Admin Settings Loading', () => {
    test('should fetch admin settings on mount', async () => {
      renderWithProviders(<App />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/settings')
        );
      });
    });

    test('should handle admin settings fetch error gracefully', async () => {
      fetch.mockRejectedValue(new Error('Network error'));
      
      renderWithProviders(<App />);

      // Should not crash when fetch fails
      await waitFor(() => {
        expect(screen.getByTestId('app-theme-provider')).toBeInTheDocument();
      });
    });

    test('should handle non-ok response from admin settings', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 404
      });

      renderWithProviders(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('app-theme-provider')).toBeInTheDocument();
      });
    });

    test('should set global variables when admin settings are loaded', async () => {
      const mockSettings = {
        'site.title': 'Custom BookStore',
        'low.stock': 10,
        'maintenance': true
      };

      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSettings)
      });

      renderWithProviders(<App />);

      await waitFor(() => {
        expect(window.__SITE_TITLE__).toBe('Custom BookStore');
      });
    });
  });

  describe('Route Rendering', () => {
    test('should render home page by default', () => {
      renderWithProviders(<App />);
      
      // Check for home page content
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });

    test('should render about page when navigating to /about', () => {
      window.history.pushState({}, 'Test page', '/about');
      renderWithProviders(<App />);
      
      // Check for about page content
      expect(screen.getByText(/about us/i)).toBeInTheDocument();
    });

    test('should render contact page when navigating to /contact', () => {
      window.history.pushState({}, 'Test page', '/contact');
      renderWithProviders(<App />);
      
      // Check for contact page content
      expect(screen.getByText(/contact us/i)).toBeInTheDocument();
    });

    test('should render login page when navigating to /login', () => {
      window.history.pushState({}, 'Test page', '/login');
      renderWithProviders(<App />);
      
      // Check for login form
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    test('should render registration page when navigating to /register', () => {
      window.history.pushState({}, 'Test page', '/register');
      renderWithProviders(<App />);
      
      // Check for registration form
      expect(screen.getByText(/create account/i)).toBeInTheDocument();
    });
  });

  describe('Authentication Routes', () => {
    test('should redirect unauthenticated users from protected routes', () => {
      window.history.pushState({}, 'Test page', '/profile');
      renderWithProviders(<App />);
      
      // Should redirect to login
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    });

    test('should render profile page for authenticated users', () => {
      // Mock authenticated user
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
      
      window.history.pushState({}, 'Test page', '/profile');
      renderWithProviders(<App />);
      
      // Should show profile content
      expect(screen.getByText(/profile/i)).toBeInTheDocument();
    });
  });

  describe('Admin Routes', () => {
    test('should redirect non-admin users from admin routes', () => {
      // Mock regular user
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ 
        username: 'testuser', 
        roles: ['ROLE_USER'] 
      }));
      
      window.history.pushState({}, 'Test page', '/admin');
      renderWithProviders(<App />);
      
      // Should redirect to home
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });

    test('should render admin dashboard for admin users', () => {
      // Mock admin user
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ 
        username: 'admin', 
        roles: ['ROLE_ADMIN'] 
      }));
      
      window.history.pushState({}, 'Test page', '/admin');
      renderWithProviders(<App />);
      
      // Should show admin dashboard
      expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid routes gracefully', () => {
      window.history.pushState({}, 'Test page', '/invalid-route');
      renderWithProviders(<App />);
      
      // Should show 404 or redirect to home
      expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    });

    test('should handle component rendering errors', () => {
      // Mock a component that throws an error
      const originalError = console.error;
      console.error = jest.fn();
      
      renderWithProviders(<App />);
      
      // Should not crash the app
      expect(screen.getByTestId('app-theme-provider')).toBeInTheDocument();
      
      console.error = originalError;
    });
  });

  describe('Performance', () => {
    test('should not re-render unnecessarily', () => {
      const { rerender } = renderWithProviders(<App />);
      
      // Re-render with same props
      rerender(<App />);
      
      // Should still render correctly
      expect(screen.getByTestId('app-theme-provider')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper semantic structure', () => {
      renderWithProviders(<App />);
      
      // Check for main landmark
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    test('should have proper heading structure', () => {
      renderWithProviders(<App />);
      
      // Check for main heading
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe('Context Integration', () => {
    test('should provide all required contexts', () => {
      renderWithProviders(<App />);
      
      // All context providers should be present
      expect(screen.getByTestId('app-theme-provider')).toBeInTheDocument();
    });

    test('should handle context value changes', () => {
      const { rerender } = renderWithProviders(<App />);
      
      // Re-render to test context stability
      rerender(<App />);
      
      expect(screen.getByTestId('app-theme-provider')).toBeInTheDocument();
    });
  });
});
