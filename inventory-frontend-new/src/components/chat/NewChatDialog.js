import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  DialogActions,
  Button,
  Box,
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import UserService from '../../services/UserService';
import ChatService from '../../services/ChatService'

const NewChatDialog = ({ open, onClose, onStartChat }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  useEffect(() => {
    if (users.length > 0) {
      applySearchFilter();
    }
  }, [searchTerm, users]);

// In NewChatDialog.js, replace the fetchUsers function
const fetchUsers = async () => {
  setLoading(true);
  try {
    // Use the dedicated chat users endpoint instead of admin endpoint
    const response = await ChatService.getAvailableUsers();
    setUsers(response.data || []);
    setFilteredUsers(response.data || []);
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    setLoading(false);
  }
};
  const applySearchFilter = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
    
    setFilteredUsers(filtered);
  };

  const handleUserClick = (userId) => {
    onStartChat(userId);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          overflow: 'hidden',
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
          Start New Conversation
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search users..."
          value={searchTerm}
          onChange={handleSearchChange}
          autoFocus
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Box sx={{ py: 4, px: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {searchTerm ? 'No users matching your search' : 'No users available'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%', pt: 0 }}>
            {filteredUsers.map((user) => (
              <React.Fragment key={user.id}>
                <ListItem 
                  button 
                  onClick={() => handleUserClick(user.id)}
                  sx={{
                    py: 2,
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#3498db' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name}
                    secondary={
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {user.email}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ fontWeight: 500 }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewChatDialog;