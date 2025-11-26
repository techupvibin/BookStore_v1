import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import LinearProgress from '@mui/material/LinearProgress';
import { useTheme } from '@mui/material/styles';
import {
  Book as BookIcon, CheckCircle, Library, Plus, Edit, Trash2, Upload, Camera
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// -------------------------------------------------------------------------
// --- API Service (Using Axios) ---
// -------------------------------------------------------------------------
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

const realApi = {
  BookService: {
    fetchBooks: (category, search) => {
      let url = '/books';
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (params.toString()) url += `?${params.toString()}`;
      return api.get(url);
    },
    createBook: (bookData, imageFile) => {
      const formData = new FormData();
      formData.append('bookCreationDTO', new Blob([JSON.stringify(bookData)], { type: 'application/json' }));
      if (imageFile) formData.append('imageFile', imageFile);
      return api.post('/books', formData);
    },
    updateBook: (id, bookData, imageFile) => {
      const formData = new FormData();
      formData.append('bookUpdateDTO', new Blob([JSON.stringify(bookData)], { type: 'application/json' }));
      if (imageFile) formData.append('imageFile', imageFile);
      return api.put(`/books/${id}`, formData);
    },
    deleteBook: (id) => api.delete(`/books/${id}`),
    uploadCsv: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/books/bulk/csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
  },
};

// -------------------------------------------------------------------------
// --- Main AdminBooksManagementPage Component ---
// -------------------------------------------------------------------------
const AdminBooksManagementPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const theme = useTheme();

  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [lowStockThreshold, setLowStockThreshold] = useState(() => {
    try {
      const v = localStorage.getItem('admin.lowStock');
      return v ? parseInt(v, 10) : 5;
    } catch { return 5; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [dialogState, setDialogState] = useState({
    open: false,
    mode: 'add',
    currentBook: {
      id: null,
      title: '',
      description: '',
      isbn: '',
      publicationYear: '',
      imageUrl: '',
      genre: '',
      price: '',
      quantity: '',
      isAvailable: false,
      publisher: '',
      authors: '',
    },
    selectedFile: null,
    previewUrl: null,
  });

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    bookId: null,
  });

  const [csvUploading, setCsvUploading] = useState(false);
  const [csvResult, setCsvResult] = useState(null); // {created, updated, failed}
  


  const totalBooks = books.length;
  const availableBooksCount = books.filter(book => Number(book.quantity ?? 0) > 0).length;
  const outOfStockBooksCount = books.filter(book => Number(book.quantity ?? 0) === 0).length;
  const soldBooksCount = orders.reduce((sum, o) => {
    const status = String(o?.status || o?.orderStatus || '').toUpperCase();
    const paid = status === 'DELIVERED' || status === 'PAID' || status === 'COMPLETED';
    if (!paid) return sum;
    const items = Array.isArray(o?.books) ? o.books : (Array.isArray(o?.orderItems) ? o.orderItems : []);
    const qty = items.reduce((s, it) => s + Number(it?.quantity ?? 0), 0);
    return sum + qty;
  }, 0);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [booksRes, ordersRes] = await Promise.all([
        realApi.BookService.fetchBooks(),
        api.get('/admin/orders'),
      ]);

      const fetchedBooks = (booksRes.data || []).map(book => ({
        ...book,
        publisher: book.publisherName || 'N/A',
        authors: book.authorNames?.join(', ') || 'N/A',
        isAvailable: book.isAvailable ?? false,
      }));
      setBooks(fetchedBooks || []);
      setOrders(ordersRes.data || []);
      showSnackbar('Data loaded successfully!', 'success');
    } catch (err) {
      console.error("Failed to load initial data:", err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load data. Please ensure the backend is running and accessible.';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    if (!isAuthenticated || !user || !user.roles.includes('ROLE_ADMIN')) {
      console.log('Access denied. Redirecting to login.');
      navigate('/login');
    } else {
      fetchAllData();
    }
  }, [fetchAllData, navigate, user, isAuthenticated]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDialogState(prev => ({
      ...prev,
      currentBook: {
        ...prev.currentBook,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleImageChangeDialog = (e) => {
    const file = e.target.files[0];
    setDialogState(prev => ({
      ...prev,
      selectedFile: file,
      previewUrl: file ? URL.createObjectURL(file) : null
    }));
  };

  const handleInlineImageChange = async (e, bookId) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const existingBook = books.find(b => b.id === bookId);
      if (!existingBook) {
        showSnackbar('Book not found for image update.', 'error');
        setLoading(false);
        return;
      }
      await realApi.BookService.updateBook(bookId, {
        ...existingBook,
        publicationYear: parseInt(existingBook.publicationYear, 10),
        // Fix: Ensure authors is properly formatted as an array
        authors: Array.isArray(existingBook.authorNames) 
          ? existingBook.authorNames 
          : (Array.isArray(existingBook.authors) ? existingBook.authors : [existingBook.authors || '']),
      }, file);
      showSnackbar('Image updated successfully!', 'success');
      fetchAllData();
    } catch (error) {
      console.error('Error uploading inline image:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update image.';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
    e.target.value = null;
  };

  const openAdd = () => {
    setDialogState({
      open: true,
      mode: 'add',
      currentBook: {
        id: null,
        title: '',
        description: '',
        isbn: '',
        publicationYear: '',
        imageUrl: '',
        genre: '',
        price: '',
        quantity: '',
        isAvailable: false,
        publisher: '',
        authors: '',
      },
      selectedFile: null,
      previewUrl: null,
    });
  };

  const openEdit = (book) => {
    setDialogState({
      open: true,
      mode: 'edit',
      currentBook: {
        ...book,
        publicationYear: book.publicationYear?.toString() || '',
        price: book.price?.toFixed(2) || '',
        quantity: book.quantity?.toString() || '',
        isAvailable: book.isAvailable ?? false,
        // Fix: Convert authors array to comma-separated string for the form
        authors: Array.isArray(book.authorNames) 
          ? book.authorNames.join(', ') 
          : (Array.isArray(book.authors) ? book.authors.join(', ') : book.authors || ''),
      },
      selectedFile: null,
      previewUrl: book.imageUrl,
    });
  };

  const handleDialogClose = () => {
    setDialogState(prev => ({ ...prev, open: false }));
  };

  const handleSave = async () => {
    const { currentBook, mode, selectedFile } = dialogState;

    // COMMENTED OUT: Allow empty fields - backend will handle validation
    // if (!currentBook.title || !currentBook.isbn ||
    //   !currentBook.genre || !currentBook.publisher || !currentBook.authors ||
    //   (mode === 'add' && !currentBook.description)) {
    //   showSnackbar('Please fill all mandatory text fields.', 'warning');
    //   return;
    // }

    // Parse numeric fields with defaults if empty
    const parsedPublicationYear = currentBook.publicationYear 
      ? parseInt(currentBook.publicationYear, 10) 
      : new Date().getFullYear();
    const parsedPrice = currentBook.price ? parseFloat(currentBook.price) : 0;
    const parsedQuantity = currentBook.quantity ? parseInt(currentBook.quantity, 10) : 1;

    // COMMENTED OUT: Allow defaults - backend will handle validation
    // if (isNaN(parsedPublicationYear) || parsedPublicationYear < 1400 || isNaN(parsedPrice) || parsedPrice < 0 || isNaN(parsedQuantity) || parsedQuantity < 0) {
    //   showSnackbar('Publication Year, Price, and Quantity must be valid numbers. Publication Year must be after 1400.', 'warning');
    //   return;
    // }

    // Use defaults if parsing failed
    const finalPublicationYear = isNaN(parsedPublicationYear) || parsedPublicationYear < 1400 
      ? new Date().getFullYear() 
      : parsedPublicationYear;
    const finalPrice = isNaN(parsedPrice) || parsedPrice < 0 ? 0 : parsedPrice;
    const finalQuantity = isNaN(parsedQuantity) || parsedQuantity < 0 ? 1 : parsedQuantity;

    // Image is optional - can be added later if needed

    // Parse authors - allow empty array if no authors provided
    let authorsArray = [];
    if (currentBook.authors) {
      if (Array.isArray(currentBook.authors)) {
        authorsArray = currentBook.authors;
      } else if (typeof currentBook.authors === 'string' && currentBook.authors.trim()) {
        authorsArray = currentBook.authors.split(',').map(a => a.trim()).filter(Boolean);
      }
    }

    const bookDataForApi = {
      title: currentBook.title || '',
      description: currentBook.description || '',
      isbn: currentBook.isbn || '',
      publicationYear: finalPublicationYear,
      genre: currentBook.genre || '',
      price: finalPrice,
      quantity: finalQuantity,
      isAvailable: !!currentBook.isAvailable,
      publisher: currentBook.publisher || '',
      authors: authorsArray,
    };

    setLoading(true);
    try {
      if (mode === 'add') {
        await realApi.BookService.createBook(bookDataForApi, selectedFile);
        showSnackbar('Book added successfully!', 'success');
      } else {
        await realApi.BookService.updateBook(currentBook.id, bookDataForApi, selectedFile);
        showSnackbar('Book updated successfully!', 'success');
      }
      handleDialogClose();
      fetchAllData();
      setError(null);
    } catch (e) {
      console.error("Save failed:", e);
      const errorMessage = e.response?.data?.message || e.message || 'Failed to save book.';
      showSnackbar(errorMessage, 'error');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeleteOpen = (id) => {
    setConfirmDialog({ open: true, bookId: id });
  };

  const handleConfirmDeleteClose = () => {
    setConfirmDialog({ open: false, bookId: null });
  };

  const handleDeleteConfirmed = async () => {
    const { bookId } = confirmDialog;
    setConfirmDialog({ open: false, bookId: null });
    if (!bookId) return;

    setLoading(true);
    try {
      await realApi.BookService.deleteBook(bookId);
      showSnackbar('Book deleted successfully!', 'success');
      fetchAllData();
      setError(null);
    } catch (e) {
      console.error("Delete failed:", e);
      const errorMessage = e.response?.data?.message || e.message || 'Failed to delete book.';
      showSnackbar(errorMessage, 'error');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };



  return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', bgcolor: theme.palette.background.default }}>


        <Box component="main" sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2, md: 2.5 }, width: '100%', maxWidth: '100%', mx: 'auto' }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              mb: 3,
              fontWeight: 700,
              color: theme.palette.text.primary,
            }}
          >
            Books Management
          </Typography>

          {/* Revised Button Position */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mb: 3,
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={openAdd}
            >
              Add New Book
            </Button>
            <Button
              component="label"
              variant="outlined"
              startIcon={<Upload size={20} />}
            >
              Upload CSV
              <input
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setCsvUploading(true);
                  setCsvResult(null);
                  try {
                    const { data } = await realApi.BookService.uploadCsv(file);
                    setCsvResult(data);
                    showSnackbar('CSV processed successfully', 'success');
                    fetchAllData();
                  } catch (err) {
                    console.error('CSV upload failed', err);
                    showSnackbar(err.response?.data?.error || 'CSV upload failed', 'error');
                  } finally {
                    setCsvUploading(false);
                    e.target.value = '';
                  }
                }}
              />
            </Button>
            <Button
              variant="outlined"
              startIcon={<Upload size={20} />}
              onClick={fetchAllData}
            >
              Refresh Data
            </Button>
          </Box>

          {csvUploading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary">Uploading CSV...</Typography>
            </Box>
          )}
          {csvResult && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Imported: created {csvResult.created ?? 0}, updated {csvResult.updated ?? 0}, failed {csvResult.failed ?? 0}
            </Alert>
          )}

          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard title="Total Books" value={totalBooks} icon={<BookIcon />} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard title="Available Books" value={availableBooksCount} icon={<CheckCircle />} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard title="Sold Books" value={soldBooksCount} icon={<Library />} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard title="Out of Stock Books" value={outOfStockBooksCount} icon={<BookIcon />} />
            </Grid>
          </Grid>

          {books.some(b => Number(b.quantity ?? 0) < lowStockThreshold) && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Some books are below the low stock threshold ({lowStockThreshold}). Consider restocking.
            </Alert>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {!loading && !error && (
            <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: '12px', overflowX: 'auto' }}>
              <Table aria-label="books table" sx={{ minWidth: 1400 }}>
                                  <TableHead sx={{ backgroundColor: 'grey.100' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', minWidth: 320 }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', minWidth: 200 }}>Author(s)</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', minWidth: 160 }}>ISBN</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', minWidth: 100 }} align="right">Year</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', minWidth: 150 }}>Genre</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', minWidth: 100 }} align="right">Price</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', minWidth: 100 }} align="right">Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', minWidth: 120 }} align="center">Available</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', minWidth: 180 }}>Publisher</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', minWidth: 240 }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                <TableBody>
                  {books.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary">No books found. Add one!</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    books.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(book => (
                      <TableRow
                        key={book.id} hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {book.imageUrl ? (
                              <Avatar
                                variant="square" src={book.imageUrl} alt={book.title}
                                sx={{ width: 56, height: 80, objectFit: 'cover', flexShrink: 0 }}
                              />
                            ) : (
                              <Avatar
                                variant="square" sx={{ width: 56, height: 80, bgcolor: 'grey.300', flexShrink: 0 }}
                              >
                                <BookIcon />
                              </Avatar>
                            )}
                            <Typography noWrap title={book.title}>{book.title}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography noWrap title={book.authors}>{book.authors}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography noWrap title={book.isbn} sx={{ maxWidth: 160 }}>{book.isbn}</Typography>
                        </TableCell>
                        <TableCell align="right">{book.publicationYear}</TableCell>
                        <TableCell>
                          <Typography noWrap title={book.genre} sx={{ maxWidth: 160 }}>{book.genre}</Typography>
                        </TableCell>
                        <TableCell align="right">£{book.price?.toFixed(2)}</TableCell>
                        <TableCell align="right">{book.quantity}</TableCell>

                        <TableCell align="center">
                          {book.isAvailable ?
                            <CheckCircle color="success" size={20} style={{ color: theme.palette.success.main }} /> :
                            <BookIcon size={20} style={{ color: theme.palette.grey[500] }} />
                          }
                        </TableCell>
                        <TableCell>
                          <Typography noWrap title={book.publisher} sx={{ maxWidth: 200 }}>{book.publisher}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
                            <Button
                              component="label" size="small" startIcon={<Camera size={16} />}
                              title="Upload Image" sx={{ textTransform: 'none' }}
                            >
                              Upload
                              <input
                                type="file" hidden accept="image/*"
                                onChange={e => handleInlineImageChange(e, book.id)}
                              />
                            </Button>
                            <Button
                              size="small" startIcon={<Edit size={16} />}
                              onClick={() => openEdit(book)} sx={{ textTransform: 'none' }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small" color="error" startIcon={<Trash2 size={16} />}
                              onClick={() => handleConfirmDeleteOpen(book.id)}
                              sx={{ textTransform: 'none' }}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={books.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[5, 10, 25]}
                SelectProps={{
                  MenuProps: {
                    disablePortal: false,
                    keepMounted: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'center' },
                    transformOrigin: { vertical: 'bottom', horizontal: 'center' },
                  },
                }}
                sx={{
                  position: 'relative',
                  zIndex: 3,
                }}
              />
            </TableContainer>
          )}

          <Dialog open={dialogState.open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ 
              bgcolor: theme.palette.primary.main, 
              color: theme.palette.primary.contrastText 
            }}>
              {dialogState.mode === 'add' ? 'Add New Book' : 'Edit Book'}
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 2.5 }}>
              <TextField name="title" label="Title" value={dialogState.currentBook.title} onChange={handleInputChange} fullWidth variant="outlined" margin="dense" required />
              {dialogState.mode === 'add' && (
                <TextField
                  name="description"
                  label="Description"
                  value={dialogState.currentBook.description}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  required
                  multiline
                  rows={3}
                />
              )}
              <TextField name="isbn" label="ISBN" value={dialogState.currentBook.isbn} onChange={handleInputChange} fullWidth variant="outlined" margin="dense" required />
              <TextField name="publicationYear" label="Publication Year" type="number" value={dialogState.currentBook.publicationYear} onChange={handleInputChange} fullWidth variant="outlined" margin="dense" inputProps={{ min: 1000, max: new Date().getFullYear() + 1 }} required />
              <TextField name="genre" label="Genre" value={dialogState.currentBook.genre} onChange={handleInputChange} fullWidth variant="outlined" margin="dense" required />
              <TextField name="price" label="Price" type="number" value={dialogState.currentBook.price} onChange={handleInputChange} fullWidth variant="outlined" margin="dense" inputProps={{ step: "0.01", min: 0 }} required />
              <TextField name="quantity" label="Quantity" type="number" value={dialogState.currentBook.quantity} onChange={handleInputChange} fullWidth variant="outlined" margin="dense" inputProps={{ min: 0 }} required />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={dialogState.currentBook.isAvailable}
                    onChange={handleInputChange} name="isAvailable" color="primary"
                  />
                } label="Available"
              />

              <TextField
                name="publisher"
                label="Publisher Name"
                value={dialogState.currentBook.publisher}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                margin="dense"
                required
              />

              <TextField
                name="authors"
                label="Author Name(s) (comma-separated)"
                value={dialogState.currentBook.authors}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                margin="dense"
                helperText="Enter multiple authors separated by commas (e.g., 'Author One, Author Two')"
              />

              <Box sx={{ mt: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  {dialogState.previewUrl ? (
                    <Avatar
                      variant="square" src={dialogState.previewUrl} alt="Book Cover"
                      sx={{ width: 80, height: 120, objectFit: 'cover', border: `1px solid ${theme.palette.divider}` }}
                    />
                  ) : (
                    <Avatar
                      variant="square" sx={{ width: 80, height: 120, bgcolor: 'grey.300', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <BookIcon size={40} color="action" />
                    </Avatar>
                  )}
                  <Button
                    component="label" variant="outlined" startIcon={<Upload size={20} />}
                    sx={{ height: 40 }}
                  >
                    {dialogState.selectedFile ? 'Change Image' : 'Upload Image (Optional)'}
                    <input
                      type="file" hidden accept="image/*"
                      onChange={handleImageChangeDialog}
                    />
                  </Button>
                </Stack>
                {!dialogState.selectedFile && !dialogState.previewUrl && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Image is optional. You can add it later if needed.
                  </Typography>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={handleDialogClose} color="secondary" variant="outlined">
                Cancel
              </Button>
              <Button onClick={handleSave} color="primary" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : (dialogState.mode === 'add' ? 'Add Book' : 'Save Changes')}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={confirmDialog.open}
            onClose={handleConfirmDeleteClose}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle sx={{ 
              bgcolor: theme.palette.error.main, 
              color: theme.palette.error.contrastText 
            }}>
              Confirm Deletion
            </DialogTitle>
            <DialogContent sx={{ pt: 2, pb: 1.5 }}>
              <Typography>Are you sure you want to delete this book? This action cannot be undone.</Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={handleConfirmDeleteClose} color="secondary" variant="outlined">
                Cancel
              </Button>
              <Button onClick={handleDeleteConfirmed} color="error" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
                     </Snackbar>
           

         </Box>
       </Box>
  );
};

// -------------------------------------------------------------------------
// --- StatsCard Component ---
// -------------------------------------------------------------------------
const StatsCard = ({ title, value, icon }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        bgcolor: theme.palette.background.paper,
        borderRadius: '12px',
      }}
    >
      <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
        <Box sx={{ '& svg': { fontSize: '1.5rem' } }}>{icon}</Box>
      </Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1, mb: 0.5 }}>{value}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>{title}</Typography>
      </Box>
    </Paper>
  );
};

export default AdminBooksManagementPage;