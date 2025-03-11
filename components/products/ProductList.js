// src/components/products/ProductList.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Paper, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TextField, Box,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, InputAdornment,
  IconButton, Chip, Tooltip, CircularProgress, Grid,
  Snackbar, Alert, TablePagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import axios from 'axios';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    id: null,
    name: '',
    description: '',
    sku: '',
    price: '',
    categoryId: null,
    categoryName: '',
    supplierId: null,
    supplierName: ''
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    categoryId: '',
    supplierId: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, suppliersRes] = await Promise.all([
        axios.get('http://localhost:8080/api/products'),
        axios.get('http://localhost:8080/api/categories'),
        axios.get('http://localhost:8080/api/suppliers')
      ]);
      
      // Make sure we're setting arrays with safety checks
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setFilteredProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      setSuppliers(Array.isArray(suppliersRes.data) ? suppliersRes.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load data. Please try again later.',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let result = [...products];
    
    // Apply search term filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(product => 
        (product.name && product.name.toLowerCase().includes(lowerSearchTerm)) || 
        (product.sku && product.sku.toLowerCase().includes(lowerSearchTerm)) ||
        (product.description && product.description.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // Apply category filter
    if (filters.categoryId) {
      result = result.filter(product => 
        product.categoryId === filters.categoryId
      );
    }
    
    // Apply supplier filter
    if (filters.supplierId) {
      result = result.filter(product => 
        product.supplierId === filters.supplierId
      );
    }
    
    setFilteredProducts(result);
    setPage(0); // Reset to first page when filtering
  }, [products, searchTerm, filters, setPage]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, products, applyFilters]);

  const handleOpenDialog = (product = null) => {
    if (product) {
      setCurrentProduct({
        ...product,
        price: product.price ? product.price.toString() : ''
      });
      setIsEditing(true);
    } else {
      setCurrentProduct({
        id: null,
        name: '',
        description: '',
        sku: '',
        price: '',
        categoryId: null,
        categoryName: '',
        supplierId: null,
        supplierName: ''
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
    
    if (name === 'price') {
      // Allow only numbers and decimal point for price
      if (/^\d*\.?\d*$/.test(value) || value === '') {
        setCurrentProduct({
          ...currentProduct,
          [name]: value
        });
      }
    } else {
      setCurrentProduct({
        ...currentProduct,
        [name]: value
      });
    }
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'categoryId') {
      const selectedCategory = categories.find(cat => cat.id === value);
      setCurrentProduct({
        ...currentProduct,
        categoryId: value,
        categoryName: selectedCategory ? selectedCategory.name : ''
      });
    } else if (name === 'supplierId') {
      const selectedSupplier = suppliers.find(sup => sup.id === value);
      setCurrentProduct({
        ...currentProduct,
        supplierId: value,
        supplierName: selectedSupplier ? selectedSupplier.name : ''
      });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleSaveProduct = async () => {
    try {
      // Validate inputs
      if (!currentProduct.name.trim()) {
        setSnackbar({
          open: true,
          message: 'Product name is required',
          severity: 'error'
        });
        return;
      }
      
      // Validate SKU
      if (!currentProduct.sku || !currentProduct.sku.trim()) {
        setSnackbar({
          open: true,
          message: 'SKU is required',
          severity: 'error'
        });
        return;
      }
      
      // Validate price
      if (!currentProduct.price) {
        setSnackbar({
          open: true,
          message: 'Price is required',
          severity: 'error'
        });
        return;
      }
      
      // Validate category
      if (!currentProduct.categoryId) {
        setSnackbar({
          open: true,
          message: 'Category is required',
          severity: 'error'
        });
        return;
      }
      
      // Validate supplier
      if (!currentProduct.supplierId) {
        setSnackbar({
          open: true,
          message: 'Supplier is required',
          severity: 'error'
        });
        return;
      }
  
      // Convert price to number
      const productToSave = {
        ...currentProduct,
        price: currentProduct.price ? parseFloat(currentProduct.price) : null
      };
  
      let response;
      if (isEditing) {
        response = await axios.put(
          `http://localhost:8080/api/products/${currentProduct.id}`, 
          productToSave,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Update products array with edited product
        setProducts(products.map(p => p.id === currentProduct.id ? response.data : p));
        
        setSnackbar({
          open: true,
          message: 'Product updated successfully!',
          severity: 'success'
        });
      } else {
        response = await axios.post(
          'http://localhost:8080/api/products', 
          productToSave,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Add new product to products array
        setProducts([...products, response.data]);
        
        setSnackbar({
          open: true,
          message: 'Product added successfully!',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving product:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save product. Please try again.',
        severity: 'error'
      });
    }
  };

  const openDeleteConfirm = (product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      await axios.delete(`http://localhost:8080/api/products/${productToDelete.id}`);
      
      // Remove deleted product from products array
      setProducts(products.filter(p => p.id !== productToDelete.id));
      
      setSnackbar({
        open: true,
        message: 'Product deleted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete product. It may be referenced by inventory or transactions.',
        severity: 'error'
      });
    } finally {
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
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
    setFilters({
      categoryId: '',
      supplierId: ''
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Products
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Product
        </Button>
      </Box>

      {/* Search and Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search products by name, SKU or description"
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
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="category-filter-label">Filter by Category</InputLabel>
              <Select
                labelId="category-filter-label"
                name="categoryId"
                value={filters.categoryId}
                onChange={handleFilterChange}
                label="Filter by Category"
              >
                <MenuItem value="">
                  <em>All Categories</em>
                </MenuItem>
                {Array.isArray(categories) && categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="supplier-filter-label">Filter by Supplier</InputLabel>
              <Select
                labelId="supplier-filter-label"
                name="supplierId"
                value={filters.supplierId}
                onChange={handleFilterChange}
                label="Filter by Supplier"
              >
                <MenuItem value="">
                  <em>All Suppliers</em>
                </MenuItem>
                {Array.isArray(suppliers) && suppliers.map(supplier => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
            <Button 
              variant="outlined" 
              startIcon={<FilterListIcon />}
              onClick={clearFilters}
              disabled={!searchTerm && !filters.categoryId && !filters.supplierId}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Products Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="products table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  (rowsPerPage > 0
                    ? filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : filteredProducts
                  ).map((product) => (
                    <TableRow 
                      key={product.id}
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>{product.id}</TableCell>
                      <TableCell component="th" scope="row">
                        <Typography fontWeight="medium">{product.name}</Typography>
                        {product.description && (
                          <Typography variant="body2" color="text.secondary" 
                            sx={{ 
                              maxWidth: 300,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {product.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{product.sku || '-'}</TableCell>
                      <TableCell>
                        {product.categoryName ? (
                          <Chip 
                            label={product.categoryName} 
                            size="small" 
                            variant="outlined"
                          />
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {product.supplierName || '-'}
                      </TableCell>
                      <TableCell align="right">
                        {product.price ? `$${parseFloat(product.price).toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenDialog(product)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => openDeleteConfirm(product)}>
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
                        No products found.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm || filters.categoryId || filters.supplierId 
                          ? 'Try adjusting your search or filters.' 
                          : 'Add your first product using the button above.'}
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
            count={filteredProducts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Product Name"
                fullWidth
                value={currentProduct.name}
                onChange={handleInputChange}
                required
                autoFocus
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="sku"
                label="SKU"
                fullWidth
                value={currentProduct.sku || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                value={currentProduct.description || ''}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="price"
                label="Price"
                fullWidth
                value={currentProduct.price || ''}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel id="category-select-label">Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  name="categoryId"
                  value={currentProduct.categoryId || ''}
                  onChange={handleSelectChange}
                  label="Category"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {Array.isArray(categories) && categories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel id="supplier-select-label">Supplier</InputLabel>
                <Select
                  labelId="supplier-select-label"
                  name="supplierId"
                  value={currentProduct.supplierId || ''}
                  onChange={handleSelectChange}
                  label="Supplier"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {Array.isArray(suppliers) && suppliers.map(supplier => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSaveProduct} variant="contained" color="primary">
            {isEditing ? 'Update' : 'Add'} Product
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
            Are you sure you want to delete the product "{productToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteProduct} variant="contained" color="error">
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

export default ProductList;