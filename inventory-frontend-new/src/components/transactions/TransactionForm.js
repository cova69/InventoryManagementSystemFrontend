import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';
import ProductService from '../../services/ProductService';
import TransactionService from '../../services/TransactionService';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as ProductIcon,
  ImportExport as TransactionIcon
} from '@mui/icons-material';

const TransactionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [transaction, setTransaction] = useState({
    product: null,
    productId: '',
    type: 'PURCHASE',
    quantity: 1,
    price: '',
    transactionDate: new Date(),
    notes: ''
  });
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch products for dropdown
        const productsResponse = await ProductService.getAllProducts();
        setProducts(productsResponse.data || []);
        
        // If in edit mode, fetch the transaction details
        if (isEditMode) {
          const transactionResponse = await TransactionService.getTransactionById(id);
          const transactionData = transactionResponse.data;
          
          // Format the data to match state
          setTransaction({
            ...transactionData,
            productId: transactionData.product?.id || '',
            transactionDate: transactionData.transactionDate ? new Date(transactionData.transactionDate) : new Date()
          });
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setSnackbar({
          open: true,
          message: 'Error loading data. Please try again.',
          severity: 'error'
        });
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchInitialData();
  }, [id, isEditMode]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransaction(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProductChange = (e) => {
    const productId = e.target.value;
    const selectedProduct = products.find(p => p.id === productId);
    
    setTransaction(prev => ({
      ...prev,
      productId,
      product: selectedProduct,
      price: selectedProduct?.price || prev.price
    }));
  };
  
  const handleDateChange = (newDate) => {
    setTransaction(prev => ({
      ...prev,
      transactionDate: newDate
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!transaction.productId || !transaction.type) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const transactionData = {
        ...transaction,
        // Format price as number
        price: transaction.price ? parseFloat(transaction.price) : null,
        // Format quantity as number
        quantity: parseInt(transaction.quantity, 10)
      };
      
      if (isEditMode) {
        await TransactionService.updateTransaction(id, transactionData);
        setSnackbar({
          open: true,
          message: 'Transaction updated successfully!',
          severity: 'success'
        });
      } else {
        await TransactionService.createTransaction(transactionData);
        setSnackbar({
          open: true,
          message: 'Transaction created successfully!',
          severity: 'success'
        });
        // Reset form after successful creation
        setTransaction({
          product: null,
          productId: '',
          type: 'PURCHASE',
          quantity: 1,
          price: '',
          transactionDate: new Date(),
          notes: ''
        });
      }
      
      // Navigate back with slight delay to show the success message
      setTimeout(() => {
        navigate('/transactions');
      }, 1500);
      
    } catch (error) {
      console.error('Error saving transaction:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error saving transaction. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/transactions');
  };
  
  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600,
            backgroundImage: 'linear-gradient(45deg, #f39c12, #e67e22)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: "'Poppins', sans-serif"
          }}
        >
          {isEditMode ? 'Edit Transaction' : 'New Transaction'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          sx={{ 
            borderColor: '#6c757d',
            color: '#6c757d',
            '&:hover': { 
              borderColor: '#5a6268',
              backgroundColor: 'rgba(108, 117, 125, 0.04)'
            },
            fontWeight: 500,
            textTransform: 'none',
            borderRadius: '8px'
          }}
        >
          Back to Transactions
        </Button>
      </Box>
      
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          borderRadius: '12px',
          mb: 3
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="product-select-label">Product</InputLabel>
                <Select
                  labelId="product-select-label"
                  name="productId"
                  value={transaction.productId}
                  onChange={handleProductChange}
                  label="Product"
                  sx={{ 
                    borderRadius: '8px',
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center'
                    }
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <ProductIcon sx={{ color: '#3498db' }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">
                    <em>Select a product</em>
                  </MenuItem>
                  {products.map(product => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name} ({product.sku || 'No SKU'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="transaction-type-label">Transaction Type</InputLabel>
                <Select
                  labelId="transaction-type-label"
                  name="type"
                  value={transaction.type}
                  onChange={handleChange}
                  label="Transaction Type"
                  sx={{ 
                    borderRadius: '8px'
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <TransactionIcon sx={{ color: '#f39c12' }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="PURCHASE">Purchase</MenuItem>
                  <MenuItem value="SALE">Sale</MenuItem>
                  <MenuItem value="RETURN">Return</MenuItem>
                  <MenuItem value="ADJUSTMENT">Adjustment</MenuItem>
                  <MenuItem value="TRANSFER">Transfer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                name="quantity"
                label="Quantity"
                type="number"
                value={transaction.quantity}
                onChange={handleChange}
                inputProps={{ min: 1 }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="price"
                label="Price"
                type="number"
                value={transaction.price}
                onChange={handleChange}
                inputProps={{ step: "0.01", min: 0 }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon sx={{ color: '#2ecc71' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Transaction Date"
                type="datetime-local"
                name="transactionDate"
                value={transaction.transactionDate instanceof Date 
                  ? transaction.transactionDate.toISOString().slice(0, 16) 
                  : new Date().toISOString().slice(0, 16)}
                onChange={(e) => {
                  setTransaction(prev => ({
                    ...prev,
                    transactionDate: new Date(e.target.value)
                  }));
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="notes"
                label="Notes"
                multiline
                rows={4}
                value={transaction.notes || ''}
                onChange={handleChange}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={loading}
                  sx={{ 
                    borderColor: '#6c757d',
                    color: '#6c757d',
                    fontWeight: 500,
                    textTransform: 'none',
                    borderRadius: '8px'
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={<SaveIcon />}
                  sx={{ 
                    backgroundColor: '#f39c12',
                    '&:hover': { backgroundColor: '#e67e22' },
                    fontWeight: 500,
                    textTransform: 'none',
                    borderRadius: '8px'
                  }}
                >
                  {loading ? 'Saving...' : (isEditMode ? 'Update Transaction' : 'Create Transaction')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            borderRadius: '8px'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TransactionForm;