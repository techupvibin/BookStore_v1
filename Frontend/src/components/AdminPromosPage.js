import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

const AdminPromosPage = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'FIXED_AMOUNT',
    discountValue: '',
    minimumOrderAmount: '',
    maxUses: '',
    validFrom: '',
    validUntil: '',
    active: true,
  });

  // Mock data for promo codes
  useEffect(() => {
    const mockPromoCodes = [
      {
        id: 1,
        code: 'WELCOME10',
        description: 'Welcome discount for new users',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minimumOrderAmount: 50,
        maxUses: 100,
        currentUses: 25,
        validFrom: '2024-01-01T00:00:00Z',
        validUntil: '2024-12-31T23:59:59Z',
        active: true,
      },
      {
        id: 2,
        code: 'SAVE5',
        description: 'Fixed $5 off on orders over $30',
        discountType: 'FIXED_AMOUNT',
        discountValue: 5,
        minimumOrderAmount: 30,
        maxUses: 200,
        currentUses: 150,
        validFrom: '2024-01-01T00:00:00Z',
        validUntil: '2024-06-30T23:59:59Z',
        active: true,
      },
      {
        id: 3,
        code: 'SUMMER20',
        description: 'Summer sale 20% off',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minimumOrderAmount: 100,
        maxUses: 50,
        currentUses: 50,
        validFrom: '2024-06-01T00:00:00Z',
        validUntil: '2024-08-31T23:59:59Z',
        active: false,
      },
    ];
    setPromoCodes(mockPromoCodes);
  }, []);

  const handleAddNew = () => {
    setEditingPromo(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'FIXED_AMOUNT',
      discountValue: '',
      minimumOrderAmount: '',
      maxUses: '',
      validFrom: '',
      validUntil: '',
      active: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (promo) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: promo.discountValue.toString(),
      minimumOrderAmount: promo.minimumOrderAmount.toString(),
      maxUses: promo.maxUses.toString(),
      validFrom: promo.validFrom.split('T')[0],
      validUntil: promo.validUntil.split('T')[0],
      active: promo.active,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const newPromo = {
      id: editingPromo ? editingPromo.id : Date.now(),
      ...formData,
      discountValue: parseFloat(formData.discountValue),
      minimumOrderAmount: parseFloat(formData.minimumOrderAmount),
      maxUses: parseInt(formData.maxUses),
      currentUses: editingPromo ? editingPromo.currentUses : 0,
      validFrom: new Date(formData.validFrom).toISOString(),
      validUntil: new Date(formData.validUntil).toISOString(),
    };

    if (editingPromo) {
      setPromoCodes(prev =>
        prev.map(promo =>
          promo.id === editingPromo.id ? newPromo : promo
        )
      );
    } else {
      setPromoCodes(prev => [...prev, newPromo]);
    }

    setDialogOpen(false);
  };

  const handleDelete = (promoId) => {
    if (window.confirm('Are you sure you want to delete this promo code?')) {
      setPromoCodes(prev => prev.filter(promo => promo.id !== promoId));
    }
  };

  const handleToggleActive = (promoId) => {
    setPromoCodes(prev =>
      prev.map(promo =>
        promo.id === promoId ? { ...promo, active: !promo.active } : promo
      )
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Promotional Codes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Add New Promo Code
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Min Order</TableCell>
              <TableCell>Usage</TableCell>
              <TableCell>Valid Until</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {promoCodes.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {promo.code}
                  </Typography>
                </TableCell>
                <TableCell>{promo.description}</TableCell>
                <TableCell>
                  <Chip
                    label={promo.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}
                    size="small"
                    color={promo.discountType === 'PERCENTAGE' ? 'primary' : 'secondary'}
                  />
                </TableCell>
                <TableCell>
                  {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                </TableCell>
                <TableCell>${promo.minimumOrderAmount}</TableCell>
                <TableCell>
                  {promo.currentUses}/{promo.maxUses}
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color={isExpired(promo.validUntil) ? 'error' : 'text.primary'}
                  >
                    {formatDate(promo.validUntil)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={promo.active ? 'Active' : 'Inactive'}
                      color={promo.active ? 'success' : 'default'}
                      size="small"
                    />
                    <Switch
                      checked={promo.active}
                      onChange={() => handleToggleActive(promo.id)}
                      size="small"
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => handleEdit(promo)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(promo.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPromo ? 'Edit Promo Code' : 'Add New Promo Code'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <TextField
              label="Promo Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Discount Type</InputLabel>
              <Select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                label="Discount Type"
              >
                <MenuItem value="FIXED_AMOUNT">Fixed Amount</MenuItem>
                <MenuItem value="PERCENTAGE">Percentage</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={formData.discountType === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount ($)'}
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Minimum Order Amount ($)"
              type="number"
              value={formData.minimumOrderAmount}
              onChange={(e) => setFormData({ ...formData, minimumOrderAmount: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Maximum Uses"
              type="number"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Valid From"
              type="date"
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Valid Until"
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
            }
            label="Active"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.code || !formData.description}
          >
            {editingPromo ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPromosPage;
