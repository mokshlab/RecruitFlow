// src/pages/AdminLoginPage.js

import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Paper,
  Fade,
  CircularProgress,
  Divider,
  alpha
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError('');
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      await loginAdmin(formData.username, formData.password);
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}
    >
      {/* Left Side - Branding */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          px: 8,
          zIndex: 1
        }}
      >
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center' }}>
            <AdminPanelSettingsIcon sx={{ fontSize: 120, mb: 3, opacity: 0.95 }} />
            <Typography variant="h2" fontWeight={700} gutterBottom sx={{ letterSpacing: -1 }}>
              Administration
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}>
              Authorized Access Only
            </Typography>
            
            <Box sx={{ mt: 6, display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { icon: SecurityIcon, label: 'Secure Access' },
                { icon: VerifiedUserIcon, label: 'Verified' },
                { icon: LockIcon, label: 'Encrypted' }
              ].map((item, index) => (
                <Fade in timeout={1000 + index * 200} key={item.label}>
                  <Box sx={{ textAlign: 'center' }}>
                    <item.icon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      {item.label}
                    </Typography>
                  </Box>
                </Fade>
              ))}
            </Box>
          </Box>
        </Fade>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          zIndex: 1
        }}
      >
        <Fade in timeout={600}>
          <Paper
            elevation={24}
            sx={{
              width: '100%',
              maxWidth: 480,
              p: { xs: 3, sm: 5 },
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            {/* Mobile Logo */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 3 }}>
              <AdminPanelSettingsIcon sx={{ fontSize: 60, color: 'primary.main' }} />
            </Box>

            <Typography 
              variant="h4" 
              align="center" 
              fontWeight={700}
              gutterBottom
              sx={{ 
                color: 'text.primary',
                mb: 1
              }}
            >
              Admin Sign In
            </Typography>
            
            <Typography 
              variant="body2" 
              align="center" 
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              Please enter your credentials to continue
            </Typography>

            {error && (
              <Fade in>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-icon': { fontSize: 22 }
                  }}
                  onClose={() => setError('')}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username}
                onChange={handleChange}
                onBlur={() => handleBlur('username')}
                error={touched.username && !formData.username}
                helperText={touched.username && !formData.username ? 'Username is required' : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: `0 0 0 2px ${alpha('#F59E0B', 0.1)}`
                    },
                    '&.Mui-focused': {
                      boxShadow: `0 0 0 3px ${alpha('#F59E0B', 0.15)}`
                    }
                  }
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                error={touched.password && !formData.password}
                helperText={touched.password && !formData.password ? 'Password is required' : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'text.secondary' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: `0 0 0 2px ${alpha('#F59E0B', 0.1)}`
                    },
                    '&.Mui-focused': {
                      boxShadow: `0 0 0 3px ${alpha('#F59E0B', 0.15)}`
                    }
                  }
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 4,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(245, 158, 11, 0.6)',
                    transform: 'translateY(-2px)'
                  },
                  '&:active': {
                    transform: 'translateY(0)'
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
                    opacity: 0.7
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Sign In'
                )}
              </Button>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <Box sx={{ textAlign: 'center' }}>
                <Link 
                  component={RouterLink} 
                  to="/login" 
                  variant="body2"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      textDecoration: 'underline',
                      color: 'primary.dark'
                    }
                  }}
                >
                  User Login →
                </Link>
              </Box>

              <Box 
                sx={{ 
                  mt: 4, 
                  pt: 3, 
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'center'
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  <SecurityIcon sx={{ fontSize: 14 }} />
                  Protected by SSL encryption
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Box>
    </Box>
  );
};

export default AdminLoginPage;