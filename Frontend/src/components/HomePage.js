import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Container, CircularProgress, Alert } from '@mui/material';
import BackgroundVideo from './BackgroundVideo';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import SupportChatWidget from './SupportChatWidget';
import { BookService } from '../services/api';

// Import react-slick styles
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Carousel settings
const carouselSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  responsive: [
    {
      breakpoint: 1024,
      settings: { slidesToShow: 3, slidesToScroll: 1 }
    },
    {
      breakpoint: 600,
      settings: { slidesToShow: 2, slidesToScroll: 1 }
    },
    {
      breakpoint: 480,
      settings: { slidesToShow: 1, slidesToScroll: 1 }
    }
  ]
};

const HomePage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  const handleDiscoverBooksClick = () => {
    navigate('/books');
  };



  useEffect(() => {
    const fetchRecentBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await BookService.fetchBooks();
        setBooks(data);
      } catch (err) {
        console.error('Failed to fetch recent books:', err);
        setError('Failed to load recent books. Please check your network or server connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentBooks();
  }, []);

  return (
    <Box>
      {/* Hero Section with responsive full-bleed background video */}
      <Box sx={{ position: 'relative', width: '100%', minHeight: 'calc(100vh - 64px)' }}>
        <BackgroundVideo videoId="Ovd89QJmQZE">
          <Container
            maxWidth="md"
            sx={{
              position: 'relative',
              zIndex: 2,
              minHeight: 'calc(100vh - 64px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              px: { xs: 2, md: 4 },
              color: '#ffffff',
            }}
          >
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.75rem' },
              }}
            >
              Discover Your Next Great Read
            </Typography>
            <Typography
              variant="h5"
              sx={{ mb: 4, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}
            >
              Uncover captivating stories, enriching knowledge, and endless inspiration in our curated collection of books.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={handleDiscoverBooksClick}
              sx={{ px: { xs: 3, md: 4 }, py: { xs: 1, md: 1.5 }, fontSize: { xs: '0.9rem', md: '1.1rem' } }}
            >
              Discover Books
            </Button>
          </Container>
        </BackgroundVideo>
      </Box>

      {/* Recently Added Books Carousel */}
      <Container maxWidth="xl" sx={{ mt: 5, mb: 5 }}>
        <Box sx={{ my: 5 }}>
          <Typography
            variant="h4"
            component="h3"
            sx={{ fontWeight: 'bold', mb: 3, fontSize: { xs: '1.8rem', md: '2.125rem' } }}
          >
            Recently Added Books
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            books.length > 0 && (
              <Box sx={{ my: 4, width: '100%', overflow: 'hidden' }}>
                <Slider {...carouselSettings}>
                  {books.filter(book => book.imageUrl).map(book => (
                    <Box key={book.id} sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
                      <Paper
                        elevation={4}
                        sx={{
                          width: 200,
                          height: 300,
                          borderRadius: '12px',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          bgcolor: 'background.paper',
                          transition: 'transform 0.3s ease-in-out',
                          '&:hover': { transform: 'scale(1.03)' },
                        }}
                      >
                        <img
                          src={book.imageUrl}
                          alt={book.title}
                          style={{
                            width: '100%',
                            height: '80%',
                            objectFit: 'cover',
                            borderTopLeftRadius: '12px',
                            borderTopRightRadius: '12px',
                          }}
                          
                        />
                        <Typography variant="subtitle2" sx={{ mt: 1, textAlign: 'center', px: 1 }}>
                          {book.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', px: 1 }}>
                          {book.authors}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                </Slider>
              </Box>
            )
          )}
        </Box>
      </Container>

      <SupportChatWidget />
      
      
         </Box>
   );
 };

export default HomePage;
