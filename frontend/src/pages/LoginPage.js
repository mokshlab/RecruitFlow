// src/pages/LoginPage.js

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
  IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import { validateEmail, validatePassword, getErrorMessage } from '../utils/errorHandler';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [validationErrors, setValidationErrors] = useState({ email: '', password: '' });
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Real-time validation
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = '';
    
    if (name === 'email') {
      const validation = validateEmail(value);
      error = validation.valid ? '' : validation.message;
    } else if (name === 'password') {
      const validation = validatePassword(value);
      error = validation.valid ? '' : validation.message;
    }
    
    setValidationErrors(prev => ({ ...prev, [name]: error }));
  };

  const isFormValid = () => {
    const emailValid = validateEmail(formData.email).valid;
    const passwordValid = validatePassword(formData.password).valid;
    return emailValid && passwordValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields on submit
    const emailValidation = validateEmail(formData.email);
    const passwordValidation = validatePassword(formData.password);
    
    if (!emailValidation.valid || !passwordValidation.valid) {
      setValidationErrors({
        email: emailValidation.message,
        password: passwordValidation.message
      });
      setTouched({ email: true, password: true });
      return;
    }
    
    try {
      await loginUser(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      const errorInfo = getErrorMessage(err);
      setError(errorInfo.message);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Left Side - Form */}
      <Box
        sx={{
          width: { xs: '100%', lg: '50%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 4, md: 5, lg: 6 },
          bgcolor: 'white'
        }}
      >
        <Box sx={{ maxWidth: 480, width: '100%', px: { xs: 0, sm: 2 } }}>
          {/* Header with better hierarchy */}
          <Box sx={{ mb: { xs: 4, md: 5 }, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              fontWeight="700" 
              gutterBottom 
              sx={{ 
                fontSize: { xs: '2rem', md: '2.75rem' },
                background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
                letterSpacing: '-0.03em',
                lineHeight: 1.2
              }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem', fontWeight: 500, letterSpacing: '0.01em' }}>
              Sign in to continue to your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: '#1e293b', fontSize: '0.875rem' }}>
              Email Address
            </Typography>
            <TextField
              required
              fullWidth
              id="email"
              name="email"
              autoComplete="email"
              autoFocus
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && !!validationErrors.email}
              helperText={touched.email && validationErrors.email}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#fafafa',
                  transition: 'all 0.2s ease',
                  '& fieldset': {
                    borderColor: '#e5e7eb',
                    borderWidth: '1.5px'
                  },
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                    '& fieldset': {
                      borderColor: '#d1d5db'
                    }
                  },
                  '&.Mui-focused': {
                    bgcolor: 'white',
                    boxShadow: '0 0 0 4px rgba(102,126,234,0.1)',
                    '& fieldset': {
                      borderColor: '#0D9488',
                      borderWidth: '2px'
                    }
                  }
                },
                '& input': {
                  fontSize: '0.9375rem',
                  py: 1.25,
                  color: '#1e293b'
                }
              }}
            />
            
            <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: '#1e293b', fontSize: '0.875rem' }}>
              Password
            </Typography>
            <TextField
              required
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password && !!validationErrors.password}
              helperText={touched.password && validationErrors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: 'text.secondary' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#fafafa',
                  transition: 'all 0.2s ease',
                  '& fieldset': {
                    borderColor: '#e5e7eb',
                    borderWidth: '1.5px'
                  },
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                    '& fieldset': {
                      borderColor: '#d1d5db'
                    }
                  },
                  '&.Mui-focused': {
                    bgcolor: 'white',
                    boxShadow: '0 0 0 4px rgba(102,126,234,0.1)',
                    '& fieldset': {
                      borderColor: '#0D9488',
                      borderWidth: '2px'
                    }
                  }
                },
                '& input': {
                  fontSize: '0.9375rem',
                  py: 1.25,
                  color: '#1e293b'
                }
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={!isFormValid()}
              sx={{
                py: 1.75,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                mb: 3,
                background: isFormValid() 
                  ? 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)'
                  : '#cbd5e1',
                color: isFormValid() ? 'white' : '#64748b',
                boxShadow: isFormValid() 
                  ? '0 4px 14px rgba(102,126,234,0.4)'
                  : 'none',
                cursor: isFormValid() ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: isFormValid()
                    ? 'linear-gradient(135deg, #0D9488 0%, #6a3f8f 100%)'
                    : '#cbd5e1',
                  boxShadow: isFormValid() 
                    ? '0 6px 20px rgba(102,126,234,0.5)'
                    : 'none',
                  transform: isFormValid() ? 'translateY(-2px)' : 'none'
                },
                '&:active': {
                  transform: isFormValid() ? 'translateY(0px)' : 'none',
                  boxShadow: isFormValid() ? '0 2px 8px rgba(102,126,234,0.3)' : 'none'
                },
                '&.Mui-disabled': {
                  background: '#cbd5e1',
                  color: '#64748b',
                  boxShadow: 'none',
                  opacity: 0.7
                }
              }}
            >
              Sign In
            </Button>
            
            <Box sx={{ textAlign: 'center', pt: 2, borderTop: '1px solid #e2e8f0' }}>
              <Typography variant="body2" color="#64748b" sx={{ fontSize: '0.95rem' }}>
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{ 
                    color: '#0D9488',
                    fontWeight: 600, 
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#0D9488',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Create Account
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Right Side - Hero Section */}
      <Box
        sx={{
          width: '50%',
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
          color: 'white',
          p: { lg: 6, xl: 8 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Dot pattern */}
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
          opacity: 0.6
        }} />
        
        {/* Soft glow effects */}
        <Box sx={{ 
          position: 'absolute', 
          top: '-10%', 
          right: '-5%', 
          width: '300px', 
          height: '300px', 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.1)',
          filter: 'blur(60px)'
        }} />
        <Box sx={{ 
          position: 'absolute', 
          bottom: '-10%', 
          left: '-5%', 
          width: '350px', 
          height: '350px', 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.08)',
          filter: 'blur(70px)'
        }} />
        
        <Box sx={{ textAlign: 'center', maxWidth: 520, zIndex: 1, width: '100%' }}>
          {/* Smaller icon illustration */}
          <Box sx={{ 
            margin: '0 auto 2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Box sx={{
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'white',
              borderRadius: '16px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
            }}>
              <BusinessCenterIcon sx={{ fontSize: 42, color: '#0D9488' }} />
            </Box>
          </Box>
          
          <Typography variant="h3" fontWeight="700" gutterBottom sx={{ fontSize: { lg: '2.5rem', xl: '2.75rem' }, mb: 4.5, lineHeight: 1.2 }}>
            Find Your Next Role
          </Typography>
          
          {/* Feature highlights */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 3, 
            mt: 5,
            textAlign: 'left',
            px: { lg: 2, xl: 3 }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                bgcolor: 'white', 
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(255,255,255,0.3)'
              }} />
              <Typography variant="body2" sx={{ fontSize: '1rem', lineHeight: 1.7, opacity: 0.98, fontWeight: 400 }}>
                Track all your applications in one place
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                bgcolor: 'white', 
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(255,255,255,0.3)'
              }} />
              <Typography variant="body2" sx={{ fontSize: '1rem', lineHeight: 1.7, opacity: 0.98, fontWeight: 400 }}>
                Get real-time updates on application status
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                bgcolor: 'white', 
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(255,255,255,0.3)'
              }} />
              <Typography variant="body2" sx={{ fontSize: '1rem', lineHeight: 1.7, opacity: 0.98, fontWeight: 400 }}>
                Filter jobs by experience and salary
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                bgcolor: 'white', 
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(255,255,255,0.3)'
              }} />
              <Typography variant="body2" sx={{ fontSize: '1rem', lineHeight: 1.7, opacity: 0.98, fontWeight: 400 }}>
                Bookmark opportunities for later
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* CSS Animation */}
        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(45deg); }
              50% { transform: translateY(-20px) rotate(45deg); }
            }
          `}
        </style>
      </Box>
    </Box>
  );
};

export default LoginPage;