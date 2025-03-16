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
  ListItemIcon,
  ListItemText,
  Tooltip,
  Button
} from '@mui/material';
import {
  Chat as ChatIcon,
  Forum as ForumIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import ChatService from '../../services/ChatService';

const ChatNavIcon = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recentChats, setRecentChats] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    fetchRecentChats();
    
    // Set up interval to check for new messages every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchRecentChats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await ChatService.getUnreadCount();
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching unread message count:', error);
    }
  };

  const fetchRecentChats = async () => {
    try {
      setLoading(true);
      const response = await ChatService.getRecentChats();
      setRecentChats(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recent chats:', error);
      setLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const navigateToChat = (chatId) => {
    handleMenuClose();
    navigate(`/chat/${chatId}`);
  };

  const navigateToChatList = () => {
    handleMenuClose();
    navigate('/chat');
  };

  // Format timestamp to relative time (e.g., "5 min ago")
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffMs = now - messageTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays < 7) return `${diffDays} day ago`;
    
    return messageTime.toLocaleDateString();
  };

  return (
    <>
      <Tooltip title="Chat">
        <IconButton
          color="inherit"
          onClick={handleMenuOpen}
          size="small"
          sx={{ position: 'relative', mx: 0.5 }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <ChatIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { 
            mt: 1.5, 
            borderRadius: '12px',
            width: 320,
            maxHeight: 450,
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
              Recent Chats
            </Typography>
            <Tooltip title="View All Chats">
              <IconButton size="small" onClick={navigateToChatList}>
                <ForumIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          {recentChats.length === 0 ? (
            <Typography variant="body2" align="center" color="text.secondary" sx={{ py: 2 }}>
              No recent chats
            </Typography>
          ) : (
            recentChats.map(chat => (
              <MenuItem 
                key={chat.id} 
                onClick={() => navigateToChat(chat.id)}
                sx={{
                  borderRadius: '8px',
                  mb: 1,
                  backgroundColor: chat.hasUnread ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
                <ListItemIcon>
                  <Avatar 
                    sx={{ 
                      bgcolor: chat.hasUnread ? '#3498db' : 'rgba(0, 0, 0, 0.08)'
                    }}
                  >
                    {chat.otherParticipant.name.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" fontWeight={chat.hasUnread ? 600 : 400}>
                        {chat.otherParticipant.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatRelativeTime(chat.lastMessage?.timestamp)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography 
                      variant="body2" 
                      color={chat.hasUnread ? 'text.primary' : 'text.secondary'}
                      fontWeight={chat.hasUnread ? 500 : 400}
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%'
                      }}
                    >
                      {chat.lastMessage?.content || 'No messages yet'}
                    </Typography>
                  }
                />
                {chat.hasUnread && (
                  <Box 
                    sx={{ 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%', 
                      bgcolor: '#3498db',
                      ml: 1
                    }} 
                  />
                )}
              </MenuItem>
            ))
          )}
          
          <Divider sx={{ my: 1 }} />
          
          <Button
            component={Link}
            to="/chat"
            fullWidth
            variant="contained"
            sx={{
              mt: 1,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              py: 1,
              backgroundImage: 'linear-gradient(120deg, #3498db, #2980b9)'
            }}
          >
            Open Chat Center
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default ChatNavIcon;