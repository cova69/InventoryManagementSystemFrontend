import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Avatar,
  Divider,
  Button,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';

import {
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  Warehouse as WarehouseIcon
} from '@mui/icons-material'; // Changed from '@mui/material' to '@mui/icons-material'

const NotificationsSystem = ({ lowStockItems, buttonStyle }) => {
  const [notifications, setNotifications] = useState([]);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Generate notifications based on props
  useEffect(() => {
    const newNotifications = [];
    
    // Add low stock notifications
    if (Array.isArray(lowStockItems) && lowStockItems.length > 0) {
      // Group notification if there are multiple low stock items
      if (lowStockItems.length > 1) {
        newNotifications.push({
          id: 'low-stock-group',
          type: 'warning',
          icon: <WarehouseIcon fontSize="small" />,
          avatarColor: 'rgba(231, 76, 60, 0.2)',
          iconColor: '#e74c3c',
          bgColor: 'rgba(231, 76, 60, 0.1)',
          borderColor: 'rgba(231, 76, 60, 0.2)',
          title: 'Low stock alert',
          message: `${lowStockItems.length} items need reordering`,
          time: new Date().toISOString(),
          read: false
        });
      } else {
        // Single item notification
        const item = lowStockItems[0];
        newNotifications.push({
          id: `low-stock-${item.id || item.productId}`,
          type: 'warning',
          icon: <WarehouseIcon fontSize="small" />,
          avatarColor: 'rgba(231, 76, 60, 0.2)',
          iconColor: '#e74c3c',
          bgColor: 'rgba(231, 76, 60, 0.1)',
          borderColor: 'rgba(231, 76, 60, 0.2)',
          title: 'Low stock alert',
          message: `${item.productName} is low in stock (${item.quantity} remaining)`,
          time: new Date().toISOString(),
          read: false
        });
      }
    }
    
    // Add sample notifications to make it look more complete
    // These can be replaced with real data from your backend later
    newNotifications.push({
      id: 'new-products',
      type: 'info',
      icon: <ShoppingCartIcon fontSize="small" />,
      avatarColor: 'rgba(46, 204, 113, 0.2)',
      iconColor: '#2ecc71',
      bgColor: 'rgba(46, 204, 113, 0.1)',
      borderColor: 'rgba(46, 204, 113, 0.2)',
      title: 'New products added',
      message: 'New items were added to inventory today',
      time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      read: false
    });
    
    newNotifications.push({
      id: 'supplier-update',
      type: 'info',
      icon: <LocalShippingIcon fontSize="small" />,
      avatarColor: 'rgba(52, 152, 219, 0.2)',
      iconColor: '#3498db',
      bgColor: 'rgba(52, 152, 219, 0.1)',
      borderColor: 'rgba(52, 152, 219, 0.2)',
      title: 'Supplier update',
      message: 'New supplier catalog available',
      time: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      read: true
    });
    
    setNotifications(newNotifications);
    setUnreadCount(newNotifications.filter(n => !n.read).length);
  }, [lowStockItems]);

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notificationId) => {
    // Mark individual notification as read
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
    handleNotificationClose();
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleNotificationOpen}
        size="small"
        sx={buttonStyle || { position: 'relative', mx: 0.5 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        PaperProps={{
          elevation: 3,
          sx: { 
            mt: 1.5, 
            borderRadius: '12px',
            width: 320,
            overflow: 'visible',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: -6,
              right: 14,
              width: 12,
              height: 12,
              bgcolor: 'background.paper',
              transform: 'rotate(45deg)',
              zIndex: 0,
            },
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button 
                size="small" 
                onClick={handleMarkAllRead}
                sx={{ fontSize: '0.75rem' }}
              >
                Mark all as read
              </Button>
            )}
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          {/* Notification Items */}
          {notifications.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="text.secondary">No notifications</Typography>
            </Box>
          ) : (
            notifications.map(notification => (
              <Box 
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id)}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 1.5,
                  mb: 1,
                  bgcolor: notification.bgColor,
                  borderRadius: '8px',
                  border: `1px solid ${notification.borderColor}`,
                  cursor: 'pointer',
                  opacity: notification.read ? 0.7 : 1,
                  '&:hover': {
                    opacity: 0.9
                  }
                }}
              >
                <Avatar sx={{ bgcolor: notification.avatarColor, color: notification.iconColor }}>
                  {notification.icon}
                </Avatar>
                <Box sx={{ ml: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                    {notification.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notification.message}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Menu>
    </>
  );
};

export default NotificationsSystem;