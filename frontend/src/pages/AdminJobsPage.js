// src/pages/AdminJobsPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Fade,
  IconButton,
  TablePagination,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Work as WorkIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import AdminLayout from '../components/admin/AdminLayout';
import {
  validateJobTitle,
  validateCompanyName,
  validateLocation,
  validateSalary,
  validateExperience,
  validateDescription
} from '../utils/validation';

const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [newJob, setNewJob] = useState({
    title: '',
    companyName: '',
    location: '',
    salary: '',
    experienceRequired: '',
    description: '',
    jobType: 'Full-time'
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await API.get('/admin/jobs');
      const jobsArray = data?.jobs || [];
      setJobs(Array.isArray(jobsArray) ? jobsArray : []);
      setLoading(false);
    } catch (error) {
      setJobs([]);
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    try {
      await API.delete(`/admin/jobs/${jobId}`);
      setMessage('Job deleted successfully');
      fetchJobs();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error deleting job');
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewJob({
      title: '',
      companyName: '',
      location: '',
      salary: '',
      experienceRequired: '',
      description: '',
      jobType: 'Full-time'
    });
    setValidationErrors({});
    setTouched({});
  };

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'title':
        error = validateJobTitle(value);
        break;
      case 'companyName':
        error = validateCompanyName(value);
        break;
      case 'location':
        error = validateLocation(value);
        break;
      case 'salary':
        error = validateSalary(value);
        break;
      case 'experienceRequired':
        error = validateExperience(value);
        break;
      case 'description':
        error = validateDescription(value, 10, 5000);
        break;
      default:
        break;
    }
    
    setValidationErrors(prev => ({ ...prev, [name]: error || '' }));
    return error === null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJob({ ...newJob, [name]: value });
    
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, value);
  };

  const handleCreateJob = async () => {
    const errors = {
      title: validateJobTitle(newJob.title),
      companyName: validateCompanyName(newJob.companyName),
      location: validateLocation(newJob.location),
      salary: validateSalary(newJob.salary),
      experienceRequired: validateExperience(newJob.experienceRequired),
      description: validateDescription(newJob.description, 10, 5000)
    };
    
    const filteredErrors = Object.fromEntries(
      Object.entries(errors).filter(([_, value]) => value !== null)
    );
    
    if (Object.keys(filteredErrors).length > 0) {
      setValidationErrors(filteredErrors);
      setTouched({
        title: true,
        companyName: true,
        location: true,
        salary: true,
        experienceRequired: true,
        description: true
      });
      setMessage('Please fix all validation errors before submitting');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    try {
      await API.post('/admin/jobs', newJob);
      setMessage('Job created successfully');
      handleCloseDialog();
      fetchJobs();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error creating job');
    }
  };

  const getJobTypeColor = (type) => {
    const colors = {
      'Full-time': '#E8920C',
      'Part-time': '#f093fb',
      'Contract': '#4facfe',
      'Internship': '#43e97b'
    };
    return colors[type] || '#E8920C';
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getFilteredAndSortedJobs = () => {
    let filtered = jobs.filter(job =>
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.jobType?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Handle numeric values for salary
        if (sortConfig.key === 'salary') {
          aVal = parseFloat(aVal) || 0;
          bVal = parseFloat(bVal) || 0;
        } else if (sortConfig.key === 'applicants') {
          aVal = a.applicants?.length || 0;
          bVal = b.applicants?.length || 0;
        } else {
          aVal = String(aVal || '').toLowerCase();
          bVal = String(bVal || '').toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  };

  const filteredJobs = getFilteredAndSortedJobs();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedJobs = filteredJobs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
          <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="#1e293b" gutterBottom>
                Job Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create, manage, and monitor job postings
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{
                background: 'linear-gradient(135deg, #E8920C 0%, #C67A08 100%)',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                whiteSpace: 'nowrap',
                '&:hover': {
                  boxShadow: '0 6px 28px rgba(102, 126, 234, 0.5)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Create New Job
            </Button>
          </Box>
        </Fade>

        {message && (
          <Fade in timeout={400}>
            <Alert
              severity={message.includes('successfully') ? 'success' : 'error'}
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setMessage('')}
            >
              {message}
            </Alert>
          </Fade>
        )}

        <Fade in timeout={600}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 300px', maxWidth: { xs: '100%', md: '500px' } }}>
                <TextField
                  fullWidth
                  placeholder="Search jobs by title, company, location, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ 
                        background: 'linear-gradient(135deg, #E8920C 0%, #C67A08 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        mr: 1,
                        fontSize: '1.4rem'
                      }} />
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.9)',
                      '& fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.1)'
                      },
                      '&:hover fieldset': {
                        borderColor: '#E8920C'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#E8920C'
                      }
                    }
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Showing {paginatedJobs.length} of {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
                {searchQuery && ` (filtered from ${jobs.length} total)`}
              </Typography>
            </Box>
          </Box>
        </Fade>

        <Fade in timeout={800}>
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
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell 
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: '#475569', 
                        py: 1.5,
                        cursor: 'pointer',
                        userSelect: 'none',
                        bgcolor: sortConfig.key === 'title' ? alpha('#E8920C', 0.08) : 'transparent',
                        '&:hover': { bgcolor: alpha('#E8920C', 0.12) },
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleSort('title')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        Job Title
                        {sortConfig.key === 'title' && (
                          sortConfig.direction === 'asc' 
                            ? <ArrowUpwardIcon fontSize="medium" sx={{ color: '#E8920C', fontWeight: 900 }} />
                            : <ArrowDownwardIcon fontSize="medium" sx={{ color: '#E8920C', fontWeight: 900 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: '#475569',
                        py: 1.5,
                        cursor: 'pointer',
                        userSelect: 'none',
                        bgcolor: sortConfig.key === 'companyName' ? alpha('#E8920C', 0.08) : 'transparent',
                        '&:hover': { bgcolor: alpha('#E8920C', 0.12) },
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleSort('companyName')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        Company
                        {sortConfig.key === 'companyName' && (
                          sortConfig.direction === 'asc' 
                            ? <ArrowUpwardIcon fontSize="medium" sx={{ color: '#E8920C', fontWeight: 900 }} />
                            : <ArrowDownwardIcon fontSize="medium" sx={{ color: '#E8920C', fontWeight: 900 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: '#475569',
                        py: 1.5,
                        cursor: 'pointer',
                        userSelect: 'none',
                        bgcolor: sortConfig.key === 'location' ? alpha('#E8920C', 0.08) : 'transparent',
                        '&:hover': { bgcolor: alpha('#E8920C', 0.12) },
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleSort('location')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        Location
                        {sortConfig.key === 'location' && (
                          sortConfig.direction === 'asc' 
                            ? <ArrowUpwardIcon fontSize="medium" sx={{ color: '#E8920C', fontWeight: 900 }} />
                            : <ArrowDownwardIcon fontSize="medium" sx={{ color: '#E8920C', fontWeight: 900 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: '#475569',
                        py: 1.5,
                        cursor: 'pointer',
                        userSelect: 'none',
                        bgcolor: sortConfig.key === 'salary' ? alpha('#E8920C', 0.08) : 'transparent',
                        '&:hover': { bgcolor: alpha('#E8920C', 0.12) },
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleSort('salary')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        Salary
                        {sortConfig.key === 'salary' && (
                          sortConfig.direction === 'asc' 
                            ? <ArrowUpwardIcon fontSize="medium" sx={{ color: '#E8920C', fontWeight: 900 }} />
                            : <ArrowDownwardIcon fontSize="medium" sx={{ color: '#E8920C', fontWeight: 900 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: '#475569',
                        py: 1.5,
                        cursor: 'pointer',
                        userSelect: 'none',
                        bgcolor: sortConfig.key === 'jobType' ? alpha('#E8920C', 0.08) : 'transparent',
                        '&:hover': { bgcolor: alpha('#E8920C', 0.12) },
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleSort('jobType')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        Type
                        {sortConfig.key === 'jobType' && (
                          sortConfig.direction === 'asc' 
                            ? <ArrowUpwardIcon fontSize="medium" sx={{ color: '#E8920C', fontWeight: 900 }} />
                            : <ArrowDownwardIcon fontSize="medium" sx={{ color: '#E8920C', fontWeight: 900 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: '#475569',
                        py: 1.5,
                        cursor: 'pointer',
                        userSelect: 'none',
                        bgcolor: sortConfig.key === 'applicants' ? alpha('#E8920C', 0.08) : 'transparent',
                        '&:hover': { bgcolor: alpha('#E8920C', 0.12) },
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleSort('applicants')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        Applicants
                        {sortConfig.key === 'applicants' && (
                          sortConfig.direction === 'asc' 
                            ? <ArrowUpwardIcon fontSize="medium" sx={{ color: '#E8920C', fontWeight: 900 }} />
                            : <ArrowDownwardIcon fontSize="medium" sx={{ color: '#E8920C', fontWeight: 900 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', py: 1.5 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedJobs.length > 0 ? (
                    paginatedJobs.map((job, index) => (
                      <TableRow
                        key={job._id}
                        sx={{
                          '&:hover': { bgcolor: alpha('#E8920C', 0.02) },
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <TableCell sx={{ py: 1 }}>
                          <Typography fontWeight={600} fontSize="0.875rem" color="#1e293b">
                            {job.title}
                          </Typography>
                          <Typography variant="caption" fontSize="0.75rem" color="text.secondary">
                            {job.experienceRequired === 0 ? 'Fresher' : `${job.experienceRequired} yrs exp`}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1, fontSize: '0.875rem' }}>{job.companyName}</TableCell>
                        <TableCell sx={{ py: 1, fontSize: '0.875rem' }}>{job.location}</TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Typography fontWeight={600} fontSize="0.875rem" color="#E8920C">
                            ₹{job.salary?.toLocaleString('en-IN')}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Chip
                            label={job.jobType}
                            size="small"
                            sx={{
                              bgcolor: alpha(getJobTypeColor(job.jobType), 0.1),
                              color: getJobTypeColor(job.jobType),
                              fontWeight: 600,
                              borderRadius: 1.5
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Chip
                            label={job.applicants?.length || 0}
                            size="small"
                            sx={{
                              bgcolor: alpha('#E8920C', 0.15),
                              color: '#E8920C',
                              fontWeight: 700,
                              border: '1px solid',
                              borderColor: alpha('#E8920C', 0.2)
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/admin-jobs/${job._id}/applicants`)}
                              sx={{
                                bgcolor: alpha('#E8920C', 0.12),
                                color: '#E8920C',
                                border: '1.5px solid',
                                borderColor: alpha('#E8920C', 0.2),
                                '&:hover': {
                                  bgcolor: alpha('#E8920C', 0.2),
                                  borderColor: '#E8920C',
                                  transform: 'scale(1.05)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(job._id)}
                              sx={{
                                bgcolor: alpha('#dc2626', 0.12),
                                color: '#dc2626',
                                border: '1.5px solid',
                                borderColor: alpha('#dc2626', 0.2),
                                '&:hover': {
                                  bgcolor: alpha('#dc2626', 0.2),
                                  borderColor: '#dc2626',
                                  transform: 'scale(1.05)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            p: 2.5,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%)',
                            mb: 2
                          }}
                        >
                          <WorkIcon 
                            sx={{ 
                              fontSize: 48, 
                              background: 'linear-gradient(135deg, #E8920C 0%, #C67A08 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }} 
                          />
                        </Box>
                        <Typography color="text.secondary" fontWeight={500}>
                          No jobs available. Create your first job posting.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredJobs.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50]}
              sx={{
                borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                '.MuiTablePagination-select': {
                  borderRadius: 1
                }
              }}
            />
          </Paper>
        </Fade>

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.15)'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1, fontWeight: 700, fontSize: '1.5rem' }}>
            Create New Job
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Job Title"
              name="title"
              value={newJob.title}
              onChange={handleInputChange}
              onBlur={handleBlur}
              margin="normal"
              required
              error={touched.title && !!validationErrors.title}
              helperText={touched.title && validationErrors.title}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Company Name"
              name="companyName"
              value={newJob.companyName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              margin="normal"
              required
              error={touched.companyName && !!validationErrors.companyName}
              helperText={touched.companyName && validationErrors.companyName}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={newJob.location}
              onChange={handleInputChange}
              onBlur={handleBlur}
              margin="normal"
              required
              error={touched.location && !!validationErrors.location}
              helperText={touched.location && validationErrors.location}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Salary"
              name="salary"
              type="number"
              value={newJob.salary}
              onChange={handleInputChange}
              onBlur={handleBlur}
              margin="normal"
              required
              error={touched.salary && !!validationErrors.salary}
              helperText={touched.salary && validationErrors.salary}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Experience Required (years)"
              name="experienceRequired"
              type="number"
              value={newJob.experienceRequired}
              onChange={handleInputChange}
              onBlur={handleBlur}
              margin="normal"
              required
              error={touched.experienceRequired && !!validationErrors.experienceRequired}
              helperText={touched.experienceRequired && validationErrors.experienceRequired}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              select
              label="Job Type"
              name="jobType"
              value={newJob.jobType}
              onChange={handleInputChange}
              margin="normal"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              <MenuItem value="Full-time">Full-time</MenuItem>
              <MenuItem value="Part-time">Part-time</MenuItem>
              <MenuItem value="Contract">Contract</MenuItem>
              <MenuItem value="Internship">Internship</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={newJob.description}
              onChange={handleInputChange}
              onBlur={handleBlur}
              margin="normal"
              multiline
              rows={4}
              required
              error={touched.description && !!validationErrors.description}
              helperText={touched.description && validationErrors.description}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateJob}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #E8920C 0%, #C67A08 100%)',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                borderRadius: 2,
                '&:hover': {
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)'
                }
              }}
            >
              Create Job
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default AdminJobsPage;
