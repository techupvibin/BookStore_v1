import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock fetch
global.fetch = jest.fn();

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(() => ({ username: 'testuser', roles: ['ROLE_USER'] }))
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Initial Render', () => {
    test('should render login form with all required elements', () => {
      renderWithProviders(<LoginPage />);

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    test('should render Google login button', () => {
      renderWithProviders(<LoginPage />);

      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    });

    test('should render remember me checkbox', () => {
      renderWithProviders(<LoginPage />);

      expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('should show error when submitting empty form', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/username and password are required/i)).toBeInTheDocument();
      });
    });

    test('should show error when username is empty', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/username and password are required/i)).toBeInTheDocument();
      });
    });

    test('should show error when password is empty', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      const usernameInput = screen.getByLabelText(/username/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/username and password are required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Input Handling', () => {
    test('should update username input value', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, 'testuser');

      expect(usernameInput).toHaveValue('testuser');
    });

    test('should update password input value', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    test('should toggle password visibility', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

      // Password should be hidden by default
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show password
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click to hide password again
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should toggle remember me checkbox', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });

      // Should be checked by default
      expect(rememberMeCheckbox).toBeChecked();

      // Uncheck it
      await user.click(rememberMeCheckbox);
      expect(rememberMeCheckbox).not.toBeChecked();

      // Check it again
      await user.click(rememberMeCheckbox);
      expect(rememberMeCheckbox).toBeChecked();
    });
  });

  describe('Successful Login', () => {
    test('should handle successful login with user role', async () => {
      const user = userEvent.setup();
      
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          token: 'mock-jwt-token',
          user: { username: 'testuser', roles: ['ROLE_USER'] }
        })
      };
      fetch.mockResolvedValueOnce(mockResponse);

      renderWithProviders(<LoginPage />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'testuser',
            password: 'password123'
          }),
        });
      });

      // Should navigate to home page for regular users
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    test('should handle successful login with admin role', async () => {
      const user = userEvent.setup();
      
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          token: 'mock-jwt-token',
          user: { username: 'admin', roles: ['ROLE_ADMIN'] }
        })
      };
      fetch.mockResolvedValueOnce(mockResponse);

      renderWithProviders(<LoginPage />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'adminpass');
      await user.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'admin',
            password: 'adminpass'
          }),
        });
      });

      // Should navigate to admin page for admin users
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
      });
    });
  });

  describe('Login Error Handling', () => {
    test('should handle login failure with error message', async () => {
      const user = userEvent.setup();
      
      const mockResponse = {
        ok: false,
        json: () => Promise.resolve({
          error: 'Invalid credentials'
        })
      };
      fetch.mockResolvedValueOnce(mockResponse);

      renderWithProviders(<LoginPage />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'wronguser');
      await user.type(passwordInput, 'wrongpass');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    test('should handle network error', async () => {
      const user = userEvent.setup();
      
      fetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<LoginPage />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    test('should handle unexpected response format', async () => {
      const user = userEvent.setup();
      
      const mockResponse = {
        ok: false,
        json: () => Promise.resolve({})
      };
      fetch.mockResolvedValueOnce(mockResponse);

      renderWithProviders(<LoginPage />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/login failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('should show loading state during form submission', async () => {
      const user = userEvent.setup();
      
      // Mock a delayed response
      const mockResponse = {
        ok: true,
        json: () => new Promise(resolve => setTimeout(() => resolve({
          token: 'mock-jwt-token',
          user: { username: 'testuser', roles: ['ROLE_USER'] }
        }), 100))
      };
      fetch.mockResolvedValueOnce(mockResponse);

      renderWithProviders(<LoginPage />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Should show loading state
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    test('should disable form during submission', async () => {
      const user = userEvent.setup();
      
      const mockResponse = {
        ok: true,
        json: () => new Promise(resolve => setTimeout(() => resolve({
          token: 'mock-jwt-token',
          user: { username: 'testuser', roles: ['ROLE_USER'] }
        }), 100))
      };
      fetch.mockResolvedValueOnce(mockResponse);

      renderWithProviders(<LoginPage />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Form inputs should be disabled during submission
      expect(usernameInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });
  });

  describe('Snackbar Notifications', () => {
    test('should show success message on successful login', async () => {
      const user = userEvent.setup();
      
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          token: 'mock-jwt-token',
          user: { username: 'testuser', roles: ['ROLE_USER'] }
        })
      };
      fetch.mockResolvedValueOnce(mockResponse);

      renderWithProviders(<LoginPage />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/login successful/i)).toBeInTheDocument();
      });
    });

    test('should close snackbar when clicking close button', async () => {
      const user = userEvent.setup();
      
      const mockResponse = {
        ok: false,
        json: () => Promise.resolve({
          error: 'Invalid credentials'
        })
      };
      fetch.mockResolvedValueOnce(mockResponse);

      renderWithProviders(<LoginPage />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'wronguser');
      await user.type(passwordInput, 'wrongpass');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      // Close the snackbar
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation Links', () => {
    test('should have link to registration page', () => {
      renderWithProviders(<LoginPage />);

      const registerLink = screen.getByText(/don't have an account/i);
      expect(registerLink).toBeInTheDocument();
      expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
    });

    test('should have link to forgot password page', () => {
      renderWithProviders(<LoginPage />);

      const forgotPasswordLink = screen.getByText(/forgot password/i);
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password');
    });
  });

  describe('Google OAuth', () => {
    test('should handle Google login button click', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);

      // Should redirect to Google OAuth URL
      expect(window.location.href).toContain('accounts.google.com');
    });
  });

  describe('Accessibility', () => {
    test('should have proper form labels', () => {
      renderWithProviders(<LoginPage />);

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    test('should have proper button roles', () => {
      renderWithProviders(<LoginPage />);

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /toggle password visibility/i })).toBeInTheDocument();
    });

    test('should have proper form structure', () => {
      renderWithProviders(<LoginPage />);

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
    });
  });
});
