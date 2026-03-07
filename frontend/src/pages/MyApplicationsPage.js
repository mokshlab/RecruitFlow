// src/pages/MyApplicationsPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getAppliedJobs } from '../api';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FilterListIcon from '@mui/icons-material/FilterList';
import NotificationToast from '../components/NotificationToast';

// Helper function to calculate days since application
const getDaysSinceApplication = (appliedDate) => {
  if (!appliedDate) return null;
  const now = new Date();
  const applied = new Date(appliedDate);
  const diffTime = Math.abs(now - applied);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getStatusBadge = (status) => {
  const statusLower = status?.toLowerCase();
  
  if (statusLower === 'shortlisted') {
    return {
      label: 'Shortlisted',
      icon: <CheckCircleIcon />,
      sx: {
        backgroundColor: '#10b981',
        color: 'white',
        fontWeight: 600,
        fontSize: '0.75rem',
        px: 1.5,
        py: 0.25,
        letterSpacing: '0.3px',
        borderRadius: '6px',
        '& .MuiChip-icon': { color: 'white', fontSize: 16 },
        boxShadow: 'none',
        border: 'none'
      }
    };
  }
  
  if (statusLower === 'rejected') {
    return {
      label: 'Not Selected',
      icon: <RemoveCircleIcon />,
      sx: {
        backgroundColor: '#ef4444',
        color: 'white',
        fontWeight: 600,
        fontSize: '0.75rem',
        px: 1.5,
        py: 0.25,
        letterSpacing: '0.3px',
        borderRadius: '6px',
        '& .MuiChip-icon': { color: 'white', fontSize: 16 },
        boxShadow: 'none',
        border: 'none'
      }
    };
  }
  
  if (statusLower === 'under review' || statusLower === 'reviewed') {
    return {
      label: 'Under Review',
      icon: <FiberManualRecordIcon />,
      sx: {
        backgroundcolor: '#0D9488',
        color: 'white',
        fontWeight: 600,
        fontSize: '0.75rem',
        px: 1.5,
        py: 0.25,
        letterSpacing: '0.3px',
        borderRadius: '6px',
        '& .MuiChip-icon': { color: 'white', fontSize: 12 },
        boxShadow: 'none',
        border: 'none'
      }
    };
  }
  
  // Default status for "Pending" or any unrecognized status
  return {
    label: 'Pending',
    icon: <FiberManualRecordIcon />,
    sx: {
      backgroundColor: '#6b7280',
      color: 'white',
      fontWeight: 600,
      fontSize: '0.75rem',
      px: 1.5,
      py: 0.25,
      letterSpacing: '0.3px',
      borderRadius: '6px',
      '& .MuiChip-icon': { color: 'white', fontSize: 12 },
      boxShadow: 'none',
      border: 'none'
    }
  };
};

const MyApplicationsPage = () => {
  const { user } = useAuth();
  const { socket, addNotification } = useSocket();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // Filter state
  const [displayLimit, setDisplayLimit] = useState(12); // Show 12 applications initially

  // Reset display limit when filter changes
  useEffect(() => {
    setDisplayLimit(12);
  }, [statusFilter]);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        setLoading(true);
        const { data } = await getAppliedJobs();
        // Extract appliedJobs from response wrapper
        const apps = data?.appliedJobs || [];
        setAppliedJobs(Array.isArray(apps) ? apps : []);
      } catch (error) {
        setAppliedJobs([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchAppliedJobs();
  }, []);

  // Listen for application status updates via WebSocket
  useEffect(() => {
    if (!socket || !user) return;

    const handleStatusUpdate = (data) => {
      // Only show toast notification for meaningful status changes (not Pending)
      if (data.status && data.status.toLowerCase() !== 'pending') {
        setCurrentNotification(data);
        setShowNotification(true);
      }
      
      // Add to notifications
      addNotification(data);
      
      // Update local state (always update UI regardless of notification)
      setAppliedJobs(prev => 
        Array.isArray(prev) ? prev.map(job => 
          job._id === data.jobId 
            ? { ...job, applicationStatus: data.status }
            : job
        ) : []
      );
    };

    socket.on('application-status-updated', handleStatusUpdate);

    return () => {
      socket.off('application-status-updated', handleStatusUpdate);
    };
  }, [socket, user, addNotification]);

  // Sort and filter applications
  const sortedApplications = useMemo(() => {
    // Defensive check - ensure appliedJobs is always an array
    if (!Array.isArray(appliedJobs)) {
      return [];
    }
    
    // Apply status filter
    let filtered = [...appliedJobs];
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => {
        const status = (job.applicationStatus || 'pending').toLowerCase();
        if (statusFilter === 'shortlisted') return status === 'shortlisted';
        if (statusFilter === 'rejected') return status === 'rejected';
        if (statusFilter === 'under review') return status === 'under review' || status === 'reviewed';
        if (statusFilter === 'pending') return status === 'pending';
        return true;
      });
    }
    
    // Sort filtered results
    return filtered.sort((a, b) => {
      const statusA = (a.applicationStatus || 'pending').toLowerCase();
      const statusB = (b.applicationStatus || 'pending').toLowerCase();
      
      // Priority: shortlisted/rejected first, then under review, then pending
      const getPriority = (status) => {
        if (status === 'shortlisted' || status === 'rejected') return 0;
        if (status === 'under review' || status === 'reviewed') return 1;
        return 2; // pending
      };
      
      const priorityDiff = getPriority(statusA) - getPriority(statusB);
      if (priorityDiff !== 0) return priorityDiff;
      
      // Within same priority, sort by applied date (newest first)
      return new Date(b.appliedAt) - new Date(a.appliedAt);
    });
  }, [appliedJobs, statusFilter]);

  if (!user) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' }, mb: 0.5 }}>
            My Applications
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' }, mb: 1 }}>
            Track all your job applications in one place
          </Typography>
          
          {/* Filter Bar */}
          {Array.isArray(appliedJobs) && appliedJobs.length > 0 && (
            <Box sx={{ 
              mt: 1.5, 
              mb: 2,
              display: 'flex', 
              gap: 1.5, 
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mr: 0.5 }}>
                <FilterListIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  Show:
                </Typography>
              </Box>
              <Chip 
                label={`All (${appliedJobs.length})`}
                onClick={() => setStatusFilter('all')}
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  backgroundColor: statusFilter === 'all' ? '#0D9488' : '#f5f5f5',
                  color: statusFilter === 'all' ? 'white' : '#424242',
                  border: statusFilter === 'all' ? '2px solid #0D9488' : '1px solid #e0e0e0',
                  '&:hover': {
                    backgroundColor: statusFilter === 'all' ? '#0D9488' : '#eeeeee'
                  }
                }}
              />
              <Chip 
                label={`Shortlisted (${appliedJobs.filter(j => (j.applicationStatus || 'pending').toLowerCase() === 'shortlisted').length})`}
                onClick={() => setStatusFilter('shortlisted')}
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  backgroundColor: statusFilter === 'shortlisted' ? '#10b981' : '#e8f5e9',
                  color: statusFilter === 'shortlisted' ? 'white' : '#2e7d32',
                  border: statusFilter === 'shortlisted' ? '2px solid #10b981' : '1px solid #c8e6c9',
                  '&:hover': {
                    backgroundColor: statusFilter === 'shortlisted' ? '#059669' : '#c8e6c9'
                  }
                }}
              />
              <Chip 
                label={`Rejected (${appliedJobs.filter(j => (j.applicationStatus || 'pending').toLowerCase() === 'rejected').length})`}
                onClick={() => setStatusFilter('rejected')}
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  backgroundColor: statusFilter === 'rejected' ? '#ef4444' : '#ffebee',
                  color: statusFilter === 'rejected' ? 'white' : '#c62828',
                  border: statusFilter === 'rejected' ? '2px solid #ef4444' : '1px solid #ffcdd2',
                  '&:hover': {
                    backgroundColor: statusFilter === 'rejected' ? '#dc2626' : '#ffcdd2'
                  }
                }}
              />
              <Chip 
                label={`Under Review (${appliedJobs.filter(j => {
                  const status = (j.applicationStatus || 'pending').toLowerCase();
                  return status === 'under review' || status === 'reviewed';
                }).length})`}
                onClick={() => setStatusFilter('under review')}
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  backgroundColor: statusFilter === 'under review' ? '#0D9488' : 'rgba(13,148,136,0.08)',
                  color: statusFilter === 'under review' ? 'white' : '#1565c0',
                  border: statusFilter === 'under review' ? '2px solid #0D9488' : '1px solid rgba(13,148,136,0.2)',
                  '&:hover': {
                    backgroundColor: statusFilter === 'under review' ? '#0F766E' : 'rgba(13,148,136,0.15)'
                  }
                }}
              />
              <Chip 
                label={`Pending (${appliedJobs.filter(j => (j.applicationStatus || 'pending').toLowerCase() === 'pending').length})`}
                onClick={() => setStatusFilter('pending')}
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  backgroundColor: statusFilter === 'pending' ? '#78716c' : '#fafafa',
                  color: statusFilter === 'pending' ? 'white' : '#616161',
                  border: statusFilter === 'pending' ? '2px solid #78716c' : '1px solid #e0e0e0',
                  '&:hover': {
                    backgroundColor: statusFilter === 'pending' ? '#57534e' : '#e0e0e0'
                  }
                }}
              />
            </Box>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : appliedJobs.length > 0 ? (
          <>
            <Grid container spacing={2.5}>
              {sortedApplications.slice(0, displayLimit).map((job) => {
              const status = (job.applicationStatus || 'pending').toLowerCase();
              const isShortlisted = status === 'shortlisted';
              const isRejected = status === 'rejected';
              const isUnderReview = status === 'under review' || status === 'reviewed';
              
              // Determine border and styling based on status
              const getBorderStyle = () => {
                if (isShortlisted) return '3px solid #10b981'; // Green for Shortlisted
                if (isRejected) return '3px solid #ef4444'; // Red for Rejected
                if (isUnderReview) return '2px solid #0D9488'; // Teal for Under Review
                return '1px solid #e0e0e0'; // Default for Pending
              };
              
              const getBoxShadow = () => {
                if (isShortlisted) return '0 8px 24px rgba(16, 185, 129, 0.2)';
                if (isRejected) return '0 8px 24px rgba(239, 68, 68, 0.15)';
                if (isUnderReview) return '0 6px 20px rgba(13, 148, 136, 0.15)';
                return '0 2px 8px rgba(0, 0, 0, 0.08)';
              };
              
              // Calculate application timeline
              const daysSince = getDaysSinceApplication(job.appliedAt);
              
              return (
                <Grid item xs={12} md={6} lg={4} key={job._id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: getBorderStyle(),
                      borderColor: status === 'pending' ? 'divider' : undefined,
                      boxShadow: getBoxShadow(),
                      position: 'relative',
                      overflow: 'visible',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: isShortlisted 
                          ? '0 12px 32px rgba(16, 185, 129, 0.3)' 
                          : isRejected 
                          ? '0 12px 32px rgba(239, 68, 68, 0.2)'
                          : isUnderReview
                          ? '0 10px 28px rgba(59, 130, 246, 0.2)'
                          : '0 6px 16px rgba(0, 0, 0, 0.12)'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Status badge in top-right corner */}
                      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                        <Chip 
                          label={getStatusBadge(status).label}
                          size="medium"
                          icon={getStatusBadge(status).icon}
                          sx={getStatusBadge(status).sx}
                        />
                      </Box>

                      {/* Company name */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, pr: 18 }}>
                        <BusinessCenterIcon sx={{ fontSize: 18, color: 'primary.main', opacity: 0.8 }} />
                        <Typography variant="body2" color="primary.main" fontWeight={600} sx={{ opacity: 0.9 }}>
                          {job.companyName || 'Company not specified'}
                        </Typography>
                      </Box>

                      {/* Job title */}
                      <Typography variant="h6" sx={{
                        fontWeight: 800,
                        fontSize: '1.15rem',
                        lineHeight: 1.3,
                        mb: 1.75,
                        color: 'text.primary',
                        pr: 18
                      }}>
                        {job.title || 'Untitled Job'}
                      </Typography>
                      
                      {/* Location */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 0.75 }}>
                        <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {job.location || 'Location not specified'}
                        </Typography>
                      </Box>
                      
                      {/* Salary */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 0.75 }}>
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          {job.salary && !isNaN(job.salary) ? `₹${Number(job.salary).toLocaleString('en-IN')} / year` : 'Salary not disclosed'}
                        </Typography>
                      </Box>
                      
                      {/* Metadata footer: Applied date + Experience */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        pt: 1.5,
                        borderTop: '1px solid',
                        borderColor: 'divider'
                      }}>
                        {job.appliedAt && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                            <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.8125rem' }}>
                              {daysSince && daysSince < 7 ? (
                                `Applied ${daysSince} ${daysSince === 1 ? 'day' : 'days'} ago`
                              ) : (
                                `Applied ${new Date(job.appliedAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}`
                              )}
                            </Typography>
                          </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                          <TrendingUpIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.8125rem' }}>
                            {job.experienceRequired === 0 ? 'Fresher / Entry Level' : job.experienceRequired === 1 ? '1 year experience' : `${job.experienceRequired}+ years experience`}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button 
                        component={RouterLink} 
                        to={`/jobs/${job._id}`}
                        variant="outlined"
                        fullWidth
                        sx={{
                          borderRadius: 1.5,
                          py: 1,
                          fontWeight: 600,
                          textTransform: 'none',
                          fontSize: '0.875rem'
                        }}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          
          {/* Load More Button */}
          {sortedApplications.length > displayLimit && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => setDisplayLimit(prev => prev + 12)}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.25,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2
                  }
                }}
              >
                Load More Applications ({sortedApplications.length - displayLimit} remaining)
              </Button>
            </Box>
          )}
          </>
        ) : (
          <Paper sx={{ p: 6, textAlign: 'center', maxWidth: 500, mx: 'auto' }}>
            <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" gutterBottom fontWeight={600}>
              {statusFilter !== 'all' 
                ? `No ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Applications` 
                : 'No Applications Yet'
              }
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
              {statusFilter !== 'all'
                ? `You currently have no ${statusFilter} applications. Clear the filter to view all applications or browse available positions.`
                : "Start your job search journey by exploring available opportunities and submitting applications."
              }
            </Typography>
            <Button 
              component={RouterLink} 
              to={statusFilter !== 'all' ? '#' : '/browse'}
              variant="contained"
              size="large"
              onClick={statusFilter !== 'all' ? () => setStatusFilter('all') : undefined}
              sx={{
                background: statusFilter !== 'all' 
                  ? 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)'
                  : undefined
              }}
            >
              {statusFilter !== 'all' ? 'Clear Filter' : 'Browse Jobs'}
            </Button>
          </Paper>
        )}
      </Container>
      
      {/* Professional Notification Toast */}
      <NotificationToast
        notification={currentNotification}
        open={showNotification}
        onClose={() => setShowNotification(false)}
        autoHideDuration={8000}
      />
    </Box>
  );
};

export default MyApplicationsPage;
