import React from 'react';
import {
    Typography,
    Box,
    Grid,
    Paper,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Link
} from '@mui/material';
import {
    Code as CodeIcon,
    School as SchoolIcon,
    Security as SecurityIcon,
    BugReport as BugReportIcon,
    Info as InfoIcon,
    AccountTree as AccountTreeIcon
} from '@mui/icons-material';

function AboutPage() {
    return (
        <Box>
        <Typography variant="h4" component="h1" gutterBottom>
            About This Project
        </Typography>
        
        <Typography variant="body1" paragraph>
            This interactive web application demonstrates and explains adversarial attacks on neural networks. It provides a hands-on way to explore how adversarial examples can fool deep learning models and how different defense strategies can mitigate these vulnerabilities.
        </Typography>
        
        <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom className="section-title">
                Project Goals
                </Typography>
                
                <List>
                <ListItem>
                    <ListItemIcon>
                    <SchoolIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                    primary="Education" 
                    secondary="Provide a clear, interactive explanation of adversarial attacks and defenses for those familiar with deep learning."
                    />
                </ListItem>
                
                <ListItem>
                    <ListItemIcon>
                    <BugReportIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                    primary="Visualization" 
                    secondary="Offer dynamic visualizations of adversarial perturbations and model behavior to build intuition."
                    />
                </ListItem>
                
                <ListItem>
                    <ListItemIcon>
                    <SecurityIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                    primary="Defense Analysis" 
                    secondary="Compare different defensive strategies and their effectiveness against various attacks."
                    />
                </ListItem>
                
                <ListItem>
                    <ListItemIcon>
                    <InfoIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                    primary="Awareness" 
                    secondary="Raise awareness about the security implications of adversarial vulnerabilities in deep learning systems."
                    />
                </ListItem>
                </List>
            </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom className="section-title">
                Implemented Features
                </Typography>
                
                <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Card elevation={1} sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="h6" component="h3" gutterBottom>
                        Attack Demonstrations
                        </Typography>
                        <List dense>
                        <ListItem disablePadding>
                            <ListItemText primary="FGSM (Fast Gradient Sign Method)" />
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemText primary="PGD (Projected Gradient Descent)" />
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemText primary="DeepFool" />
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemText primary="C&W (Carlini & Wagner)" />
                        </ListItem>
                        </List>
                    </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                    <Card elevation={1} sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="h6" component="h3" gutterBottom>
                        Defense Strategies
                        </Typography>
                        <List dense>
                        <ListItem disablePadding>
                            <ListItemText primary="Adversarial Training" />
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemText primary="Defensive Distillation" />
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemText primary="Progressive Training" />
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemText primary="Robustness Analysis" />
                        </ListItem>
                        </List>
                    </CardContent>
                    </Card>
                </Grid>
                </Grid>
            </Paper>
            </Grid>
        </Grid>
        
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom className="section-title">
            Technical Implementation
            </Typography>
            
            <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccountTreeIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h3">
                        Architecture
                    </Typography>
                    </Box>
                    
                    <Typography variant="body2" paragraph>
                    This application uses a modern full-stack architecture:
                    </Typography>
                    
                    <List dense>
                    <ListItem disablePadding>
                        <ListItemText 
                        primary="Frontend" 
                        secondary="React.js with Material-UI for responsive interfaces"
                        />
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemText 
                        primary="Backend" 
                        secondary="Flask serving a RESTful API for Python ML integration"
                        />
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemText 
                        primary="ML Components" 
                        secondary="PyTorch for models, ART library for adversarial attacks"
                        />
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemText 
                        primary="Visualization" 
                        secondary="Matplotlib for dynamic visualization generation"
                        />
                    </ListItem>
                    </List>
                </CardContent>
                </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
                <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CodeIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h3">
                        Implementation Details
                    </Typography>
                    </Box>
                    
                    <Typography variant="body2" paragraph>
                    Key technical details and optimizations:
                    </Typography>
                    
                    <List dense>
                    <ListItem disablePadding>
                        <ListItemText 
                        primary="Pre-computed Visualizations" 
                        secondary="Most visualizations are pre-computed to ensure fast loading times"
                        />
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemText 
                        primary="On-demand Processing" 
                        secondary="Dynamic attack generation only when explicitly requested"
                        />
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemText 
                        primary="Caching Strategy" 
                        secondary="Results are cached to prevent redundant computation"
                        />
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemText 
                        primary="Responsive Design" 
                        secondary="Optimized for both desktop and mobile viewing"
                        />
                    </ListItem>
                    </List>
                </CardContent>
                </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
                <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h3">
                        Educational Approach
                    </Typography>
                    </Box>
                    
                    <Typography variant="body2" paragraph>
                    This project uses several pedagogical techniques:
                    </Typography>
                    
                    <List dense>
                    <ListItem disablePadding>
                        <ListItemText 
                        primary="Interactive Learning" 
                        secondary="Hands-on demonstrations for experiential learning"
                        />
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemText 
                        primary="Mathematical Foundation" 
                        secondary="Clear mathematical explanations with LaTeX rendering"
                        />
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemText 
                        primary="Visual Intuition" 
                        secondary="Visualizations to build intuitive understanding"
                        />
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemText 
                        primary="Comparative Analysis" 
                        secondary="Side-by-side comparisons of different methods"
                        />
                    </ListItem>
                    </List>
                </CardContent>
                </Card>
            </Grid>
            </Grid>
        </Box>
        
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom className="section-title">
            References and Resources
            </Typography>
            
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
                Key Papers
            </Typography>
            
            <List>
                <ListItem>
                <ListItemText 
                    primary="Explaining and Harnessing Adversarial Examples" 
                    secondary="Goodfellow et al., ICLR 2015"
                />
                </ListItem>
                <ListItem>
                <ListItemText 
                    primary="Towards Deep Learning Models Resistant to Adversarial Attacks" 
                    secondary="Madry et al., ICLR 2018"
                />
                </ListItem>
                <ListItem>
                <ListItemText 
                    primary="Distillation as a Defense to Adversarial Perturbations against Deep Neural Networks" 
                    secondary="Papernot et al., IEEE S&P 2016"
                />
                </ListItem>
                <ListItem>
                <ListItemText 
                    primary="Towards Evaluating the Robustness of Neural Networks" 
                    secondary="Carlini & Wagner, IEEE S&P 2017"
                />
                </ListItem>
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
                Libraries and Tools
            </Typography>
            
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                <Link href="https://pytorch.org/" target="_blank" rel="noopener noreferrer" underline="hover">
                    PyTorch
                </Link>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                <Link href="https://github.com/Trusted-AI/adversarial-robustness-toolbox" target="_blank" rel="noopener noreferrer" underline="hover">
                    Adversarial Robustness Toolbox (ART)
                </Link>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                <Link href="https://flask.palletsprojects.com/" target="_blank" rel="noopener noreferrer" underline="hover">
                    Flask
                </Link>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                <Link href="https://reactjs.org/" target="_blank" rel="noopener noreferrer" underline="hover">
                    React
                </Link>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                <Link href="https://mui.com/" target="_blank" rel="noopener noreferrer" underline="hover">
                    Material-UI
                </Link>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                <Link href="https://matplotlib.org/" target="_blank" rel="noopener noreferrer" underline="hover">
                    Matplotlib
                </Link>
                </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
                Further Learning
            </Typography>
            
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                <Link href="https://adversarial-ml-tutorial.org/" target="_blank" rel="noopener noreferrer" underline="hover">
                    Adversarial Machine Learning Tutorial
                </Link>
                </Grid>
                <Grid item xs={12} sm={6}>
                <Link href="https://www.robust-ml.org/" target="_blank" rel="noopener noreferrer" underline="hover">
                    Robust ML
                </Link>
                </Grid>
                <Grid item xs={12} sm={6}>
                <Link href="https://nicholas.carlini.com/writing/2018/adversarial-machine-learning-reading-list.html" target="_blank" rel="noopener noreferrer" underline="hover">
                    Adversarial ML Reading List
                </Link>
                </Grid>
                <Grid item xs={12} sm={6}>
                <Link href="https://openai.com/blog/adversarial-example-research/" target="_blank" rel="noopener noreferrer" underline="hover">
                    OpenAI Adversarial Example Research
                </Link>
                </Grid>
            </Grid>
            </Paper>
        </Box>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
            This project was created as an educational resource to help understand adversarial attacks and defenses in neural networks.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            © {new Date().getFullYear()} Adversarial Attacks Explorer
            </Typography>
        </Box>
        </Box>
    );
}

export default AboutPage;