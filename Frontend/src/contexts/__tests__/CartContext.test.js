import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '../CartContext';
import { AuthProvider } from '../AuthContext';
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

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Test component to access context
const TestComponent = () => {
  const { 
    cartItems, 
    addToCart, 
    buyNow, 
    updateCartItemQuantity, 
    removeFromCart, 
    clearCart,
    loading,
    error,
    totalAmount,
    totalItems
  } = useCart();
  
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error ? error.message : 'null'}</div>
      <div data-testid="cart-items">{JSON.stringify(cartItems)}</div>
      <div data-testid="total-amount">{totalAmount}</div>
      <div data-testid="total-items">{totalItems}</div>
      <button data-testid="add-to-cart-btn" onClick={() => addToCart(1, 2)}>
        Add to Cart
      </button>
      <button data-testid="buy-now-btn" onClick={() => buyNow(1, 1)}>
        Buy Now
      </button>
      <button data-testid="update-quantity-btn" onClick={() => updateCartItemQuantity(1, 3)}>
        Update Quantity
      </button>
      <button data-testid="remove-item-btn" onClick={() => removeFromCart(1)}>
        Remove Item
      </button>
      <button data-testid="clear-cart-btn" onClick={clearCart}>
        Clear Cart
      </button>
    </div>
  );
};

const renderWithProviders = (component) => {
  return render(
    <AuthProvider>
      <CartProvider>
        {component}
      </CartProvider>
    </AuthProvider>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('test-token');
    mockNavigate.mockClear();
  });

  describe('Initial State', () => {
    test('should start with loading state', () => {
      renderWithProviders(<TestComponent />);
      
      expect(screen.getByTestId('loading')).toHaveTextContent('true');
    });

    test('should start with empty cart items', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { cartItems: [] }
      });

      renderWithProviders(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('cart-items')).toHaveTextContent('[]');
      });
    });
  });

  describe('Cart Operations', () => {
    test('should add item to cart successfully', async () => {
      const mockCart = {
        cartItems: [
          { bookId: 1, bookTitle: 'Test Book', bookPrice: 10.99, quantity: 2 }
        ]
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: { cartItems: [] }
      });

      mockedAxios.post.mockResolvedValueOnce({
        data: mockCart
      });

      const user = renderWithProviders(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await userEvent.click(screen.getByTestId('add-to-cart-btn'));
      });

      expect(mockedAxios.post).toHaveBeenCalledWith('/cart/add', { bookId: 1, quantity: 2 });
      expect(screen.getByTestId('cart-items')).toContainHTML('Test Book');
    });

    test('should handle add to cart error', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { cartItems: [] }
      });

      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { message: 'Failed to add item' } }
      });

      const user = renderWithProviders(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await userEvent.click(screen.getByTestId('add-to-cart-btn'));
      });

      expect(mockedAxios.post).toHaveBeenCalledWith('/cart/add', { bookId: 1, quantity: 2 });
    });

    test('should update cart item quantity successfully', async () => {
      const mockCart = {
        cartItems: [
          { bookId: 1, bookTitle: 'Test Book', bookPrice: 10.99, quantity: 3 }
        ]
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: { cartItems: [] }
      });

      mockedAxios.put.mockResolvedValueOnce({
        data: mockCart
      });

      const user = renderWithProviders(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await userEvent.click(screen.getByTestId('update-quantity-btn'));
      });

      expect(mockedAxios.put).toHaveBeenCalledWith('/cart/update', { bookId: 1, quantity: 3 });
    });

    test('should remove item from cart successfully', async () => {
      const mockCart = {
        cartItems: []
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: { cartItems: [] }
      });

      mockedAxios.delete.mockResolvedValueOnce({
        data: mockCart
      });

      const user = renderWithProviders(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await userEvent.click(screen.getByTestId('remove-item-btn'));
      });

      expect(mockedAxios.delete).toHaveBeenCalledWith('/cart/remove/1');
    });

    test('should clear cart successfully', async () => {
      const mockCart = {
        cartItems: []
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: { cartItems: [] }
      });

      mockedAxios.delete.mockResolvedValueOnce({
        data: mockCart
      });

      const user = renderWithProviders(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await userEvent.click(screen.getByTestId('clear-cart-btn'));
      });

      expect(mockedAxios.delete).toHaveBeenCalledWith('/cart/clear');
    });
  });

  describe('Buy Now Functionality', () => {
    test('should handle buy now successfully', async () => {
      const mockCart = {
        cartItems: [
          { bookId: 1, bookTitle: 'Test Book', bookPrice: 10.99, quantity: 1 }
        ]
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: { cartItems: [] }
      });

      mockedAxios.post.mockResolvedValueOnce({
        data: mockCart
      });

      const user = renderWithProviders(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await userEvent.click(screen.getByTestId('buy-now-btn'));
      });

      expect(mockedAxios.post).toHaveBeenCalledWith('/cart/add', { bookId: 1, quantity: 1 });
      
      // Wait for navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/payment');
      }, { timeout: 2000 });
    });

    test('should handle buy now error', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { cartItems: [] }
      });

      mockedAxios.post.mockRejectedValueOnce(new Error('Failed to process purchase'));

      const user = renderWithProviders(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await userEvent.click(screen.getByTestId('buy-now-btn'));
      });

      expect(mockedAxios.post).toHaveBeenCalledWith('/cart/add', { bookId: 1, quantity: 1 });
    });
  });

  describe('Cart Calculations', () => {
    test('should calculate total amount correctly', async () => {
      const mockCart = {
        cartItems: [
          { bookId: 1, bookTitle: 'Book 1', bookPrice: 10.99, quantity: 2 },
          { bookId: 2, bookTitle: 'Book 2', bookPrice: 15.50, quantity: 1 }
        ]
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockCart
      });

      renderWithProviders(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // Expected total: (10.99 * 2) + (15.50 * 1) = 21.98 + 15.50 = 37.48
      expect(screen.getByTestId('total-amount')).toHaveTextContent('37.48');
      expect(screen.getByTestId('total-items')).toHaveTextContent('3');
    });

    test('should handle empty cart calculations', async () => {
      const mockCart = {
        cartItems: []
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockCart
      });

      renderWithProviders(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('total-amount')).toHaveTextContent('0');
      expect(screen.getByTestId('total-items')).toHaveTextContent('0');
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('Network error');
      });
    });

    test('should handle update quantity error', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { cartItems: [] }
      });

      mockedAxios.put.mockRejectedValueOnce(new Error('Update failed'));

      const user = renderWithProviders(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await userEvent.click(screen.getByTestId('update-quantity-btn'));
      });

      expect(mockedAxios.put).toHaveBeenCalledWith('/cart/update', { bookId: 1, quantity: 3 });
    });

    test('should handle remove item error', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { cartItems: [] }
      });

      mockedAxios.delete.mockRejectedValueOnce(new Error('Remove failed'));

      const user = renderWithProviders(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await userEvent.click(screen.getByTestId('remove-item-btn'));
      });

      expect(mockedAxios.delete).toHaveBeenCalledWith('/cart/remove/1');
    });
  });

  describe('Authentication Integration', () => {
    test('should require authentication for cart operations', async () => {
      localStorageMock.getItem.mockReturnValue(null); // No token

      mockedAxios.get.mockResolvedValueOnce({
        data: { cartItems: [] }
      });

      const user = renderWithProviders(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await userEvent.click(screen.getByTestId('add-to-cart-btn'));
      });

      // Should not make API call when not authenticated
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });

  describe('API Interceptors', () => {
    test('should include authorization header in requests', async () => {
      const mockCart = {
        cartItems: []
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockCart
      });

      mockedAxios.post.mockResolvedValueOnce({
        data: mockCart
      });

      const user = renderWithProviders(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await userEvent.click(screen.getByTestId('add-to-cart-btn'));
      });

      // Check that the request was made with the correct base URL and headers
      expect(mockedAxios.post).toHaveBeenCalledWith('/cart/add', { bookId: 1, quantity: 2 });
    });
  });
});
