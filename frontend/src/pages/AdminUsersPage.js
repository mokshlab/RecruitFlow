// src/pages/AdminUsersPage.js

import React, { useState, useEffect } from 'react';
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
  Alert,
  Chip,
  Fade,
  IconButton,
  TextField,
  TablePagination,
  alpha
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Description as ResumeIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import AdminLayout from '../components/admin/AdminLayout';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState({ url: '', name: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/admin/users');
      const usersArray = data?.users || [];
      setUsers(Array.isArray(usersArray) ? usersArray : []);
      setLoading(false);
    } catch (error) {
      setUsers([]);
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await API.delete(`/admin/users/${userId}`);
      setMessage('User deleted successfully');
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error deleting user');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getFilteredAndSortedUsers = () => {
    let filtered = users.filter(user =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.gender?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Handle numeric values for experience
        if (sortConfig.key === 'experience') {
          aVal = parseFloat(aVal) || 0;
          bVal = parseFloat(bVal) || 0;
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

  const filteredUsers = getFilteredAndSortedUsers();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
              User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage registered users on your platform
            </Typography>
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
                  placeholder="Search users by name, email, phone, or gender..."
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
                Showing {paginatedUsers.length} of {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
                {searchQuery && ` (filtered from ${users.length} total)`}
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
                        bgcolor: sortConfig.key === 'name' ? alpha('#E8920C', 0.08) : 'transparent',
                        '&:hover': { bgcolor: alpha('#E8920C', 0.12) },
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleSort('name')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        User
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
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', py: 1.5 }}>Phone</TableCell>
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
                        transition: 'all 0.2s ease'
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
                        transition: 'all 0.2s ease'
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
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', py: 1.5 }}>Resume</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', py: 1.5 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                      <TableRow
                        key={user._id}
                        sx={{
                          '&:hover': { bgcolor: alpha('#E8920C', 0.02) },
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <TableCell sx={{ py: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              src={
                                user.profilePhoto
                                  ? user.profilePhoto.startsWith('http')
                                    ? user.profilePhoto
                                    : `${process.env.REACT_APP_API_BASE_URL?.replace('/api', '')}/${user.profilePhoto}`
                                  : undefined
                              }
                              sx={{
                                width: 32,
                                height: 32,
                                border: '2px solid #e2e8f0',
                                bgcolor: alpha('#E8920C', 0.1),
                                color: '#E8920C',
                                fontWeight: 600
                              }}
                            >
                              {user.name?.charAt(0)}
                            </Avatar>
                            <Typography fontWeight={600} fontSize="0.875rem" color="#1e293b">
                              {user.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1, fontSize: '0.875rem', color: 'text.secondary' }}>{user.email}</TableCell>
                        <TableCell sx={{ py: 1, fontSize: '0.875rem' }}>{user.phone || 'N/A'}</TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Chip
                            label={`${user.experience || 0} years`}
                            size="small"
                            sx={{
                              bgcolor: alpha('#E8920C', 0.1),
                              color: '#E8920C',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1, fontSize: '0.875rem' }}>{user.gender || 'Not specified'}</TableCell>
                        <TableCell sx={{ py: 1 }}>
                          {user.resume ? (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ResumeIcon />}
                              onClick={() => {
                                setSelectedPdf({ url: user.resume, name: `${user.name}'s Resume` });
                                setPdfViewerOpen(true);
                              }}
                              sx={{
                                textTransform: 'none',
                                borderColor: '#E8920C',
                                color: '#E8920C',
                                fontWeight: 600,
                                '&:hover': {
                                  borderColor: '#C67A08',
                                  bgcolor: alpha('#E8920C', 0.04)
                                }
                              }}
                            >
                              View
                            </Button>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              No resume
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(user._id)}
                            sx={{
                              bgcolor: alpha('#dc2626', 0.1),
                              color: '#dc2626',
                              '&:hover': {
                                bgcolor: alpha('#dc2626', 0.2)
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
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
                          <PeopleIcon 
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
                          No users registered yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredUsers.length}
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

export default AdminUsersPage;
