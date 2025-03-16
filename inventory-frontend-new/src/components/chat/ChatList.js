import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Divider, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Badge, 
  Grid, 
  CircularProgress,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Message as MessageIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ChatService from '../../services/ChatService';
import NewChatDialog from './NewChatDialog';

const ChatList = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);

  useEffect(() => {
    fetchChats();
    
    // Set up polling interval to refresh chats every 10 seconds
    const interval = setInterval(() => {
      fetchChats(false); // pass false to not show loading indicator on interval refreshes
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chats.length > 0) {
      applySearchFilter();
    }
  }, [searchTerm, chats]);

  const fetchChats = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const response = await ChatService.getAllChats();
      setChats(response.data || []);
      setFilteredChats(response.data || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const applySearchFilter = () => {
    if (!searchTerm.trim()) {
      setFilteredChats(chats);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = chats.filter(chat => 
      chat.otherParticipant.name.toLowerCase().includes(term) ||
      (chat.lastMessage && chat.lastMessage.content.toLowerCase().includes(term))
    );
    
    setFilteredChats(filtered);
  };

  const handleChatItemClick = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  const handleOpenNewChatDialog = () => {
    setNewChatDialogOpen(true);
  };

  const handleCloseNewChatDialog = () => {
    setNewChatDialogOpen(false);
  };

  const handleStartNewChat = async (userId) => {
    try {
      const response = await ChatService.createChat(userId);
      handleCloseNewChatDialog();
      navigate(`/chat/${response.data.id}`);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
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
    <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
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
          Chat Messages
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              borderRadius: '12px',
              overflow: 'hidden',
              height: 'calc(100vh - 180px)'
            }}
          >
            <Box 
              sx={{ 
                p: 2, 
                borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '&.Mui-focused fieldset': {
                      borderColor: '#3a7bd5',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#3a7bd5' }} />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Box>
            
            <Box 
              sx={{ 
                overflowY: 'auto',
                height: 'calc(100% - 70px)'
              }}
            >
              {loading && chats.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress size={40} />
                </Box>
              ) : filteredChats.length === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <MessageIcon sx={{ fontSize: 48, color: '#aaa', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" align="center">
                    {searchTerm ? 'No chats matching your search' : 'No chats yet'}
                  </Typography>
                  {!searchTerm && (
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleOpenNewChatDialog}
                      sx={{ mt: 2 }}
                    >
                      Start a new chat
                    </Button>
                  )}
                </Box>
              ) : (
                <List sx={{ width: '100%', p: 0 }}>
                  {filteredChats.map((chat) => (
                    <React.Fragment key={chat.id}>
                      <ListItem 
                        button
                        alignItems="flex-start"
                        onClick={() => handleChatItemClick(chat.id)}
                        sx={{
                          px: 2,
                          py: 1.5,
                          transition: 'background-color 0.2s',
                          backgroundColor: chat.hasUnread ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.05)'
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            variant="dot"
                            color="success"
                            invisible={!chat.otherParticipant.online}
                          >
                            <Avatar 
                              sx={{ 
                                bgcolor: chat.hasUnread ? '#3498db' : 'rgba(0, 0, 0, 0.08)',
                                color: chat.hasUnread ? 'white' : 'inherit'
                              }}
                            >
                              {chat.otherParticipant.name.charAt(0).toUpperCase()}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
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
                                maxWidth: '100%',
                                mt: 0.5
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
                              ml: 1,
                              mt: 2
                            }} 
                          />
                        )}
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={2} 
            sx={{ 
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: 'calc(100vh - 180px)',
              bgcolor: 'rgba(52, 152, 219, 0.05)'
            }}
          >
            <MessageIcon sx={{ fontSize: 64, color: '#3498db', mb: 3, opacity: 0.5 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Select a chat to start messaging
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: '70%', mb: 4 }}>
              Choose a conversation from the list or start a new chat to begin messaging
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenNewChatDialog}
              sx={{ 
                backgroundColor: '#3498db',
                '&:hover': { backgroundColor: '#2980b9' },
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: '8px'
              }}
            >
              Start New Conversation
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      <NewChatDialog 
        open={newChatDialogOpen}
        onClose={handleCloseNewChatDialog}
        onStartChat={handleStartNewChat}
      />
    </Box>
  );
};

export default ChatList;