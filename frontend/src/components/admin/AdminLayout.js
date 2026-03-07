// src/components/admin/AdminLayout.js

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  alpha,
  Badge
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useSocket } from '../../context/SocketContext';

const drawerWidth = 260;

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logout } = useAuth();
  const { notifications } = useSocket();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin-dashboard' },
    { text: 'Jobs', icon: <WorkIcon />, path: '/admin-jobs' },
    { text: 'Users', icon: <PeopleIcon />, path: '/admin-users' },
    { text: 'Admins', icon: <AdminIcon />, path: '/admin-admins', superAdminOnly: true }
  ];

  // Filter menu items based on admin role
  const visibleMenuItems = menuItems.filter(item => 
    !item.superAdminOnly || admin?.role === 'Super Admin'
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
          color: 'white'
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AdminIcon /> Admin Portal
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          RecruitFlow Platform
        </Typography>
      </Box>

      {/* Admin Profile Section */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ 
            width: 40, 
            height: 40, 
            background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
            fontWeight: 700
          }}>
            {admin?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={600} noWrap>
              {admin?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {admin?.role || 'Administrator'}
            </Typography>
          </Box>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Box>
      </Box>

      <List sx={{ flex: 1, px: 2, pt: 2 }}>
        {visibleMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: alpha('#F59E0B', 0.12),
                  color: '#F59E0B',
                  '&:hover': {
                    bgcolor: alpha('#F59E0B', 0.18)
                  }
                },
                '&:hover': {
                  bgcolor: alpha('#F59E0B', 0.08)
                }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />
      
      {/* Logout Button */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: '#dc2626',
            '&:hover': {
              bgcolor: alpha('#dc2626', 0.08)
            }
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            primaryTypographyProps={{ fontWeight: 600 }}
          />
        </ListItemButton>
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, mt: 1, display: 'block' }}>
          Version 1.2.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Mobile Menu Button - Floating */}
      <IconButton
        onClick={handleDrawerToggle}
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1300,
          bgcolor: 'white',
          boxShadow: 2,
          '&:hover': {
            bgcolor: 'white',
            boxShadow: 4
          }
        }}
      >
        <MenuIcon />
      </IconButton>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: '2px 0 8px rgba(0, 0, 0, 0.04)'
            }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
