import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Stack,
  CircularProgress, Alert, Snackbar, TablePagination
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Folder as CategoryIcon, Plus, Edit, Trash2, Upload
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// -------------------------------------------------------------------------
// --- API Service (Using Axios) ---
// Extend your existing API setup for categories
// -------------------------------------------------------------------------
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to requests if available
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

const realApi = {
  // ... BookService (from your AdminBooksManagementPage)
  CategoryService: {
    fetchCategories: () => api.get('/categories'),
    createCategory: (categoryData) => api.post('/categories', categoryData),
    updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
    deleteCategory: (id) => api.delete(`/categories/${id}`),
  },
};

// -------------------------------------------------------------------------
// --- Main CategoryManagementPage Component ---
// -------------------------------------------------------------------------
const CategoryManagementPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const theme = useTheme();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [openDialog, setOpenDialog] = useState(false); // For Add/Edit Category dialog
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [currentCategory, setCurrentCategory] = useState({ id: null, name: '' });

  // State for delete confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [categoryToDeleteId, setCategoryToDeleteId] = useState(null);
  const [categoryToDeleteName, setCategoryToDeleteName] = useState('');

  // Helper function to show snackbar messages
  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  // Handler for closing the snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  // Fetches all categories from the API
  const fetchAllCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await realApi.CategoryService.fetchCategories();
      setCategories(response.data || []);
      showSnackbar('Categories loaded successfully!', 'success');
    } catch (err) {
      console.error("Failed to load categories:", err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load categories. Please ensure the backend is running and accessible.';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  // Effect hook for initial data fetch and authentication check
  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!isAuthenticated || !user || !user.roles.includes('ROLE_ADMIN')) {
      console.log('Access denied. Redirecting to login.');
      navigate('/login');
    } else {
      fetchAllCategories(); // Fetch data only if authenticated as admin
    }
  }, [fetchAllCategories, navigate, user, isAuthenticated]);

  // Handler for form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open add category dialog
  const openAdd = () => {
    setDialogMode('add');
    setCurrentCategory({ id: null, name: '' }); // Reset state for a new entry
    setOpenDialog(true);
  };

  // Open edit category dialog with existing category data
  const openEdit = (category) => {
    setDialogMode('edit');
    setCurrentCategory({ id: category.id, name: category.name });
    setOpenDialog(true);
  };

  // Close add/edit category dialog
  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  // Handles saving a new category or updating an existing one
  const handleSave = async () => {
    // Basic validation
    if (!currentCategory.name || currentCategory.name.trim() === '') {
      showSnackbar('Category name is mandatory.', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (dialogMode === 'add') {
        await realApi.CategoryService.createCategory({ name: currentCategory.name });
        showSnackbar('Category added successfully!', 'success');
      } else {
        await realApi.CategoryService.updateCategory(currentCategory.id, { name: currentCategory.name });
        showSnackbar('Category updated successfully!', 'success');
      }
      setOpenDialog(false); // Close dialog on success
      fetchAllCategories(); // Re-fetch data to update the table
      setError(null); // Clear any previous errors
    } catch (e) {
      console.error("Save failed:", e);
      const errorMessage = e.response?.data?.message || e.message || 'Failed to save category.';
      if (e.response?.status === 409) { // HTTP Conflict
        showSnackbar('Category name already exists.', 'error');
      } else {
        showSnackbar(errorMessage, 'error');
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation dialog
  const handleConfirmDeleteOpen = (category) => {
    setCategoryToDeleteId(category.id);
    setCategoryToDeleteName(category.name);
    setConfirmDialogOpen(true);
  };

  // Close delete confirmation dialog
  const handleConfirmDeleteClose = () => {
    setConfirmDialogOpen(false);
    setCategoryToDeleteId(null);
    setCategoryToDeleteName('');
  };

  // Perform actual delete after confirmation
  const handleDeleteConfirmed = async () => {
    setConfirmDialogOpen(false); // Close confirmation dialog
    if (!categoryToDeleteId) return; // Should not happen if dialog opened correctly

    setLoading(true);
    try {
      await realApi.CategoryService.deleteCategory(categoryToDeleteId);
      showSnackbar('Category deleted successfully!', 'success');
      fetchAllCategories(); // Re-fetch data to update the table
      setError(null);
    } catch (e) {
      console.error("Delete failed:", e);
      const errorMessage = e.response?.data?.message || e.message || 'Failed to delete category.';
      showSnackbar(errorMessage, 'error');
      setError(errorMessage);
    } finally {
      setLoading(false);
      setCategoryToDeleteId(null);
      setCategoryToDeleteName('');
    }
  };

  // Logout handler (as seen in AdminBooksManagementPage)
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: theme.palette.background.default }}>
        {/* --- Top Navigation Bar --- */}
        <AppBar position="static">
          <Toolbar>
            <CategoryIcon style={{ marginRight: theme.spacing(2), fontSize: '2rem' }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Category Management
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        {/* --- Main Content Area --- */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, width: '100%', maxWidth: '1200px', mx: 'auto' }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              mb: 4,
              color: theme.palette.text.primary,
              fontWeight: 700,
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            Manage Book Categories
          </Typography>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex', justifyContent: 'space-between',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2, mb: 3,
            }}
          >
            <Button
              variant="contained" startIcon={<Plus size={20} />} onClick={openAdd}
              sx={{ px: 3, py: 1.5 }}
            >
              Add New Category
            </Button>
            <Button
              variant="outlined" startIcon={<Upload size={20} />} onClick={fetchAllCategories}
              sx={{ px: 3, py: 1.5 }}
            >
              Refresh Categories
            </Button>
          </Box>

          {/* Loading and Error Indicators */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Categories Table */}
          {!loading && !error && (
            <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: '12px', overflow: 'hidden' }}>
              <Table aria-label="categories table">
                <TableHead sx={{ backgroundColor: 'grey.100' }}>
                  <TableRow>
                    {['ID', 'Category Name', 'Actions'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600, color: 'text.secondary' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary">No categories found. Add one!</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(category => (
                      <TableRow
                        key={category.id} hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>{category.id}</TableCell>
                        <TableCell>{category.name}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Button
                              size="small" startIcon={<Edit size={16} />}
                              onClick={() => openEdit(category)} sx={{ textTransform: 'none' }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small" color="error" startIcon={<Trash2 size={16} />}
                              onClick={() => handleConfirmDeleteOpen(category)}
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
                count={categories.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </TableContainer>
          )}

          {/* Add/Edit Category Dialog */}
          <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
              {dialogMode === 'add' ? 'Add New Category' : 'Edit Category'}
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 3 }}>
              <TextField
                name="name" label="Category Name" value={currentCategory.name}
                onChange={handleInputChange} fullWidth variant="outlined" margin="dense" required
              />
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleDialogClose} color="secondary" variant="outlined">
                Cancel
              </Button>
              <Button onClick={handleSave} color="primary" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : (dialogMode === 'add' ? 'Add Category' : 'Save Changes')}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={confirmDialogOpen}
            onClose={handleConfirmDeleteClose}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle sx={{ bgcolor: 'error.main', color: 'white' }}>
              Confirm Deletion
            </DialogTitle>
            <DialogContent sx={{ pt: 2, pb: 2 }}>
              <Typography>Are you sure you want to delete category "<strong>{categoryToDeleteName}</strong>"? This action cannot be undone.</Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleConfirmDeleteClose} color="secondary" variant="outlined">
                Cancel
              </Button>
              <Button onClick={handleDeleteConfirmed} color="error" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
  );
};

export default CategoryManagementPage;

            <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
  );
};

export default CategoryManagementPage;
