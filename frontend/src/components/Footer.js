import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';

function Footer() {
  return (
    <Box 
        component="footer" 
        sx={{ 
        py: 4, 
        px: 2, 
        mt: 'auto', 
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #e0e0e0'
        }}
    >
        <Container maxWidth="lg">
        <Typography variant="body1" color="text.secondary" align="center" sx={{ fontWeight: 500 }}>
            {'© '}
            {new Date().getFullYear()}
            {' Adversarial Attacks Explorer | '}
            <Link color="primary" href="https://github.com" target="_blank" rel="noopener" sx={{ fontWeight: 'bold' }}>
            GitHub
            </Link>
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            Built with PyTorch, ART, React, and Flask
        </Typography>
        </Container>
    </Box>
  );
}

export default Footer;