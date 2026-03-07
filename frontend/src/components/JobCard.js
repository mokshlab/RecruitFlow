// src/components/JobCard.js
// Reusable job card component with bookmark and apply functionality

import React, { useState, useMemo } from 'react';
import { 
  Card, CardContent, CardActions, Typography, Button, Chip, 
  IconButton, Tooltip, Box, alpha 
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { bookmarkJob, removeBookmark } from '../api';

const JobCard = ({ job, isNewJob = false }) => {
  const { user, refreshUser, setUser } = useAuth();
  const { showToast } = useSocket();
  const [loading, setLoading] = useState(false);
  
  // Calculate bookmark status directly from user context
  const isBookmarked = useMemo(() => {
    if (!user || !user.bookmarkedJobs) return false;
    return user.bookmarkedJobs.some(bookmark => {
      const bookmarkId = typeof bookmark === 'string' ? bookmark : bookmark._id;
      return bookmarkId === job._id;
    });
  }, [user, job._id]);
  
  // Check if current user has applied for this job
  const hasApplied = useMemo(() => 
    user && user.appliedJobs?.some(app => 
      (app.jobId === job._id || app === job._id)
    ), [user, job._id]
  );
  
  // Format salary for better readability (memoized)
  const formattedSalary = useMemo(() => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(job.salary);
  }, [job.salary]);

  // Format experience text (memoized)
  const experienceText = useMemo(() => {
    if (job.experienceRequired === 0) return 'Fresher / Entry Level';
    if (job.experienceRequired === 1) return '1 year experience';
    return `${job.experienceRequired}+ years experience`;
  }, [job.experienceRequired]);

  const handleBookmarkToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast('Please login to bookmark jobs', 'warning');
      return;
    }
    
    setLoading(true);
    
    // Optimistic update - immediately update UI
    const updatedBookmarks = isBookmarked
      ? user.bookmarkedJobs.filter(bookmark => {
          const bookmarkId = typeof bookmark === 'string' ? bookmark : bookmark._id;
          return bookmarkId !== job._id;
        })
      : [...(user.bookmarkedJobs || []), job._id];
    
    setUser({ ...user, bookmarkedJobs: updatedBookmarks });
    
    try {
      if (isBookmarked) {
        await removeBookmark(job._id);
        showToast('Bookmark removed', 'info');
      } else {
        await bookmarkJob(job._id);
        showToast('Job bookmarked successfully', 'success');
      }
      // Refresh to sync with backend
      await refreshUser();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update bookmark';
      showToast(errorMsg, 'error');
      // Revert optimistic update on error
      await refreshUser();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'relative',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
          borderColor: 'primary.light',
        }
      }}
    >
      {/* Header Section */}
      <Box 
        sx={{ 
          background: alpha('#f5f7fa', 1),
          p: 2.5,
          position: 'relative',
          borderBottom: '1px solid',
          borderColor: '#e8eaf0',
          minHeight: user ? 110 : 95
        }}
      >
        {/* New Badge */}
        {isNewJob && (
          <Chip 
            label="NEW"
            size="small"
            sx={{ 
              position: 'absolute',
              top: 10,
              left: 10,
              background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.65rem',
              height: 20,
              px: 1,
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
              border: '1px solid rgba(255,255,255,0.2)',
              '& .MuiChip-label': {
                px: 1
              }
            }}
          />
        )}
        
        {/* Bookmark Button */}
        {user && (
          <Tooltip title={isBookmarked ? "Remove bookmark" : "Bookmark job"}>
            <IconButton
              onClick={handleBookmarkToggle}
              disabled={loading}
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                bgcolor: 'white',
                color: isBookmarked ? 'primary.main' : 'action.active',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                width: 36,
                height: 36,
                '&:hover': {
                  bgcolor: 'white',
                  transform: 'scale(1.1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                  color: isBookmarked ? 'primary.dark' : 'primary.main'
                }
              }}
            >
              {isBookmarked ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
        
        {/* Company Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, mt: isNewJob ? 3 : 0 }}>
          <BusinessCenterIcon sx={{ color: 'primary.main', fontSize: 18, opacity: 0.8 }} />
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600, 
              color: 'primary.main',
              opacity: 0.9,
              fontSize: '0.8125rem'
            }}
          >
            {job.companyName}
          </Typography>
        </Box>
        
        {/* Job Title */}
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 800,
            color: 'text.primary',
            mb: hasApplied ? 1.5 : 1.75,
            pr: user ? 5 : 0,
            lineHeight: 1.3,
            fontSize: '1.15rem'
          }}
        >
          {job.title}
        </Typography>
        
        {/* Applied Badge */}
        {hasApplied && (
          <Chip 
            icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
            label="Applied" 
            size="small"
            color="success"
            variant="outlined"
            sx={{ 
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 26,
              borderWidth: '1.5px',
              '& .MuiChip-icon': {
                ml: 0.5
              }
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        {/* Location */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 0.75 }}>
          <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {job.location}
          </Typography>
        </Box>
        
        {/* Salary */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 0.75 }}>
          <Typography variant="body2" fontWeight={600} color="success.main">
            {formattedSalary} / year
          </Typography>
        </Box>
        
        {/* Metadata footer: Experience */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 0.6,
          pt: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <TrendingUpIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.8125rem' }}>
            {experienceText}
          </Typography>
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
  );
};

export default JobCard;