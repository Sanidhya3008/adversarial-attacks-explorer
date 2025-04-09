import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Button,
    Paper,
    Divider,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    Alert,
    Tooltip,
    CircularProgress,
    CardMedia
} from '@mui/material';
import axios from 'axios';
import MathComponent from '../components/MathJax';
import ImageUpload from '../components/ImageUpload';
import InfoIcon from '@mui/icons-material/Info';
import CompareIcon from '@mui/icons-material/Compare';

// Tab panel component
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
        role="tabpanel"
        hidden={value !== index}
        id={`attack-tabpanel-${index}`}
        aria-labelledby={`attack-tab-${index}`}
        {...other}
        >
        {value === index && (
            <Box sx={{ pt: 3 }}>
            {children}
            </Box>
        )}
        </div>
    );
}

// Predefined image examples
const sampleImages = [
    {
        id: 1,
        name: 'Giant Panda',
        url: '/static/samples/sample_1.jpg'
    },
    {
        id: 2,
        name: 'Cat',
        url: '/static/samples/sample_2.jpg'
    },
    {
        id: 3,
        name: 'Dog',
        url: '/static/samples/sample_3.jpg'
    }
];

function AttacksPage() {
    // State for the active tab
    const [activeTab, setActiveTab] = useState(0);
    const [exampleAttackTab, setExampleAttackTab] = useState(0);
    
    // State for the selected attack type and parameters
    const [attackType, setAttackType] = useState('fgsm');
    const [epsilon, setEpsilon] = useState(0.03);
    
    // State for the uploaded image and results
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    
    // State for comparison results
    const [comparisonIsLoading, setComparisonIsLoading] = useState(false);
    const [comparisonError, setComparisonError] = useState(null);
    const [comparisonResult, setComparisonResult] = useState(null);
    
    // State for available attack types
    const [availableAttacks, setAvailableAttacks] = useState([]);
    
    // Fetch available attack types on component mount
    useEffect(() => {
        axios.get('/api/attacks')
        .then(response => {
            setAvailableAttacks(response.data.attacks);
        })
        .catch(error => {
            console.error('Error fetching attack types:', error);
            setAvailableAttacks(['fgsm', 'pgd', 'deepfool', 'cw']);
        });
    }, []);
    
    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };
    
    // Handle attack type change
    const handleAttackTypeChange = (event) => {
        setAttackType(event.target.value);
    };
    
    // Handle epsilon change
    const handleEpsilonChange = (event, newValue) => {
        setEpsilon(newValue);
    };
    
    // Handle image upload
    const handleImageUpload = (imageData) => {
        setImage(imageData);
        setResult(null);
        setComparisonResult(null);
    };
    
    // Handle sample image selection
    const handleSampleImage = (imageUrl) => {
        // Fetch the image and convert to base64
        fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => {
            setImage(reader.result);
            setResult(null);
            setComparisonResult(null);
            };
            reader.readAsDataURL(blob);
        })
        .catch(error => {
            console.error('Error loading sample image:', error);
            setError('Error loading sample image. Please try again.');
        });
    };
    
    // Generate adversarial example
    const handleGenerateAdversarial = () => {
        if (!image) {
        setError('Please upload an image first.');
        return;
        }
        
        setIsLoading(true);
        setError(null);
        
        // Remove data URL prefix if present
        const base64Image = image.includes(',') ? image.split(',')[1] : image;
        
        axios.post('/api/generate_adversarial', {
        image: base64Image,
        attack_type: attackType,
        epsilon: epsilon
        })
        .then(response => {
            setResult(response.data);
            setIsLoading(false);
        })
        .catch(error => {
            console.error('Error generating adversarial example:', error);
            setError('Error generating adversarial example. Please try again.');
            setIsLoading(false);
        });
    };
    
    // Compare all attack methods
    const handleCompareAttacks = () => {
        if (!image) {
        setComparisonError('Please upload an image first.');
        return;
        }
        
        setComparisonIsLoading(true);
        setComparisonError(null);
        
        // Remove data URL prefix if present
        const base64Image = image.includes(',') ? image.split(',')[1] : image;
        
        axios.post('/api/compare_attacks', {
        image: base64Image,
        attacks: availableAttacks,
        epsilon: epsilon
        })
        .then(response => {
            setComparisonResult(response.data);
            setComparisonIsLoading(false);
        })
        .catch(error => {
            console.error('Error comparing attacks:', error);
            setComparisonError('Error comparing attack methods. Please try again.');
            setComparisonIsLoading(false);
        });
    };
    
    // Attack descriptions and mathematical formulations
    const attackDescriptions = {
        fgsm: {
        title: 'Fast Gradient Sign Method (FGSM)',
        description: 'FGSM is one of the simplest and most efficient adversarial attacks. It works by taking a single step in the direction of the gradient of the loss with respect to the input, maximizing the loss.',
        formula: 'x_{adv} = x + \\epsilon \\cdot \\text{sign}(\\nabla_x J(\\theta, x, y))',
        reference: 'Goodfellow et al., "Explaining and Harnessing Adversarial Examples", ICLR 2015'
        },
        pgd: {
        title: 'Projected Gradient Descent (PGD)',
        description: 'PGD is an iterative version of FGSM that takes multiple smaller steps in the direction of the gradient, projecting back onto an ε-ball around the original image after each step.',
        formula: 'x_{t+1} = \\Pi_{x+S}(x_t + \\alpha \\cdot \\text{sign}(\\nabla_x J(\\theta, x_t, y)))',
        reference: 'Madry et al., "Towards Deep Learning Models Resistant to Adversarial Attacks", ICLR 2018'
        },
        deepfool: {
        title: 'DeepFool',
        description: 'DeepFool iteratively finds the minimum perturbation needed to cross the decision boundary by linearizing the model around the current point and moving toward the closest decision boundary.',
        formula: '\\Delta x_i = -\\frac{f(x_i)}{\\|\\nabla f(x_i)\\|^2_2} \\nabla f(x_i)',
        reference: 'Moosavi-Dezfooli et al., "DeepFool: A Simple and Accurate Method to Fool Deep Neural Networks", CVPR 2016'
        },
        cw: {
        title: 'Carlini & Wagner (C&W)',
        description: 'C&W is a powerful optimization-based attack that seeks to find the smallest perturbation that causes misclassification while maintaining high confidence in the wrong class.',
        formula: '\\min_{\\delta} \\|\\delta\\|_p + c \\cdot f(x + \\delta)',
        reference: 'Carlini & Wagner, "Towards Evaluating the Robustness of Neural Networks", IEEE S&P 2017'
        }
    };
    
    return (
        <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
            borderBottom: '2px solid #3f51b5', 
            paddingBottom: '8px',
            marginBottom: '16px'
        }}>
            Adversarial Attacks
        </Typography>
        
        <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '1rem'
            },
            '& .Mui-selected': {
                color: '#3f51b5'
            }
            }}
            variant="fullWidth"
        >
            <Tab label="Generate" />
            <Tab label="Compare" />
            <Tab label="Learn" />
        </Tabs>
        
        {/* Generate Tab */}
        <TabPanel value={activeTab} index={0}>
            <Grid container spacing={4}>
            {/* Image Upload Section */}
            <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                Upload an Image
                </Typography>
                <ImageUpload onImageUpload={handleImageUpload} isLoading={isLoading} />
                
                {/* Sample Images */}
                {!image && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                    Or choose a sample image:
                    </Typography>
                    <Grid container spacing={2}>
                    {sampleImages.map((sample) => (
                        <Grid item xs={4} key={sample.id}>
                        <Card 
                            onClick={() => handleSampleImage(sample.url)}
                            sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}
                        >
                            <CardMedia
                            component="img"
                            height="100"
                            image={sample.url}
                            alt={sample.name}
                            />
                            <CardContent sx={{ p: 1 }}>
                            <Typography variant="body2" align="center">
                                {sample.name}
                            </Typography>
                            </CardContent>
                        </Card>
                        </Grid>
                    ))}
                    </Grid>
                </Box>
                )}
                
                {/* Image Preview */}
                {image && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                    Selected Image:
                    </Typography>
                    <img 
                    src={image} 
                    alt="Uploaded" 
                    className="image-preview" 
                    />
                    <Button 
                    variant="outlined" 
                    color="primary" 
                    size="small"
                    onClick={() => setImage(null)}
                    sx={{ mt: 1 }}
                    >
                    Clear Image
                    </Button>
                </Box>
                )}
            </Grid>
            
            {/* Attack Parameters Section */}
            <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                Attack Parameters
                </Typography>
                
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                {/* Attack Type Selection */}
                <FormControl fullWidth margin="normal">
                    <InputLabel id="attack-type-label">Attack Type</InputLabel>
                    <Select
                    labelId="attack-type-label"
                    value={attackType}
                    label="Attack Type"
                    onChange={handleAttackTypeChange}
                    >
                    {availableAttacks.map((attack) => (
                        <MenuItem key={attack} value={attack}>
                        {attackDescriptions[attack]?.title || attack.toUpperCase()}
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>
                
                {/* Epsilon Slider */}
                <Box sx={{ mt: 4, mb: 2 }}>
                    <Typography id="epsilon-slider" gutterBottom>
                    Perturbation Size (ε): {epsilon.toFixed(3)}
                    <Tooltip title="Controls how much the image can be modified. Larger values make the attack stronger but more visible.">
                        <InfoIcon fontSize="small" sx={{ ml: 1, verticalAlign: 'middle', color: 'text.secondary' }} />
                    </Tooltip>
                    </Typography>
                    <Slider
                    aria-labelledby="epsilon-slider"
                    value={epsilon}
                    onChange={handleEpsilonChange}
                    min={0.001}
                    max={0.1}
                    step={0.001}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => value.toFixed(3)}
                    />
                </Box>
                
                {/* Attack Description */}
                {attackType && attackDescriptions[attackType] && (
                    <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        {attackDescriptions[attackType].description}
                    </Typography>
                    <Box className="math-container" sx={{ mt: 2 }}>
                        <MathComponent tex={attackDescriptions[attackType].formula} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        Source: {attackDescriptions[attackType].reference}
                    </Typography>
                    </Box>
                )}
                
                {/* Generate Button */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleGenerateAdversarial}
                    disabled={isLoading || !image}
                    >
                    {isLoading ? (
                        <CircularProgress size={24} sx={{ mr: 1 }} />
                    ) : (
                        'Generate Adversarial Example'
                    )}
                    </Button>
                </Box>
                </Paper>
            </Grid>
            </Grid>
            
            {/* Error Alert */}
            {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
                {error}
            </Alert>
            )}
            
            {/* Results Section */}
            {result && (
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                Attack Results
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={4} alignItems="center">
                {/* Original Image */}
                <Grid item xs={12} md={4}>
                    <Card elevation={3} sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom align="center" color="primary" sx={{ fontWeight: 'bold' }}>
                        Original Image
                        </Typography>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <img 
                            src={`data:image/png;base64,${result.original_image}`} 
                            alt="Original" 
                            className="comparison-image" 
                        />
                        </Box>
                        <Typography variant="body1" sx={{ mt: 2, mb: 1 }} align="center">
                        Prediction: <strong>{result.original_pred}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                        Confidence: {(result.original_conf * 100).toFixed(2)}%
                        </Typography>
                    </CardContent>
                    </Card>
                </Grid>
                
                {/* Adversarial Image */}
                <Grid item xs={12} md={4}>
                    <Card elevation={3} sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom align="center" color={result.success ? 'error' : 'primary'} sx={{ fontWeight: 'bold' }}>
                        Adversarial Image ({attackType.toUpperCase()})
                        </Typography>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <img 
                            src={`data:image/png;base64,${result.adversarial_image}`} 
                            alt="Adversarial" 
                            className="comparison-image" 
                        />
                        </Box>
                        <Typography 
                        variant="body1" 
                        sx={{ mt: 2, mb: 1 }} 
                        align="center"
                        color={result.success ? 'error.main' : 'inherit'}
                        >
                        Prediction: <strong>{result.adv_pred}</strong>
                        {result.success && ' ✓'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                        Confidence: {(result.adv_conf * 100).toFixed(2)}%
                        </Typography>
                    </CardContent>
                    </Card>
                </Grid>
                
                {/* Metrics */}
                <Grid item xs={12} md={4}>
                    <Card elevation={3} sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom align="center" color="primary" sx={{ fontWeight: 'bold' }}>
                        Attack Analysis
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                        <Typography variant="body1" gutterBottom>
                            <strong>Attack Success:</strong> {result.success ? 'Yes ✓' : 'No ✗'}
                        </Typography>
                        
                        <Typography variant="body1" gutterBottom>
                            <strong>Perturbation Size:</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 2 }}>
                            L2 Distance: {result.l2_dist.toFixed(4)}
                            <Tooltip title="Euclidean distance between original and adversarial images">
                            <InfoIcon fontSize="small" sx={{ ml: 1, verticalAlign: 'middle', color: 'text.secondary' }} />
                            </Tooltip>
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 2 }}>
                            L∞ Distance: {result.linf_dist.toFixed(4)}
                            <Tooltip title="Maximum pixel-wise difference">
                            <InfoIcon fontSize="small" sx={{ ml: 1, verticalAlign: 'middle', color: 'text.secondary' }} />
                            </Tooltip>
                        </Typography>
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Typography variant="body1" gutterBottom>
                        <strong>Confidence Change:</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 2 }}>
                        Original class confidence: {(result.original_conf * 100).toFixed(2)}% → {(result.adv_conf * 100).toFixed(2)}%
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 2 }}>
                        Confidence drop: {((result.original_conf - result.adv_conf) * 100).toFixed(2)}%
                        </Typography>
                    </CardContent>
                    </Card>
                </Grid>
                </Grid>
                
                {/* Comparison Visualization */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                    Visual Comparison
                </Typography>
                <img 
                    src={`data:image/png;base64,${result.comparison_plot}`} 
                    alt="Comparison" 
                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                />
                </Box>
                
                {/* Technical Explanation */}
                <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Why This Attack Works
                </Typography>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2, backgroundColor: '#f9f9f9' }}>
                    <Typography variant="body2">
                    The {attackDescriptions[attackType]?.title || attackType.toUpperCase()} attack exploits the linearity of neural networks in high-dimensional spaces. By modifying the input in the direction that maximizes the loss function, even small changes can significantly alter the model's output while remaining visually similar to humans.
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mt: 2 }}>
                    In this case, the model's confidence in the correct class decreased from {(result.original_conf * 100).toFixed(2)}% to {(result.adv_conf * 100).toFixed(2)}%, 
                    {result.success 
                        ? ` causing it to misclassify the image as "${result.adv_pred}" instead of "${result.original_pred}".` 
                        : ` but it still correctly classified the image as "${result.original_pred}".`}
                    </Typography>
                </Paper>
                </Box>
            </Box>
            )}
        </TabPanel>
        
        {/* Compare Tab */}
        <TabPanel value={activeTab} index={1}>
            <Grid container spacing={4}>
            {/* Image Upload Section */}
            <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                Upload an Image
                </Typography>
                <ImageUpload onImageUpload={handleImageUpload} isLoading={comparisonIsLoading} />
                
                {/* Sample Images */}
                {!image && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                    Or choose a sample image:
                    </Typography>
                    <Grid container spacing={2}>
                    {sampleImages.map((sample) => (
                        <Grid item xs={4} key={sample.id}>
                        <Card 
                            onClick={() => handleSampleImage(sample.url)}
                            sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}
                        >
                            <CardMedia
                            component="img"
                            height="100"
                            image={sample.url}
                            alt={sample.name}
                            />
                            <CardContent sx={{ p: 1 }}>
                            <Typography variant="body2" align="center">
                                {sample.name}
                            </Typography>
                            </CardContent>
                        </Card>
                        </Grid>
                    ))}
                    </Grid>
                </Box>
                )}
                
                {/* Image Preview */}
                {image && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                    Selected Image:
                    </Typography>
                    <img 
                    src={image} 
                    alt="Uploaded" 
                    className="image-preview" 
                    />
                    <Button 
                    variant="outlined" 
                    color="primary" 
                    size="small"
                    onClick={() => setImage(null)}
                    sx={{ mt: 1 }}
                    >
                    Clear Image
                    </Button>
                </Box>
                )}
            </Grid>
            
            {/* Comparison Parameters */}
            <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                Comparison Parameters
                </Typography>
                
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="body1" paragraph>
                    Compare how different adversarial attack methods affect the same image. This will generate adversarial examples using all available attack methods with the same perturbation budget.
                </Typography>
                
                {/* Epsilon Slider */}
                <Box sx={{ mt: 3, mb: 2 }}>
                    <Typography id="epsilon-slider-comparison" gutterBottom>
                    Perturbation Size (ε): {epsilon.toFixed(3)}
                    <Tooltip title="Controls how much the image can be modified. Larger values make the attacks stronger but more visible.">
                        <InfoIcon fontSize="small" sx={{ ml: 1, verticalAlign: 'middle', color: 'text.secondary' }} />
                    </Tooltip>
                    </Typography>
                    <Slider
                    aria-labelledby="epsilon-slider-comparison"
                    value={epsilon}
                    onChange={handleEpsilonChange}
                    min={0.001}
                    max={0.1}
                    step={0.001}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => value.toFixed(3)}
                    />
                </Box>
                
                {/* Attack Methods */}
                <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" gutterBottom>
                    Attack methods to compare:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {availableAttacks.map((attack) => (
                        <Tooltip key={attack} title={attackDescriptions[attack]?.description || ''}>
                        <Button
                            variant="outlined"
                            size="small"
                            disabled
                            sx={{ cursor: 'default' }}
                        >
                            {attack.toUpperCase()}
                        </Button>
                        </Tooltip>
                    ))}
                    </Box>
                </Box>
                
                {/* Compare Button */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<CompareIcon />}
                    onClick={handleCompareAttacks}
                    disabled={comparisonIsLoading || !image}
                    >
                    {comparisonIsLoading ? (
                        <>
                        <CircularProgress size={24} sx={{ mr: 1 }} />
                        Comparing...
                        </>
                    ) : (
                        'Compare Attack Methods'
                    )}
                    </Button>
                </Box>
                </Paper>
            </Grid>
            </Grid>
            
            {/* Error Alert */}
            {comparisonError && (
            <Alert severity="error" sx={{ mt: 3 }}>
                {comparisonError}
            </Alert>
            )}
            
            {/* Comparison Results */}
            {comparisonResult && (
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                Attack Comparison Results
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                {/* Visual Comparison */}
                <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Visual Comparison of Attack Methods
                </Typography>
                <img 
                    src={`data:image/png;base64,${comparisonResult.comparison_plot}`} 
                    alt="Attack methods comparison" 
                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                />
                </Box>
                
                {/* Confidence Comparison */}
                <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Confidence Comparison
                </Typography>
                <img 
                    src={`data:image/png;base64,${comparisonResult.confidence_plot}`} 
                    alt="Confidence comparison" 
                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                />
                </Box>
                
                {/* Attack Results Table */}
                <Typography variant="h6" gutterBottom>
                Attack Results Summary
                </Typography>
                <Grid container spacing={2}>
                {Object.entries(comparisonResult.attack_results).map(([attack, result]) => (
                    <Grid item xs={12} sm={6} md={3} key={attack}>
                    <Card 
                        sx={{ 
                        height: '100%',
                        borderLeft: result.success ? '4px solid #f50057' : '4px solid #9e9e9e'
                        }}
                    >
                        <CardContent>
                        <Typography variant="h6" gutterBottom>
                            {attack.toUpperCase()}
                            {result.success && ' ✓'}
                        </Typography>
                        
                        <Typography variant="body2" gutterBottom>
                            <strong>Original:</strong> {result.original_pred} ({(result.original_conf * 100).toFixed(1)}%)
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            <strong>Adversarial:</strong> {result.adv_pred} ({(result.adv_conf * 100).toFixed(1)}%)
                        </Typography>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Typography variant="body2">
                            <strong>L2 Distance:</strong> {result.l2_dist.toFixed(4)}
                        </Typography>
                        <Typography variant="body2">
                            <strong>L∞ Distance:</strong> {result.linf_dist.toFixed(4)}
                        </Typography>
                        </CardContent>
                    </Card>
                    </Grid>
                ))}
                </Grid>

                {/* Precomputed Comparisons */}
                <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Example Attack Comparisons
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                    <img src="/static/precomputed/attack_comparison.png" alt="Attack Comparison" style={{ width: '100%', borderRadius: '8px' }} />
                    </Grid>
                    <Grid item xs={12}>
                    <img src="/static/precomputed/confidence_comparison.png" alt="Confidence Comparison" style={{ width: '100%', borderRadius: '8px' }} />
                    </Grid>
                </Grid>
                </Box>
                
                {/* Analysis */}
                <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Analysis
                </Typography>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2, backgroundColor: '#f9f9f9' }}>
                    <Typography variant="body1" paragraph>
                    Different attack methods have different strengths and characteristics:
                    </Typography>
                    
                    <ul>
                    <li>
                        <Typography variant="body2" paragraph>
                        <strong>FGSM</strong> is fast but less effective, generating more noticeable perturbations.
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body2" paragraph>
                        <strong>PGD</strong> is more powerful than FGSM by taking multiple small steps, creating stronger adversarial examples.
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body2" paragraph>
                        <strong>DeepFool</strong> finds minimal perturbations that cross decision boundaries, typically creating very subtle, hard-to-detect adversarial examples.
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body2" paragraph>
                        <strong>C&W</strong> is among the most powerful attacks, optimizing specifically to find minimal perturbations that cause misclassification with high confidence.
                        </Typography>
                    </li>
                    </ul>
                    
                    <Typography variant="body2">
                    These results demonstrate how different objectives and optimization strategies lead to variations in attack effectiveness, perturbation size, and visual quality.
                    </Typography>
                </Paper>
                </Box>
            </Box>
            )}
        </TabPanel>
        
        {/* Learn Tab */}
        <TabPanel value={activeTab} index={2}>
            <Typography variant="h5" gutterBottom>
            Understanding Adversarial Attacks
            </Typography>
            
            <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom className="section-title">
                What Makes Neural Networks Vulnerable?
            </Typography>
            
            <Typography variant="body1" paragraph>
                Deep neural networks achieve remarkable accuracy on many tasks, but they can be surprisingly vulnerable to carefully crafted inputs. The main reasons for this vulnerability include:
            </Typography>
            
            <ol>
                <li>
                <Typography variant="body1" paragraph>
                    <strong>Linear Behavior in High Dimensions</strong> - Despite their nonlinear activation functions, neural networks often behave in a surprisingly linear way. In high-dimensional spaces, small changes in many directions can add up to significant shifts in the output.
                </Typography>
                <Box className="math-container" sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.03)', borderRadius: 1, overflow: 'auto' }}>
                    <MathComponent
                    tex="w^T \widetilde{x} = w^T x + w^T \eta"
                    />
                </Box>
                </li>
                
                <li>
                <Typography variant="body1" paragraph>
                    <strong>Decision Boundary Proximity</strong> - Many correctly classified examples lie close to decision boundaries in the feature space, so small perturbations can push them across these boundaries.
                </Typography>
                </li>
                
                <li>
                <Typography variant="body1" paragraph>
                    <strong>Excessive Extrapolation</strong> - Neural networks extrapolate confidently even for out-of-distribution inputs, leading to high-confidence predictions for adversarial examples.
                </Typography>
                </li>
            </ol>
            </Box>
            
            <Box sx={{ mt: 5 }}>
            <Typography variant="h6" gutterBottom className="section-title">
                Types of Adversarial Attacks
            </Typography>
            
            <Grid container spacing={3}>
                {/* White-box vs. Black-box */}
                <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{ height: '100%' }}>
                    <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Knowledge-based Classification
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>
                        White-box Attacks
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Attacker has complete knowledge of the model architecture, parameters, and training data. Examples include FGSM, PGD, and C&W methods.
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>
                        Black-box Attacks
                    </Typography>
                    <Typography variant="body2">
                        Attacker has no or limited knowledge of the model. May only have access to the model's predictions. Typically rely on transferability or query-based approaches.
                    </Typography>
                    </CardContent>
                </Card>
                </Grid>
                
                {/* Targeted vs. Untargeted */}
                <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{ height: '100%' }}>
                    <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Goal-based Classification
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>
                        Untargeted Attacks
                    </Typography>
                    <Typography variant="body2" paragraph>
                        The goal is to cause any misclassification. Optimization objective is to maximize the loss for the correct class.
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>
                        Targeted Attacks
                    </Typography>
                    <Typography variant="body2">
                        The goal is to cause the model to predict a specific target class. Optimization objective is to minimize the loss for the target class.
                    </Typography>
                    </CardContent>
                </Card>
                </Grid>
            </Grid>
            </Box>
            
            <Box sx={{ mt: 5 }}>
            <Typography variant="h6" gutterBottom className="section-title">
                Mathematical Foundations
            </Typography>
            
            <Typography variant="body1" paragraph>
                Adversarial attacks can be formulated as constrained optimization problems:
            </Typography>
            
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                Untargeted Attack:
                </Typography>
                <Box className="math-container" sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.03)', borderRadius: 1, overflow: 'auto' }}>
                <MathComponent
                    tex="\max_{\delta} \mathcal{L}(f(x + \delta), y) \quad \text{subject to} \quad \|\delta\|_p \leq \epsilon"
                />
                </Box>
            </Paper>
            
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                Targeted Attack:
                </Typography>
                <Box className="math-container">
                <MathComponent
                    tex="\min_{\delta} \mathcal{L}(f(x + \delta), y_{target}) \quad \text{subject to} \quad \|\delta\|_p \leq \epsilon"
                />
                </Box>
            </Paper>
            
            <Typography variant="body1" paragraph>
                Where:
            </Typography>
            <ul>
                <li>
                <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ mr: 1 }}>
                    <MathComponent tex="x" inline={true} />
                    </Box>
                    is the original input
                </Typography>
                </li>
                <li>
                <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ mr: 1 }}>
                    <MathComponent tex="\delta" inline={true} />
                    </Box>
                    is the adversarial perturbation
                </Typography>
                </li>
                <li>
                <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ mr: 1 }}>
                    <MathComponent tex="y" inline={true} />
                    </Box>
                    is the true label
                </Typography>
                </li>
                <li>
                <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ mr: 1 }}>
                    <MathComponent tex="y_{target}" inline={true} />
                    </Box>
                    is the target label (for targeted attacks)
                </Typography>
                </li>
                <li>
                <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ mr: 1 }}>
                    <MathComponent tex="f" inline={true} />
                    </Box>
                    is the neural network
                </Typography>
                </li>
                <li>
                <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ mr: 1 }}>
                    <MathComponent tex="\mathcal{L}" inline={true} />
                    </Box>
                    is the loss function
                </Typography>
                </li>
                <li>
                <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ mr: 1 }}>
                    <MathComponent tex="\|\delta\|_p" inline={true} />
                    </Box>
                    is the p-norm of the perturbation (commonly L2 or L∞)
                </Typography>
                </li>
                <li>
                <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ mr: 1 }}>
                    <MathComponent tex="\epsilon" inline={true} />
                    </Box>
                    is the perturbation budget
                </Typography>
                </li>
            </ul>
            </Box>

            {/* Example Attack Visualizations */}
            <Box sx={{ mt: 5 }}>
            <Typography variant="h6" gutterBottom className="section-title">
                Example Attack Visualizations
            </Typography>
            
            <Typography variant="body1" paragraph>
                Below are examples of different attack methods applied to a Giant Panda image:
            </Typography>
            
            <Tabs value={exampleAttackTab} onChange={(e, newValue) => setExampleAttackTab(newValue)} sx={{ mb: 2 }}>
                <Tab label="FGSM" />
                <Tab label="PGD" />
                <Tab label="DeepFool" />
                <Tab label="C&W" />
            </Tabs>
            
            {/* FGSM Example */}
            <Box hidden={exampleAttackTab !== 0}>
                <Grid container spacing={2}>
                <Grid item xs={12}>
                    <img src="/static/precomputed/fgsm_attack_demo.png" alt="FGSM Attack Demo" style={{ width: '100%' }} />
                </Grid>
                <Grid item xs={12}>
                    <img src="/static/precomputed/fgsm_magnified.png" alt="FGSM Attack Magnified" style={{ width: '100%' }} />
                </Grid>
                </Grid>
            </Box>
            
            {/* PGD Example */}
            <Box hidden={exampleAttackTab !== 1}>
                <Grid container spacing={2}>
                <Grid item xs={12}>
                    <img src="/static/precomputed/pgd_attack_demo.png" alt="PGD Attack Demo" style={{ width: '100%' }} />
                </Grid>
                <Grid item xs={12}>
                    <img src="/static/precomputed/pgd_magnified.png" alt="PGD Attack Magnified" style={{ width: '100%' }} />
                </Grid>
                </Grid>
            </Box>
            
            {/* DeepFool Example */}
            <Box hidden={exampleAttackTab !== 2}>
                <Grid container spacing={2}>
                <Grid item xs={12}>
                    <img src="/static/precomputed/deepfool_attack_demo.png" alt="DeepFool Attack Demo" style={{ width: '100%' }} />
                </Grid>
                <Grid item xs={12}>
                    <img src="/static/precomputed/deepfool_magnified.png" alt="DeepFool Attack Magnified" style={{ width: '100%' }} />
                </Grid>
                </Grid>
            </Box>
            
            {/* C&W Example */}
            <Box hidden={exampleAttackTab !== 3}>
                <Grid container spacing={2}>
                <Grid item xs={12}>
                    <img src="/static/precomputed/cw_attack_demo.png" alt="C&W Attack Demo" style={{ width: '100%' }} />
                </Grid>
                <Grid item xs={12}>
                    <img src="/static/precomputed/cw_magnified.png" alt="C&W Attack Magnified" style={{ width: '100%' }} />
                </Grid>
                </Grid>
            </Box>
            </Box>

            {/* Loss Landscape Analysis */}
            <Box sx={{ mt: 5 }}>
            <Typography variant="h6" gutterBottom className="section-title">
                Loss Landscape Analysis
            </Typography>
            
            <Typography variant="body1" paragraph>
                The loss landscape helps understand how adversarial examples exploit the geometry of the decision boundaries:
            </Typography>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                <img src="/static/precomputed/loss_landscape_perturbations.png" alt="Loss Landscape Perturbations" style={{ width: '100%' }} />
                </Grid>
                <Grid item xs={12} md={6}>
                <img src="/static/precomputed/3d_loss_landscape.png" alt="3D Loss Landscape" style={{ width: '100%' }} />
                </Grid>
            </Grid>
            </Box>
            
            <Box sx={{ mt: 5 }}>
            <Typography variant="h6" gutterBottom className="section-title">
                Real-world Implications
            </Typography>
            
            <Typography variant="body1" paragraph>
                Adversarial vulnerabilities have significant implications for AI systems deployed in critical applications:
            </Typography>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                <Card className="result-card" elevation={2}>
                    <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Autonomous Vehicles
                    </Typography>
                    <Typography variant="body2">
                        Attackers could potentially modify road signs or project adversarial patterns that cause misdetection, posing serious safety risks.
                    </Typography>
                    </CardContent>
                </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                <Card className="result-card" elevation={2}>
                    <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Security Systems
                    </Typography>
                    <Typography variant="body2">
                        Facial recognition and biometric authentication systems might be bypassed using adversarial examples designed to be misclassified.
                    </Typography>
                    </CardContent>
                </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                <Card className="result-card" elevation={2}>
                    <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Medical Diagnosis
                    </Typography>
                    <Typography variant="body2">
                        AI systems for analyzing medical images could be manipulated to miss critical findings or produce false positives, affecting patient care.
                    </Typography>
                    </CardContent>
                </Card>
                </Grid>
            </Grid>
            </Box>
        </TabPanel>
        </Box>
    );
}

export default AttacksPage;