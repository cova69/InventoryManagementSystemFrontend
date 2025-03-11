// src/components/dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { 
  Grid, Paper, Typography, Box, Card, CardContent, 
  CircularProgress, Divider
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    productCount: 0,
    categoryCount: 0,
    supplierCount: 0,
    lowStockCount: 0,
    lowStockItems: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, suppliersRes, inventoryRes] = await Promise.all([
          axios.get('http://localhost:8080/api/products'),
          axios.get('http://localhost:8080/api/categories'),
          axios.get('http://localhost:8080/api/suppliers'),
          axios.get('http://localhost:8080/api/inventory/low-stock')
        ]);
        
        setStats({
          productCount: Array.isArray(productsRes.data) ? productsRes.data.length : 0,
          categoryCount: Array.isArray(categoriesRes.data) ? categoriesRes.data.length : 0,
          supplierCount: Array.isArray(suppliersRes.data) ? suppliersRes.data.length : 0,
          lowStockCount: Array.isArray(inventoryRes.data) ? inventoryRes.data.length : 0,
          lowStockItems: Array.isArray(inventoryRes.data) ? inventoryRes.data : []
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <Card elevation={3} sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center">
          <Box 
            sx={{ 
              bgcolor: `${color}.light`, 
              color: `${color}.main`,
              p: 1.5,
              borderRadius: 2,
              display: 'flex',
              mr: 2
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h6" component="div">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Total Products" 
                value={stats.productCount} 
                icon={<InventoryIcon />} 
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Categories" 
                value={stats.categoryCount} 
                icon={<CategoryIcon />} 
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Suppliers" 
                value={stats.supplierCount} 
                icon={<LocalShippingIcon />} 
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Low Stock Items" 
                value={stats.lowStockCount} 
                icon={<WarningIcon />} 
                color="warning"
              />
            </Grid>
          </Grid>

          <Typography variant="h5" gutterBottom>
            Low Stock Items
          </Typography>
          <Paper elevation={2} sx={{ p: 2 }}>
            {stats.lowStockItems.length > 0 ? (
              <Box>
                {stats.lowStockItems.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <Box py={1.5}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography fontWeight="medium">{item.productName}</Typography>
                        <Typography 
                          color={item.quantity === 0 ? "error.main" : "warning.main"}
                          fontWeight="medium"
                        >
                          {item.quantity} in stock
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mt={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          Reorder Level: {item.reorderLevel}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Location: {item.location || 'Not specified'}
                        </Typography>
                      </Box>
                    </Box>
                    {index < stats.lowStockItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </Box>
            ) : (
              <Typography align="center" color="text.secondary" py={3}>
                No low stock items found. Your inventory is in good shape!
              </Typography>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
};

export default Dashboard;