// src/pages/AdminAdminsPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
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
  Chip,
  Fade,
  IconButton,
  TablePagination,
  alpha,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  Shield as ShieldIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import AdminLayout from '../components/admin/AdminLayout';

const AdminAdminsPage = () => {
  const navigate = useNavigate();
  const { admin: currentAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [message, setMessage] = useState({ text: '', severity: 'success' });
  const [openDialog, setOpenDialog] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });

  // Redirect non-Super Admins
  useEffect(() => {
    if (currentAdmin && currentAdmin.role !== 'Super Admin') {
      navigate('/admin-dashboard');
    }
  }, [currentAdmin, navigate]);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data } = await API.get('/admin/admins');
      const adminsArray = data?.admins || [];
      setAdmins(Array.isArray(adminsArray) ? adminsArray : []);
      setLoading(false);
    } catch (error) {
      setAdmins([]);
      setLoading(false);
    }
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    
    try {
      await API.delete(`/admin/admins/${adminId}`);
      setMessage({ text: 'Admin deleted successfully', severity: 'success' });
      await fetchAdmins();
      setTimeout(() => setMessage({ text: '', severity: 'success' }), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.msg || 'Error deleting admin';
      setMessage({ text: errorMsg, severity: 'error' });
      setTimeout(() => setMessage({ text: '', severity: 'success' }), 5000);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.username || !newAdmin.password) {
      setMessage({ text: 'Please fill in all fields', severity: 'warning' });
      setTimeout(() => setMessage({ text: '', severity: 'success' }), 3000);
      return;
    }

    setCreating(true);
    try {
      await API.post('/admin/admins', newAdmin);
      setOpenDialog(false);
      setNewAdmin({ username: '', password: '' });
      await fetchAdmins();
      setMessage({ text: 'Admin created successfully', severity: 'success' });
      setTimeout(() => setMessage({ text: '', severity: 'success' }), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.msg || 'Error creating admin';
      setMessage({ text: errorMsg, severity: 'error' });
      setTimeout(() => setMessage({ text: '', severity: 'success' }), 5000);
    } finally {
      setCreating(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getFilteredAndSortedAdmins = () => {
    let filtered = admins.filter(admin =>
      admin.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = String(a[sortConfig.key] || '').toLowerCase();
        let bVal = String(b[sortConfig.key] || '').toLowerCase();

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  };

  const filteredAdmins = getFilteredAndSortedAdmins();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedAdmins = filteredAdmins.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
                Admin Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage administrator accounts and permissions
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
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
              Create Admin
            </Button>
          </Box>
        </Fade>

        {message.text && (
          <Fade in timeout={400}>
            <Alert
              severity={message.severity}
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setMessage({ text: '', severity: 'success' })}
            >
              {message.text}
            </Alert>
          </Fade>
        )}

        <Fade in timeout={600}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 300px', maxWidth: { xs: '100%', md: '500px' } }}>
                <TextField
                  fullWidth
                  placeholder="Search admins by username or role..."
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
                Showing {paginatedAdmins.length} of {filteredAdmins.length} {filteredAdmins.length === 1 ? 'admin' : 'admins'}
                {searchQuery && ` (filtered from ${admins.length} total)`}
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
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', py: 1.5 }}>Admin</TableCell>
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
                        bgcolor: sortConfig.key === 'username' ? alpha('#E8920C', 0.08) : 'transparent',
                        '&:hover': { bgcolor: alpha('#E8920C', 0.12) },
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleSort('username')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        Username
                        {sortConfig.key === 'username' && (
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
                        bgcolor: sortConfig.key === 'role' ? alpha('#E8920C', 0.08) : 'transparent',
                        '&:hover': { bgcolor: alpha('#E8920C', 0.12) },
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleSort('role')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        Role
                        {sortConfig.key === 'role' && (
                          sortConfig.direction === 'asc' 
                            ? <ArrowUpwardIcon fontSize="medium" sx={{ color: '#E8920C' }} />
                            : <ArrowDownwardIcon fontSize="medium" sx={{ color: '#E8920C' }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', py: 1.5 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(paginatedAdmins) && paginatedAdmins.map((admin) => (
                    <TableRow
                      key={admin._id}
                      sx={{
                        '&:hover': { bgcolor: alpha('#E8920C', 0.02) },
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <TableCell sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: admin.isDefault 
                                ? 'linear-gradient(135deg, #E8920C 0%, #C67A08 100%)'
                                : alpha('#E8920C', 0.1),
                              color: admin.isDefault ? 'white' : '#E8920C',
                              fontWeight: 700,
                              border: admin.isDefault ? '2px solid #E8920C' : 'none'
                            }}
                          >
                            {admin.isDefault ? <ShieldIcon /> : admin.username?.charAt(0).toUpperCase()}
                          </Avatar>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Typography fontWeight={600} fontSize="0.875rem" color="#1e293b">
                          {admin.username}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        {admin.isDefault ? (
                          <Chip
                            label="Super Admin"
                            size="small"
                            icon={<ShieldIcon />}
                            sx={{
                              background: 'linear-gradient(135deg, #E8920C 0%, #C67A08 100%)',
                              color: 'white',
                              fontWeight: 700,
                              borderRadius: 1.5
                            }}
                          />
                        ) : (
                          <Chip
                            label="Administrator"
                            size="small"
                            icon={<AdminIcon />}
                            sx={{
                              bgcolor: alpha('#E8920C', 0.1),
                              color: '#E8920C',
                              fontWeight: 600,
                              borderRadius: 1.5
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        {!admin.isDefault ? (
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(admin._id)}
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
                        ) : (
                          <Chip
                            label="Protected"
                            size="small"
                            sx={{
                              bgcolor: alpha('#22c55e', 0.1),
                              color: '#22c55e',
                              fontWeight: 600
                            }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredAdmins.length}
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

            {admins.length === 0 && (
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
                  <AdminIcon 
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
                  No administrators found
                </Typography>
                <Typography color="text.secondary">
                  Create your first admin account to get started
                </Typography>
              </Box>
            )}
          </Paper>
        </Fade>

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.15)'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1, fontWeight: 700, fontSize: '1.5rem' }}>
            Create New Admin
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Username"
              value={newAdmin.username}
              onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
              margin="normal"
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              margin="normal"
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={() => setOpenDialog(false)}
              disabled={creating}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAdmin}
              variant="contained"
              disabled={creating}
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
              {creating ? <CircularProgress size={24} color="inherit" /> : 'Create Admin'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default AdminAdminsPage;
