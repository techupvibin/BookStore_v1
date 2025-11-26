import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  Snackbar,
  Button,
  TextField,
  Autocomplete,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../contexts/AuthContext"; // Assuming this path is correct relative to src/components
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";
import { useCart } from "../contexts/CartContext"; // Assuming this path is correct relative to src/components

const api = axios.create({ baseURL: "http://localhost:8080/api" });

const AllBooksPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  const fetchBooks = useCallback(
    async (selectedGenre, search, selectedAuthor, selectedPublisher) => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (selectedGenre) params.category = selectedGenre;
        if (search) params.search = search;
        if (selectedAuthor) params.author = selectedAuthor;
        if (selectedPublisher) params.publisher = selectedPublisher;

        const response = await api.get("/books", { params });
        const bookData = Array.isArray(response.data)
          ? response.data
          : response.data.books || [];
        setBooks(bookData);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError("Failed to load books. Please try again later.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (!query) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await api.get("/books/suggestions", {
          params: { query },
        });
        setSuggestions(response.data || []);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setSuggestions([]);
      }
    }, 400),
    []
  );

  const fetchGenres = useCallback(async () => {
    try {
      const response = await api.get("/books/genres");
      const genreData = Array.isArray(response.data)
        ? response.data
        : response.data.genres || [];
      setGenres(genreData);
    } catch (err) {
      console.error("Error fetching genres:", err);
      setGenres([]);
    }
  }, []);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  useEffect(() => {
    fetchBooks(genre, searchTerm, author, publisher);
  }, [fetchBooks, genre, searchTerm, author, publisher]);

  const handleGenreChange = (e) => setGenre(e.target.value);
  const handleAuthorChange = (e) => setAuthor(e.target.value);
  const handlePublisherChange = (event) => {
    setPublisher(event.target.value);
  };

  const highlightText = (text, highlight) => {
    if (!highlight) return text;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = String(text).split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? <mark key={index}>{part}</mark> : part
    );
  };

  const handleAddToCart = (bookId) => {
    addToCart(bookId, 1);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading books...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => fetchBooks(genre, searchTerm, author, publisher)}
          sx={{ mt: 4 }}
        >
          Retry Loading Books
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: "background.default", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
        sx={{ fontWeight: "bold", color: "text.primary", mb: 4 }}
      >
        Available Books
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 4,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* Title Search */}
        <Autocomplete
          freeSolo
          options={suggestions}
          value={searchTerm}
          onInputChange={(e, value) => {
            setSearchTerm(value);
            fetchSuggestions(value);
          }}
          onChange={(e, value) => {
            if (value) setSearchTerm(value);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search by Title"
              variant="outlined"
              sx={{ minWidth: 300 }}
            />
          )}
        />

        {/* Genre Filter */}
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel>Genre</InputLabel>
          <Select value={genre} onChange={handleGenreChange} label="Genre">
            <MenuItem value="">
              <em>All Genres</em>
            </MenuItem>
            {genres.map((g) => (
              <MenuItem key={g} value={g}>
                {g}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Author Search Field */}
        <TextField
          label="Search by Author"
          variant="outlined"
          value={author}
          onChange={handleAuthorChange}
          sx={{ minWidth: 200 }}
        />

        {/* Publisher Search Field */}
        <TextField
          label="Search by Publisher"
          variant="outlined"
          value={publisher}
          onChange={handlePublisherChange}
          sx={{ minWidth: 200 }}
        />
      </Box>

      {/* Book Grid */}
      {books.length === 0 && searchTerm === "" && genre === "" && author === "" && publisher === "" ? (
        <Alert severity="info" sx={{ mt: 4 }}>
          No books available to display.
        </Alert>
      ) : books.length === 0 ? (
        <Alert severity="info" sx={{ mt: 4 }}>
          No books found matching your criteria.
        </Alert>
      ) : (
        <Grid container spacing={4}>
          {books.map((book) => (
            <Grid item key={book.id} xs={12} sm={6} md={4} lg={4}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: 3,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": { transform: "translateY(-5px)", boxShadow: 6 },
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={
                    book.imageUrl ||
                    `https://placehold.co/200x200/cccccc/333333?text=${encodeURIComponent(
                      book.title || "No Title"
                    )}`
                  }
                  alt={book.title}
                  sx={{ objectFit: "cover" }}
                  
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    sx={{ fontWeight: "bold" }}
                  >
                    {highlightText(book.title, searchTerm)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Genre: {book.genre || "N/A"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Author: {book.authorNames ? book.authorNames.join(', ') : "N/A"}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="primary.main"
                    sx={{ fontWeight: "bold", mt: 1 }}
                  >
                    $
                    {(typeof book.price === "number" ? book.price : 0).toFixed(
                      2
                    )}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 4 }}
                    onClick={() => navigate(`/books/${book.id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AllBooksPage;
