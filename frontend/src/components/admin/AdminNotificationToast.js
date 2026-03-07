// src/components/admin/AdminNotificationToast.js
// Professional notification toast for admin dashboard - shows new application alerts

import React, { useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Box,
  Typography,
  IconButton,
  Slide,
  Stack,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import EmailIcon from '@mui/icons-material/Email';

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

const AdminNotificationToast = ({ notification, open, onClose, autoHideDuration = 6000 }) => {
  useEffect(() => {
    if (open && autoHideDuration) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [open, onClose, autoHideDuration]);

  if (!notification) return null;

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={SlideTransition}
      sx={{ mt: 8 }}
    >
      <Alert
        icon={false}
        severity="info"
        onClose={onClose}
        sx={{
          width: '420px',
          maxWidth: '95vw',
          bgcolor: 'white',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: 3,
          border: '1px solid #e5e7eb',
          borderLeft: '4px solid #0D9488',
          '& .MuiAlert-message': {
            width: '100%',
            p: 0
          }
        }}
        action={
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ 
              color: '#64748b',
              '&:hover': { 
                bgcolor: '#f1f5f9'
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Stack spacing={1.5}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                bgcolor: 'rgba(13,148,136,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FiberNewIcon sx={{ fontSize: 22, color: '#0D9488' }} />
              </Box>
              <Typography sx={{
                fontWeight: 700,
                fontSize: '1rem',
                color: '#111827',
                lineHeight: 1.3,
                letterSpacing: '-0.01em'
              }}>
                New Application
              </Typography>
            </Box>
            <Box sx={{
              bgcolor: '#fef3c7',
              color: '#92400e',
              px: 1.5,
              py: 0.5,
              borderRadius: 1.5,
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Action Required
            </Box>
          </Box>
          
          <Divider sx={{ borderColor: '#f3f4f6' }} />

          {/* Job Details */}
          {notification.jobTitle && (
            <Box>
              <Typography sx={{ 
                fontSize: '0.688rem',
                fontWeight: 700,
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                mb: 1
              }}>
                Position Details
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Box sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: '#f9fafb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <WorkIcon sx={{ fontSize: 18, color: '#6b7280' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ 
                    fontWeight: 600,
                    fontSize: '0.938rem',
                    color: '#111827',
                    lineHeight: 1.4,
                    mb: 0.5
                  }}>
                    {notification.jobTitle}
                  </Typography>
                  {notification.companyName && (
                    <Typography sx={{ 
                      fontSize: '0.813rem',
                      color: '#6b7280',
                      lineHeight: 1.4
                    }}>
                      {notification.companyName}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          )}
          
          <Divider sx={{ borderColor: '#f3f4f6' }} />

          {/* Candidate Info */}
          {notification.userName && (
            <Box>
              <Typography sx={{ 
                fontSize: '0.688rem',
                fontWeight: 700,
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                mb: 1
              }}>
                Candidate Information
              </Typography>
              <Box sx={{ 
                bgcolor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: 2.5,
                p: 1.5
              }}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <PersonIcon sx={{ fontSize: 20, color: '#4b5563' }} />
                    <Typography sx={{ 
                      fontSize: '0.938rem',
                      color: '#111827',
                      fontWeight: 600,
                      lineHeight: 1.4
                    }}>
                      {notification.userName}
                    </Typography>
                  </Box>
                  {notification.userEmail && (
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <EmailIcon sx={{ fontSize: 18, color: '#6b7280' }} />
                      <Typography sx={{ 
                        fontSize: '0.875rem',
                        color: '#4b5563',
                        lineHeight: 1.4
                      }}>
                        {notification.userEmail}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Box>
          )}
        </Stack>
      </Alert>
    </Snackbar>
  );
};

export default AdminNotificationToast;
