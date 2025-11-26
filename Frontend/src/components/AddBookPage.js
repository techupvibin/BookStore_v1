import React, { useState } from 'react';
import { Box, Typography, Container, Paper, TextField, Button, Grid, CircularProgress, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const AddBookPage = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const [bookData, setBookData] = useState({
        title: '',
        description: '',
        isbn: '',
        publicationYear: '',
        genre: '',
        price: '',
        quantity: '',
        publisher: '',
        authors: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookData({ ...bookData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus('');

        // Parse numeric fields with defaults
        const publicationYear = bookData.publicationYear ? parseInt(bookData.publicationYear) : new Date().getFullYear();
        const price = bookData.price ? parseFloat(bookData.price) : 0;
        const quantity = bookData.quantity ? parseInt(bookData.quantity) : 1;

        // Parse authors string into array (comma-separated or newline-separated)
        // If authors is empty, use empty array (backend will handle validation)
        const authorsArray = bookData.authors && bookData.authors.trim()
            ? bookData.authors.split(/[,\n]/).map(a => a.trim()).filter(a => a.length > 0)
            : [];

        // Create bookCreationDTO object with trimmed values and defaults
        // Backend will handle validation and return proper error messages
        const bookCreationDTO = {
            title: bookData.title ? bookData.title.trim() : '',
            description: bookData.description ? bookData.description.trim() : '',
            isbn: bookData.isbn ? bookData.isbn.trim() : '',
            publicationYear: isNaN(publicationYear) ? new Date().getFullYear() : publicationYear,
            genre: bookData.genre ? bookData.genre.trim() : '',
            price: isNaN(price) ? 0 : price,
            quantity: isNaN(quantity) ? 1 : quantity,
            isAvailable: true,
            publisher: bookData.publisher ? bookData.publisher.trim() : '',
            authors: authorsArray  // Array will be converted to Set by Jackson
        };

        const formData = new FormData();
        
        // Append bookCreationDTO as JSON string (backend expects this format)
        formData.append('bookCreationDTO', new Blob([JSON.stringify(bookCreationDTO)], {
            type: 'application/json'
        }));

        // Only append imageFile if a file is selected (optional)
        if (selectedFile) {
            formData.append('imageFile', selectedFile);
        }

        try {
            // Get auth token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                setStatus('error: You must be logged in to add books.');
                setLoading(false);
                return;
            }

            // Log the data being sent for debugging
            console.log('Sending book data:', bookCreationDTO);
            console.log('Has image file:', !!selectedFile);

            const response = await axios.post('http://localhost:8080/api/books', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Don't set Content-Type - let axios set it for FormData
                }
            });

            setStatus('success: Book added successfully!');
            setBookData({
                title: '', description: '', isbn: '', publicationYear: '', genre: '', price: '', quantity: '', publisher: '', authors: ''
            });
            setSelectedFile(null);
            setPreviewUrl(null);
            
            // Optionally redirect or refresh
            setTimeout(() => {
                window.location.href = '/admin/books';
            }, 2000);
        } catch (error) {
            console.error('Upload error:', error);
            console.error('Error response:', error.response?.data);
            
            // Better error message handling - show backend validation errors
            let errorMessage = 'Failed to add book';
            
            if (error.response?.data) {
                // Handle validation errors from backend
                if (error.response.data.validationErrors) {
                    // Multiple validation errors
                    const errors = Object.values(error.response.data.validationErrors).join(', ');
                    errorMessage = `Validation errors: ${errors}`;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.status === 400) {
                    errorMessage = 'Please check the form fields. Some required fields may be missing or invalid.';
                } else if (error.response.status === 401) {
                    errorMessage = 'Unauthorized: Please login as admin.';
                } else if (error.response.status === 403) {
                    errorMessage = 'Forbidden: Admin access required.';
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setStatus(`error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 5 }}>
            <Paper elevation={5} sx={{ p: { xs: 3, md: 6 }, borderRadius: 2, backgroundColor: theme.palette.background.paper }}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Add New Book
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
                    Fill in the details below. Only Genre is required. Other fields have defaults or are optional.
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                margin="normal" 
                                label="Book Title *" 
                                name="title" 
                                value={bookData.title} 
                                onChange={handleInputChange}
                                placeholder="Enter book title"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                margin="normal" 
                                label="Description" 
                                name="description" 
                                value={bookData.description} 
                                onChange={handleInputChange}
                                multiline
                                rows={3}
                                placeholder="Enter book description (optional)"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                margin="normal" 
                                label="ISBN" 
                                name="isbn" 
                                value={bookData.isbn} 
                                onChange={handleInputChange}
                                placeholder="Enter ISBN (optional)"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                margin="normal" 
                                label="Publication Year" 
                                name="publicationYear" 
                                type="number" 
                                value={bookData.publicationYear} 
                                onChange={handleInputChange}
                                placeholder={new Date().getFullYear().toString()}
                                helperText={`Default: ${new Date().getFullYear()}`}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                margin="normal" 
                                label="Genre *" 
                                name="genre" 
                                value={bookData.genre} 
                                onChange={handleInputChange}
                                placeholder="e.g., Fiction, Science, History"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                margin="normal" 
                                label="Price" 
                                name="price" 
                                type="number" 
                                value={bookData.price} 
                                onChange={handleInputChange}
                                placeholder="0.00"
                                helperText="Default: 0.00"
                                inputProps={{ step: "0.01", min: "0" }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                margin="normal" 
                                label="Quantity" 
                                name="quantity" 
                                type="number" 
                                value={bookData.quantity} 
                                onChange={handleInputChange}
                                placeholder="1"
                                helperText="Default: 1"
                                inputProps={{ min: "0" }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                margin="normal" 
                                label="Publisher" 
                                name="publisher" 
                                value={bookData.publisher} 
                                onChange={handleInputChange}
                                placeholder="Enter publisher name (optional)"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth 
                                margin="normal" 
                                label="Authors" 
                                name="authors" 
                                value={bookData.authors} 
                                onChange={handleInputChange}
                                helperText="Enter author names separated by commas (e.g., John Doe, Jane Smith). Optional."
                                placeholder="John Doe, Jane Smith"
                            />
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 3, mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Book Cover Image <Typography component="span" variant="caption" color="text.secondary">(Optional)</Typography>
                        </Typography>
                        <Button variant="outlined" component="label">
                            {selectedFile ? 'Change Image' : 'Select Image'}
                            <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                        </Button>
                        {selectedFile && (
                            <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>
                                {selectedFile.name}
                            </Typography>
                        )}
                        {previewUrl && (
                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} />
                            </Box>
                        )}
                        {!selectedFile && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                You can add a book cover image later if needed.
                            </Typography>
                        )}
                    </Box>
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Book'}
                    </Button>
                    {status && (
                        <Alert severity={status.split(':')[0]} sx={{ mt: 2 }}>
                            {status.split(':')[1]}
                        </Alert>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default AddBookPage;