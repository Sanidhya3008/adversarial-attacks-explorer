import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create a theme
// Create a theme
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#3f51b5',
            light: '#757de8',
            dark: '#002984',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#f50057',
            light: '#ff4081',
            dark: '#c51162',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f7f9fc',
            paper: '#ffffff',
        },
        text: {
            primary: '#212121',
            secondary: '#555555',
        },
        error: {
            main: '#f44336',
        },
        warning: {
            main: '#ff9800',
        },
        info: {
            main: '#2196f3',
        },
        success: {
            main: '#4caf50',
        },
    },
    typography: {
        fontFamily: [
            'Roboto',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Arial',
            'sans-serif',
        ].join(','),
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
        },
        body2: {
            lineHeight: 1.6,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
            root: {
                textTransform: 'none',
                fontWeight: 500,
            },
            contained: {
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            },
            },
        },
        MuiCard: {
            styleOverrides: {
            root: {
                overflow: 'hidden',
            },
            },
        },
        MuiPaper: {
            styleOverrides: {
            rounded: {
                borderRadius: 8,
            },
            },
        },
    },
});

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root')
);