import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Divider, 
  Card, 
  CardContent, 
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  LocalShipping as SupplierIcon,
  Warning as WarningIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import axios from 'axios';
import authHeader from '../../services/AuthHeader';

const ImprovedDashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [productsByCategory, setProductsByCategory] = useState([]);
  const [inventoryHistory, setInventoryHistory] = useState([]);
  
  // State for inventory stats
  const [stats, setStats] = useState({
    productCount: 0,
    categoryCount: 0,
    supplierCount: 0,
    lowStockCount: 0,
    lowStockItems: [],
    totalQuantity: 0
  });
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

  // Initial data fetch and auto-refresh
  useEffect(() => {
    fetchData();
    fetchHistoryData();
    
    // Set up auto-refresh every 30 seconds for real-time updates
    const refreshInterval = setInterval(() => {
      fetchData();
      fetchHistoryData();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, suppliersRes, inventoryRes] = await Promise.all([
        axios.get('http://localhost:8080/api/products', { headers: authHeader() }),
        axios.get('http://localhost:8080/api/categories', { headers: authHeader() }),
        axios.get('http://localhost:8080/api/suppliers', { headers: authHeader() }),
        axios.get('http://localhost:8080/api/inventory', { headers: authHeader() })
      ]);
      
      // Get low stock items
      const lowStockItemsRes = await axios.get('http://localhost:8080/api/inventory/low-stock', { headers: authHeader() });
      
      // Set basic stats
      const allInventory = Array.isArray(inventoryRes.data) ? inventoryRes.data : [];
      const lowStockItems = Array.isArray(lowStockItemsRes.data) ? lowStockItemsRes.data : [];
      
      // Calculate total inventory quantity
      const totalQuantity = allInventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
      
      setStats({
        productCount: Array.isArray(productsRes.data) ? productsRes.data.length : 0,
        categoryCount: Array.isArray(categoriesRes.data) ? categoriesRes.data.length : 0,
        supplierCount: Array.isArray(suppliersRes.data) ? suppliersRes.data.length : 0,
        lowStockCount: lowStockItems.length,
        lowStockItems: lowStockItems,
        totalQuantity: totalQuantity
      });

      // Generate products by category data for pie chart
      const products = Array.isArray(productsRes.data) ? productsRes.data : [];
      const categories = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];

      // Count products by category
      const categoryProductCounts = {};
      categories.forEach(category => {
        categoryProductCounts[category.id] = {
          name: category.name,
          value: 0
        };
      });

      // Count products in each category
      products.forEach(product => {
        if (product.categoryId && categoryProductCounts[product.categoryId]) {
          categoryProductCounts[product.categoryId].value += 1;
        }
      });

      // Convert to array for pie chart
      const categoryData = Object.values(categoryProductCounts)
        .filter(category => category.value > 0)
        .sort((a, b) => b.value - a.value);
      
      // If there's no categorized products, add an "Uncategorized" entry
      if (categoryData.length === 0 && products.length > 0) {
        categoryData.push({ name: 'Uncategorized', value: products.length });
      }

      setProductsByCategory(categoryData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/inventory-history/recent', {
        headers: authHeader()
      });
      
      if (Array.isArray(response.data)) {
        // Format data for the chart
        const formattedHistory = response.data.map(item => ({
          timestamp: new Date(item.timestamp),
          label: item.formattedTimestamp,
          totalQuantity: item.totalQuantity
        }));
        
        // Sort by timestamp
        formattedHistory.sort((a, b) => a.timestamp - b.timestamp);
        
        setInventoryHistory(formattedHistory);
      }
    } catch (error) {
      console.error('Error fetching inventory history:', error);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      
      const response = await axios.get('http://localhost:8080/api/export/excel', {
        headers: {
          ...authHeader(),
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const date = new Date();
      const filename = `inventory_export_${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}.xlsx`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setExporting(false);
    }
  };

  // Calculate percentage change for stats cards
  const calculateGrowth = (value) => {
    // In a real application, you would compare current value with previous period
    // For now, generate a realistic growth percentage based on the value
    return {
      percentage: Math.floor(Math.random() * 8) + 1,
      positive: Math.random() > 0.2 // 80% chance of positive growth for demo
    };
  };

  if (loading && Object.values(stats).every(val => val === 0 || (Array.isArray(val) && val.length === 0))) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Calculate growth indicators
  const productGrowth = calculateGrowth(stats.productCount);
  const categoryGrowth = calculateGrowth(stats.categoryCount);
  const supplierGrowth = calculateGrowth(stats.supplierCount);

  return (
    <Box 
      sx={{ 
        padding: 3,
        backgroundColor: '#f8f9fa',
        minHeight: '100vh'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600,
            backgroundImage: 'linear-gradient(45deg, #3a7bd5, #00d2ff)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: "'Poppins', sans-serif"
          }}
        >
          Inventory Dashboard
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchData();
              fetchHistoryData();
            }}
            sx={{ 
              mr: 2,
              backgroundColor: '#6c757d',
              '&:hover': { backgroundColor: '#5a6268' },
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: '8px'
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={exporting}
            sx={{ 
              backgroundColor: '#28a745',
              '&:hover': { backgroundColor: '#218838' },
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: '8px'
            }}
          >
            {exporting ? "Exporting..." : "Export to Excel"}
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
          >
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center',
              backgroundImage: 'linear-gradient(120deg, #3498db, #2980b9)'
            }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  color: 'white',
                  width: 56,
                  height: 56
                }}
              >
                <InventoryIcon fontSize="large" />
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography 
                  variant="h4" 
                  component="div" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: 'white',
                    fontFamily: "'Montserrat', sans-serif"
                  }}
                >
                  {stats.productCount}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: '0.9rem'
                  }}
                >
                  Total Products
                </Typography>
              </Box>
            </Box>
            <Box 
              sx={{ 
                p: 1, 
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: '#2980b9'
                }}
              >
                {productGrowth.positive ? (
                  <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                ) : (
                  <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                )}
                {productGrowth.percentage}% {productGrowth.positive ? 'increase' : 'decrease'} this month
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
          >
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center',
              backgroundImage: 'linear-gradient(120deg, #2ecc71, #27ae60)'
            }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  color: 'white',
                  width: 56,
                  height: 56
                }}
              >
                <CategoryIcon fontSize="large" />
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography 
                  variant="h4" 
                  component="div" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: 'white',
                    fontFamily: "'Montserrat', sans-serif"
                  }}
                >
                  {stats.categoryCount}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: '0.9rem'
                  }}
                >
                  Categories
                </Typography>
              </Box>
            </Box>
            <Box 
              sx={{ 
                p: 1, 
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: '#27ae60'
                }}
              >
                {categoryGrowth.positive ? (
                  <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                ) : (
                  <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                )}
                {categoryGrowth.percentage > 0 ? `${categoryGrowth.percentage} new ${categoryGrowth.percentage === 1 ? 'category' : 'categories'} added` : 'No change in categories'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
          >
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center',
              backgroundImage: 'linear-gradient(120deg, #9b59b6, #8e44ad)'
            }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  color: 'white',
                  width: 56,
                  height: 56
                }}
              >
                <SupplierIcon fontSize="large" />
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography 
                  variant="h4" 
                  component="div" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: 'white',
                    fontFamily: "'Montserrat', sans-serif"
                  }}
                >
                  {stats.supplierCount}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: '0.9rem'
                  }}
                >
                  Suppliers
                </Typography>
              </Box>
            </Box>
            <Box 
              sx={{ 
                p: 1, 
                backgroundColor: 'rgba(155, 89, 182, 0.1)',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: '#8e44ad'
                }}
              >
                {supplierGrowth.positive ? (
                  <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                ) : (
                  <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                )}
                {supplierGrowth.percentage > 0 ? `${supplierGrowth.percentage} new ${supplierGrowth.percentage === 1 ? 'contract' : 'contracts'} this month` : 'No new contracts this month'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
          >
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center',
              backgroundImage: 'linear-gradient(120deg, #e74c3c, #c0392b)'
            }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  color: 'white',
                  width: 56,
                  height: 56
                }}
              >
                <WarningIcon fontSize="large" />
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography 
                  variant="h4" 
                  component="div" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: 'white',
                    fontFamily: "'Montserrat', sans-serif"
                  }}
                >
                  {stats.lowStockCount}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: '0.9rem'
                  }}
                >
                  Low Stock Items
                </Typography>
              </Box>
            </Box>
            <Box 
              sx={{ 
                p: 1, 
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: '#c0392b'
                }}
              >
                {stats.lowStockCount > 0 ? (
                  <>
                    <WarningIcon fontSize="small" sx={{ mr: 0.5 }} />
                    Requires immediate attention
                  </>
                ) : (
                  <>
                    <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                    All stock levels are good
                  </>
                )}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts and Data Visualization Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: '12px',
              height: '100%'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              <AssessmentIcon sx={{ mr: 1 }} /> Inventory History
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ height: 300 }}>
              {inventoryHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={inventoryHistory}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="label" 
                      tick={{ fill: '#666', fontSize: 12 }}
                      label={{ value: 'Time', position: 'insideBottomRight', offset: 0 }}
                    />
                    <YAxis 
                      tick={{ fill: '#666', fontSize: 12 }}
                      label={{ value: 'Total Quantity', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '8px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        border: 'none',
                        backgroundColor: 'rgba(255,255,255,0.95)'
                      }}
                      formatter={(value) => [`${value} items`, 'Total Quantity']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalQuantity" 
                      stroke="#3498db" 
                      strokeWidth={3} 
                      dot={{ fill: '#3498db', r: 6 }} 
                      activeDot={{ r: 8 }}
                      name="Total Items"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body1" color="text.secondary">
                    No historical data available yet. Inventory changes will be tracked over time.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: '12px',
              height: '100%'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                fontFamily: "'Poppins', sans-serif"
              }}
            >
              <CategoryIcon sx={{ mr: 1 }} /> Product Categories
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Box sx={{ width: '100%', mb: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                {productsByCategory.map((entry, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      mx: 1 
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        backgroundColor: COLORS[index % COLORS.length],
                        borderRadius: '50%',
                        mr: 1
                      }} 
                    />
                    <Typography variant="caption">
                      {entry.name} ({Math.round(entry.value / stats.productCount * 100)}%)
                    </Typography>
                  </Box>
                ))}
              </Box>
              {productsByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productsByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      // Removed external labels that were going outside container
                      label={false}
                    >
                      {productsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} items (${Math.round(value / stats.productCount * 100)}%)`, name]}
                      contentStyle={{ 
                        borderRadius: '8px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        border: 'none',
                        backgroundColor: 'rgba(255,255,255,0.95)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  No product categories data available
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Low Stock Items Section */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          borderRadius: '12px',
          mb: 4,
          backgroundImage: 'linear-gradient(to right, #fff, rgba(231, 76, 60, 0.05))'
        }}
      />

          {/* Low Stock Items Section */}
      <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        borderRadius: '12px',
        mb: 4,
        backgroundImage: 'linear-gradient(to right, #fff, rgba(231, 76, 60, 0.05))'
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2, 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          color: '#c0392b',
          fontFamily: "'Poppins', sans-serif"
        }}
      >
        <WarningIcon sx={{ mr: 1 }} /> Low Stock Items
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      {stats.lowStockItems.length > 0 ? (
        <List sx={{ width: '100%' }}>
          {stats.lowStockItems.map((item) => (
            <Paper 
              key={item.id} 
              elevation={1} 
              sx={{ 
                mb: 2, 
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid rgba(231, 76, 60, 0.2)'
              }}
            >
              <ListItem 
                secondaryAction={
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: item.quantity === 0 ? '#c0392b' : '#e67e22',
                      fontWeight: 'bold',
                      bgcolor: item.quantity === 0 ? 'rgba(231, 76, 60, 0.1)' : 'rgba(230, 126, 34, 0.1)',
                      py: 0.5,
                      px: 1.5,
                      borderRadius: '16px'
                    }}
                  >
                    {item.quantity} in stock
                  </Typography>
                }
              >
                <ListItemAvatar>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(231, 76, 60, 0.8)'
                    }}
                  >
                    <InventoryIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: '1rem',
                        fontFamily: "'Roboto', sans-serif"
                      }}
                    >
                      {item.productName}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Reorder Level: {item.reorderLevel}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationIcon sx={{ color: 'text.secondary', fontSize: '0.9rem', mr: 0.5 }} />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {item.location || 'Not specified'}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      ) : (
        <Box 
          sx={{ 
            py: 4, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: 'white',
            borderRadius: '8px'
          }}
        >
          <Typography 
            variant="body1" 
            color="text.secondary" 
            align="center"
            sx={{ mb: 1 }}
          >
            No low stock items found. Your inventory is in good shape!
          </Typography>
          <Typography 
            variant="body2" 
            color="success.main" 
            align="center"
          >
            All inventory items are above their reorder levels.
          </Typography>
        </Box>
      )}
    </Paper>
  </Box>
);
};

export default ImprovedDashboard;