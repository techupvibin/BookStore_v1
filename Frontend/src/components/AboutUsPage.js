import React from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Button,
} from "@mui/material";

const AboutUsPage = () => {
  return (
    <Box sx={{ bgcolor: "background.default", color: "text.primary" }}>
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        {/* Header Section */}
        <Box
          sx={{
            textAlign: "center",
            mb: { xs: 6, md: 8 },
            py: { xs: 4, md: 6 },
            background: "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)",
            borderRadius: "20px",
            color: "white",
            boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 800, letterSpacing: 1 }}
          >
            Discover Dream Books
          </Typography>
          <Typography
            variant="h6"
            sx={{
              maxWidth: "720px",
              mx: "auto",
              opacity: 0.95,
              lineHeight: 1.7,
              fontWeight: 300,
            }}
          >
            A modern space where books meet technology. From local favorites to
            global stories, explore a world of imagination and inspiration.
          </Typography>
        </Box>

        {/* Our Story */}
        <Grid container spacing={6} alignItems="center" sx={{ mb: 12 }}>
          <Grid item xs={12} md={6}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontWeight: 700, mb: 3 }}
            >
              Our Story
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              Founded in 2023 in Greenock, Scotland — Dream Books started as a
              cozy local bookstore. What began with shelves of hand-picked
              novels and friendly chats over coffee has now grown into a global
              reading destination.
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              Our mission is simple: make reading personal, modern, and
              accessible to everyone, everywhere.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80"
              alt="Bookstore interior"
              sx={{
                width: "100%",
                borderRadius: "20px",
                boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
              }}
            />
          </Grid>
        </Grid>

        {/* Visit Our Store */}
        <Grid container spacing={6} alignItems="center" sx={{ mb: 12 }}>
          <Grid item xs={12} md={6}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontWeight: 700, mb: 3 }}
            >
              Visit Our Store
            </Typography>
            <Typography
              variant="body1"
              paragraph
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              Find us in the heart of Greenock, Scotland. A space to relax,
              discover, and fall in love with your next favorite book.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: "relative",
                height: 400,
                backgroundColor: "grey.200",
                border: "1px solid #ccc",
                top: 0,
                width: "375%",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
              }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8976.710448759455!2d-4.7600039!3d55.9472024!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4889bf91d3ed1d35%3A0x7f2e7b0d8891d3c1!2sGreenock%2C%20Scotland!5e0!3m2!1sen!2suk!4v1692200000000!5m2!1sen!2suk"
                width="100%"
                height="400"
                style={{ border: 0, display: "" }}
                allowFullScreen
                loading="lazy"
                title="Store Location Map"
              ></iframe>
            </Box>
          </Grid>
        </Grid>

        {/* Connect With Us */}
        <Box sx={{ textAlign: "center", py: 5 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Stay Connected
          </Typography>
          <Typography
            variant="body1"
            paragraph
            color="text.secondary"
            sx={{ maxWidth: "700px", mx: "auto", mb: 4 }}
          >
            Follow us for new arrivals, exclusive events, and personalized
            recommendations.
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              sx={{ mr: 2, borderRadius: 0, px: 3 }}
            >
              Shop Online
            </Button>
            <Button variant="outlined" sx={{ mr: 2, borderRadius: 0 }}>
              Instagram
            </Button>
            <Button variant="outlined" sx={{ mr: 2, borderRadius: 0 }}>
              Facebook
            </Button>
            <Button variant="outlined" sx={{ borderRadius: 0 }}>
              Twitter
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutUsPage;
