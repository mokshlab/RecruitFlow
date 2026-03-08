// backend/routes/api/admin.js

const express = require('express');
const router = express.Router();
const { authAdmin, isDefaultAdmin } = require('../../middleware/authMiddleware');
const {
  validateAddAdmin,
  validateAdminId,
  validateJobIdForApplicants,
  validateJob,
  validateJobId
} = require('../../middleware/validationMiddleware');
const {
  addAdmin,
  deleteAdmin,
  getAllAdmins,
  getAllUsers,
  deleteUser,
  getAllJobs,
  getJobApplicants,
  postJob,
  deleteJob,
  updateJob,
  updateApplicationStatus,
  getStats
} = require('../../controllers/adminController');

// Dashboard stats
router.get('/stats', authAdmin, getStats);

// Admin management
router.get('/admins', authAdmin, getAllAdmins);
router.post('/admins', authAdmin, isDefaultAdmin, validateAddAdmin, addAdmin);
router.delete('/admins/:id', authAdmin, isDefaultAdmin, validateAdminId, deleteAdmin);

// User management
router.get('/users', authAdmin, getAllUsers);
router.delete('/users/:id', authAdmin, isDefaultAdmin, deleteUser);

// Applicant management
router.get('/jobs/:jobId/applicants', authAdmin, validateJobIdForApplicants, getJobApplicants);
router.patch('/jobs/:jobId/applicants/:applicantId/status', authAdmin, updateApplicationStatus);

// Job management
router.get('/jobs', authAdmin, getAllJobs);
router.post('/jobs', authAdmin, validateJob, postJob);
router.delete('/jobs/:id', authAdmin, isDefaultAdmin, validateJobId, deleteJob);
router.put('/jobs/:id', authAdmin, validateJobId, validateJob, updateJob);

module.exports = router;