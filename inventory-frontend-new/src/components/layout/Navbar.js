import React, { useState, useContext } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  useTheme, 
  useMediaQuery, 
  Avatar, 
  Divider,
  Tooltip
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import InventoryIcon from '@mui/icons-material/Inventory';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CategoryIcon from '@mui/icons-material/Category';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ReceiptIcon from '@mui/icons-material/Receipt';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, isAdmin } = useContext(AuthContext);
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [productsMenuAnchor, setProductsMenuAnchor] = useState(null);
  const [reportsMenuAnchor, setReportsMenuAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const isActive = (path) => location.pathname === path;

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleProductsMenuOpen = (event) => {
    setProductsMenuAnchor(event.currentTarget);
  };

  const handleProductsMenuClose = () => {
    setProductsMenuAnchor(null);
  };

  const handleReportsMenuOpen = (event) => {
    setReportsMenuAnchor(event.currentTarget);
  };

  const handleReportsMenuClose = () => {
    setReportsMenuAnchor(null);
  };
  
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  
  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/login');
  };

  const drawerItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Products', icon: <ShoppingCartIcon />, path: '/products' },
    { text: 'Categories', icon: <CategoryIcon />, path: '/categories' },
    { text: 'Suppliers', icon: <LocalShippingIcon />, path: '/suppliers' },
    { text: 'Inventory', icon: <WarehouseIcon />, path: '/inventory' },
  ];
  
  // Add Users management for admins
  if (isAdmin()) {
    drawerItems.push({ text: 'Users', icon: <PeopleIcon />, path: '/users' });
  }

  const drawer = (
    <Box 
      sx={{ width: 250 }} 
      role="presentation" 
      onClick={toggleDrawer(false)} 
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, mb: 2 }}>
        <Avatar 
          sx={{ 
            width: 64, 
            height: 64, 
            mb: 1, 
            bgcolor: theme.palette.primary.main,
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <InventoryIcon fontSize="large" />
        </Avatar>
        <Typography variant="h6" color="primary">
          Inventory System
        </Typography>
        {currentUser && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {currentUser.username}
          </Typography>
        )}
      </Box>
      <Divider />
      <List>
        {drawerItems.map((item) => (
          <ListItem 
            button 
            component={Link} 
            to={item.path} 
            key={item.text}
            sx={{ 
              py: 1,
              backgroundColor: isActive(item.path) ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
              borderLeft: isActive(item.path) ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
              }
            }}
          >
            <ListItemIcon sx={{ color: isActive(item.path) ? theme.palette.primary.main : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                fontWeight: isActive(item.path) ? 'bold' : 'normal'
              }}
            />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          backgroundColor: 'white', 
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography 
                variant="h6" 
                component={Link} 
                to="/" 
                sx={{ 
                  flexGrow: 1, 
                  textDecoration: 'none', 
                  color: 'inherit', 
                  display: 'flex', 
                  alignItems: 'center' 
                }}
              >
                <InventoryIcon sx={{ mr: 1 }} />
                Inventory System
              </Typography>
              
              {/* User menu for mobile */}
              <Tooltip title="Account">
                <IconButton
                  onClick={handleUserMenuOpen}
                  size="large"
                  edge="end"
                  color="inherit"
                >
                  <AccountCircleIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Typography 
                variant="h6" 
                component={Link} 
                to="/" 
                sx={{ 
                  textDecoration: 'none', 
                  color: 'inherit', 
                  display: 'flex', 
                  alignItems: 'center', 
                  mr: 4 
                }}
              >
                <InventoryIcon sx={{ mr: 1 }} />
                Inventory System
              </Typography>
              <Box sx={{ display: 'flex', flexGrow: 1 }}>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/"
                  sx={{ 
                    mx: 1, 
                    borderBottom: isActive('/') ? '2px solid' : '2px solid transparent',
                    borderColor: isActive('/') ? 'primary.main' : 'transparent',
                    borderRadius: 0,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  Dashboard
                </Button>
                
                <Button 
                  color="inherit" 
                  sx={{ 
                    mx: 1,
                    borderBottom: ['/products', '/categories'].includes(location.pathname) ? '2px solid' : '2px solid transparent',
                    borderColor: ['/products', '/categories'].includes(location.pathname) ? 'primary.main' : 'transparent',
                    borderRadius: 0,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                  endIcon={<KeyboardArrowDownIcon />}
                  onClick={handleProductsMenuOpen}
                >
                  Products
                </Button>
                <Menu
                  anchorEl={productsMenuAnchor}
                  open={Boolean(productsMenuAnchor)}
                  onClose={handleProductsMenuClose}
                  MenuListProps={{
                    'aria-labelledby': 'products-button',
                  }}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                >
                  <MenuItem 
                    onClick={handleProductsMenuClose} 
                    component={Link} 
                    to="/products"
                    selected={isActive('/products')}
                  >
                    <ListItemIcon>
                      <ShoppingCartIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Products</ListItemText>
                  </MenuItem>
                  <MenuItem 
                    onClick={handleProductsMenuClose} 
                    component={Link} 
                    to="/categories"
                    selected={isActive('/categories')}
                  >
                    <ListItemIcon>
                      <CategoryIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Categories</ListItemText>
                  </MenuItem>
                </Menu>
                
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/suppliers"
                  sx={{ 
                    mx: 1, 
                    borderBottom: isActive('/suppliers') ? '2px solid' : '2px solid transparent',
                    borderColor: isActive('/suppliers') ? 'primary.main' : 'transparent',
                    borderRadius: 0,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  Suppliers
                </Button>
                
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/inventory"
                  sx={{ 
                    mx: 1, 
                    borderBottom: isActive('/inventory') ? '2px solid' : '2px solid transparent',
                    borderColor: isActive('/inventory') ? 'primary.main' : 'transparent',
                    borderRadius: 0,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  Inventory
                </Button>
                
                {/* Admin-only buttons */}
                {isAdmin() && (
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/users"
                    sx={{ 
                      mx: 1, 
                      borderBottom: isActive('/users') ? '2px solid' : '2px solid transparent',
                      borderColor: isActive('/users') ? 'primary.main' : 'transparent',
                      borderRadius: 0,
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    Users
                  </Button>
                )}
              </Box>
              
              {/* User menu */}
              <Box sx={{ ml: 2 }}>
                <Tooltip title="Account">
                  <Button 
                    onClick={handleUserMenuOpen}
                    color="inherit"
                    startIcon={<AccountCircleIcon />}
                    endIcon={<KeyboardArrowDownIcon />}
                  >
                    {currentUser?.username}
                  </Button>
                </Tooltip>
              </Box>
            </>
          )}
          
          {/* User menu */}
          <Menu
            anchorEl={userMenuAnchor}
            id="account-menu"
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            onClick={handleUserMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                Signed in as <strong>{currentUser?.email}</strong>
              </Typography>
            </MenuItem>
            <Divider />
            {isAdmin() && (
              <MenuItem component={Link} to="/users">
                <ListItemIcon>
                  <PeopleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>User Management</ListItemText>
              </MenuItem>
            )}
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;