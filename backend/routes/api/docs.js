// backend/routes/api/docs.js
// API documentation endpoint

const express = require('express');
const router = express.Router();
const constants = require('../../config/constants');

router.get('/', (req, res) => {
  res.json({
    name: 'RecruitFlow API',
    version: '1.2.0',
    description: 'Full-stack job portal with real-time notifications and dual authentication',
    baseUrl: '/api',
    documentation: {
      auth: {
        routes: [
          { method: 'POST', path: '/auth/register', description: 'Register new user', auth: false },
          { method: 'POST', path: '/auth/login', description: 'User login', auth: false },
          { method: 'POST', path: '/auth/admin/login', description: 'Admin login', auth: false }
        ]
      },
      users: {
        routes: [
          { method: 'GET', path: '/users/profile', description: 'Get user profile', auth: 'user' },
          { method: 'PUT', path: '/users/profile', description: 'Update user profile (supports multipart/form-data)', auth: 'user' },
          { method: 'POST', path: '/users/jobs/:id/apply', description: 'Apply for a job', auth: 'user' },
          { method: 'DELETE', path: '/users/jobs/:id/withdraw', description: 'Withdraw job application', auth: 'user' },
          { method: 'GET', path: '/users/applied-jobs', description: 'Get all applied jobs', auth: 'user' },
          { method: 'POST', path: '/users/jobs/:id/bookmark', description: 'Bookmark a job', auth: 'user' },
          { method: 'DELETE', path: '/users/jobs/:id/bookmark', description: 'Remove bookmark', auth: 'user' },
          { method: 'GET', path: '/users/bookmarked-jobs', description: 'Get bookmarked jobs', auth: 'user' }
        ]
      },
      jobs: {
        routes: [
          { method: 'GET', path: '/jobs', description: 'Get all jobs (supports ?experience=X&salary=Y filters, optional pagination with ?page=1&limit=10)', auth: false },
          { method: 'GET', path: '/jobs/:id', description: 'Get job by ID', auth: false }
        ]
      },
      admin: {
        routes: [
          { method: 'GET', path: '/admin/stats', description: 'Get dashboard statistics', auth: 'admin' },
          { method: 'GET', path: '/admin/admins', description: 'Get all admins', auth: 'admin' },
          { method: 'POST', path: '/admin/admins', description: 'Create new admin', auth: 'default-admin' },
          { method: 'DELETE', path: '/admin/admins/:id', description: 'Delete admin', auth: 'default-admin' },
          { method: 'GET', path: '/admin/users', description: 'Get all users (optional pagination with ?page=1&limit=10)', auth: 'admin' },
          { method: 'DELETE', path: '/admin/users/:id', description: 'Delete user (soft delete)', auth: 'admin' },
          { method: 'GET', path: '/admin/jobs', description: 'Get all jobs with applicant counts (optional pagination with ?page=1&limit=10)', auth: 'admin' },
          { method: 'POST', path: '/admin/jobs', description: 'Create new job posting', auth: 'admin' },
          { method: 'PUT', path: '/admin/jobs/:id', description: 'Update job posting', auth: 'admin' },
          { method: 'DELETE', path: '/admin/jobs/:id', description: 'Delete job (soft delete)', auth: 'admin' },
          { method: 'GET', path: '/admin/jobs/:jobId/applicants', description: 'Get all applicants for a job', auth: 'admin' },
          { method: 'PATCH', path: '/admin/jobs/:jobId/applicants/:applicantId/status', description: 'Update applicant status', auth: 'admin' }
        ]
      },
      files: {
        routes: [
          { method: 'GET', path: '/files/:filename', description: 'Download file from GridFS', auth: false }
        ]
      },
      contact: {
        routes: [
          { method: 'POST', path: '/contact', description: 'Submit contact form', auth: false }
        ]
      },
      news: {
        routes: [
          { method: 'GET', path: '/news', description: 'Get news articles', auth: false }
        ]
      },
      resume: {
        routes: [
          { method: 'GET', path: '/resume/download/:userId', description: 'Download user resume', auth: 'admin' }
        ]
      }
    },
    constants: {
      applicationStatuses: Object.values(constants.APPLICATION_STATUS),
      jobTypes: Object.values(constants.JOB_TYPES),
      rateLimits: {
        general: `${constants.RATE_LIMIT_MAX_REQUESTS} requests per ${constants.RATE_LIMIT_WINDOW_MS / 60000} minutes`,
        auth: `${constants.AUTH_RATE_LIMIT_MAX} attempts per ${constants.RATE_LIMIT_WINDOW_MS / 60000} minutes`
      },
      fileUploadLimits: {
        profilePhoto: `${constants.MAX_PROFILE_PHOTO_SIZE / 1024 / 1024}MB`,
        resume: `${constants.MAX_RESUME_SIZE / 1024 / 1024}MB`,
        allowedImageTypes: constants.ALLOWED_IMAGE_TYPES,
        allowedResumeTypes: constants.ALLOWED_RESUME_TYPES
      }
    },
    authentication: {
      type: 'JWT Bearer Token',
      header: 'Authorization: Bearer <token>',
      expiration: constants.JWT_EXPIRATION,
      note: 'Separate tokens for user and admin authentication'
    },
    realtime: {
      socketio: 'Enabled',
      events: ['new-job-posted', 'application-status-updated', 'new-application', 'job-deleted']
    },
    health: {
      endpoint: '/api/health',
      description: 'Check API health and service status'
    }
  });
});

module.exports = router;
