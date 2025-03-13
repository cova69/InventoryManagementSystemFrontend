import React, { useState, useContext, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Grid, 
  TextField, 
  Button, 
  Divider, 
  IconButton, 
  Snackbar, 
  Alert,
  Card,
  CardContent,
  Tab,
  Tabs,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  AccountCircle as AccountCircleIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Security as SecurityIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import authHeader from '../../services/AuthHeader';

const UserProfile = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [userDetails, setUserDetails] = useState({
    username: '',
    email: '',
    fullName: '',
    position: '',
    phoneNumber: '',
    department: '',
    joinDate: '',
    lastLogin: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  useEffect(() => {
    fetchUserDetails();
  }, []);
  
  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      // Get the user profile from the auth context
      if (currentUser) {
        const userProfileData = {
          username: currentUser.username || currentUser.name || '',
          email: currentUser.email || '',
          fullName: currentUser.name || '',
          position: currentUser.role || '',
          phoneNumber: '',
          department: '',
          joinDate: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        setUserDetails(userProfileData);
      } else {
        // If no current user is available, redirect to login
        navigate('/login');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load user details',
        severity: 'error'
      });
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      // Call the backend API to update the user profile
      await axios.put(
        `http://localhost:8080/api/users/${currentUser.id}`, 
        {
          name: userDetails.fullName,
          email: userDetails.email,
          role: userDetails.position.toUpperCase()
        },
        { headers: authHeader() }
      );
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangePassword = async () => {
    // Simple validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'New passwords do not match',
        severity: 'error'
      });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setSnackbar({
        open: true,
        message: 'Password must be at least 8 characters',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    try {
      // Call the backend API to change the password
      await axios.put(
        `http://localhost:8080/api/users/${currentUser.id}`, 
        {
          name: userDetails.fullName,
          email: userDetails.email,
          password: passwordData.newPassword,
          role: currentUser.role
        },
        { headers: authHeader() }
      );
      
      setSnackbar({
        open: true,
        message: 'Password changed successfully',
        severity: 'success'
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to change password',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading && !userDetails.username) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  return (
    <Box 
      sx={{ 
        padding: 3,
        backgroundColor: '#f8f9fa',
        minHeight: '100vh'
      }}
    >
      <Box sx={{ mb: 4 }}>
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
          My Profile
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          View and manage your account information
        </Typography>
      </Box>

      <Grid container spacing={3} justifyContent="center">
        {/* Centered column - Tabs for editing profile and changing password */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={2} 
            sx={{ 
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  py: 2,
                  fontWeight: 600
                },
                '& .Mui-selected': {
                  color: '#3498db !important'
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#3498db',
                  height: 3
                }
              }}
            >
              <Tab 
                icon={<PersonIcon />} 
                iconPosition="start" 
                label="Profile Details" 
                id="profile-tab"
              />
              <Tab 
                icon={<SecurityIcon />} 
                iconPosition="start" 
                label="Security" 
                id="security-tab"
              />
            </Tabs>
            
            {/* Profile Details Tab */}
            <Box 
              role="tabpanel"
              hidden={activeTab !== 0}
              id="profile-tabpanel"
              aria-labelledby="profile-tab"
              sx={{ p: 3 }}
            >
              {activeTab === 0 && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Profile Information
                    </Typography>
                    <Button
                      variant={isEditing ? "contained" : "outlined"}
                      color={isEditing ? "primary" : "inherit"}
                      startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                      onClick={isEditing ? handleUpdateProfile : handleEditToggle}
                      disabled={loading}
                      sx={{ 
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 500,
                        py: 1
                      }}
                    >
                      {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Edit Profile')}
                    </Button>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={userDetails.username}
                        onChange={handleInputChange}
                        disabled
                        sx={{ 
                          mb: 2,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={userDetails.email}
                        onChange={handleInputChange}
                        disabled
                        sx={{ 
                          mb: 2,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="fullName"
                        value={userDetails.fullName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        sx={{ 
                          mb: 2,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Position"
                        name="position"
                        value={userDetails.position}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        sx={{ 
                          mb: 2,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Department"
                        name="department"
                        value={userDetails.department}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        sx={{ 
                          mb: 2,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phoneNumber"
                        value={userDetails.phoneNumber}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        sx={{ 
                          mb: 2,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px'
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                  
                  {isEditing && (
                    <Box sx={{ mt: 2 }}>
                      <Alert severity="info" sx={{ borderRadius: '8px' }}>
                        Note: Username and email cannot be changed. Please contact an administrator if you need to update these fields.
                      </Alert>
                    </Box>
                  )}
                </>
              )}
            </Box>
            
            {/* Security Tab */}
            <Box 
              role="tabpanel"
              hidden={activeTab !== 1}
              id="security-tabpanel"
              aria-labelledby="security-tab"
              sx={{ p: 3 }}
            >
              {activeTab === 1 && (
                <>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                    Change Password
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#3498db' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            edge="end"
                          >
                            {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#3498db' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#3498db' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                  
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleChangePassword}
                      disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      sx={{ 
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 500,
                        py: 1.5,
                        px: 4,
                        backgroundImage: 'linear-gradient(120deg, #3498db, #2980b9)',
                      }}
                    >
                      {loading ? 'Updating...' : 'Change Password'}
                    </Button>
                  </Box>
                  
                  <Box sx={{ mt: 4 }}>
                    <Alert severity="info" sx={{ borderRadius: '8px' }}>
                      Password requirements:
                      <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                        <li>At least 8 characters long</li>
                        <li>Include at least one uppercase letter</li>
                        <li>Include at least one number</li>
                        <li>Include at least one special character</li>
                      </ul>
                    </Alert>
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Profile header with avatar */}
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4
        }}
      >
        <Avatar 
          sx={{ 
            width: 100,
            height: 100,
            bgcolor: 'rgba(52, 152, 219, 0.8)',
            border: '4px solid rgba(52, 152, 219, 0.3)',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            mb: 2,
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}
        >
          {userDetails.username?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 'bold',
            fontFamily: "'Montserrat', sans-serif"
          }}
        >
          {userDetails.fullName}
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            mt: 0.5,
            fontFamily: "'Roboto', sans-serif"
          }}
        >
          {userDetails.username} • {userDetails.position}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            mt: 2,
            gap: 2
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            backgroundColor: 'rgba(52, 152, 219, 0.05)',
            p: 1,
            px: 2,
            borderRadius: '8px'
          }}>
            <EmailIcon sx={{ mr: 1, color: '#3498db', fontSize: '0.9rem' }} />
            <Typography variant="body2">
              {userDetails.email}
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            backgroundColor: 'rgba(52, 152, 219, 0.05)',
            p: 1,
            px: 2,
            borderRadius: '8px'
          }}>
            <PhoneIcon sx={{ mr: 1, color: '#3498db', fontSize: '0.9rem' }} />
            <Typography variant="body2">
              {userDetails.phoneNumber}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile;

