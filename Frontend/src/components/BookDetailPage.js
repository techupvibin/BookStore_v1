// src/components/BookDetailPage.js
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import axios from 'axios';

const BookDetailPage = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sampleOpen, setSampleOpen] = useState(false);
  const [activeImg, setActiveImg] = useState('');
  const [sampleText, setSampleText] = useState('');
  // Magnifying Glass Zoom state
  const imgBoxRef = useRef(null);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomBgPos, setZoomBgPos] = useState('50% 50%');
  const [zoomBgSize, setZoomBgSize] = useState('300%');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // ⭐ Use the context hooks
  const { addToCart, cartItems } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/books/${bookId}`);
        setBook(response.data);
        setActiveImg(response.data?.imageUrl || '');
      } catch (error) {
        console.error('Error fetching book details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [bookId]);

  // Load sample text once book is available
  useEffect(() => {
    const loadSample = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/books/${bookId}/sample`);
        setSampleText(res.data?.sample || '');
      } catch (e) {
        setSampleText(book?.description || '');
      }
    };
    if (book) loadSample();
  }, [book, bookId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!book) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5" color="error">
          Book not found.
        </Typography>
      </Box>
    );
  }

  const handleFavoriteToggle = () => {
    if (isFavorite(book.id)) {
      removeFromFavorites(book.id);
    } else {
      addToFavorites(book.id);
    }
  };

  const handleAddToCart = () => {
    // ⭐ Call the context function directly
    addToCart(book.id, 1);
  };

  // ⭐ Use the context state to check if the book is in the cart
  const inCart = cartItems.some(item => item.bookId === book.id);

  

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', mt: 4, px: { xs: 2, md: 3 } }}>
      <Card sx={{ p: { xs: 2, md: 3 }, boxShadow: 4 }}>
        <Grid container spacing={3}>
          {/* Left: Image preview with hover zoom */}
          <Grid item xs={12} md={5}>
            <Stack spacing={2}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  pt: '130%', // aspect ratio box
                  overflow: 'hidden',
                  borderRadius: 2,
                  border: theme => `1px solid ${theme.palette.divider}`,
                  cursor: 'zoom-in',
                }}
                ref={imgBoxRef}
                onMouseEnter={() => setZoomVisible(true)}
                onMouseLeave={() => setZoomVisible(false)}
                onMouseMove={(e) => {
                  const rect = imgBoxRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  
                  // Calculate mouse position relative to the image
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  
                  // Update zoom background position
                  setZoomBgPos(`${x}% ${y}%`);
                  
                  // Update mouse position for magnifying glass
                  setMousePos({ x: e.clientX, y: e.clientY });
                }}
              >
                <Box
                  component="img"
                  src={activeImg || 'https://placehold.co/400x520/1f2937/F3F4F6?text=No+Image'}
                  alt={book.title}
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'all 0.3s ease',
                    filter: zoomVisible ? 'brightness(1.1)' : 'brightness(1)',
                    transform: zoomVisible ? 'scale(1.02)' : 'scale(1)',
                  }}
                />
                {/* Magnifying Glass Zoom Panel (md and up) */}
                <Box
                  sx={{
                    display: { xs: 'none', md: 'block' },
                    position: 'fixed',
                    left: mousePos.x + 20,
                    top: mousePos.y - 100,
                    width: 200,
                    height: 200,
                    border: '2px solid #fff',
                    borderRadius: '50%',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    backgroundColor: 'transparent',
                    backgroundImage: `url(${activeImg || ''})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: zoomBgSize,
                    backgroundPosition: zoomBgPos,
                    opacity: zoomVisible ? 1 : 0,
                    pointerEvents: 'none',
                    transition: 'all 0.15s ease',
                    zIndex: 9999,
                    transform: 'translate(-50%, -50%)',
                    overflow: 'hidden',
                    // Add a subtle scale effect when zoom is visible
                    transform: zoomVisible ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.95)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    bgcolor: 'rgba(0,0,0,0.75)',
                    color: '#fff',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  🔍 Hover to zoom
                </Box>
              </Box>
              <Stack direction="row" spacing={1}>
                {(book.imageUrl ? [book.imageUrl] : []).map((src) => (
                  <Box
                    key={src}
                    component="img"
                    src={src}
                    alt="thumbnail"
                    onClick={() => setActiveImg(src)}
                    sx={{
                      width: 64,
                      height: 88,
                      objectFit: 'cover',
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: theme => `1px solid ${theme.palette.divider}`
                    }}
                  />
                ))}
              </Stack>
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={() => setSampleOpen(true)}>Read sample</Button>
              </Stack>
            </Stack>
          </Grid>

          {/* Right: Book info and actions */}
          <Grid item xs={12} md={7}>
            <Typography variant="h4" gutterBottom>{book.title}</Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              by {book.authorNames ? (Array.isArray(book.authorNames) ? book.authorNames.join(', ') : book.authorNames) : (book.author || 'Unknown')}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
              Price: £{book.price?.toFixed(2) || 'N/A'}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddToCart}
                disabled={inCart}
              >
                {inCart ? 'In Cart' : 'Add to Cart'}
              </Button>
              <Button
                variant="outlined"
                color={isFavorite(book.id) ? 'secondary' : 'primary'}
                onClick={handleFavoriteToggle}
              >
                {isFavorite(book.id) ? 'Remove from Favorites' : 'Add to Favorites'}
              </Button>
            </Stack>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {book.description || 'No description available.'}
            </Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Read sample dialog */}
      <Dialog open={sampleOpen} onClose={() => setSampleOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Read sample</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {sampleText || 'Sample not available.'}
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default BookDetailPage;