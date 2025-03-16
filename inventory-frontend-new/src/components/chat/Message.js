import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';

const Message = ({ message, isOwn }) => {
  // Format timestamp to time only (e.g. "14:32")
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        mb: 1.5
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOwn ? 'flex-end' : 'flex-start',
          maxWidth: '70%'
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: '18px',
            borderTopRightRadius: isOwn ? 4 : 18,
            borderTopLeftRadius: isOwn ? 18 : 4,
            backgroundColor: isOwn ? '#3498db' : 'white',
            color: isOwn ? 'white' : 'inherit',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Typography variant="body1">{message.content}</Typography>
        </Paper>
        
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mt: 0.5,
            fontSize: '0.75rem',
            color: 'text.secondary'
          }}
        >
          <Typography variant="caption" sx={{ mr: 0.5 }}>
            {formatTime(message.timestamp)}
          </Typography>
          
          {isOwn && (
            message.read 
              ? <DoneAllIcon fontSize="inherit" sx={{ fontSize: '0.9rem', color: '#3498db' }} /> 
              : <DoneIcon fontSize="inherit" sx={{ fontSize: '0.9rem' }} />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Message;