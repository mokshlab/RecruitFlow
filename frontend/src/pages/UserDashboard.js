// src/pages/UserDashboard.js
import { Link } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../api';
import PdfViewer from '../components/PdfViewer';
import {
  Container, Box, Typography, TextField, Button, Grid,
  Paper, Avatar, CircularProgress, Chip, Divider, Alert
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DescriptionIcon from '@mui/icons-material/Description';

const UserDashboard = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    gender: '',
    experience: 0, 
    skills: '',
    description: '' 
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [resume, setResume] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        experience: user.experience || 0,
        skills: user.skills ? user.skills.join(', ') : '',
        description: user.description || ''
      });
    }
  }, [user]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfilePhotoChange = (e) => {
    setProfilePhoto(e.target.files[0]);
  };

  const handleResumeChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setIsUpdating(true);
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('phone', formData.phone);
    data.append('gender', formData.gender);
    data.append('experience', formData.experience);
    data.append('skills', formData.skills);
    data.append('description', formData.description);
    if (profilePhoto) data.append('profilePhoto', profilePhoto);
    if (resume) data.append('resume', resume);

    try {
      const response = await updateUserProfile(data);
      // Extract user from response wrapper
      setUser(response.data?.user || response.data);
      setSuccessMessage('Profile updated successfully!');
      setProfilePhoto(null);
      setResume(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        setErrorMessage('Upload timed out. Your backend may be starting up (cold start on Render free tier takes 30-60 seconds). Please try again in a moment.');
      } else {
        setErrorMessage(error.response?.data?.msg || 'Failed to update profile. Please try again.');
      }
    } finally {
      setIsUpdating(false);
    }
  };
  if (!user) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Top Bar with gradient accent */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
          height: '4px'
        }}
      />
      
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            fontWeight="700" 
            color="#1a1a1a"
            sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, mb: 1 }}
          >
            Profile Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your personal and professional information
          </Typography>
        </Box>

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ mb: 3, borderRadius: 2 }} 
            onClose={() => setSuccessMessage('')}
          >
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }} 
            onClose={() => setErrorMessage('')}
          >
            {errorMessage}
          </Alert>
        )}
        {/* Main Form Card */}
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 3,
            border: '1px solid #e0e0e0',
            bgcolor: 'white',
            overflow: 'hidden'
          }}
        >
          <Box component="form" onSubmit={handleProfileUpdate}>
            {/* Profile Photo Section */}
            <Box sx={{ 
              p: { xs: 3, md: 4 }, 
              bgcolor: '#fafbfc',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2, color: '#1a1a1a' }}>
                Profile Photo
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                <Avatar
                  src={
                    user.profilePhoto
                      ? user.profilePhoto.startsWith('http')
                        ? user.profilePhoto
                        : `${process.env.REACT_APP_API_BASE_URL?.replace('/api', '')}/${user.profilePhoto}`
                      : ''
                  }
                  sx={{ 
                    width: { xs: 80, md: 100 }, 
                    height: { xs: 80, md: 100 },
                    border: '3px solid #e0e0e0'
                  }}
                >
                  <AccountCircleIcon sx={{ width: { xs: 50, md: 64 }, height: { xs: 50, md: 64 }, color: '#999' }} />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Button 
                    variant="outlined" 
                    component="label" 
                    size="small"
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 1.5,
                      px: 2.5,
                      py: 0.75,
                      borderColor: '#d0d7de',
                      color: '#24292f',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      '&:hover': { 
                        borderColor: '#0D9488',
                        bgcolor: '#f6f8ff'
                      }
                    }}
                  >
                    Choose Photo
                    <input type="file" hidden onChange={handleProfilePhotoChange} accept="image/*,.svg" />
                  </Button>
                  {profilePhoto && (
                    <Chip 
                      label={profilePhoto.name} 
                      size="small" 
                      sx={{ ml: 1.5, maxWidth: 200 }}
                      onDelete={() => setProfilePhoto(null)}
                    />
                  )}
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                    JPG, PNG or SVG. Max size 2MB.
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider />

            {/* Personal Information Section */}
            <Box sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 3, color: '#1a1a1a', fontSize: '1.125rem' }}>
                Personal Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: '#24292f' }}>
                    Full Name *
                  </Typography>
                  <TextField 
                    name="name" 
                    value={formData.name} 
                    onChange={handleFormChange} 
                    fullWidth 
                    required
                    placeholder="Enter your full name"
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        bgcolor: 'white',
                        '& fieldset': {
                          borderColor: '#d0d7de',
                        },
                        '&:hover fieldset': {
                          borderColor: '#0D9488',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#0D9488',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: '#24292f' }}>
                    Email Address
                  </Typography>
                  <TextField 
                    name="email" 
                    value={formData.email} 
                    fullWidth 
                    disabled
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        bgcolor: '#f6f8fa',
                        '& fieldset': {
                          borderColor: '#d0d7de',
                        }
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Email cannot be changed
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: '#24292f' }}>
                    Mobile Number *
                  </Typography>
                  <TextField 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleFormChange} 
                    fullWidth
                    placeholder="+91 XXXXX XXXXX"
                    required
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        bgcolor: 'white',
                        '& fieldset': {
                          borderColor: '#d0d7de',
                        },
                        '&:hover fieldset': {
                          borderColor: '#0D9488',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#0D9488',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: '#24292f' }}>
                    Gender
                  </Typography>
                  <TextField 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleFormChange} 
                    fullWidth
                    select
                    variant="outlined"
                    SelectProps={{
                      native: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        bgcolor: 'white',
                        '& fieldset': {
                          borderColor: '#d0d7de',
                        },
                        '&:hover fieldset': {
                          borderColor: '#0D9488',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#0D9488',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Professional Information Section */}
            <Box sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 3, color: '#1a1a1a', fontSize: '1.125rem' }}>
                Professional Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: '#24292f' }}>
                    Years of Experience *
                  </Typography>
                  <TextField 
                    name="experience" 
                    type="number" 
                    value={formData.experience} 
                    onChange={handleFormChange} 
                    fullWidth
                    required
                    variant="outlined"
                    inputProps={{ min: 0, max: 50 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        bgcolor: 'white',
                        '& fieldset': {
                          borderColor: '#d0d7de',
                        },
                        '&:hover fieldset': {
                          borderColor: '#0D9488',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#0D9488',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Enter 0 if you're a fresher
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: '#24292f' }}>
                    Skills
                  </Typography>
                  <TextField 
                    name="skills" 
                    value={formData.skills} 
                    onChange={handleFormChange} 
                    fullWidth
                    variant="outlined"
                    placeholder="JavaScript, Python, React"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        bgcolor: 'white',
                        '& fieldset': {
                          borderColor: '#d0d7de',
                        },
                        '&:hover fieldset': {
                          borderColor: '#0D9488',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#0D9488',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Separate skills with commas
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: '#24292f' }}>
                    Professional Summary
                  </Typography>
                  <TextField 
                    name="description" 
                    value={formData.description} 
                    onChange={handleFormChange} 
                    fullWidth 
                    multiline 
                    rows={5}
                    variant="outlined"
                    placeholder="Describe your professional background, skills, and career goals..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        bgcolor: 'white',
                        '& fieldset': {
                          borderColor: '#d0d7de',
                        },
                        '&:hover fieldset': {
                          borderColor: '#0D9488',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#0D9488',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {formData.description.split(/\s+/).filter(w => w.length > 0).length}/300 words
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Resume Upload Section */}
            <Box sx={{ p: { xs: 3, md: 4 }, bgcolor: '#fafbfc' }}>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 3, color: '#1a1a1a', fontSize: '1.125rem' }}>
                Resume/CV
              </Typography>
              {user.resume && (
                <Box sx={{ 
                  mb: 2, 
                  p: 2,
                  border: '1px solid #d0d7de',
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: 'white'
                }}>
                  <DescriptionIcon sx={{ fontSize: 24, color: '#0D9488' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight="500" color="#24292f">
                      Current Resume
                    </Typography>
                    <Link 
                      component="button"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setPdfViewerOpen(true);
                      }}
                      sx={{ fontSize: '0.8125rem', color: '#0D9488', cursor: 'pointer', textAlign: 'left' }}
                    >
                      View Resume →
                    </Link>
                  </Box>
                </Box>
              )}
              <Button 
                variant="outlined" 
                component="label" 
                size="medium"
                startIcon={<DescriptionIcon />}
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 1.5,
                  px: 2.5,
                  py: 1,
                  borderColor: '#d0d7de',
                  color: '#24292f',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  '&:hover': { 
                    borderColor: '#0D9488',
                    bgcolor: '#f6f8ff'
                  }
                }}
              >
                {user.resume ? 'Update Resume' : 'Upload Resume'}
                <input type="file" hidden onChange={handleResumeChange} accept=".pdf,.doc,.docx" />
              </Button>
              {resume && (
                <Chip 
                  label={resume.name} 
                  size="small" 
                  sx={{ ml: 1.5, maxWidth: 250 }}
                  onDelete={() => setResume(null)}
                />
              )}
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1.5 }}>
                PDF, DOC or DOCX. Max size 5MB.
              </Typography>
            </Box>

            <Divider />

            {/* Action Buttons */}
            <Box sx={{ 
              p: { xs: 3, md: 4 },
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-end',
              flexDirection: { xs: 'column', sm: 'row' },
              bgcolor: '#f8fafc',
              borderTop: '1px solid #e2e8f0'
            }}>
              <Button 
                variant="outlined" 
                onClick={() => window.location.reload()}
                sx={{
                  textTransform: 'none',
                  px: 3.5,
                  py: 1.25,
                  borderRadius: 2,
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#0D9488',
                    bgcolor: 'white',
                    color: '#0D9488'
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                disabled={isUpdating}
                startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{
                  textTransform: 'none',
                  px: 4,
                  py: 1.25,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                  boxShadow: '0 4px 14px rgba(102,126,234,0.4)',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0D9488 0%, #6a3f8f 100%)',
                    boxShadow: '0 6px 20px rgba(102,126,234,0.5)',
                    transform: 'translateY(-2px)'
                  },
                  '&:active': {
                    transform: 'translateY(0px)'
                  },
                  '&:disabled': {
                    background: '#cbd5e1',
                    color: '#64748b'
                  }
                }}
              >
                {isUpdating ? 'Uploading...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* PDF Viewer Modal */}
        {user?.resume && (
          <PdfViewer
            open={pdfViewerOpen}
            onClose={() => setPdfViewerOpen(false)}
            pdfUrl={user.resume}
            title={`${user.name}'s Resume`}
          />
        )}
      </Container>
    </Box>
  );
};

export default UserDashboard;
