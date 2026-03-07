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
        borderLeft: '4px solid #0D9488',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(13,148,136,0.15)',
          borderColor: 'divider',
          borderLeft: '4px solid #F59E0B',
        }
      }}
    >
      {/* Header Section */}
      <Box 
        sx={{ 
          bgcolor: 'white',
          p: 2.5,
          position: 'relative',
          borderBottom: '1px solid',
          borderColor: '#e8eaf0',
        }}
      >
        {/* NEW Badge */}
        {isNewJob && (
          <Chip 
            label="NEW"
            size="small"
            sx={{ 
              position: 'absolute',
              top: 10,
              right: user ? 52 : 10,
              background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.65rem',
              height: 20,
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
              border: '1px solid rgba(255,255,255,0.2)',
              '& .MuiChip-label': { px: 1 }
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
                bgcolor: 'rgba(13,148,136,0.06)',
                color: isBookmarked ? '#0D9488' : 'action.active',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                width: 34,
                height: 34,
                '&:hover': {
                  bgcolor: 'rgba(13,148,136,0.12)',
                  transform: 'scale(1.1)',
                  color: '#0D9488'
                }
              }}
            >
              {isBookmarked ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}

        {/* Company Avatar + Info */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, pr: user ? 5 : 0 }}>
          {/* Company Initial Avatar */}
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'white',
              fontWeight: 800,
              fontSize: '1.1rem',
              boxShadow: '0 2px 8px rgba(13,148,136,0.25)',
              mt: 0.25
            }}
          >
            {job.companyName?.charAt(0)?.toUpperCase() || 'C'}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Company name + job type chip */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mb: 0.5 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: '#0D9488', fontSize: '0.8125rem' }}
              >
                {job.companyName}
              </Typography>
              {job.jobType && (
                <Chip
                  label={job.jobType}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    bgcolor: alpha('#0D9488', 0.08),
                    color: '#0D9488',
                    border: '1px solid',
                    borderColor: alpha('#0D9488', 0.2),
                    '& .MuiChip-label': { px: 0.75, py: 0 }
                  }}
                />
              )}
            </Box>

            {/* Job Title */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: 'text.primary',
                lineHeight: 1.3,
                fontSize: '1.05rem',
                mb: hasApplied ? 1 : 0
              }}
            >
              {job.title}
            </Typography>

            {/* Applied Badge */}
            {hasApplied && (
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                label="Applied"
                size="small"
                color="success"
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 22,
                  borderWidth: '1.5px',
                  '& .MuiChip-icon': { ml: 0.5 }
                }}
              />
            )}
          </Box>
        </Box>
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
          <Typography variant="body2" fontWeight={700} sx={{ color: '#F59E0B', fontSize: '0.9375rem' }}>
            {formattedSalary}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            / year
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
          variant="contained"
          disableElevation
          fullWidth
          sx={{ 
            borderRadius: 1.5,
            py: 1,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.875rem',
            background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
            boxShadow: '0 2px 8px rgba(13,148,136,0.2)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0F766E 0%, #0c6b61 100%)',
              boxShadow: '0 4px 16px rgba(13,148,136,0.35)',
              transform: 'translateY(-1px)'
            }
          }}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default JobCard;