import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  IconButton, 
  Avatar, 
  Divider, 
  Badge, 
  CircularProgress,
  List,
  useTheme
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ChatService from '../../services/ChatService';
import Message from './Message';

const ChatDetail = () => {
  const { chatId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = theme.breakpoints.down('md');
  
  const [chatInfo, setChatInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  const messageListRef = useRef(null);
  
  // Fetch chat data and messages
  useEffect(() => {
    if (chatId) {
      fetchChatInfo();
      fetchMessages();
      
      // Set up polling interval to check for new messages
      const interval = setInterval(() => {
        fetchMessages(false); // Don't show loading state on interval refreshes
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [chatId]);

  // Scroll to bottom effect
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatInfo = async () => {
    try {
      setLoading(true);
      const response = await ChatService.getChatInfo(chatId);
      setChatInfo(response.data);
    } catch (error) {
      console.error('Error fetching chat info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await ChatService.getMessages(chatId);
      
      // Mark messages as read when viewing the chat
      if (response.data && response.data.length > 0) {
        ChatService.markChatAsRead(chatId);
      }
      
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    setSending(true);
    try {
      await ChatService.sendMessage(chatId, newMessage);
      setNewMessage('');
      await fetchMessages(false);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleBackToList = () => {
    navigate('/chat');
  };

  // Group messages by date
  const getMessageGroups = () => {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  // Get formatted date header
  const getFormattedDateHeader = (dateStr) => {
    const today = new Date().toLocaleDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString();
    
    if (dateStr === today) {
      return 'Today';
    } else if (dateStr === yesterdayStr) {
      return 'Yesterday';
    } else {
      return dateStr;
    }
  };

  if (loading && !chatInfo) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  const messageGroups = getMessageGroups();

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: '12px',
          overflow: 'hidden',
          height: 'calc(100vh - 110px)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Chat Header */}
        <Box 
          sx={{ 
            p: 2,
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            backgroundColor: 'white'
          }}
        >
          {isMobile && (
            <IconButton onClick={handleBackToList} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
          )}
          
          {chatInfo && (
            <>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                color="success"
                invisible={!chatInfo.otherParticipant.online}
              >
                <Avatar sx={{ mr: 2 }}>
                  {chatInfo.otherParticipant.name.charAt(0).toUpperCase()}
                </Avatar>
              </Badge>
              <Box>
                <Typography variant="h6" fontWeight={500}>
                  {chatInfo.otherParticipant.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {chatInfo.otherParticipant.online ? 'Online' : 'Offline'}
                </Typography>
              </Box>
            </>
          )}
        </Box>
        
        {/* Message List */}
        <Box 
          ref={messageListRef}
          sx={{ 
            flexGrow: 1,
            overflowY: 'auto',
            p: 2,
            backgroundColor: '#f5f7f9',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {Object.keys(messageGroups).map(date => (
            <Box key={date}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 2, 
                  mt: 2 
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.1)', 
                    px: 2, 
                    py: 0.5, 
                    borderRadius: 10,
                    color: 'text.secondary'
                  }}
                >
                  {getFormattedDateHeader(date)}
                </Typography>
              </Box>
              
              {messageGroups[date].map((message) => (
                <Message 
                  key={message.id} 
                  message={message} 
                  isOwn={message.senderId === currentUser?.id} 
                />
              ))}
            </Box>
          ))}
          
          {/* Empty state if no messages */}
          {messages.length === 0 && (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center',
                height: '100%'
              }}
            >
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No messages yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start the conversation by sending a message
              </Typography>
            </Box>
          )}
          
          {/* Reference for auto-scrolling */}
          <div ref={messagesEndRef} />
        </Box>
        
        {/* Message Input */}
        <Box 
          component="form" 
          onSubmit={handleSendMessage}
          sx={{ 
            p: 2,
            backgroundColor: 'white',
            borderTop: '1px solid rgba(0, 0, 0, 0.12)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <TextField
            fullWidth
            placeholder="Type a message..."
            variant="outlined"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            size="medium"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '24px',
                '&.Mui-focused fieldset': {
                  borderColor: '#3498db',
                },
              },
            }}
          />
          <IconButton 
            color="primary" 
            type="submit" 
            disabled={sending || !newMessage.trim()} 
            sx={{ 
              ml: 1, 
              bgcolor: '#3498db', 
              color: 'white',
              '&:hover': {
                bgcolor: '#2980b9',
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(0, 0, 0, 0.12)',
              }
            }}
          >
            {sending ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatDetail;