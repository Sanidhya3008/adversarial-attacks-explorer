import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, Box } from '@mui/material';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import pages
import HomePage from './pages/HomePage';
import AttacksPage from './pages/AttacksPage';
import DefensesPage from './pages/DefensesPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AboutPage from './pages/AboutPage';

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Container component="main" sx={{ mt: 8, mb: 4, flexGrow: 1 }}>
            <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/attacks" element={<AttacksPage />} />
            <Route path="/defenses" element={<DefensesPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/about" element={<AboutPage />} />
            </Routes>
        </Container>
        <Footer />
    </Box>
  );
}

export default App;