import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { HeartOff } from 'lucide-react'; // Icon for removing from favorites

import { useFavorites } from '../contexts/FavoritesContext'; // Import the new context

const FavouritesPage = () => {
  const theme = useTheme();
  const { favorites, loading, error, removeFromFavorites, fetchFavorites } = useFavorites();

  useEffect(() => {
    // Fetch favorites when the component mounts or dependencies change
    fetchFavorites();
  }, [fetchFavorites]); // fetchFavorites is stable due to useCallback

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading favorites...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load favorite books: {error.message || 'An unexpected error occurred.'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
        Your Favourites
      </Typography>
      <Divider sx={{ my: 3 }} />

      {favorites.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <HeartOff size={64} color={theme.palette.text.secondary} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            You haven't added any books to your favorites yet.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Start exploring books and click the heart icon to add them!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {favorites.map((fav) => (
            <Grid item key={fav.bookId} xs={12} sm={6} md={4} lg={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, boxShadow: theme.shadows[3] }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={fav.bookImageUrl || "https://placehold.co/200x300/a0a0a0/ffffff?text=No+Image"}
                  alt={fav.bookTitle || 'Book Cover'}
                  sx={{ objectFit: 'cover', borderBottom: `1px solid ${theme.palette.divider}` }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div" noWrap>
                    {fav.bookTitle || 'Unknown Title'}
                  </Typography>
                  {fav.bookPrice != null && (
                    <Typography variant="body2" color="text.secondary">
                      Price: £{Number(fav.bookPrice).toFixed(2)}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<HeartOff size={20} />}
                    onClick={() => removeFromFavorites(fav.bookId)}
                    sx={{ borderRadius: 9999, textTransform: 'none' }}
                  >
                    Remove
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default FavouritesPage;
