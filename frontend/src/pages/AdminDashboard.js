// src/pages/AdminDashboard.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import API from '../api';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Fade,
  alpha,
  Chip
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  BusinessCenter as WorkIcon,
  People as PeopleIcon,
  Description as ApplicationIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import AdminLayout from '../components/admin/AdminLayout';
import AdminNotificationToast from '../components/admin/AdminNotificationToast';

const AdminDashboard = () => {
  const { socket, addNotification } = useSocket();
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewApplication = (data) => {
      setCurrentNotification(data);
      setShowNotification(true);
      addNotification(data);
      fetchDashboardData();
    };

    socket.on('new-application', handleNewApplication);

    return () => {
      socket.off('new-application', handleNewApplication);
    };
  }, [socket, addNotification]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, jobsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/jobs')
      ]);
      setStats(statsRes.data?.stats || null);
      const jobsData = jobsRes.data?.jobs || [];
      setRecentJobs(Array.isArray(jobsData) ? jobsData.slice(0, 5) : []);
      setLoading(false);
    } catch (error) {
      setRecentJobs([]);
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Total Admins', 
      value: stats?.totalAdmins || 0, 
      icon: <AdminIcon sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #E8920C 0%, #C67A08 100%)',
      color: '#E8920C'
    },
    { 
      title: 'Total Jobs', 
      value: stats?.totalJobs || 0, 
      icon: <WorkIcon sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
      color: '#0D9488'
    },
    { 
      title: 'Total Applications', 
      value: stats?.totalApplications || 0, 
      icon: <ApplicationIcon sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #C67A08 0%, #E8920C 100%)',
      color: '#C67A08'
    },
    { 
      title: 'Registered Users', 
      value: stats?.totalUsers || 0, 
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #115E59 0%, #0D9488 100%)',
      color: '#115E59'
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} sx={{ color: '#E8920C' }} />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box>
        <Fade in timeout={600}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" fontWeight={700} color="#1e293b" gutterBottom>
              Dashboard Overview
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back! Here's what's happening with your platform.
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} lg={3} key={card.title}>
              <Fade in timeout={800 + index * 100}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3,
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 48px rgba(0, 0, 0, 0.12)'
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: card.gradient
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 2,
                        background: alpha(card.color, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: card.color
                      }}
                    >
                      {card.icon}
                    </Box>
                    <TrendingIcon sx={{ color: '#22c55e', fontSize: 28 }} />
                  </Box>
                  <Typography variant="h3" fontWeight={700} color="#1e293b" sx={{ mb: 0.5 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {card.title}
                  </Typography>
                </Paper>
              </Fade>
            </Grid>
          ))}
        </Grid>

        <Fade in timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" fontWeight={700} color="#1e293b">
                  Recent Jobs
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Latest job postings on your platform
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/admin-jobs')}
                sx={{
                  borderColor: '#E8920C',
                  color: '#E8920C',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#C67A08',
                    bgcolor: alpha('#E8920C', 0.04)
                  }
                }}
              >
                View All
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Job Title</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Company</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Salary</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Applicants</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Posted</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentJobs.length > 0 ? (
                    recentJobs.map((job, index) => (
                      <TableRow 
                        key={job._id} 
                        sx={{ 
                          '&:hover': { bgcolor: alpha('#E8920C', 0.02) },
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <TableCell>
                          <Typography fontWeight={600} color="#1e293b">
                            {job.title}
                          </Typography>
                        </TableCell>
                        <TableCell>{job.companyName}</TableCell>
                        <TableCell>{job.location}</TableCell>
                        <TableCell>
                          <Typography fontWeight={600} color="#E8920C">
                            ₹{job.salary?.toLocaleString('en-IN')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={job.applicants?.length || 0}
                            size="small"
                            sx={{
                              bgcolor: alpha('#E8920C', 0.1),
                              color: '#E8920C',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>
                          {new Date(job.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <WorkIcon sx={{ fontSize: 60, color: '#E8920C', opacity: 0.35, mb: 2 }} />
                        <Typography color="text.secondary">
                          No jobs posted yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Fade>
        
        <AdminNotificationToast
          notification={currentNotification}
          open={showNotification}
          onClose={() => setShowNotification(false)}
          autoHideDuration={8000}
        />
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboard;