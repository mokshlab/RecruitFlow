// src/components/Footer.js
import React from 'react';
import { Box, Container, Typography, Stack } from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1C1917',
        borderTop: '3px solid transparent',
        backgroundImage: 'linear-gradient(#1C1917, #1C1917), linear-gradient(90deg, #0D9488, #F59E0B)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        py: 3,
        textAlign: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={1} alignItems="center">
          {/* Brand mark */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0D9488 0%, #F59E0B 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '11px',
                color: 'white',
                letterSpacing: '-0.5px',
                fontFamily: 'Roboto, Arial, sans-serif',
                flexShrink: 0,
              }}
            >
              RF
            </Box>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 700,
                fontSize: '1rem',
                letterSpacing: '-0.3px',
              }}
            >
              RecruitFlow
            </Typography>
          </Stack>

          {/* Tagline */}
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontStyle: 'italic' }}
          >
            Connecting talent with opportunity, one application at a time.
          </Typography>

          {/* Copyright */}
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', mt: 0.5 }}
          >
            © {currentYear} RecruitFlow. Built by Moksh.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
