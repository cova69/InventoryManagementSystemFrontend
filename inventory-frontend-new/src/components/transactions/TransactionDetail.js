import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip,
  Button,
  CircularProgress,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ShoppingCart as ProductIcon,
  LocalShipping as ShippingIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  ImportExport as TransactionIcon,
  Notes as NotesIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import TransactionService from '../../services/TransactionService';
import format from 'date-fns/format';

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await TransactionService.getTransactionById(id);
        setTransaction(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching transaction details:', err);
        setError('Failed to load transaction details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchTransaction();
  }, [id]);
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await TransactionService.deleteTransaction(id);
        navigate('/transactions', { 
          state: { message: 'Transaction deleted successfully', severity: 'success' } 
        });
      } catch (err) {
        console.error('Error deleting transaction:', err);
        setError('Failed to delete transaction. Please try again.');
      }
    }
  };
  
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };
  
  const getTransactionTypeChip = (type) => {
    let color, icon, label;
    
    switch(type) {
      case 'PURCHASE':
        color = '#3498db';
        icon = <ShippingIcon fontSize="small" />;
        label = 'Purchase';
        break;
      case 'SALE':
        color = '#2ecc71';
        icon = <MoneyIcon fontSize="small" />;
        label = 'Sale';
        break;
      case 'RETURN':
        color = '#e74c3c';
        icon = <TransactionIcon fontSize="small" />;
        label = 'Return';
        break;
      case 'ADJUSTMENT':
        color = '#f39c12';
        icon = <EditIcon fontSize="small" />;
        label = 'Adjustment';
        break;
      case 'TRANSFER':
        color = '#9b59b6';
        icon = <TransactionIcon fontSize="small" />;
        label = 'Transfer';
        break;
      default:
        color = '#95a5a6';
        icon = <TransactionIcon fontSize="small" />;
        label = type || 'Unknown';
    }
    
    return (
      <Chip 
        icon={icon}
        label={label} 
        sx={{ 
          backgroundColor: `${color}20`,
          color: color,
          fontWeight: 500,
          fontSize: '0.95rem',
          px: 1,
          py: 2.5,
          '& .MuiChip-icon': { color }
        }}
      />
    );
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 4, 
            borderRadius: '12px',
            textAlign: 'center'
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            {error}
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/transactions"
            sx={{ mt: 2 }}
          >
            Back to Transactions
          </Button>
        </Paper>
      </Box>
    );
  }
  
  if (!transaction) {
    return (
      <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 4, 
            borderRadius: '12px',
            textAlign: 'center'
          }}
        >
          <Typography variant="h5" gutterBottom>
            Transaction not found
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/transactions"
            sx={{ mt: 2 }}
          >
            Back to Transactions
          </Button>
        </Paper>
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
          Transaction Details
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/transactions')}
            sx={{ 
              mr: 2,
              borderColor: '#6c757d',
              color: '#6c757d',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: '8px'
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={`/transactions/${id}/edit`}
            sx={{ 
              mr: 2,
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: '8px'
            }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            sx={{ 
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: '8px'
            }}
          >
            Delete
          </Button>
        </Box>
      </Box>
      
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          borderRadius: '12px',
          mb: 3
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mr: 2 }}>
              Transaction #{transaction.id}
            </Typography>
            {getTransactionTypeChip(transaction.type)}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarIcon sx={{ color: '#f39c12', mr: 1 }} />
            <Typography variant="body1">
              {formatDate(transaction.transactionDate)}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card 
              elevation={1} 
              sx={{ 
                borderRadius: '12px',
                height: '100%'
              }}
            >
              <CardContent>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#3498db',
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2
                  }}
                >
                  <ProductIcon sx={{ mr: 1 }} />
                  Product Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Product Name
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1" fontWeight={500}>
                      {transaction.product?.name || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      SKU
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1">
                      {transaction.product?.sku || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Category
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Chip
                      size="small"
                      icon={<CategoryIcon />}
                      label={transaction.product?.categoryName || 'Not categorized'}
                      sx={{ 
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        color: '#2ecc71',
                        '& .MuiChip-icon': { color: '#2ecc71' }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Supplier
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                  <Chip
                       size="small"
                       icon={<ShippingIcon />}
                       label={transaction.product?.supplierName || 'Not specified'}
                        sx={{ 
                       backgroundColor: 'rgba(155, 89, 182, 0.1)',
                        color: '#9b59b6',
                        '& .MuiChip-icon': { color: '#9b59b6' }
                    }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card 
              elevation={1} 
              sx={{ 
                borderRadius: '12px',
                height: '100%'
              }}
            >
              <CardContent>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#f39c12',
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2
                  }}
                >
                  <TransactionIcon sx={{ mr: 1 }} />
                  Transaction Details
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Quantity
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography 
                      variant="body1" 
                      fontWeight={500}
                      sx={{ 
                        color: transaction.quantity < 0 ? '#e74c3c' : '#2ecc71'
                      }}
                    >
                      {transaction.quantity > 0 ? `+${transaction.quantity}` : transaction.quantity} units
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Price
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1" fontWeight={500}>
                      {formatCurrency(transaction.price)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Total Value
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1" fontWeight={600}>
                      {formatCurrency(transaction.price * transaction.quantity)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#7f8c8d',
                        display: 'flex',
                        alignItems: 'center',
                        mt: 1,
                        mb: 2
                      }}
                    >
                      <NotesIcon sx={{ mr: 1, fontSize: '1.1rem' }} />
                      Notes
                    </Typography>
                    <Box 
                      sx={{ 
                        p: 2, 
                        backgroundColor: 'rgba(0,0,0,0.02)', 
                        borderRadius: '8px',
                        minHeight: '80px'
                      }}
                    >
                      <Typography variant="body2">
                        {transaction.notes || 'No additional notes for this transaction.'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default TransactionDetail;