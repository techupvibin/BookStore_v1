import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Stack,
  CircularProgress, Alert, Snackbar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';

// -------------------------------------------------------------------------
// --- API Service for Categories (Using Axios) ---
// -------------------------------------------------------------------------
const API_BASE_URL = 'http://localhost:8080/api';

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
  error => {
    return Promise.reject(error);
  }
);

const categoryService = {
  fetchAllCategories: () => api.get('/categories'),
  createCategory: (categoryData) => api.post('/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

// -------------------------------------------------------------------------
// --- Main AdminCategoriesManagementPage Component ---
// -------------------------------------------------------------------------
const AdminCategoriesManagementPage = () => {
  const theme = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [currentCategory, setCurrentCategory] = useState({ id: null, name: '' });

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [categoryToDeleteId, setCategoryToDeleteId] = useState(null);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryService.fetchAllCategories();
      setCategories(response.data);
      showSnackbar('Categories loaded successfully!', 'success');
    } catch (err) {
      console.error("Failed to load categories:", err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load categories. Ensure backend is running.';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory(prev => ({ ...prev, [name]: value }));
  };

  const openAddDialog = () => {
    setDialogMode('add');
    setCurrentCategory({ id: null, name: '' });
    setOpenDialog(true);
  };

  const openEditDialog = (category) => {
    setDialogMode('edit');
    setCurrentCategory(category);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setCurrentCategory({ id: null, name: '' }); // Clear state on close
  };

  const handleSave = async () => {
    if (!currentCategory.name.trim()) {
      showSnackbar('Category name cannot be empty.', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (dialogMode === 'add') {
        await categoryService.createCategory(currentCategory);
        showSnackbar('Category added successfully!', 'success');
      } else {
        await categoryService.updateCategory(currentCategory.id, currentCategory);
        showSnackbar('Category updated successfully!', 'success');
      }
      setOpenDialog(false);
      fetchCategories(); // Re-fetch all categories to update table
      setError(null);
    } catch (e) {
      console.error("Save failed:", e);
      const errorMessage = e.response?.data?.message || e.message || 'Failed to save category.';
      showSnackbar(errorMessage, 'error');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeleteOpen = (id) => {
    setCategoryToDeleteId(id);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDeleteClose = () => {
    setConfirmDialogOpen(false);
    setCategoryToDeleteId(null);
  };

  const handleDeleteConfirmed = async () => {
    setConfirmDialogOpen(false);
    if (!categoryToDeleteId) return;

    setLoading(true);
    try {
      await categoryService.deleteCategory(categoryToDeleteId);
      showSnackbar('Category deleted successfully!', 'success');
      fetchCategories(); // Re-fetch categories after deletion
      setError(null);
    } catch (e) {
      console.error("Delete failed:", e);
      const errorMessage = e.response?.data?.message || e.message || 'Failed to delete category.';
      showSnackbar(errorMessage, 'error');
      setError(errorMessage);
    } finally {
      setLoading(false);
      setCategoryToDeleteId(null);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 2.5 }, width: '100%' }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 700, color: theme.palette.text.primary }}>
        Category Management
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2.5 }}>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={openAddDialog}
        >
          Add New Category
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && (
        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: '12px', overflow: 'hidden', overflowX: 'auto' }}>
          <Table aria-label="categories table">
            <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>Actions</TableCell>
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
                categories.map(category => (
                  <TableRow
                    key={category.id} hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>{category.id}</TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          startIcon={<Edit size={16} />}
                          onClick={() => openEditDialog(category)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Trash2 size={16} />}
                          onClick={() => handleConfirmDeleteOpen(category.id)}
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
        </TableContainer>
      )}

      {/* Add/Edit Category Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ 
          bgcolor: theme.palette.primary.main, 
          color: theme.palette.primary.contrastText 
        }}>
          {dialogMode === 'add' ? 'Add New Category' : 'Edit Category'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 2.5 }}>
          <TextField
            name="name"
            label="Category Name"
            value={currentCategory.name}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            margin="dense"
            required
            autoFocus // Auto-focus on name field when dialog opens
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
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
        <DialogTitle sx={{ 
          bgcolor: theme.palette.error.main, 
          color: theme.palette.error.contrastText 
        }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 1.5 }}>
          <Typography>Are you sure you want to delete this category? This action cannot be undone.</Typography>
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
  );
};

export default AdminCategoriesManagementPage;
