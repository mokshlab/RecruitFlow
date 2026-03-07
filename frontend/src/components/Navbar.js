// src/components/Navbar.js

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import NewspaperIcon from '@mui/icons-material/Newspaper';

const Navbar = () => {
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: '70px' }}>
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              flexGrow: 1,
              gap: 1.5
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                bgcolor: 'rgba(255,255,255,0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '14px',
                letterSpacing: '-0.5px',
                color: '#0D9488',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                flexShrink: 0,
                fontFamily: 'Roboto, Arial, sans-serif'
              }}
            >
              RF
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.5px',
                color: 'inherit'
              }}
            >
              RecruitFlow
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
            {user ? (
              // User Menu
              <>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/browse"
                  startIcon={<BusinessCenterIcon />}
                  sx={{ 
                    textTransform: 'none',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 500,
                    px: { xs: 1, sm: 1.5, md: 2 },
                    minWidth: 'auto',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Browse Jobs</Box>
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/applications"
                  startIcon={<AssignmentIcon />}
                  sx={{ 
                    textTransform: 'none',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 500,
                    px: { xs: 1, sm: 1.5, md: 2 },
                    minWidth: 'auto',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>My Applications</Box>
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/bookmarks"
                  startIcon={<BookmarkIcon />}
                  sx={{ 
                    textTransform: 'none',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 500,
                    px: { xs: 1, sm: 1.5, md: 2 },
                    minWidth: 'auto',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Bookmarks</Box>
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/contact"
                  startIcon={<ContactMailIcon />}
                  sx={{ 
                    textTransform: 'none',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 500,
                    px: { xs: 1, sm: 1.5, md: 2 },
                    minWidth: 'auto',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Contact</Box>
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/news"
                  startIcon={<NewspaperIcon />}
                  sx={{ 
                    textTransform: 'none',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 500,
                    px: { xs: 1, sm: 1.5, md: 2 },
                    minWidth: 'auto',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>News</Box>
                </Button>
                
                <IconButton
                  onClick={handleMenu}
                  sx={{ ml: 1 }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      width: 40,
                      height: 40,
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}
                  >
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      minWidth: 180,
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <MenuItem 
                    onClick={() => { handleClose(); navigate('/dashboard'); }}
                    sx={{ py: 1.5, px: 2 }}
                  >
                    <DashboardIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    My Profile
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { handleClose(); handleLogout(); }}
                    sx={{ py: 1.5, px: 2, color: 'error.main' }}
                  >
                    <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              // Guest Menu
              <>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/browse"
                  startIcon={<BusinessCenterIcon />}
                  sx={{ 
                    textTransform: 'none',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 500,
                    px: { xs: 1, sm: 1.5, md: 2 },
                    minWidth: 'auto',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Browse Jobs</Box>
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/contact"
                  startIcon={<ContactMailIcon />}
                  sx={{ 
                    textTransform: 'none',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 500,
                    px: { xs: 1, sm: 1.5, md: 2 },
                    minWidth: 'auto',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Contact</Box>
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/news"
                  startIcon={<NewspaperIcon />}
                  sx={{ 
                    textTransform: 'none',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 500,
                    px: { xs: 1, sm: 1.5, md: 2 },
                    minWidth: 'auto',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>News</Box>
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/login"
                  startIcon={<PersonIcon />}
                  sx={{ 
                    textTransform: 'none',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 500,
                    px: { xs: 1, sm: 1.5, md: 2 },
                    minWidth: 'auto',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Login</Box>
                </Button>
                <Button 
                  component={Link} 
                  to="/register"
                  variant="contained"
                  sx={{ 
                    textTransform: 'none',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 600,
                    px: { xs: 2, md: 3 },
                    minWidth: 'auto',
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;