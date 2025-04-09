import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Button, 
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Box,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Menu as MenuIcon,
    Home as HomeIcon,
    Security as SecurityIcon,
    BugReport as BugReportIcon,
    Equalizer as EqualizerIcon,
    Info as InfoIcon
} from '@mui/icons-material';

const navItems = [
    { label: 'Home', path: '/', icon: <HomeIcon /> },
    { label: 'Attacks', path: '/attacks', icon: <BugReportIcon /> },
    { label: 'Defenses', path: '/defenses', icon: <SecurityIcon /> },
    { label: 'Leaderboard', path: '/leaderboard', icon: <EqualizerIcon /> },
    { label: 'About', path: '/about', icon: <InfoIcon /> }
];

function Navbar() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const drawer = (
        <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={handleDrawerToggle}
        >
            <List>
                {navItems.map((item) => (
                <ListItem 
                    button 
                    key={item.label} 
                    component={RouterLink} 
                    to={item.path}
                    selected={location.pathname === item.path}
                >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <AppBar position="fixed" sx={{ 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            backgroundColor: '#3f51b5'
        }}>
        <Toolbar>
            {isMobile && (
            <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
            >
                <MenuIcon />
            </IconButton>
            )}
            <Typography variant="h6" component="div" sx={{ 
            flexGrow: 1, 
            fontWeight: 'bold',
            letterSpacing: '0.5px'
            }}>
            Adversarial Attacks Explorer
            </Typography>
            
            {!isMobile && (
            <Box>
                {navItems.map((item) => (
                <Button
                    key={item.label}
                    component={RouterLink}
                    to={item.path}
                    color="inherit"
                    sx={{ 
                    mx: 1,
                    fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                    borderBottom: location.pathname === item.path ? '2px solid white' : 'none',
                    fontSize: '1rem',
                    padding: '6px 16px',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                    }}
                    startIcon={item.icon}
                >
                    {item.label}
                </Button>
                ))}
            </Box>
            )}
        </Toolbar>
        
        <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={handleDrawerToggle}
        >
            {drawer}
        </Drawer>
        </AppBar>
    );
}

export default Navbar;