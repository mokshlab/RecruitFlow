// src/pages/HomePage.js
// Last Updated: 2026-01-03 v2.0 - 2-Row Filter Layout

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Container, Typography, Box, Grid, Alert, Chip, Paper, Collapse, 
  Skeleton, Fade, Badge, Stack, alpha, Card, CardContent, TextField, 
  MenuItem, InputAdornment, Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchJobs } from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import TuneIcon from '@mui/icons-material/Tune';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import JobCard from '../components/JobCard';

// Log deployment verification
console.log('HomePage: Grid config S4-E2-M2-M2-L2');

// Loading Skeleton Component
const JobCardSkeleton = () => (
  <Card 
    sx={{ 
      height: '100%', 
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider'
    }}
  >
    <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" height={32} />
    </Box>
    <CardContent>
      <Stack spacing={1.5}>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="50%" />
        <Skeleton variant="text" width="70%" />
      </Stack>
    </CardContent>
    <Box sx={{ p: 2.5, pt: 0 }}>
      <Skeleton variant="rectangular" height={42} sx={{ borderRadius: 2 }} />
    </Box>
  </Card>
);

const HomePage = () => {
  const { user } = useAuth();
  const { socket, addNotification } = useSocket();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [filters, setFilters] = useState({ 
    search: '', 
    experience: '', 
    minSalary: '', 
    maxSalary: '',
    location: '' 
  });
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadJobs();
  }, []);

  // Listen for new jobs and deletions via WebSocket
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewJob = (data) => {
      addNotification(data);
      
      // Add new job to list
      setJobs(prev => [data, ...prev]);
    };

    const handleJobDeleted = (data) => {
      addNotification(data);
      
      // Remove job from list
      setJobs(prev => prev.filter(job => job._id !== data.jobId));
    };

    socket.on('new-job-posted', handleNewJob);
    socket.on('job-deleted', handleJobDeleted);

    return () => {
      socket.off('new-job-posted', handleNewJob);
      socket.off('job-deleted', handleJobDeleted);
    };
  }, [socket, user, addNotification]);

  // Debounced search for performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await fetchJobs();
      // Extract jobs array from response wrapper
      const jobsArray = data?.jobs || [];
      setJobs(Array.isArray(jobsArray) ? jobsArray : []);
    } catch (err) {
      setError('Failed to load jobs. Please try again later.');
      setJobs([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };



  // Enhanced filtering and sorting algorithm with useMemo for performance
  const filteredJobs = useMemo(() => {
    // Defensive check - ensure jobs is always an array
    if (!Array.isArray(jobs)) {
      return [];
    }
    
    let filtered = [...jobs];

    // Search filter with multi-field fuzzy matching
    if (filters.search && filters.search.trim()) {
      const searchTerms = filters.search.toLowerCase().trim().split(/\s+/);
      
      filtered = filtered.filter(job => {
        const searchableText = [
          job.title,
          job.companyName,
          job.location,
          job.description,
          ...(job.requirements || [])
        ].join(' ').toLowerCase();

        // Check if all search terms are present (AND logic)
        return searchTerms.every(term => searchableText.includes(term));
      });
    }

    // Experience filter - exact match or range
    if (filters.experience !== '') {
      const expValue = parseInt(filters.experience);
      filtered = filtered.filter(job => {
        if (expValue === 0) {
          return job.experienceRequired === 0; // Fresher only
        }
        return job.experienceRequired >= expValue && job.experienceRequired < expValue + 2;
      });
    }

    // Salary range filter
    if (filters.minSalary) {
      filtered = filtered.filter(job => job.salary >= parseInt(filters.minSalary));
    }
    if (filters.maxSalary) {
      filtered = filtered.filter(job => job.salary <= parseInt(filters.maxSalary));
    }

    // Location filter with partial matching
    if (filters.location && filters.location.trim()) {
      const locationTerms = filters.location.toLowerCase().trim().split(/\s+/);
      filtered = filtered.filter(job => 
        locationTerms.some(term => job.location.toLowerCase().includes(term))
      );
    }

    // Advanced sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'salary-high':
          return b.salary - a.salary;
        case 'salary-low':
          return a.salary - b.salary;
        case 'experience':
          return a.experienceRequired - b.experienceRequired;
        case 'company':
          return a.companyName.localeCompare(b.companyName);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }, [jobs, filters, sortBy]);

  const handleFilterChange = useCallback((e) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ search: '', experience: '', minSalary: '', maxSalary: '', location: '' });
    setSearchInput('');
  }, []);

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const handleViewDetails = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FFFBEB' }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2, 
            borderRadius: 2,
            '& .MuiAlert-icon': { fontSize: 28 }
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Hero Section - F-Pattern Layout with Visual Hierarchy */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 50%, #0D9488 100%)',
          color: 'white',
          pt: { xs: 8, sm: 10, md: 14 },
          pb: { xs: 10, sm: 12, md: 16 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 1
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '80px',
            background: 'linear-gradient(to top, #FFFBEB, transparent)'
          }
        }}
      >
        <Container sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            {/* Main Value Proposition - Left side (F-pattern) */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Fade in timeout={800}>
                <Box>
                  {/* Stat Badges - Enhanced with UI Psychology */}
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={2} 
                    sx={{ mb: 4 }}
                    flexWrap="wrap"
                  >
                    {/* Trust Badge - High Contrast & Depth */}
                    <Chip
                      icon={<VerifiedIcon sx={{ fontSize: 18 }} />}
                      label="Verified Opportunities"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.95)',
                        color: '#0D9488',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        height: 40,
                        backdropFilter: 'blur(20px)',
                        border: '2px solid rgba(255,255,255,0.8)',
                        px: 1.5,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(13,148,136,0.1)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        animation: 'slideInLeft 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        '@keyframes slideInLeft': {
                          '0%': { opacity: 0, transform: 'translateX(-20px)' },
                          '100%': { opacity: 1, transform: 'translateX(0)' }
                        },
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.2), 0 0 20px rgba(13,148,136,0.3)'
                        },
                        '& .MuiChip-icon': { 
                          color: '#4caf50', 
                          ml: 0.5,
                          filter: 'drop-shadow(0 2px 4px rgba(76,175,80,0.3))'
                        },
                        '& .MuiChip-label': { px: 1.5 }
                      }}
                    />
                    
                    {/* Urgency Badge - Attention Grabbing */}
                    <Chip
                      icon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
                      label={`${Math.min(jobs.length, 6)} new jobs available`}
                      sx={{
                        bgcolor: 'rgba(255,215,0,0.95)',
                        color: '#1a1a2e',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        height: 40,
                        backdropFilter: 'blur(20px)',
                        border: '2px solid rgba(255,215,0,0.8)',
                        px: 1.5,
                        boxShadow: '0 8px 32px rgba(255,215,0,0.3), 0 0 0 1px rgba(255,215,0,0.2)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        animation: 'slideInRight 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s backwards',
                        '@keyframes slideInRight': {
                          '0%': { opacity: 0, transform: 'translateX(20px)' },
                          '100%': { opacity: 1, transform: 'translateX(0)' }
                        },
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 40px rgba(255,215,0,0.4), 0 0 20px rgba(255,215,0,0.5)'
                        },
                        '& .MuiChip-icon': { 
                          color: '#ff6b6b', 
                          ml: 0.5,
                          filter: 'drop-shadow(0 2px 4px rgba(255,107,107,0.3))'
                        },
                        '& .MuiChip-label': { px: 1.5 }
                      }}
                    />
                  </Stack>
                  
                  {/* Primary Headline - Cognitive Load Reduction */}
                  <Typography 
                    variant="h1" 
                    sx={{ 
                      fontWeight: 900, 
                      mb: 3,
                      fontSize: { xs: '2.25rem', sm: '3rem', md: '3.75rem', lg: '4rem' },
                      lineHeight: 1.1,
                      textShadow: '0 4px 20px rgba(0,0,0,0.2)',
                      letterSpacing: '-1px'
                    }}
                  >
                    Stop Searching.
                    <br />
                    Start Landing.
                  </Typography>
                  
                  {/* Supporting Text - Clarity */}
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      opacity: 0.95,
                      mb: 4,
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                      fontWeight: 400,
                      lineHeight: 1.6,
                      maxWidth: '600px'
                    }}
                  >
                    Discover {jobs.length} verified opportunities from India's top companies.
                    Apply in minutes, track real-time.
                  </Typography>
                  
                  {/* Social Proof Metrics - Trust Building */}
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={{ xs: 2, sm: 4 }}
                    sx={{ mt: 4 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          bgcolor: 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(10px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <WorkOutlineIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                          {jobs.length}+
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
                          Active Jobs
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          bgcolor: 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(10px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <SpeedIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                          2 Min
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
                          Avg. Apply Time
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          bgcolor: 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(10px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <CheckCircleIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                          100%
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
                          Verified Jobs
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              </Fade>
            </Grid>
            
            {/* Trust Indicators - Right side */}
            <Grid item xs={12} md={5}>
              <Fade in timeout={1000}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, sm: 4 },
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                    Why Choose RecruitFlow?
                  </Typography>
                  
                  <Stack spacing={2.5}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: 'primary.main',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <SecurityIcon />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                          100% Verified Jobs
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          Every listing verified by our team
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: 'success.main',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <SpeedIcon />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                          Quick Apply
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          Apply to multiple jobs in seconds
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: 'warning.main',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <VerifiedIcon />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                          Trusted Platform
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          10,000+ successful placements
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              </Fade>
            </Grid>
          </Grid>

          {/* Hero Search Bar */}
          <Box sx={{ mt: { xs: 5, md: 6 }, position: 'relative', zIndex: 2 }}>
            <Paper
              elevation={0}
              sx={{
                p: 1,
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(255,255,255,0.8)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
                display: 'flex',
                gap: 1,
                alignItems: 'center'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, px: 1.5, gap: 1 }}>
                <SearchIcon sx={{ color: '#0D9488', fontSize: 24, flexShrink: 0 }} />
                <Box
                  component="input"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by title, company, or skill..."
                  sx={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: { xs: '0.9375rem', md: '1rem' },
                    fontFamily: 'inherit',
                    color: '#1C1917',
                    bgcolor: 'transparent',
                    py: 1.25,
                    '&::placeholder': { color: '#9CA3AF' }
                  }}
                />
              </Box>
              <Button
                variant="contained"
                disableElevation
                onClick={() => setShowFilters(true)}
                sx={{
                  borderRadius: 2,
                  px: { xs: 2.5, sm: 4 },
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.9375rem',
                  background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                  flexShrink: 0,
                  boxShadow: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0F766E 0%, #0c6b61 100%)',
                    boxShadow: '0 4px 16px rgba(13,148,136,0.35)'
                  }
                }}
              >
                Find Jobs
              </Button>
            </Paper>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', mt: 1.5, display: 'block', textAlign: 'center', letterSpacing: 0.3 }}>
              Popular: Frontend Developer &bull; Product Manager &bull; Data Analyst &bull; DevOps
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Trust Stats Strip */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: '#E5E7EB', py: { xs: 2.5, sm: 3 } }}>
        <Container>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="center"
            alignItems="center"
            spacing={{ xs: 2, sm: 0 }}
            divider={
              <Box sx={{ display: { xs: 'none', sm: 'block' }, width: '1px', height: 24, bgcolor: '#E5E7EB', mx: 4 }} />
            }
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <CheckCircleIcon sx={{ color: '#0D9488', fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1C1917' }}>100% Verified Listings</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#0D9488', animation: 'pulse 2s infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.4 } } }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1C1917' }}>Real-time Application Tracking</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <SpeedIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1C1917' }}>Apply in Under 2 Minutes</Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Jobs Section */
      <Container maxWidth={false} sx={{ py: { xs: 8, sm: 10, md: 12 }, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Section Header with Progressive Disclosure */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 4,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
              Browse Opportunities
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {filteredJobs.length} {filteredJobs.length === 1 ? 'position' : 'positions'} available
              {hasActiveFilters ? ' matching your search' : ' right now'}
            </Typography>
          </Box>
          
          {/* Filter Toggle Button */}
          <Button 
            variant={showFilters ? "contained" : "outlined"}
            onClick={() => setShowFilters(!showFilters)}
            startIcon={
              <Badge 
                badgeContent={hasActiveFilters ? Object.values(filters).filter(v => v !== '').length : 0} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.65rem',
                    height: 18,
                    minWidth: 18,
                    fontWeight: 700,
                    right: -3,
                    top: -3
                  }
                }}
              >
                <TuneIcon sx={{ fontSize: 22 }} />
              </Badge>
            }
            endIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ 
              px: { xs: 2, sm: 3 },
              py: 1.2,
              borderRadius: 2,
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              fontWeight: 600,
              textTransform: 'none',
              border: '2px solid',
              borderColor: showFilters ? 'primary.main' : alpha('#0D9488', 0.3),
              bgcolor: showFilters ? 'primary.main' : 'white',
              color: showFilters ? 'white' : 'primary.main',
              boxShadow: showFilters 
                ? '0 4px 12px rgba(13, 148, 136, 0.3)' 
                : '0 2px 8px rgba(0,0,0,0.08)',
              '&:hover': { 
                bgcolor: showFilters ? 'primary.dark' : alpha('#0D9488', 0.04),
                borderColor: 'primary.main',
                boxShadow: '0 4px 16px rgba(13, 148, 136, 0.35)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              minWidth: { xs: 'auto', sm: 140 },
              whiteSpace: 'nowrap'
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              Filters
            </Box>
          </Button>
        </Box>

        {/* Streamlined Search & Filter Bar */}
        <Collapse in={showFilters}>
          <Paper 
            elevation={0} 
            sx={{ 
              mb: 5, 
              p: 2, 
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: alpha('#e0e0e0', 1),
              bgcolor: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Row 1: Search */}
              <TextField
                fullWidth
                name="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search jobs by title, company, or keywords"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  )
                }}
              />

              {/* Row 2: Filters */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    select
                    label="Experience"
                    name="experience"
                    value={filters.experience}
                    onChange={handleFilterChange}
                    sx={{
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        pr: 4
                      },
                      bgcolor: filters.experience !== '' ? alpha('#0D9488', 0.04) : 'transparent'
                    }}
                    InputLabelProps={{
                      shrink: true
                    }}
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (value) => {
                        if (value === '') return 'All Levels';
                        if (value === 0) return 'Fresher';
                        if (value === 1) return '1-2 years';
                        if (value === 3) return '3-4 years';
                        if (value === 5) return '5-6 years';
                        if (value === 7) return '7+ years';
                        return 'All Levels';
                      }
                    }}
                  >
                    <MenuItem value="">All Levels</MenuItem>
                    <MenuItem value={0}>Fresher</MenuItem>
                    <MenuItem value={1}>1-2 years</MenuItem>
                    <MenuItem value={3}>3-4 years</MenuItem>
                    <MenuItem value={5}>5-6 years</MenuItem>
                    <MenuItem value={7}>7+ years</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    placeholder="e.g., Mumbai, Remote"
                    sx={{
                      bgcolor: filters.location ? alpha('#0D9488', 0.04) : 'transparent'
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon sx={{ color: 'action.active' }} />
                        </InputAdornment>
                      )
                    }}
                    InputLabelProps={{
                      shrink: true
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Min Salary (LPA)"
                    name="minSalary"
                    type="number"
                    value={filters.minSalary}
                    onChange={handleFilterChange}
                    sx={{
                      bgcolor: filters.minSalary ? alpha('#0D9488', 0.04) : 'transparent'
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CurrencyRupeeIcon sx={{ color: 'action.active', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }}
                    InputLabelProps={{
                      shrink: true
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Max Salary (LPA)"
                    name="maxSalary"
                    type="number"
                    value={filters.maxSalary}
                    onChange={handleFilterChange}
                    sx={{
                      bgcolor: filters.maxSalary ? alpha('#0D9488', 0.04) : 'transparent'
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CurrencyRupeeIcon sx={{ color: 'action.active', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }}
                    InputLabelProps={{
                      shrink: true
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Compact Action Bar */}
            {(hasActiveFilters || filteredJobs.length > 0) && (
              <Box sx={{ 
                display: 'flex', 
                gap: 1.5, 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                flexWrap: 'wrap',
                mt: 2.5,
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider'
              }}>
                {/* Active Filters Pills */}
                <Stack 
                  direction="row" 
                  spacing={0.5} 
                  flexWrap="wrap" 
                  sx={{ gap: 0.5, flex: 1 }}
                >
                  {filters.search && (
                    <Chip 
                      label={filters.search.length > 15 ? filters.search.substring(0, 15) + '...' : filters.search}
                      onDelete={() => { setFilters(prev => ({ ...prev, search: '' })); setSearchInput(''); }}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {filters.experience !== '' && (
                    <Chip 
                      label={filters.experience === '0' ? 'Fresher' : `${filters.experience}+ yrs`}
                      onDelete={() => setFilters(prev => ({ ...prev, experience: '' }))}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {filters.location && (
                    <Chip 
                      label={filters.location}
                      onDelete={() => setFilters(prev => ({ ...prev, location: '' }))}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {(filters.minSalary || filters.maxSalary) && (
                    <Chip 
                      label={`₹${filters.minSalary || '0'}-${filters.maxSalary || '∞'}`}
                      onDelete={() => setFilters(prev => ({ ...prev, minSalary: '', maxSalary: '' }))}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  
                  {/* Results Counter */}
                  <Chip 
                    label={`${filteredJobs.length} ${filteredJobs.length === 1 ? 'job' : 'jobs'}`}
                    size="small"
                    sx={{ 
                      bgcolor: 'success.main', 
                      color: 'white',
                      fontWeight: 600,
                      '& .MuiChip-label': { px: 1.5 }
                    }}
                  />
                </Stack>
                
                {/* Sort & Clear Actions */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    select
                    size="small"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    sx={{ minWidth: 140 }}
                  >
                    <MenuItem value="recent">Recent</MenuItem>
                    <MenuItem value="salary-high">High Salary</MenuItem>
                    <MenuItem value="salary-low">Low Salary</MenuItem>
                    <MenuItem value="experience">Experience</MenuItem>
                    <MenuItem value="company">Company</MenuItem>
                  </TextField>

                  {hasActiveFilters && (
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={handleClearFilters}
                      startIcon={<ClearIcon />}
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      Clear
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        </Collapse>

        {/* Jobs Grid/List with Loading States */}
        {loading ? (
          <Grid container spacing={4}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <JobCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : filteredJobs.length === 0 ? (
          <Fade in timeout={600}>
            <Paper 
              elevation={0} 
              sx={{ 
                textAlign: 'center', 
                py: 12,
                px: 4,
                borderRadius: 4,
                border: '2px dashed',
                borderColor: alpha('#0D9488', 0.2),
                bgcolor: alpha('#FFFBEB', 0.5),
                backdropFilter: 'blur(10px)'
              }}
            >
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  bgcolor: alpha('#0D9488', 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 3
                }}
              >
                <WorkOutlineIcon sx={{ fontSize: 64, color: 'primary.main', opacity: 0.6 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
                No Jobs Found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 480, mx: 'auto' }}>
                {hasActiveFilters 
                  ? "We couldn't find any jobs matching your criteria. Try adjusting your filters or explore all positions."
                  : "No job listings available at the moment. Check back soon for new opportunities!"}
              </Typography>
              {hasActiveFilters && (
                <Button 
                  variant="contained" 
                  onClick={handleClearFilters}
                  startIcon={<ClearIcon />}
                  size="large"
                  sx={{ 
                    borderRadius: 2.5, 
                    textTransform: 'none', 
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                    boxShadow: '0 4px 16px rgba(13, 148, 136, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(13, 148, 136, 0.4)',
                    }
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </Paper>
          </Fade>
        ) : (
          <Grid container spacing={4}>
            {filteredJobs.map((job, index) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                key={job._id}
              >
                <Box>
                  <JobCard 
                    job={job} 
                    isNewJob={index < 6}
                    onViewDetails={handleViewDetails}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;