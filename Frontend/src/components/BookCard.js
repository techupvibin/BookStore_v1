import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';

const BookCard = ({ book }) => {
  const theme = useTheme();
  // Destructure addToCart and cartItems from useCart.
  // getQuantity is no longer provided by the CartContext.
  const { addToCart, cartItems } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  // Determine if the book is a favorite
  const isFav = isFavorite(book.id);

  // ⭐ Updated isInCart logic: Check if any item in cartItems matches the book's ID.
  // Cart items now have bookId, not id directly, as per CartItemDTO from backend.
  const isInCart = cartItems.some(item => item.bookId === book.id);

  // Handler for adding/removing from favorites
  const handleFavoriteClick = (e) => {
    e.preventDefault(); // Prevent navigating to book detail page
    isFav ? removeFromFavorites(book.id) : addToFavorites(book);
  };

  // Handler for adding to cart
  const handleAddToCartClick = (e) => {
    e.preventDefault(); // Prevent navigating to book detail page
    // Pass book.id and quantity (e.g., 1) to addToCart
    // The CartContext's addToCart expects (bookId, quantity)
    addToCart(book.id, 1);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        backgroundColor: theme.palette.background.paper,
        position: 'relative', // For positioning favorite/cart buttons
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        height: '100%', // Ensures cards in a grid have consistent height
        transition: 'transform 0.8s ease-in-out', // Smooth hover effect
        '&:hover': {
          transform: 'translateY(-5px)', // Lift card on hover
          '& img': {
            transform: 'scale(1.05)', // Zoom image on hover
          },
        },
        '& img': {
          transition: 'transform 0.3s ease-in-out', // Smooth image zoom
        },
      }}
    >
      {/* Link to the Book Detail Page */}
      <Link to={`/books/${book.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}>
        {/* Book Cover Image */}
        <Box
          component="img"
          // Use book.imageUrl, with a placeholder fallback
          src={book.imageUrl || 'https://placehold.co/150x200/1f2937/F3F4F6?text=No+Image'}
          alt={book.title}
          sx={{
            width: '100%',
            maxWidth: 150, // Max width for the image
            height: 200,    // Fixed height for consistent card layout
            objectFit: 'cover', // Crop image to fit, maintaining aspect ratio
            borderRadius: 2, // Rounded corners for the image
            mb: 1, // Margin bottom
          }}
        />
        {/* Book Title */}
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {book.title}
        </Typography>
        {/* Book Description (Truncated) */}
        <Typography
          variant="body2" // Using a standard Material-UI typography variant
          color="text.secondary"
          sx={{
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3, // Limit text to 3 lines
            WebkitBoxOrient: 'vertical',
            minHeight: '3em', // Ensure consistent height for description area even if short
          }}
        >
          {book.description || 'No description available.'} {/* Display description or fallback text */}
        </Typography>
        {/* Book Author(s) */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          by {book.authorNames || 'Unknown Author'} {/* Display author names or fallback text */}
        </Typography>
        {/* Book Price */}
        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
          £{book.price?.toFixed(2) || 'N/A'} {/* Display price in GBP */}
        </Typography>
      </Link>

      {/* Action Buttons (Favorite and Add to Cart) - positioned absolutely */}
      <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
        <Tooltip title={isFav ? 'Remove from favorites' : 'Add to favorites'}>
          <IconButton
            onClick={handleFavoriteClick}
            sx={{ color: isFav ? theme.palette.secondary.main : theme.palette.text.secondary }}
          >
            {/* Fill heart icon if it's a favorite */}
            <Heart size={20} fill={isFav ? theme.palette.secondary.main : 'none'} />
          </IconButton>
        </Tooltip>
        <Tooltip title={isInCart ? 'Already in cart' : 'Add to cart'}>
          <IconButton
            onClick={handleAddToCartClick}
            sx={{ color: isInCart ? theme.palette.primary.main : theme.palette.text.secondary }}
          >
            <ShoppingCart size={20} />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default BookCard;
