// src/components/inventory/InventoryList.js
import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentInventory, setCurrentInventory] = useState({
    id: null,
    productId: null,
    productName: '',
    quantity: 0,
    reorderLevel: 0,
    reorderQuantity: 0,
    location: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [inventoryRes, productsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/inventory'),
        axios.get('http://localhost:8080/api/products')
      ]);
      
      console.log('Inventory response:', inventoryRes.data);
      console.log('Products response:', productsRes.data);
      
      setInventory(Array.isArray(inventoryRes.data) ? inventoryRes.data : []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setInventory([]);
      setProducts([]);
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Failed to load data. Please try again later.',
        severity: 'error'
      });
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setCurrentInventory(item);
      setIsEditing(true);
    } else {
      setCurrentInventory({
        id: null,
        productId: '',
        productName: '',
        quantity: 0,
        reorderLevel: 0,
        reorderQuantity: 0,
        location: ''
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
    setCurrentInventory({
      ...currentInventory,
      [name]: name === 'quantity' || name === 'reorderLevel' || name === 'reorderQuantity' 
        ? parseInt(value) || 0 
        : value
    });
  };

  const handleProductChange = (e) => {
    const productId = e.target.value;
    const selectedProduct = products.find(p => p.id === productId);
    setCurrentInventory({
      ...currentInventory,
      productId: productId,
      productName: selectedProduct ? selectedProduct.name : ''
    });
  };

  const handleSaveInventory = async () => {
    try {
      if (!currentInventory.productId) {
        setSnackbar({
          open: true,
          message: 'Please select a product',
          severity: 'error'
        });
        return;
      }

      let response;
      if (isEditing) {
        response = await axios.put(
          `http://localhost:8080/api/inventory/${currentInventory.id}`, 
          currentInventory,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        setSnackbar({
          open: true,
          message: 'Inventory updated successfully!',
          severity: 'success'
        });
      } else {
        response = await axios.post(
          'http://localhost:8080/api/inventory', 
          currentInventory,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        setSnackbar({
          open: true,
          message: 'Inventory added successfully!',
          severity: 'success'
        });
      }
      
      fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving inventory:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save inventory. Please try again.',
        severity: 'error'
      });
    }
  };

  const isLowStock = (item) => {
    return item.quantity <= item.reorderLevel;
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Filter out products that already have inventory
  const getAvailableProducts = () => {
    const inventoryProductIds = inventory.map(item => item.productId);
    return products.filter(product => !inventoryProductIds.includes(product.id));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Inventory Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={getAvailableProducts().length === 0}
        >
          Add Inventory
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Reorder Level</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.length > 0 ? (
                inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.productName || 'Unknown Product'}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.reorderLevel}</TableCell>
                    <TableCell>{item.location || 'Not specified'}</TableCell>
                    <TableCell>
                      {isLowStock(item) ? (
                        <Chip label="Low Stock" color="warning" size="small" />
                      ) : (
                        <Chip label="In Stock" color="success" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">No inventory items found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Inventory Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Update Inventory' : 'Add New Inventory'}</DialogTitle>
        <DialogContent>
          {isEditing ? (
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Product: {currentInventory.productName}
            </Typography>
          ) : (
            <FormControl fullWidth margin="normal">
              <InputLabel id="product-select-label">Product</InputLabel>
              <Select
                labelId="product-select-label"
                name="productId"
                value={currentInventory.productId || ''}
                onChange={handleProductChange}
                label="Product"
                required
              >
                <MenuItem value="">
                  <em>Select a product</em>
                </MenuItem>
                {getAvailableProducts().map(product => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField
            margin="normal"
            name="quantity"
            label="Quantity"
            type="number"
            fullWidth
            variant="outlined"
            value={currentInventory.quantity}
            onChange={handleInputChange}
            InputProps={{ inputProps: { min: 0 } }}
          />
          <TextField
            margin="normal"
            name="reorderLevel"
            label="Reorder Level"
            type="number"
            fullWidth
            variant="outlined"
            value={currentInventory.reorderLevel}
            onChange={handleInputChange}
            InputProps={{ inputProps: { min: 0 } }}
          />
          <TextField
            margin="normal"
            name="reorderQuantity"
            label="Reorder Quantity"
            type="number"
            fullWidth
            variant="outlined"
            value={currentInventory.reorderQuantity}
            onChange={handleInputChange}
            InputProps={{ inputProps: { min: 0 } }}
          />
          <TextField
            margin="normal"
            name="location"
            label="Location"
            type="text"
            fullWidth
            variant="outlined"
            value={currentInventory.location || ''}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button onClick={handleSaveInventory} color="primary" variant="contained">
            {isEditing ? 'Update' : 'Add'} Inventory
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

export default InventoryList;