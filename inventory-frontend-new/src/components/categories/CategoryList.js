// src/components/categories/CategoryList.js
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

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    id: null,
    name: '',
    description: '',
    productCount: 0
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/categories');
      
      // Add these console logs to debug
      console.log('Categories API response:', response);
      console.log('Categories data type:', typeof response.data);
      console.log('Is data an array?', Array.isArray(response.data));
      
      setCategories(Array.isArray(response.data) ? response.data : []);
      setFilteredCategories(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load categories. Please try again later.',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    if (!Array.isArray(categories)) return;
    
    let result = [...categories];
    
    // Apply search term filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(category => 
        (category.name && category.name.toLowerCase().includes(lowerSearchTerm)) || 
        (category.description && category.description.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    setFilteredCategories(result);
    setPage(0); // Reset to first page when filtering
  }, [categories, searchTerm]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, categories, applyFilters]);

  const handleOpenDialog = (category = null) => {
    if (category) {
      setCurrentCategory({
        ...category
      });
      setIsEditing(true);
    } else {
      setCurrentCategory({
        id: null,
        name: '',
        description: '',
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
    setCurrentCategory({
      ...currentCategory,
      [name]: value
    });
  };

  const handleSaveCategory = async () => {
    try {
      // Validate inputs
      if (!currentCategory.name.trim()) {
        setSnackbar({
          open: true,
          message: 'Category name is required',
          severity: 'error'
        });
        return;
      }

      let response;
      if (isEditing) {
        response = await axios.put(
          `http://localhost:8080/api/categories/${currentCategory.id}`, 
          currentCategory,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Update categories array with edited category
        setCategories(categories.map(c => c.id === currentCategory.id ? response.data : c));
        
        setSnackbar({
          open: true,
          message: 'Category updated successfully!',
          severity: 'success'
        });
      } else {
        response = await axios.post(
          'http://localhost:8080/api/categories', 
          currentCategory,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Add new category to categories array
        setCategories([...categories, response.data]);
        
        setSnackbar({
          open: true,
          message: 'Category added successfully!',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving category:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save category. Please try again.',
        severity: 'error'
      });
    }
  };

  const openDeleteConfirm = (category) => {
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      await axios.delete(`http://localhost:8080/api/categories/${categoryToDelete.id}`);
      
      // Remove deleted category from categories array
      setCategories(categories.filter(c => c.id !== categoryToDelete.id));
      
      setSnackbar({
        open: true,
        message: 'Category deleted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete category. It may be referenced by products.',
        severity: 'error'
      });
    } finally {
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
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
          Categories
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Category
        </Button>
      </Box>

      {/* Search */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search categories by name or description"
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

      {/* Categories Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="categories table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Products Count</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(filteredCategories) && filteredCategories.length > 0 ? (
                  (rowsPerPage > 0
                    ? filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : filteredCategories
                  ).map((category) => (
                    <TableRow 
                      key={category.id}
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>{category.id}</TableCell>
                      <TableCell component="th" scope="row">
                        <Typography fontWeight="medium">{category.name}</Typography>
                      </TableCell>
                      <TableCell>
                        {category.description || '-'}
                      </TableCell>
                      <TableCell>
                        {category.productCount || 0}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenDialog(category)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => openDeleteConfirm(category)}
                            disabled={category.productCount > 0}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography variant="subtitle1">
                        No categories found.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm 
                          ? 'Try adjusting your search.' 
                          : 'Add your first category using the button above.'}
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
            count={Array.isArray(filteredCategories) ? filteredCategories.length : 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {/* Add/Edit Category Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Category Name"
                fullWidth
                value={currentCategory.name}
                onChange={handleInputChange}
                required
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                value={currentCategory.description || ''}
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
          <Button onClick={handleSaveCategory} variant="contained" color="primary">
            {isEditing ? 'Update' : 'Add'} Category
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
            Are you sure you want to delete the category "{categoryToDelete?.name}"? This action cannot be undone.
          </Typography>
          {categoryToDelete && categoryToDelete.productCount > 0 && (
            <Typography color="error" sx={{ mt: 2 }}>
              This category has {categoryToDelete.productCount} products assigned to it. 
              Please reassign or delete these products first.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteCategory} 
            variant="contained" 
            color="error"
            disabled={categoryToDelete && categoryToDelete.productCount > 0}
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

export default CategoryList;