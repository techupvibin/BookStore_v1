import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Stack,
  CircularProgress, Alert, Snackbar, Checkbox, FormControlLabel, FormGroup, TablePagination
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Users, Edit, Trash2 } from 'lucide-react'; // Added Users icon
import axios from 'axios';

// -------------------------------------------------------------------------
// --- API Service for Users (Using Axios) ---
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

const userService = {
  fetchAllUsers: () => api.get('/admin/users'),
  updateUserRoles: (userId, roles) => api.put(`/admin/users/${userId}/roles`, { roles }), // Expects { roles: ["ROLE_USER", "ROLE_ADMIN"] }
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
};

// Define all possible roles your application uses.
// This is crucial for displaying checkboxes in the edit dialog.
const ALL_POSSIBLE_ROLES = ['ROLE_USER', 'ROLE_ADMIN']; // Adjust based on your backend roles

// -------------------------------------------------------------------------
// --- Main AdminUsersManagementPage Component ---
// -------------------------------------------------------------------------
const AdminUsersManagementPage = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Stores the user being edited
  const [selectedRoles, setSelectedRoles] = useState(new Set()); // Stores roles selected in the dialog

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState(null);
  const [userToDeleteUsername, setUserToDeleteUsername] = useState(''); // For display in confirmation

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.fetchAllUsers();
      setUsers(response.data);
      showSnackbar('Users loaded successfully!', 'success');
    } catch (err) {
      console.error("Failed to load users:", err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load users. Ensure backend is running and you have admin access.';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openEditUserDialog = (user) => {
    setCurrentUser(user);
    // Initialize selectedRoles with the user's current roles
    setSelectedRoles(new Set(user.roles));
    setOpenEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
    setCurrentUser(null);
    setSelectedRoles(new Set());
  };

  const handleRoleChange = (event) => {
    const roleName = event.target.name;
    setSelectedRoles(prevRoles => {
      const newRoles = new Set(prevRoles);
      if (event.target.checked) {
        newRoles.add(roleName);
      } else {
        newRoles.delete(roleName);
      }
      return newRoles;
    });
  };

  const handleSaveRoles = async () => {
    if (!currentUser) return;

    setLoading(true); // Set loading for the save operation
    try {
      // Convert Set to Array of strings for the API
      const rolesArray = Array.from(selectedRoles);
      const updatedUser = await userService.updateUserRoles(currentUser.userId, rolesArray);
      showSnackbar(`Roles for ${updatedUser.username} updated successfully!`, 'success');
      fetchUsers(); // Re-fetch users to update the table
      handleEditDialogClose();
    } catch (e) {
      console.error("Failed to update user roles:", e);
      const errorMessage = e.response?.data?.message || e.message || 'Failed to update user roles.';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleConfirmDeleteOpen = (id, username) => {
    setUserToDeleteId(id);
    setUserToDeleteUsername(username);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDeleteClose = () => {
    setConfirmDialogOpen(false);
    setUserToDeleteId(null);
    setUserToDeleteUsername('');
  };

  const handleDeleteConfirmed = async () => {
    setConfirmDialogOpen(false);
    if (!userToDeleteId) return;

    setLoading(true);
    try {
      await userService.deleteUser(userToDeleteId);
      showSnackbar(`User '${userToDeleteUsername}' deleted successfully!`, 'success');
      fetchUsers(); // Re-fetch users after deletion
    } catch (e) {
      console.error("Delete user failed:", e);
      const errorMessage = e.response?.data?.message || e.message || 'Failed to delete user.';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
      setUserToDeleteId(null);
      setUserToDeleteUsername('');
    }
  };

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 700, color: theme.palette.text.primary }}>
        User & Role Management
      </Typography>

      {/* No "Add New User" button here, assuming users register via frontend or are created by other means.
          If you want to add this, you'd implement a similar dialog logic to books/categories. */}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && (
        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: '12px', overflow: 'hidden', overflowX: 'auto' }}>
          <Table aria-label="users table">
            <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>Roles</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary">No users found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(user => (
                  <TableRow
                    key={user.userId} hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>{user.userId}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.roles && user.roles.length > 0
                        ? user.roles.map(role => role.replace('ROLE_', '')).join(', ')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          startIcon={<Edit size={16} />}
                          onClick={() => openEditUserDialog(user)}
                        >
                          Edit Roles
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Trash2 size={16} />}
                          onClick={() => handleConfirmDeleteOpen(user.userId, user.username)}
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
            count={users.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </TableContainer>
      )}

      {/* Edit User Roles Dialog */}
      {currentUser && (
        <Dialog open={openEditDialog} onClose={handleEditDialogClose} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ 
            bgcolor: theme.palette.primary.main, 
            color: theme.palette.primary.contrastText 
          }}>
            Edit Roles for {currentUser.username}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 3 }}>
            <TextField
              label="Username"
              value={currentUser.username}
              fullWidth
              variant="outlined"
              margin="dense"
              disabled // Username is not editable here
            />
            <TextField
              label="Email"
              value={currentUser.email}
              fullWidth
              variant="outlined"
              margin="dense"
              disabled // Email is not editable here
            />
            <Typography variant="subtitle1" sx={{ mt: 2 }}>Assign Roles:</Typography>
            <FormGroup>
              {ALL_POSSIBLE_ROLES.map(roleName => (
                <FormControlLabel
                  key={roleName}
                  control={
                    <Checkbox
                      checked={selectedRoles.has(roleName)}
                      onChange={handleRoleChange}
                      name={roleName}
                      color="primary"
                    />
                  }
                  label={roleName.replace('ROLE_', '')} // Display without "ROLE_" prefix
                />
              ))}
            </FormGroup>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleEditDialogClose} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleSaveRoles} color="primary" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Save Roles'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Delete User Confirmation Dialog */}
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
          Confirm User Deletion
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 2 }}>
          <Typography>Are you sure you want to delete user "<strong>{userToDeleteUsername}</strong>"? This action cannot be undone.</Typography>
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
  );
};

export default AdminUsersManagementPage;
