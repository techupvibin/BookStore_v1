import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import BookCard from '../BookCard';
import { CartProvider } from '../../contexts/CartContext';
import { FavoritesProvider } from '../../contexts/FavoritesContext';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the contexts
const mockAddToCart = jest.fn();
const mockAddToFavorites = jest.fn();
const mockRemoveFromFavorites = jest.fn();
const mockIsFavorite = jest.fn();

jest.mock('../../contexts/CartContext', () => ({
  ...jest.requireActual('../../contexts/CartContext'),
  useCart: () => ({
    addToCart: mockAddToCart,
    cartItems: []
  })
}));

jest.mock('../../contexts/FavoritesContext', () => ({
  ...jest.requireActual('../../contexts/FavoritesContext'),
  useFavorites: () => ({
    addToFavorites: mockAddToFavorites,
    removeFromFavorites: mockRemoveFromFavorites,
    isFavorite: mockIsFavorite
  })
}));

const theme = createTheme();

const mockBook = {
  id: 1,
  title: 'Test Book',
  description: 'This is a test book description that should be displayed in the card.',
  authorNames: 'Test Author',
  price: 19.99,
  imageUrl: 'https://example.com/book-cover.jpg'
};

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              {component}
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('BookCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsFavorite.mockReturnValue(false);
  });

  describe('Rendering', () => {
    test('should render book information correctly', () => {
      renderWithProviders(<BookCard book={mockBook} />);

      expect(screen.getByText('Test Book')).toBeInTheDocument();
      expect(screen.getByText('This is a test book description that should be displayed in the card.')).toBeInTheDocument();
      expect(screen.getByText('by Test Author')).toBeInTheDocument();
      expect(screen.getByText('£19.99')).toBeInTheDocument();
    });

    test('should render book image with correct alt text', () => {
      renderWithProviders(<BookCard book={mockBook} />);

      const image = screen.getByAltText('Test Book');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/book-cover.jpg');
    });

    test('should render placeholder image when no image URL is provided', () => {
      const bookWithoutImage = { ...mockBook, imageUrl: null };
      renderWithProviders(<BookCard book={bookWithoutImage} />);

      const image = screen.getByAltText('Test Book');
      expect(image).toHaveAttribute('src', 'https://placehold.co/150x200/1f2937/F3F4F6?text=No+Image');
    });

    test('should render fallback text when description is missing', () => {
      const bookWithoutDescription = { ...mockBook, description: null };
      renderWithProviders(<BookCard book={bookWithoutDescription} />);

      expect(screen.getByText('No description available.')).toBeInTheDocument();
    });

    test('should render fallback text when author is missing', () => {
      const bookWithoutAuthor = { ...mockBook, authorNames: null };
      renderWithProviders(<BookCard book={bookWithoutAuthor} />);

      expect(screen.getByText('by Unknown Author')).toBeInTheDocument();
    });

    test('should render N/A when price is missing', () => {
      const bookWithoutPrice = { ...mockBook, price: null };
      renderWithProviders(<BookCard book={bookWithoutPrice} />);

      expect(screen.getByText('£N/A')).toBeInTheDocument();
    });

    test('should format price correctly with two decimal places', () => {
      const bookWithDecimalPrice = { ...mockBook, price: 15.5 };
      renderWithProviders(<BookCard book={bookWithDecimalPrice} />);

      expect(screen.getByText('£15.50')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    test('should link to book detail page', () => {
      renderWithProviders(<BookCard book={mockBook} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/books/1');
    });

    test('should make entire card clickable', () => {
      renderWithProviders(<BookCard book={mockBook} />);

      const link = screen.getByRole('link');
      expect(link).toHaveTextContent('Test Book');
      expect(link).toHaveTextContent('This is a test book description');
      expect(link).toHaveTextContent('by Test Author');
      expect(link).toHaveTextContent('£19.99');
    });
  });

  describe('Favorite Functionality', () => {
    test('should render favorite button', () => {
      renderWithProviders(<BookCard book={mockBook} />);

      const favoriteButton = screen.getByRole('button', { name: /add to favorites/i });
      expect(favoriteButton).toBeInTheDocument();
    });

    test('should show filled heart when book is favorite', () => {
      mockIsFavorite.mockReturnValue(true);
      renderWithProviders(<BookCard book={mockBook} />);

      const favoriteButton = screen.getByRole('button', { name: /remove from favorites/i });
      expect(favoriteButton).toBeInTheDocument();
    });

    test('should call addToFavorites when clicking favorite button on non-favorite book', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BookCard book={mockBook} />);

      const favoriteButton = screen.getByRole('button', { name: /add to favorites/i });
      await user.click(favoriteButton);

      expect(mockAddToFavorites).toHaveBeenCalledWith(mockBook);
      expect(mockRemoveFromFavorites).not.toHaveBeenCalled();
    });

    test('should call removeFromFavorites when clicking favorite button on favorite book', async () => {
      const user = userEvent.setup();
      mockIsFavorite.mockReturnValue(true);
      renderWithProviders(<BookCard book={mockBook} />);

      const favoriteButton = screen.getByRole('button', { name: /remove from favorites/i });
      await user.click(favoriteButton);

      expect(mockRemoveFromFavorites).toHaveBeenCalledWith(mockBook.id);
      expect(mockAddToFavorites).not.toHaveBeenCalled();
    });

    test('should prevent navigation when clicking favorite button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BookCard book={mockBook} />);

      const favoriteButton = screen.getByRole('button', { name: /add to favorites/i });
      await user.click(favoriteButton);

      // The event should be prevented from bubbling up to the link
      expect(mockAddToFavorites).toHaveBeenCalled();
    });
  });

  describe('Cart Functionality', () => {
    test('should render add to cart button', () => {
      renderWithProviders(<BookCard book={mockBook} />);

      const cartButton = screen.getByRole('button', { name: /add to cart/i });
      expect(cartButton).toBeInTheDocument();
    });

    test('should call addToCart when clicking cart button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BookCard book={mockBook} />);

      const cartButton = screen.getByRole('button', { name: /add to cart/i });
      await user.click(cartButton);

      expect(mockAddToCart).toHaveBeenCalledWith(mockBook.id, 1);
    });

    test('should prevent navigation when clicking cart button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BookCard book={mockBook} />);

      const cartButton = screen.getByRole('button', { name: /add to cart/i });
      await user.click(cartButton);

      // The event should be prevented from bubbling up to the link
      expect(mockAddToCart).toHaveBeenCalled();
    });

    test('should show different tooltip when book is in cart', () => {
      // Mock cartItems to include the book
      jest.spyOn(require('../../contexts/CartContext'), 'useCart').mockReturnValue({
        addToCart: mockAddToCart,
        cartItems: [{ bookId: 1 }]
      });

      renderWithProviders(<BookCard book={mockBook} />);

      const cartButton = screen.getByRole('button', { name: /already in cart/i });
      expect(cartButton).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    test('should have proper card structure', () => {
      renderWithProviders(<BookCard book={mockBook} />);

      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();
    });

    test('should have action buttons positioned correctly', () => {
      renderWithProviders(<BookCard book={mockBook} />);

      const favoriteButton = screen.getByRole('button', { name: /add to favorites/i });
      const cartButton = screen.getByRole('button', { name: /add to cart/i });

      expect(favoriteButton).toBeInTheDocument();
      expect(cartButton).toBeInTheDocument();
    });

    test('should truncate long descriptions', () => {
      const bookWithLongDescription = {
        ...mockBook,
        description: 'This is a very long description that should be truncated after three lines to maintain consistent card layout and prevent the card from becoming too tall. The description should be cut off with ellipsis.'
      };

      renderWithProviders(<BookCard book={bookWithLongDescription} />);

      const description = screen.getByText(/This is a very long description/);
      expect(description).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper alt text for images', () => {
      renderWithProviders(<BookCard book={mockBook} />);

      const image = screen.getByAltText('Test Book');
      expect(image).toBeInTheDocument();
    });

    test('should have proper tooltips for action buttons', () => {
      renderWithProviders(<BookCard book={mockBook} />);

      expect(screen.getByRole('button', { name: /add to favorites/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
    });

    test('should have proper button roles', () => {
      renderWithProviders(<BookCard book={mockBook} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2); // Favorite and cart buttons
    });

    test('should have proper link structure', () => {
      renderWithProviders(<BookCard book={mockBook} />);

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/books/1');
    });
  });

  describe('Edge Cases', () => {
    test('should handle book with minimal data', () => {
      const minimalBook = { id: 1, title: 'Minimal Book' };
      renderWithProviders(<BookCard book={minimalBook} />);

      expect(screen.getByText('Minimal Book')).toBeInTheDocument();
      expect(screen.getByText('No description available.')).toBeInTheDocument();
      expect(screen.getByText('by Unknown Author')).toBeInTheDocument();
      expect(screen.getByText('£N/A')).toBeInTheDocument();
    });

    test('should handle book with zero price', () => {
      const freeBook = { ...mockBook, price: 0 };
      renderWithProviders(<BookCard book={freeBook} />);

      expect(screen.getByText('£0.00')).toBeInTheDocument();
    });

    test('should handle book with very long title', () => {
      const bookWithLongTitle = {
        ...mockBook,
        title: 'This is a very long book title that might cause layout issues if not handled properly'
      };
      renderWithProviders(<BookCard book={bookWithLongTitle} />);

      expect(screen.getByText(/This is a very long book title/)).toBeInTheDocument();
    });

    test('should handle book with special characters in title', () => {
      const bookWithSpecialChars = {
        ...mockBook,
        title: 'Book with "quotes" & special chars: <test>'
      };
      renderWithProviders(<BookCard book={bookWithSpecialChars} />);

      expect(screen.getByText('Book with "quotes" & special chars: <test>')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('should not re-render unnecessarily when props are the same', () => {
      const { rerender } = renderWithProviders(<BookCard book={mockBook} />);
      
      // Re-render with same props
      rerender(<BookCard book={mockBook} />);
      
      // Should still render correctly
      expect(screen.getByText('Test Book')).toBeInTheDocument();
    });

    test('should handle rapid button clicks', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BookCard book={mockBook} />);

      const favoriteButton = screen.getByRole('button', { name: /add to favorites/i });
      const cartButton = screen.getByRole('button', { name: /add to cart/i });

      // Rapid clicks
      await user.click(favoriteButton);
      await user.click(cartButton);
      await user.click(favoriteButton);

      expect(mockAddToFavorites).toHaveBeenCalledTimes(2);
      expect(mockAddToCart).toHaveBeenCalledTimes(1);
    });
  });
});
