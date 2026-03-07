// src/pages/JobDetailsPage.js

import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { fetchJobById, applyForJob } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  Divider,
  Grid,
  Skeleton,
  Stack
} from '@mui/material';

const JobDetailsPage = () => {
  const { id } = useParams();
  const { user, refreshUser } = useAuth(); // Get the new refreshUser function

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Smooth scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const loadJobDetails = async () => {
      try {
        setLoading(true);
        const { data } = await fetchJobById(id);
        // Extract job from response wrapper
        setJob(data?.job || null);

        // Check if the current logged-in user has applied for this job
        // appliedJobs is an array of objects with jobId property
        if (user && user.appliedJobs?.some(app => String(app.jobId) === String(id))) {
          setHasApplied(true);
        } else {
          setHasApplied(false);
        }
      } catch (err) {
        setError('Job not found or an error occurred.');
      } finally {
        setLoading(false);
      }
    };
    loadJobDetails();
  }, [id, user]); // Rerun when id or user object changes

  const handleApply = async () => {
    setActionInProgress(true);
    try {
      await applyForJob(id);
      setHasApplied(true);
      await refreshUser(); // <-- REFRESH aFTER APPLYING
    } catch (err) {
    } finally {
      setActionInProgress(false);
    }
  };
  
  const renderContent = () => {
    if (loading) {
      return (
        <Paper 
          elevation={0}
          sx={{ 
            p: 5,
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Skeleton variant="text" width="60%" height={48} />
              <Skeleton variant="text" width="40%" height={32} sx={{ mt: 1 }} />
            </Box>
            <Divider />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Skeleton variant="text" width="50%" />
                <Skeleton variant="text" width="80%" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Skeleton variant="text" width="50%" />
                <Skeleton variant="text" width="80%" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Skeleton variant="text" width="50%" />
                <Skeleton variant="text" width="80%" />
              </Grid>
            </Grid>
            <Box>
              <Skeleton variant="text" width="30%" height={32} />
              <Skeleton variant="rectangular" height={120} sx={{ mt: 2, borderRadius: 1 }} />
            </Box>
          </Stack>
        </Paper>
      );
    }
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }
    if (job) {
      return (
        <Paper 
          elevation={0}
          sx={{ 
            p: 5,
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>{job.title || 'Untitled Job'}</Typography>
              <Typography variant="h6" color="text.secondary">{job.companyName || 'Company not specified'}</Typography>
            </Box>
            <Box sx={{ minWidth: 150, textAlign: 'right' }}>
              {user ? (
                hasApplied ? (
                  <Button 
                    variant="contained" 
                    color="success" 
                    disabled
                    sx={{ 
                      cursor: 'not-allowed',
                      py: 1.5,
                      px: 4,
                      borderRadius: 2.5,
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      textTransform: 'none',
                      bgcolor: '#d4edda',
                      color: '#155724',
                      border: '2px solid #c3e6cb',
                      '&.Mui-disabled': {
                        bgcolor: '#d4edda',
                        color: '#155724',
                        opacity: 1
                      }
                    }}
                  >
                    ✓ Applied
                  </Button>
                ) : (
                  <Button 
                    variant="contained" 
                    onClick={handleApply} 
                    disabled={actionInProgress}
                    sx={{
                      py: 1.8,
                      px: 5,
                      borderRadius: 2.5,
                      fontWeight: 700,
                      fontSize: '1rem',
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                      boxShadow: '0 6px 20px rgba(102,126,234,0.4)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 8px 28px rgba(102,126,234,0.5)'
                      },
                      '&:active': {
                        transform: 'translateY(-1px)',
                      }
                    }}
                  >
                    {actionInProgress ? 'Applying...' : 'Apply Now'}
                  </Button>
                )
              ) : (
                <Button 
                  variant="contained" 
                  component={RouterLink} 
                  to="/login"
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 2.5,
                    fontWeight: 600,
                    textTransform: 'none'
                  }}
                >
                  Login to Apply
                </Button>
              )}
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          {/* ... (rest of the JSX is the same) ... */}
          <Grid container spacing={2} sx={{ my: 2 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="overline" color="text.secondary">Location</Typography>
              <Typography variant="body1">{job.location || 'Not specified'}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="overline" color="text.secondary">Salary</Typography>
              <Typography variant="body1">
                {job.salary && !isNaN(job.salary) ? `₹${Number(job.salary).toLocaleString('en-IN')} / year` : 'Not disclosed'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="overline" color="text.secondary">Experience</Typography>
              <Typography variant="body1">{job.experienceRequired === 0 ? 'Fresher' : `${job.experienceRequired ?? 0} years`}</Typography>
            </Grid>
          </Grid>
          <Typography variant="h6" sx={{ mt: 4 }}>Job Description</Typography>
          <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
            {job.description || 'No description provided'}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return <Container sx={{ my: 4 }}>{renderContent()}</Container>;
};

export default JobDetailsPage;