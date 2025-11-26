import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Test component to access context
const TestComponent = () => {
  const { isAuthenticated, user, loading, login, logout, hasRole } = useAuth();
  
  return (
    <div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <button data-testid="login-btn" onClick={() => login('test-token', { username: 'testuser', roles: ['ROLE_USER'] })}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
      <div data-testid="hasRole-user">{hasRole('ROLE_USER').toString()}</div>
      <div data-testid="hasRole-admin">{hasRole('ROLE_ADMIN').toString()}</div>
    </div>
  );
};

const renderWithAuthProvider = (component) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    sessionStorageMock.getItem.mockReturnValue(null);
  });

  describe('Initial State', () => {
    test('should start with unauthenticated state', async () => {
      renderWithAuthProvider(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('user')).toHaveTextContent('null');
      });
    });

    test('should start with loading state', () => {
      renderWithAuthProvider(<TestComponent />);
      
      expect(screen.getByTestId('loading')).toHaveTextContent('true');
    });
  });

  describe('Token Validation', () => {
    test('should validate token successfully', async () => {
      const mockUser = { username: 'testuser', roles: ['ROLE_USER'] };
      const mockToken = 'valid-token';
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return mockToken;
        if (key === 'user') return JSON.stringify(mockUser);
        return null;
      });

      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: mockUser
      });

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('user')).toContainHTML('testuser');
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/validate',
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
    });

    test('should handle token validation failure', async () => {
      const mockToken = 'invalid-token';
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return mockToken;
        if (key === 'user') return JSON.stringify({ username: 'testuser' });
        return null;
      });

      mockedAxios.get.mockRejectedValueOnce(new Error('Token invalid'));

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('user')).toHaveTextContent('null');
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });

    test('should handle invalid user data in storage', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'valid-token';
        if (key === 'user') return JSON.stringify({}); // Invalid user data
        return null;
      });

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('Login Function', () => {
    test('should login user successfully', async () => {
      const user = renderWithAuthProvider(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await userEvent.click(screen.getByTestId('login-btn'));
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify({ username: 'testuser', roles: ['ROLE_USER'] }));
      
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toContainHTML('testuser');
    });
  });

  describe('Logout Function', () => {
    test('should logout user successfully', async () => {
      const user = renderWithAuthProvider(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // First login
      await act(async () => {
        await userEvent.click(screen.getByTestId('login-btn'));
      });

      // Then logout
      await act(async () => {
        await userEvent.click(screen.getByTestId('logout-btn'));
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });

  describe('Role Checking', () => {
    test('should check user roles correctly', async () => {
      const user = renderWithAuthProvider(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // Login with user role
      await act(async () => {
        await userEvent.click(screen.getByTestId('login-btn'));
      });

      expect(screen.getByTestId('hasRole-user')).toHaveTextContent('true');
      expect(screen.getByTestId('hasRole-admin')).toHaveTextContent('false');
    });

    test('should handle different role formats', async () => {
      const TestComponentWithRoles = () => {
        const { login, hasRole } = useAuth();
        
        return (
          <div>
            <button data-testid="login-admin-btn" onClick={() => login('token', { username: 'admin', roles: ['ROLE_ADMIN'] })}>
              Login Admin
            </button>
            <button data-testid="login-user-btn" onClick={() => login('token', { username: 'user', roles: ['USER'] })}>
              Login User
            </button>
            <div data-testid="hasRole-admin">{hasRole('ADMIN').toString()}</div>
            <div data-testid="hasRole-user">{hasRole('USER').toString()}</div>
          </div>
        );
      };

      const user = renderWithAuthProvider(<TestComponentWithRoles />);
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // Test admin role
      await act(async () => {
        await userEvent.click(screen.getByTestId('login-admin-btn'));
      });

      expect(screen.getByTestId('hasRole-admin')).toHaveTextContent('true');

      // Test user role
      await act(async () => {
        await userEvent.click(screen.getByTestId('login-user-btn'));
      });

      expect(screen.getByTestId('hasRole-user')).toHaveTextContent('true');
    });
  });

  describe('Session Storage Support', () => {
    test('should check sessionStorage for token and user', async () => {
      const mockUser = { username: 'testuser', roles: ['ROLE_USER'] };
      const mockToken = 'session-token';
      
      sessionStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return mockToken;
        if (key === 'user') return JSON.stringify(mockUser);
        return null;
      });

      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: mockUser
      });

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });

      expect(sessionStorageMock.getItem).toHaveBeenCalledWith('token');
      expect(sessionStorageMock.getItem).toHaveBeenCalledWith('user');
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors during validation', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'valid-token';
        if (key === 'user') return JSON.stringify({ username: 'testuser' });
        return null;
      });

      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });

    test('should handle non-200 response status', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'valid-token';
        if (key === 'user') return JSON.stringify({ username: 'testuser' });
        return null;
      });

      mockedAxios.get.mockResolvedValueOnce({
        status: 401,
        data: { message: 'Unauthorized' }
      });

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });
  });
});
