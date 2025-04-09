import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Typography,
    Box,
    Button,
    Grid,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Paper
} from '@mui/material';
import MathComponent from '../components/MathJax';

function HomePage() {
    return (
        <Box>
        {/* Hero Section */}
        <Paper 
            elevation={3}
            sx={{ 
            p: 4, 
            mb: 6, 
            borderRadius: 2,
            background: 'linear-gradient(120deg, #3f51b5 0%, #5c6bc0 100%)',
            color: 'white'
            }}
        >
            <Typography variant="h3" component="h1" gutterBottom>
            Adversarial Attacks Explorer
            </Typography>
            <Typography variant="h5" gutterBottom>
            Exploring Vulnerabilities in Neural Networks
            </Typography>
            <Typography variant="body1" paragraph sx={{ maxWidth: '800px' }}>
            Neural networks can be fooled by adversarial examples - inputs that have been
            specifically designed to cause misclassification while appearing unchanged to
            humans. This interactive platform explores how these attacks work and how to
            defend against them.
            </Typography>
            <Box sx={{ mt: 3 }}>
            <Button 
                variant="contained" 
                component={RouterLink}
                to="/attacks"
                color="secondary"
                size="large"
                sx={{ mr: 2 }}
            >
                Explore Attacks
            </Button>
            <Button 
                variant="outlined" 
                component={RouterLink}
                to="/defenses"
                color="inherit"
                size="large"
            >
                Discover Defenses
            </Button>
            </Box>
        </Paper>

        {/* Introduction Section */}
        <Typography variant="h4" component="h2" className="section-title">
            What are Adversarial Attacks?
        </Typography>
        <Typography variant="body1" paragraph>
            Modern deep learning systems achieve remarkable accuracy on many tasks, but
            they can be surprisingly vulnerable to carefully crafted inputs. Adversarial
            attacks exploit these vulnerabilities by adding small, often imperceptible
            perturbations to inputs that cause neural networks to make incorrect predictions.
        </Typography>
        <Box className="math-container">
            <MathComponent
            tex={`\\text{adversarial example} = \\text{original input} + \\text{carefully crafted perturbation}`}
            />
        </Box>
        <Typography variant="body1" paragraph>
            These vulnerabilities raise serious concerns about the deployment of deep learning
            systems in security-critical applications, such as autonomous vehicles, medical
            diagnosis, and biometric authentication.
        </Typography>

        {/* Key Features */}
        <Typography variant="h4" component="h2" className="section-title" sx={{ mt: 6 }}>
            Key Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
            <Card className="result-card" elevation={3}>
                <CardMedia
                component="img"
                height="200"
                image="/static/precomputed/fgsm_robustness.png"
                alt="Adversarial Attacks"
                />
                <CardContent className="result-card-content">
                <Typography variant="h6" component="div" gutterBottom>
                    Interactive Attacks
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Upload your own images and generate adversarial examples using state-of-the-art
                    attack methods like FGSM, PGD, DeepFool, and more.
                </Typography>
                </CardContent>
                <CardActions>
                <Button size="small" component={RouterLink} to="/attacks">Learn More</Button>
                </CardActions>
            </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
            <Card className="result-card" elevation={3}>
                <CardMedia
                component="img"
                height="200"
                image="/static/precomputed/robustness_overview.png"
                alt="Defense Techniques"
                />
                <CardContent className="result-card-content">
                <Typography variant="h6" component="div" gutterBottom>
                    Defense Techniques
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Explore different defense strategies, including adversarial training,
                    defensive distillation, and more, with visualizations of their effectiveness.
                </Typography>
                </CardContent>
                <CardActions>
                <Button size="small" component={RouterLink} to="/defenses">Learn More</Button>
                </CardActions>
            </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
            <Card className="result-card" elevation={3}>
                <CardMedia
                component="img"
                height="200"
                image="/static/precomputed/transferability_matrix.png"
                alt="Technical Insights"
                />
                <CardContent className="result-card-content">
                <Typography variant="h6" component="div" gutterBottom>
                    Technical Insights
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Understand the mathematics behind adversarial attacks, visualize model decision
                    boundaries, and gain insights into what makes neural networks vulnerable.
                </Typography>
                </CardContent>
                <CardActions>
                <Button size="small" component={RouterLink} to="/leaderboard">View Leaderboard</Button>
                </CardActions>
            </Card>
            </Grid>
        </Grid>

        {/* Quick Start */}
        <Typography variant="h4" component="h2" className="section-title" sx={{ mt: 6 }}>
            Quick Start
        </Typography>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="body1" paragraph>
            Ready to explore adversarial attacks and defenses? Here's how to get started:
            </Typography>
            <ol>
            <li>
                <Typography variant="body1" paragraph>
                <strong>Generate Adversarial Examples:</strong> Visit the 
                <Button component={RouterLink} to="/attacks" size="small" sx={{ mx: 1 }}>Attacks</Button> 
                page to upload an image and generate adversarial examples.
                </Typography>
            </li>
            <li>
                <Typography variant="body1" paragraph>
                <strong>Explore Defenses:</strong> Check out the 
                <Button component={RouterLink} to="/defenses" size="small" sx={{ mx: 1 }}>Defenses</Button> 
                page to see how different defensive techniques can mitigate these attacks.
                </Typography>
            </li>
            <li>
                <Typography variant="body1" paragraph>
                <strong>Compare Model Robustness:</strong> View the 
                <Button component={RouterLink} to="/leaderboard" size="small" sx={{ mx: 1 }}>Leaderboard</Button> 
                to compare the robustness of different models against various attacks.
                </Typography>
            </li>
            </ol>
        </Paper>
        </Box>
    );
}

export default HomePage;