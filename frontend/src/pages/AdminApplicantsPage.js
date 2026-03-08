// src/pages/AdminApplicantsPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';
import PdfViewer from '../components/PdfViewer';
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
  Avatar,
  MenuItem,
  Select,
  FormControl,
  Chip,
  Fade,
  alpha,
  TablePagination,
  TextField
} from '@mui/material';
import {
  Description as ResumeIcon,
  Assignment as ApplicationIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  CheckCircle as CheckCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  FiberManualRecord as FiberManualRecordIcon
} from '@mui/icons-material';
import AdminLayout from '../components/admin/AdminLayout';

const AdminApplicantsPage = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState({ url: '', name: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchApplicants = useCallback(async () => {
    try {
      const { data } = await API.get(`/admin/jobs/${jobId}/applicants`);
      setJob(data?.job || null);
      const applicantsList = data?.applicants || [];
      const mappedApplicants = Array.isArray(applicantsList) 
        ? applicantsList.map(app => ({
            ...app,
            status: app.status || 'Pending'
          }))
        : [];
      setApplicants(mappedApplicants);
      setLoading(false);
    } catch (error) {
      setApplicants([]);
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const handleStatusChange = async (applicantId, newStatus) => {
    try {
      await API.patch(`/admin/jobs/${jobId}/applicants/${applicantId}/status`, {
        status: newStatus
      });
      
      setApplicants(applicants.map(app => 
        app._id === applicantId ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      alert('Failed to update status. Please try again.');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getFilteredAndSortedApplicants = () => {
    let filtered = applicants.filter(app => {
      const search = searchQuery.toLowerCase();
      return (
        app.name?.toLowerCase().includes(search) ||
        app.email?.toLowerCase().includes(search) ||
        app.status?.toLowerCase().includes(search) ||
        app.gender?.toLowerCase().includes(search)
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'experience') {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
        }

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal?.toLowerCase() || '';
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  };

  const filteredApplicants = getFilteredAndSortedApplicants();
  const paginatedApplicants = filteredApplicants.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#6b7280',
      'Under Review': '#0D9488',
      'Shortlisted': '#16a34a',
      'Rejected': '#dc2626'
    };
    return colors[status] || '#6b7280';
  };

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
              {job?.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="body1" color="text.secondary">
                {job?.companyName}
              </Typography>
              {job?.location && (
                <Chip
                  label={job.location}
                  size="small"
                  sx={{
                    bgcolor: alpha('#E8920C', 0.1),
                    color: '#E8920C',
                    fontWeight: 600
                  }}
                />
              )}
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha('#E8920C', 0.1),
                  color: '#E8920C',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  border: '1px solid',
                  borderColor: alpha('#E8920C', 0.2),
                  borderRadius: '16px',
                  px: 1.5,
                  py: 0.5,
                  height: '24px',
                  lineHeight: 1
                }}
              >
                {applicants.length} Applicants
              </Box>
            </Box>
          </Box>
        </Fade>

        <Fade in timeout={600}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 300px', maxWidth: { xs: '100%', md: '500px' } }}>
                <TextField
                  fullWidth
                  placeholder="Search applicants by name, email, status, or gender..."
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
                Showing {paginatedApplicants.length} of {filteredApplicants.length} {filteredApplicants.length === 1 ? 'applicant' : 'applicants'}
                {searchQuery && ` (filtered from ${applicants.length} total)`}
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
            {applicants.length > 0 ? (
              <>
              <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%' }}>
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
                          bgcolor: sortConfig.key === 'name' ? alpha('#E8920C', 0.08) : 'transparent',
                          '&:hover': { bgcolor: alpha('#E8920C', 0.12) },
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => handleSort('name')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          Applicant
                          {sortConfig.key === 'name' && (
                            sortConfig.direction === 'asc' 
                              ? <ArrowUpwardIcon fontSize="medium" sx={{ color: '#E8920C' }} />
                              : <ArrowDownwardIcon fontSize="medium" sx={{ color: '#E8920C' }} />
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
                          bgcolor: sortConfig.key === 'email' ? alpha('#E8920C', 0.08) : 'transparent',
                          '&:hover': { bgcolor: alpha('#E8920C', 0.12) },
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => handleSort('email')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          Email
                          {sortConfig.key === 'email' && (
                            sortConfig.direction === 'asc' 
                              ? <ArrowUpwardIcon fontSize="medium" sx={{ color: '#E8920C' }} />
                              : <ArrowDownwardIcon fontSize="medium" sx={{ color: '#E8920C' }} />
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
                          bgcolor: sortConfig.key === 'experience' ? alpha('#E8920C', 0.08) : 'transparent',
                          '&:hover': { bgcolor: alpha('#E8920C', 0.12) },
                          transition: 'all 0.2s ease',
                          minWidth: { xs: 70, md: 100 }
                        }}
                        onClick={() => handleSort('experience')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          Experience
                          {sortConfig.key === 'experience' && (
                            sortConfig.direction === 'asc' 
                              ? <ArrowUpwardIcon fontSize="medium" sx={{ color: '#E8920C' }} />
                              : <ArrowDownwardIcon fontSize="medium" sx={{ color: '#E8920C' }} />
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
                          bgcolor: sortConfig.key === 'gender' ? alpha('#E8920C', 0.08) : 'transparent',
                          '&:hover': { bgcolor: alpha('#E8920C', 0.12) },
                          transition: 'all 0.2s ease',
                          display: { xs: 'none', md: 'table-cell' }
                        }}
                        onClick={() => handleSort('gender')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          Gender
                          {sortConfig.key === 'gender' && (
                            sortConfig.direction === 'asc' 
                              ? <ArrowUpwardIcon fontSize="medium" sx={{ color: '#E8920C' }} />
                              : <ArrowDownwardIcon fontSize="medium" sx={{ color: '#E8920C' }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', py: 1.5, display: { xs: 'none', lg: 'table-cell' } }}>Phone</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', py: 1.5 }}>Resume</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', py: 1.5, minWidth: { xs: 140, md: 180 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer' }} onClick={() => handleSort('status')}>
                          Status
                          {sortConfig.key === 'status' && (
                            sortConfig.direction === 'asc' 
                              ? <ArrowUpwardIcon fontSize="medium" sx={{ color: '#E8920C' }} />
                              : <ArrowDownwardIcon fontSize="medium" sx={{ color: '#E8920C' }} />
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedApplicants.map((applicant) => (
                      <TableRow
                        key={applicant._id}
                        sx={{
                          '&:hover': { bgcolor: alpha('#E8920C', 0.02) },
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <TableCell sx={{ py: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              src={applicant.profilePhoto || undefined}
                              sx={{
                                width: 32,
                                height: 32,
                                border: '2px solid #e2e8f0',
                                bgcolor: alpha('#E8920C', 0.1),
                                color: '#E8920C',
                                fontWeight: 600
                              }}
                            >
                              {applicant.name?.charAt(0)}
                            </Avatar>
                            <Typography fontWeight={600} fontSize="0.875rem" color="#1e293b">
                              {applicant.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1, fontSize: '0.875rem', color: 'text.secondary', maxWidth: { xs: 150, md: 250 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{applicant.email}</TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Chip
                            label={`${applicant.experience} yrs`}
                            size="small"
                            sx={{
                              bgcolor: alpha('#E8920C', 0.12),
                              color: '#E8920C',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              border: '1px solid',
                              borderColor: alpha('#E8920C', 0.2)
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1, fontSize: '0.875rem', display: { xs: 'none', md: 'table-cell' } }}>{applicant.gender || 'N/A'}</TableCell>
                        <TableCell sx={{ py: 1, fontSize: '0.875rem', display: { xs: 'none', lg: 'table-cell' } }}>{applicant.phone || 'N/A'}</TableCell>
                        <TableCell sx={{ py: 1 }}>
                          {applicant.resume ? (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ResumeIcon fontSize="small" />}
                              onClick={() => {
                                setSelectedPdf({ url: applicant.resume, name: `${applicant.name}'s Resume` });
                                setPdfViewerOpen(true);
                              }}
                              sx={{
                                textTransform: 'none',
                                borderColor: '#E8920C',
                                color: '#E8920C',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                border: '1.5px solid',
                                borderRadius: 1.5,
                                '&:hover': {
                                  borderColor: '#E8920C',
                                  bgcolor: alpha('#E8920C', 0.08),
                                  transform: 'scale(1.02)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              View
                            </Button>
                          ) : (
                            <Typography variant="caption" fontSize="0.75rem" color="text.secondary">
                              No resume
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={applicant.status || 'Pending'}
                              onChange={(e) => handleStatusChange(applicant._id, e.target.value)}
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                color: getStatusColor(applicant.status),
                                borderRadius: 2,
                                '& .MuiSelect-select': {
                                  py: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#E8920C',
                                  borderWidth: 2
                                }
                              }}
                            >
                              <MenuItem value="Pending" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <FiberManualRecordIcon sx={{ fontSize: 12, color: '#6b7280' }} />
                                  <span>Pending</span>
                                </Box>
                              </MenuItem>
                              <MenuItem value="Under Review" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <FiberManualRecordIcon sx={{ fontSize: 12, color: '#0D9488' }} />
                                  <span>Under Review</span>
                                </Box>
                              </MenuItem>
                              <MenuItem value="Shortlisted" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <CheckCircleIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                                  <span>Shortlisted</span>
                                </Box>
                              </MenuItem>
                              <MenuItem value="Rejected" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <RemoveCircleIcon sx={{ fontSize: 16, color: '#dc2626' }} />
                                  <span>Not Selected</span>
                                </Box>
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredApplicants.length}
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
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 12 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    p: 3,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%)',
                    mb: 3
                  }}
                >
                  <ApplicationIcon 
                    sx={{ 
                      fontSize: 64, 
                      background: 'linear-gradient(135deg, #E8920C 0%, #C67A08 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }} 
                  />
                </Box>
                <Typography variant="h6" color="text.secondary" gutterBottom fontWeight={600}>
                  No applicants yet
                </Typography>
                <Typography color="text.secondary" fontSize="0.875rem">
                  This job hasn't received any applications.
                </Typography>
              </Box>
            )}
          </Paper>
        </Fade>

        <PdfViewer
          open={pdfViewerOpen}
          onClose={() => setPdfViewerOpen(false)}
          pdfUrl={selectedPdf.url}
          title={selectedPdf.name}
        />
      </Box>
    </AdminLayout>
  );
};

export default AdminApplicantsPage;
