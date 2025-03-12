// src/components/suppliers/SupplierList.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Paper, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TextField, Box,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, CircularProgress, Grid,
  Snackbar, Alert, TablePagination, InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import axios from 'axios';

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState({
    id: null,
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    productCount: 0
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/suppliers');
      
      // Add logging to understand the response
      console.log('API Response:', response.data);
      
      // Ensure you're setting an array
      const data = Array.isArray(response.data) ? response.data : [];
      setSuppliers(data);
      setFilteredSuppliers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setSuppliers([]); // Set to empty array on error
      setFilteredSuppliers([]);
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Failed to load suppliers. Please try again later.',
        severity: 'error'
      });
    }
  };

  const applyFilters = useCallback(() => {
    if (!Array.isArray(suppliers)) return;
    
    let result = [...suppliers];
    
    // Apply search term filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(supplier => 
        (supplier.name && supplier.name.toLowerCase().includes(lowerSearchTerm)) || 
        (supplier.contactName && supplier.contactName.toLowerCase().includes(lowerSearchTerm)) ||
        (supplier.email && supplier.email.toLowerCase().includes(lowerSearchTerm)) ||
        (supplier.phone && supplier.phone.toLowerCase().includes(lowerSearchTerm)) ||
        (supplier.address && supplier.address.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    setFilteredSuppliers(result);
    setPage(0); // Reset to first page when filtering
  }, [suppliers, searchTerm]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, suppliers, applyFilters]);

  const handleOpenDialog = (supplier = null) => {
    if (supplier) {
      setCurrentSupplier({
        ...supplier
      });
      setIsEditing(true);
    } else {
      setCurrentSupplier({
        id: null,
        name: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        productCount: 0
      });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentSupplier({
      ...currentSupplier,
      [name]: value
    });
  };

  const handleSaveSupplier = async () => {
    try {
      // Validate inputs
      if (!currentSupplier.name.trim()) {
        setSnackbar({
          open: true,
          message: 'Supplier name is required',
          severity: 'error'
        });
        return;
      }

      let response;
      if (isEditing) {
        response = await axios.put(
          `http://localhost:8080/api/suppliers/${currentSupplier.id}`, 
          currentSupplier,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Update suppliers array with edited supplier
        setSuppliers(suppliers.map(s => s.id === currentSupplier.id ? response.data : s));
        
        setSnackbar({
          open: true,
          message: 'Supplier updated successfully!',
          severity: 'success'
        });
      } else {
        response = await axios.post(
          'http://localhost:8080/api/suppliers', 
          currentSupplier,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Add new supplier to suppliers array
        setSuppliers([...suppliers, response.data]);
        
        setSnackbar({
          open: true,
          message: 'Supplier added successfully!',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving supplier:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save supplier. Please try again.',
        severity: 'error'
      });
    }
  };

  const openDeleteConfirm = (supplier) => {
    setSupplierToDelete(supplier);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return;
    
    try {
      await axios.delete(`http://localhost:8080/api/suppliers/${supplierToDelete.id}`);
      
      // Remove deleted supplier from suppliers array
      setSuppliers(suppliers.filter(s => s.id !== supplierToDelete.id));
      
      setSnackbar({
        open: true,
        message: 'Supplier deleted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting supplier:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete supplier. It may be referenced by products.',
        severity: 'error'
      });
    } finally {
      setDeleteConfirmOpen(false);
      setSupplierToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const clearFilters = () => {
    setSearchTerm('');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Suppliers
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Supplier
        </Button>
      </Box>

      {/* Search */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search suppliers by name, contact, email, phone or address"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
            <Button 
              variant="outlined" 
              startIcon={<FilterListIcon />}
              onClick={clearFilters}
              disabled={!searchTerm}
            >
              Clear Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Suppliers Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="suppliers table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Contact Person</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Products Count</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(filteredSuppliers) && filteredSuppliers.length > 0 ? (
                  (rowsPerPage > 0
                    ? filteredSuppliers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : filteredSuppliers
                  ).map((supplier) => (
                    <TableRow 
                      key={supplier.id}
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>{supplier.id}</TableCell>
                      <TableCell component="th" scope="row">
                        <Typography fontWeight="medium">{supplier.name}</Typography>
                        {supplier.address && (
                          <Typography variant="body2" color="text.secondary">
                            {supplier.address}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{supplier.contactName || '-'}</TableCell>
                      <TableCell>{supplier.email || '-'}</TableCell>
                      <TableCell>{supplier.phone || '-'}</TableCell>
                      <TableCell>
                        {supplier.productCount || 0}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenDialog(supplier)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => openDeleteConfirm(supplier)}
                            disabled={supplier.productCount > 0}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography variant="subtitle1">
                        No suppliers found.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm 
                          ? 'Try adjusting your search.' 
                          : 'Add your first supplier using the button above.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={Array.isArray(filteredSuppliers) ? filteredSuppliers.length : 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {/* Add/Edit Supplier Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? 'Edit Supplier' : 'Add New Supplier'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Supplier Name"
                fullWidth
                value={currentSupplier.name}
                onChange={handleInputChange}
                required
                autoFocus
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="contactName"
                label="Contact Person"
                fullWidth
                value={currentSupplier.contactName || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                value={currentSupplier.email || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone"
                fullWidth
                value={currentSupplier.phone || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                fullWidth
                value={currentSupplier.address || ''}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSaveSupplier} variant="contained" color="primary">
            {isEditing ? 'Update' : 'Add'} Supplier
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the supplier "{supplierToDelete?.name}"? This action cannot be undone.
          </Typography>
          {supplierToDelete && supplierToDelete.productCount > 0 && (
            <Typography color="error" sx={{ mt: 2 }}>
              This supplier has {supplierToDelete.productCount} products assigned to it. 
              Please reassign or delete these products first.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteSupplier} 
            variant="contained" 
            color="error"
            disabled={supplierToDelete && supplierToDelete.productCount > 0}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SupplierList;