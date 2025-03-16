import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Drawer,
  Fab,
  List,
  ListItem,
  Divider,
  InputAdornment,
  Zoom,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Chat as ChatIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import authHeader from '../../services/AuthHeader';

const InventoryAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Inventory Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId] = useState(`user_${Math.random().toString(36).substring(2, 15)}`);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    
    if (!newMessage.trim()) return;

    // Add user message to chat
    const userMessage = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setLoading(true);

    try {
      // Send message to bot API
      const response = await axios.post(
        'http://localhost:8080/api/chatbot/message',
        {
          message: newMessage,
          userId: userId
        },
        {
          headers: {
            ...authHeader(),
            'Content-Type': 'application/json'
          }
        }
      );

      // Add bot response to chat
      const botMessage = {
        id: messages.length + 2,
        text: response.data.message,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message to bot:', error);
      
      // Add error message
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I'm having trouble connecting to my service right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatMessageTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const exampleQuestions = [
    "What are our top selling products?",
    "How many products have been returned?",
    "Which items are low in stock?",
    "What is the total value of our inventory?",
    "What are the sales for this month?",
    "Show me recent transactions"
  ];

  return (
    <>
      {/* Chat toggle button */}
      <Zoom in={!open}>
        <Tooltip title="Inventory Assistant" placement="left">
          <Fab
            color="primary"
            aria-label="chat"
            onClick={toggleDrawer}
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              backgroundColor: '#3498db',
              '&:hover': {
                backgroundColor: '#2980b9'
              }
            }}
          >
            <ChatIcon />
          </Fab>
        </Tooltip>
      </Zoom>

      {/* Chat drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 380 },
            maxWidth: '100%',
            height: '100%',
            borderTopLeftRadius: { xs: 0, sm: '16px' },
            borderBottomLeftRadius: { xs: 0, sm: '16px' },
            overflow: 'hidden'
          }
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            backgroundColor: '#3498db',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                mr: 1.5
              }}
            >
              <BotIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Inventory Assistant
              </Typography>
              <Typography variant="caption">
                Ask me about sales, inventory & more
              </Typography>
            </Box>
          </Box>
          <IconButton color="inherit" onClick={toggleDrawer}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Messages area */}
        <Box
          sx={{
            flexGrow: 1,
            p: 2,
            overflowY: 'auto',
            backgroundColor: '#f5f7f9'
          }}
        >
          <List>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  p: 0,
                  mb: 2
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    maxWidth: '85%'
                  }}
                >
                  {message.sender === 'bot' && (
                    <Avatar
                      sx={{
                        bgcolor: '#3498db',
                        width: 32,
                        height: 32,
                        mr: 1,
                        ml: message.sender === 'user' ? 1 : 0
                      }}
                    >
                      <BotIcon fontSize="small" />
                    </Avatar>
                  )}
                  
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      borderRadius: '18px',
                      backgroundColor: message.sender === 'user' ? '#3498db' : 'white',
                      color: message.sender === 'user' ? 'white' : 'inherit',
                      ml: message.sender === 'user' ? 0 : 1,
                      mr: message.sender === 'user' ? 1 : 0,
                      borderTopRightRadius: message.sender === 'user' ? 4 : 18,
                      borderTopLeftRadius: message.sender === 'user' ? 18 : 4,
                      whiteSpace: 'pre-line'
                    }}
                  >
                    <Typography variant="body2">{message.text}</Typography>
                  </Paper>
                </Box>
                
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    mx: 2,
                    fontSize: '0.7rem'
                  }}
                >
                  {formatMessageTimestamp(message.timestamp)}
                </Typography>
              </ListItem>
            ))}
            {loading && (
              <ListItem
                sx={{
                  display: 'flex',
                  p: 0,
                  mb: 2
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    maxWidth: '85%'
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: '#3498db',
                      width: 32,
                      height: 32,
                      mr: 1
                    }}
                  >
                    <BotIcon fontSize="small" />
                  </Avatar>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      borderRadius: '18px',
                      backgroundColor: 'white',
                      borderTopLeftRadius: 4
                    }}
                  >
                    <CircularProgress size={20} thickness={5} />
                  </Paper>
                </Box>
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>
        </Box>

        {/* Example questions */}
        {messages.length <= 2 && (
          <Box
            sx={{
              p: 2,
              borderTop: '1px solid rgba(0,0,0,0.08)',
              backgroundColor: 'rgba(52, 152, 219, 0.05)'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              You can ask me:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {exampleQuestions.map((question, index) => (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: 'white',
                    border: '1px solid rgba(52, 152, 219, 0.3)',
                    borderRadius: '16px',
                    px: 1,
                    py: 0.5,
                    fontSize: '0.75rem',
                    color: '#3498db',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(52, 152, 219, 0.1)'
                    }
                  }}
                  onClick={() => {
                    setNewMessage(question);
                  }}
                >
                  {question}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Divider />

        {/* Input area */}
        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            p: 2,
            backgroundColor: 'white',
            boxShadow: '0 -2px 4px rgba(0,0,0,0.05)'
          }}
        >
          <TextField
            fullWidth
            placeholder="Type your question here..."
            variant="outlined"
            value={newMessage}
            onChange={handleInputChange}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    color="primary"
                    aria-label="send message"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || loading}
                  >
                    <SendIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                borderRadius: '24px',
                pr: 0.5
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#3498db'
                }
              }
            }}
          />
        </Box>
      </Drawer>
    </>
  );
};

export default InventoryAssistant;