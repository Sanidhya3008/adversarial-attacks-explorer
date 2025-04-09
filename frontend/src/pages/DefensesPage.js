import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
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
  Chip
} from '@mui/material';
import axios from 'axios';
import MathComponent from '../components/MathJax';
import InfoIcon from '@mui/icons-material/Info';
import SecurityIcon from '@mui/icons-material/Security';
import CompareIcon from '@mui/icons-material/Compare';

// Tab panel component
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
        role="tabpanel"
        hidden={value !== index}
        id={`defense-tabpanel-${index}`}
        aria-labelledby={`defense-tab-${index}`}
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

// Defense model information
const defenseModels = [
    {
        id: 'standard',
        name: 'Standard Training',
        file: 'best_standard_model.pth',
        description: 'Baseline model trained using standard training procedure without any adversarial examples.',
        icon: '🔄',
        strengths: ['Simple to train', 'Good performance on clean data'],
        weaknesses: ['Vulnerable to adversarial attacks', 'No robustness guarantees']
    },
    {
        id: 'adversarial',
        name: 'Adversarial Training',
        file: 'best_adv_pgd_model.pth',
        description: 'Model trained with adversarial examples generated using PGD attack during training.',
        icon: '🛡️',
        strengths: ['Improved robustness against gradient-based attacks', 'Maintains reasonable clean accuracy'],
        weaknesses: ['Computationally expensive', 'May not generalize to unseen attacks']
    },
    {
        id: 'distillation',
        name: 'Defensive Distillation',
        file: 'best_distill_model.pth',
        description: 'Model trained using knowledge distillation with soft labels and high temperature to smooth decision boundaries.',
        icon: '🔥',
        strengths: ['Smoother decision boundaries', 'Gradient masking effect'],
        weaknesses: ['Can be bypassed with adaptive attacks', 'Complex training procedure']
    },
    {
        id: 'progressive',
        name: 'Progressive Training',
        file: 'best_progressive_pgd_model.pth',
        description: 'Model trained with progressively stronger adversarial examples, gradually increasing attack strength.',
        icon: '📈',
        strengths: ['Better robustness-accuracy trade-off', 'More stable training'],
        weaknesses: ['Longer training time', 'Requires careful scheduling']
    }
];

// Attack types
const attackTypes = ['fgsm', 'pgd', 'deepfool', 'cw'];

function DefensesPage() {
    // State for the active tab
    const [activeTab, setActiveTab] = useState(0);
    const [attackComparisonTab, setAttackComparisonTab] = useState(0);
    
    // State for selected defense model and parameters
    const [selectedModel, setSelectedModel] = useState(defenseModels[0]);
    const [attackType, setAttackType] = useState('pgd');
    const [epsilon, setEpsilon] = useState(0.03);
    
    // State for evaluation results
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [evaluationResult, setEvaluationResult] = useState(null);
    
    // State for comparison results
    const [isComparingModels, setIsComparingModels] = useState(false);
    const [comparisonError, setComparisonError] = useState(null);
    const [comparisonResult, setComparisonResult] = useState(null);
    
    // State for available models
    const [availableModels, setAvailableModels] = useState([]);
    
    // Fetch available defense models on component mount
    useEffect(() => {
        axios.get('/api/defenses')
        .then(response => {
            setAvailableModels(response.data.defenses);
        })
        .catch(error => {
            console.error('Error fetching defense models:', error);
            setAvailableModels(defenseModels.map(model => model.file));
        });
    }, []);
    
    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };
    
    // Handle model selection
    const handleModelSelection = (model) => {
        setSelectedModel(model);
        setEvaluationResult(null);
    };
    
    // Handle attack type change
    const handleAttackTypeChange = (event) => {
        setAttackType(event.target.value);
    };
    
    // Handle epsilon change
    const handleEpsilonChange = (event, newValue) => {
        setEpsilon(newValue);
    };
    
    // Evaluate model robustness
    const handleEvaluateModel = () => {
        setIsLoading(true);
        setError(null);
        
        axios.post('/api/evaluate_defense', {
        model_name: selectedModel.file,
        attack_type: attackType,
        epsilon: epsilon
        })
        .then(response => {
            setEvaluationResult(response.data);
            setIsLoading(false);
        })
        .catch(error => {
            console.error('Error evaluating defense model:', error);
            setError('Error evaluating defense model. Please try again.');
            setIsLoading(false);
        });
    };
    
    // Compare defense models
    const handleCompareModels = () => {
        setIsComparingModels(true);
        setComparisonError(null);
        
        axios.post('/api/compare_defenses', {
        model_names: defenseModels.map(model => model.file),
        attack_type: attackType,
        epsilon: epsilon
        })
        .then(response => {
            setComparisonResult(response.data);
            setIsComparingModels(false);
        })
        .catch(error => {
            console.error('Error comparing defense models:', error);
            setComparisonError('Error comparing defense models. Please try again.');
            setIsComparingModels(false);
        });
    };
    
    // Defense technique descriptions
    const defenseTechniques = {
        adversarial: {
        title: 'Adversarial Training',
        description: 'Adversarial training incorporates adversarial examples into the training process, exposing the model to potential attacks during training.',
        formula: '\\min_{\\theta} \\mathbb{E}_{(x,y) \\sim D} [\\max_{\\delta \\in S} L(f_\\theta(x + \\delta), y)]',
        reference: 'Madry et al., "Towards Deep Learning Models Resistant to Adversarial Attacks", ICLR 2018'
        },
        distillation: {
        title: 'Defensive Distillation',
        description: 'Defensive distillation uses soft labels generated from a teacher model with temperature scaling to train a student model, smoothing decision boundaries.',
        formula: 'q_i = \\frac{\\exp(z_i/T)}{\\sum_j \\exp(z_j/T)}',
        reference: 'Papernot et al., "Distillation as a Defense to Adversarial Perturbations against Deep Neural Networks", IEEE S&P 2016'
        },
        progressive: {
        title: 'Progressive Adversarial Training',
        description: 'Progressive training gradually increases the strength of adversarial attacks during training, allowing the model to adapt to increasingly difficult examples.',
        formula: '\\epsilon_t = \\epsilon_{\\min} + (\\epsilon_{\\max} - \\epsilon_{\\min}) \\cdot \\frac{t}{T}',
        reference: 'Cai et al., "Curriculum Adversarial Training", IJCAI 2018'
        }
    };
    
    return (
        <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
            borderBottom: '2px solid #3f51b5', 
            paddingBottom: '8px',
            marginBottom: '16px'
        }}>
            Adversarial Defenses
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
            <Tab label="Evaluate" />
            <Tab label="Compare" />
            <Tab label="Learn" />
        </Tabs>
        
        {/* Evaluate Tab */}
        <TabPanel value={activeTab} index={0}>
            <Grid container spacing={4}>
            {/* Model Selection Section */}
            <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
                Select Defense Model
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                Choose a defense strategy below to evaluate its robustness against adversarial attacks. Each model uses different techniques to defend against perturbations.
                </Alert>
                
                <Grid container spacing={2}>
                {defenseModels.map((model) => (
                    <Grid item xs={12} sm={6} key={model.id}>
                    <Card 
                        className={`defense-card ${selectedModel.id === model.id ? 'selected' : ''}`}
                        elevation={selectedModel.id === model.id ? 3 : 1}
                        onClick={() => handleModelSelection(model)}
                        sx={{ 
                        p: 2,
                        borderLeft: selectedModel.id === model.id ? '4px solid #3f51b5' : '4px solid transparent'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h3" component="span" sx={{ mr: 2 }}>
                            {model.icon}
                        </Typography>
                        <Typography variant="h6" component="h3">
                            {model.name}
                        </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" paragraph>
                        {model.description}
                        </Typography>
                        
                        {selectedModel.id === model.id && (
                        <Chip 
                            label="Selected" 
                            color="primary" 
                            size="small"
                            sx={{ mt: 1 }}
                        />
                        )}
                    </Card>
                    </Grid>
                ))}
                </Grid>
                
                {/* Model Details */}
                {selectedModel && (
                <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                    {selectedModel.name} Details
                    </Typography>
                    
                    <Typography variant="body2" paragraph>
                    <strong>Strengths:</strong>
                    </Typography>
                    <ul>
                    {selectedModel.strengths.map((strength, index) => (
                        <li key={index}>
                        <Typography variant="body2">
                            {strength}
                        </Typography>
                        </li>
                    ))}
                    </ul>
                    
                    <Typography variant="body2" paragraph>
                    <strong>Weaknesses:</strong>
                    </Typography>
                    <ul>
                    {selectedModel.weaknesses.map((weakness, index) => (
                        <li key={index}>
                        <Typography variant="body2">
                            {weakness}
                        </Typography>
                        </li>
                    ))}
                    </ul>
                    
                    {/* Show mathematical formulation for specific techniques */}
                    {selectedModel.id !== 'standard' && defenseTechniques[selectedModel.id] && (
                    <Box sx={{ mt: 2 }}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                        {defenseTechniques[selectedModel.id].description}
                        </Typography>
                        <Box className="math-container" sx={{ mt: 2 }}>
                        <MathComponent tex={defenseTechniques[selectedModel.id].formula} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                        Source: {defenseTechniques[selectedModel.id].reference}
                        </Typography>
                    </Box>
                    )}
                </Paper>
                )}
            </Grid>
            
            {/* Evaluation Parameters Section */}
            <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                Evaluation Parameters
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
                    {attackTypes.map((attack) => (
                        <MenuItem key={attack} value={attack}>
                        {attack.toUpperCase()}
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>
                
                {/* Epsilon Slider */}
                <Box sx={{ mt: 4, mb: 2 }}>
                    <Typography id="defense-epsilon-slider" gutterBottom>
                    Perturbation Size (ε): {epsilon.toFixed(3)}
                    <Tooltip title="Controls how much the image can be modified. Larger values create stronger attacks to test defense robustness.">
                        <InfoIcon fontSize="small" sx={{ ml: 1, verticalAlign: 'middle', color: 'text.secondary' }} />
                    </Tooltip>
                    </Typography>
                    <Slider
                    aria-labelledby="defense-epsilon-slider"
                    value={epsilon}
                    onChange={handleEpsilonChange}
                    min={0.01}
                    max={0.1}
                    step={0.01}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => value.toFixed(3)}
                    />
                </Box>
                
                {/* Description */}
                <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                    This evaluation will test the robustness of the selected model against adversarial attacks. The model will be evaluated on CIFAR-10 test data, and both clean accuracy and adversarial accuracy will be reported.
                    </Typography>
                </Box>
                
                {/* Evaluate Button */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<SecurityIcon />}
                    onClick={handleEvaluateModel}
                    disabled={isLoading}
                    >
                    {isLoading ? (
                        <>
                        <CircularProgress size={24} sx={{ mr: 1 }} />
                        Evaluating...
                        </>
                    ) : (
                        'Evaluate Robustness'
                    )}
                    </Button>
                </Box>
                </Paper>
                
                {/* Precomputed Visualization */}
                <Box sx={{ mt: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Precomputed visualization of model robustness:
                </Typography>
                <img 
                    src="/api/precomputed/robustness_overview" 
                    alt="Robustness Overview" 
                    style={{ maxWidth: '100%', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                />
                </Box>
            </Grid>
            </Grid>
            
            {/* Error Alert */}
            {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
                {error}
            </Alert>
            )}
            
            {/* Results Section */}
            {evaluationResult && (
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                Evaluation Results: {selectedModel.name}
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                {/* Accuracy Metrics */}
                <Grid item xs={12} md={4}>
                    <Card elevation={3}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom align="center">
                        Performance Metrics
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body1">Clean Accuracy:</Typography>
                        <Typography variant="body1" fontWeight="bold">
                            {(evaluationResult.clean_accuracy * 100).toFixed(2)}%
                        </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body1">Adversarial Accuracy:</Typography>
                        <Typography variant="body1" fontWeight="bold" color={evaluationResult.adv_accuracy < 0.5 ? 'error.main' : 'inherit'}>
                            {(evaluationResult.adv_accuracy * 100).toFixed(2)}%
                        </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body1">Robustness Ratio:</Typography>
                        <Typography variant="body1" fontWeight="bold">
                            {(evaluationResult.adv_accuracy / evaluationResult.clean_accuracy * 100).toFixed(2)}%
                        </Typography>
                        </Box>
                        
                        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            <strong>Attack:</strong> {attackType.toUpperCase()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Epsilon:</strong> {epsilon.toFixed(3)}
                        </Typography>
                        </Box>
                    </CardContent>
                    </Card>
                </Grid>
                
                {/* Example Images */}
                <Grid item xs={12} md={8}>
                    <Typography variant="h6" gutterBottom>
                    Example Adversarial Samples
                    </Typography>
                    
                    <Grid container spacing={2}>
                    {evaluationResult.example_plots.slice(0, 3).map((plotBase64, index) => (
                        <Grid item xs={12} md={4} key={index}>
                        <Card elevation={2}>
                            <CardMedia
                            component="img"
                            image={`data:image/png;base64,${plotBase64}`}
                            alt={`Example ${index + 1}`}
                            />
                        </Card>
                        </Grid>
                    ))}
                    </Grid>
                </Grid>
                </Grid>
                
                {/* Robustness Analysis */}
                <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Robustness Analysis
                </Typography>
                
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2, backgroundColor: '#f9f9f9' }}>
                    <Typography variant="body2" paragraph>
                    The {selectedModel.name} model {evaluationResult.adv_accuracy > 0.5 ? 'demonstrates good robustness' : 'struggles'} against {attackType.toUpperCase()} attacks with ε={epsilon.toFixed(3)}.
                    </Typography>
                    
                    <Typography variant="body2" paragraph>
                    With a clean accuracy of {(evaluationResult.clean_accuracy * 100).toFixed(2)}% and an adversarial accuracy of {(evaluationResult.adv_accuracy * 100).toFixed(2)}%, the model {evaluationResult.adv_accuracy > evaluationResult.clean_accuracy * 0.7 ? 'maintains most of its performance' : 'experiences significant degradation'} under attack.
                    </Typography>
                    
                    <Typography variant="body2">
                    {evaluationResult.adv_accuracy > 0.6 
                        ? 'This level of robustness is quite good, demonstrating the effectiveness of the defense technique.'
                        : evaluationResult.adv_accuracy > 0.3
                        ? 'This moderate level of robustness shows that the defense provides some protection, but could be improved further.'
                        : 'The low adversarial accuracy indicates that this defense technique may not be effective against this specific attack.'}
                    </Typography>
                </Paper>
                </Box>
            </Box>
            )}
        </TabPanel>
        
        {/* Compare Tab */}
        <TabPanel value={activeTab} index={1}>
            <Typography variant="h5" gutterBottom>
            Compare Defense Strategies
            </Typography>
            
            <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                Comparison Parameters
                </Typography>
                
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                {/* Attack Type Selection */}
                <FormControl fullWidth margin="normal">
                    <InputLabel id="compare-attack-type-label">Attack Type</InputLabel>
                    <Select
                    labelId="compare-attack-type-label"
                    value={attackType}
                    label="Attack Type"
                    onChange={handleAttackTypeChange}
                    >
                    {attackTypes.map((attack) => (
                        <MenuItem key={attack} value={attack}>
                        {attack.toUpperCase()}
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>
                
                {/* Epsilon Slider */}
                <Box sx={{ mt: 4, mb: 2 }}>
                    <Typography id="compare-epsilon-slider" gutterBottom>
                    Perturbation Size (ε): {epsilon.toFixed(3)}
                    <Tooltip title="Controls how much the image can be modified. Larger values create stronger attacks to test defense robustness.">
                        <InfoIcon fontSize="small" sx={{ ml: 1, verticalAlign: 'middle', color: 'text.secondary' }} />
                    </Tooltip>
                    </Typography>
                    <Slider
                    aria-labelledby="compare-epsilon-slider"
                    value={epsilon}
                    onChange={handleEpsilonChange}
                    min={0.01}
                    max={0.1}
                    step={0.01}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => value.toFixed(3)}
                    />
                </Box>
                
                {/* Description */}
                <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                    This comparison will evaluate all defense models against the selected attack type and parameters. The results will show the relative performance of each defense strategy.
                    </Typography>
                </Box>
                
                {/* Compare Button */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<CompareIcon />}
                    onClick={handleCompareModels}
                    disabled={isComparingModels}
                    >
                    {isComparingModels ? (
                        <>
                        <CircularProgress size={24} sx={{ mr: 1 }} />
                        Comparing...
                        </>
                    ) : (
                        'Compare Models'
                    )}
                    </Button>
                </Box>
                </Paper>
            </Grid>
            
            <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
                Precomputed Visualizations
            </Typography>
            
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                The following visualizations show precomputed comparisons of different defense strategies:
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                    Robustness Overview
                    </Typography>
                    <img 
                    src="/static/precomputed/robustness_overview.png" 
                    alt="Robustness Overview" 
                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                    />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                    Robustness by Class
                    </Typography>
                    <img 
                    src="/static/precomputed/robustness_by_class.png" 
                    alt="Robustness By Class" 
                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                    />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                    Robustness Drop by Class
                    </Typography>
                    <img 
                    src="/static/precomputed/robustness_drop_by_class.png" 
                    alt="Robustness Drop By Class" 
                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                    />
                </Grid>
                
                <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                    Feature Map Comparison
                    </Typography>
                    <img 
                    src="/static/precomputed/feature_maps_layer3.png" 
                    alt="Feature Maps" 
                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                    />
                </Grid>
                
                <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                    Attack Type Comparison
                    </Typography>
                    <Tabs value={attackComparisonTab} onChange={(e, newValue) => setAttackComparisonTab(newValue)} sx={{ mb: 2 }}>
                    <Tab label="FGSM" />
                    <Tab label="PGD" />
                    <Tab label="DeepFool" />
                    </Tabs>
                    
                    <Box hidden={attackComparisonTab !== 0}>
                    <img 
                        src="/static/precomputed/fgsm_robustness.png" 
                        alt="FGSM Robustness" 
                        style={{ maxWidth: '100%', borderRadius: '8px' }}
                    />
                    </Box>
                    
                    <Box hidden={attackComparisonTab !== 1}>
                    <img 
                        src="/static/precomputed/pgd_robustness.png" 
                        alt="PGD Robustness" 
                        style={{ maxWidth: '100%', borderRadius: '8px' }}
                    />
                    </Box>
                    
                    <Box hidden={attackComparisonTab !== 2}>
                    <img 
                        src="/static/precomputed/deepfool_robustness.png" 
                        alt="DeepFool Robustness" 
                        style={{ maxWidth: '100%', borderRadius: '8px' }}
                    />
                    </Box>
                </Grid>
                </Grid>
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
                Defense Model Comparison Results
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                {/* Robustness Bar Chart */}
                <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Robustness Comparison
                </Typography>
                <img 
                    src={`data:image/png;base64,${comparisonResult.robustness_bar_chart}`} 
                    alt="Robustness comparison" 
                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                />
                </Box>
                
                {/* Advanced Visualizations */}
                <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                    Robustness by Class
                    </Typography>
                    <img 
                    src={`/api/precomputed/${comparisonResult.robustness_by_class}`} 
                    alt="Robustness by class" 
                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                    />
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                    Feature Map Analysis
                    </Typography>
                    <img 
                    src={`/api/precomputed/${comparisonResult.feature_maps}`} 
                    alt="Feature maps" 
                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                    />
                </Grid>
                </Grid>
                
                {/* Model Results */}
                <Typography variant="h6" gutterBottom>
                Model Performance Summary
                </Typography>
                <Grid container spacing={2}>
                {Object.entries(comparisonResult.model_results).map(([modelName, result]) => (
                    <Grid item xs={12} sm={6} md={3} key={modelName}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                        <Typography variant="h6" gutterBottom>
                            {modelName}
                        </Typography>
                        
                        <Typography variant="body2" gutterBottom>
                            <strong>Clean Accuracy:</strong> {(result.clean_accuracy * 100).toFixed(2)}%
                        </Typography>
                        
                        <Typography variant="body2" gutterBottom>
                            <strong>Adversarial Accuracy:</strong> {(result.adv_accuracy * 100).toFixed(2)}%
                        </Typography>
                        
                        <Typography variant="body2" gutterBottom>
                            <strong>Robustness Ratio:</strong> {(result.robustness_ratio * 100).toFixed(2)}%
                        </Typography>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Chip 
                            label={result.robustness_ratio > 0.7 ? "Strong Defense" : (result.robustness_ratio > 0.4 ? "Moderate Defense" : "Weak Defense")} 
                            color={result.robustness_ratio > 0.7 ? "success" : (result.robustness_ratio > 0.4 ? "warning" : "error")} 
                            size="small" 
                            sx={{ mt: 1 }}
                        />
                        </CardContent>
                    </Card>
                    </Grid>
                ))}
                </Grid>
            </Box>
            )}
        </TabPanel>
        
        {/* Learn Tab */}
        <TabPanel value={activeTab} index={2}>
            <Typography variant="h5" gutterBottom>
            Understanding Adversarial Defenses
            </Typography>
            
            <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom className="section-title">
                Adversarial Defense Strategies
            </Typography>
            
            <Typography variant="body1" paragraph>
                Adversarial defenses aim to make neural networks robust against adversarial attacks. Defenses generally fall into three categories:
            </Typography>
            
            <Grid container spacing={3}>
                {/* Empirical Defenses */}
                <Grid item xs={12} md={4}>
                <Card elevation={2} sx={{ height: '100%' }}>
                    <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Empirical Defenses
                    </Typography>
                    
                    <Typography variant="body2" paragraph>
                        These defenses modify the training process or model architecture to empirically improve robustness.
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom>
                        Examples:
                    </Typography>
                    <ul>
                        <li>
                        <Typography variant="body2" gutterBottom>
                            <strong>Adversarial Training:</strong> Incorporating adversarial examples during training
                        </Typography>
                        </li>
                        <li>
                        <Typography variant="body2" gutterBottom>
                            <strong>Defensive Distillation:</strong> Using knowledge distillation to smooth decision boundaries
                        </Typography>
                        </li>
                        <li>
                        <Typography variant="body2">
                            <strong>Feature Denoising:</strong> Adding denoising blocks to remove adversarial perturbations
                        </Typography>
                        </li>
                    </ul>
                    </CardContent>
                </Card>
                </Grid>
                
                {/* Certified Defenses */}
                <Grid item xs={12} md={4}>
                <Card elevation={2} sx={{ height: '100%' }}>
                    <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Certified Defenses
                    </Typography>
                    
                    <Typography variant="body2" paragraph>
                        These defenses provide provable guarantees of robustness within certain bounds.
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom>
                        Examples:
                    </Typography>
                    <ul>
                        <li>
                        <Typography variant="body2" gutterBottom>
                            <strong>Randomized Smoothing:</strong> Using randomization to provide probabilistic robustness certificates
                        </Typography>
                        </li>
                        <li>
                        <Typography variant="body2" gutterBottom>
                            <strong>Convex Relaxations:</strong> Bounding the worst-case adversarial loss using convex optimization
                        </Typography>
                        </li>
                        <li>
                        <Typography variant="body2">
                            <strong>Interval Bound Propagation:</strong> Training networks with formal verification techniques
                        </Typography>
                        </li>
                    </ul>
                    </CardContent>
                </Card>
                </Grid>
                
                {/* Detection Methods */}
                <Grid item xs={12} md={4}>
                <Card elevation={2} sx={{ height: '100%' }}>
                    <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Detection Methods
                    </Typography>
                    
                    <Typography variant="body2" paragraph>
                        These approaches focus on detecting adversarial examples rather than making the model robust.
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom>
                        Examples:
                    </Typography>
                    <ul>
                        <li>
                        <Typography variant="body2" gutterBottom>
                            <strong>Input Preprocessing:</strong> Applying transformations to detect or remove adversarial perturbations
                        </Typography>
                        </li>
                        <li>
                        <Typography variant="body2" gutterBottom>
                            <strong>Statistical Methods:</strong> Using statistical tests to identify out-of-distribution examples
                        </Typography>
                        </li>
                        <li>
                        <Typography variant="body2">
                            <strong>Auxiliary Networks:</strong> Training separate networks to identify adversarial examples
                        </Typography>
                        </li>
                    </ul>
                    </CardContent>
                </Card>
                </Grid>
            </Grid>
            </Box>
            
            <Box sx={{ mt: 5 }}>
            <Typography variant="h6" gutterBottom className="section-title">
                Adversarial Training Deep Dive
            </Typography>
            
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                <Typography variant="body1" paragraph>
                    Adversarial training is one of the most effective empirical defenses. It works by incorporating adversarial examples into the training process, allowing the model to learn to resist these attacks.
                </Typography>
                
                <Typography variant="subtitle1" gutterBottom>
                    The Min-Max Formulation:
                </Typography>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                    <Box className="math-container" sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.03)', borderRadius: 1, overflow: 'auto' }}>
                    <MathComponent
                        tex="\min_{\theta} \mathbb{E}_{(x,y) \sim D} [\max_{\delta \in S} L(f_\theta(x + \delta), y)]"
                    />
                    </Box>
                </Paper>
                
                <Typography variant="body2" paragraph>
                    This formulation has two parts:
                </Typography>
                <ul>
                    <li>
                    <Typography variant="body2" paragraph>
                        <strong>Inner maximization:</strong> Find the worst-case adversarial example within the allowed perturbation set.
                    </Typography>
                    </li>
                    <li>
                    <Typography variant="body2">
                        <strong>Outer minimization:</strong> Update the model to minimize the loss on these worst-case examples.
                    </Typography>
                    </li>
                </ul>
                
                <Typography variant="body2" paragraph>
                    In practice, the inner maximization is approximated using attack methods like PGD, and the outer minimization is performed using standard optimization techniques like SGD.
                </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                    Key Challenges in Adversarial Training:
                </Typography>
                
                <Card elevation={2} sx={{ mb: 3 }}>
                    <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                        Robustness vs. Accuracy Trade-off
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Improving robustness often comes at the cost of standard accuracy. This trade-off appears to be fundamental to current approaches.
                    </Typography>
                    
                    <Box className="math-container" sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.03)', borderRadius: 1, overflow: 'auto' }}>
                        <MathComponent
                        tex="\text{Trade-off: } \quad \text{Robust Error} = \text{Standard Error} + \text{Boundary Error}"
                        />
                    </Box>
                    </CardContent>
                </Card>
                
                <Card elevation={2} sx={{ mb: 3 }}>
                    <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                        Computational Cost
                    </Typography>
                    <Typography variant="body2">
                        Generating adversarial examples during training, especially with iterative methods like PGD, significantly increases the computational cost compared to standard training.
                    </Typography>
                    </CardContent>
                </Card>
                
                <Card elevation={2}>
                    <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                        Generalization to Unseen Attacks
                    </Typography>
                    <Typography variant="body2">
                        Models trained against one type of attack may remain vulnerable to other attack methods. This is known as adaptive attacks or transferability.
                    </Typography>
                    </CardContent>
                </Card>
                </Grid>
            </Grid>
            </Box>
            
            <Box sx={{ mt: 5 }}>
            <Typography variant="h6" gutterBottom className="section-title">
                Evaluating Adversarial Robustness
            </Typography>
            
            <Typography variant="body1" paragraph>
                Properly evaluating the robustness of defense methods is crucial. Several metrics and approaches are commonly used:
            </Typography>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                <Card className="result-card" elevation={2}>
                    <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Empirical Robustness
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Measuring model performance against various adversarial attacks with different parameters.
                    </Typography>
                    <ul>
                        <li>
                        <Typography variant="body2">
                            <strong>Attack Success Rate:</strong> Percentage of adversarial examples that fool the model
                        </Typography>
                        </li>
                        <li>
                        <Typography variant="body2">
                            <strong>Robust Accuracy:</strong> Model accuracy on adversarial examples
                        </Typography>
                        </li>
                    </ul>
                    </CardContent>
                </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                <Card className="result-card" elevation={2}>
                    <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Certified Robustness
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Providing mathematical guarantees about model robustness within a certain perturbation bound.
                    </Typography>
                    <ul>
                        <li>
                        <Typography variant="body2">
                            <strong>Certification Rate:</strong> Percentage of examples that can be certified robust
                        </Typography>
                        </li>
                        <li>
                        <Typography variant="body2">
                            <strong>Certified Radius:</strong> Maximum perturbation size for which robustness can be guaranteed
                        </Typography>
                        </li>
                    </ul>
                    </CardContent>
                </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                <Card className="result-card" elevation={2}>
                    <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Adaptive Evaluation
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Testing defenses against attacks specifically designed to bypass them.
                    </Typography>
                    <ul>
                        <li>
                        <Typography variant="body2">
                            <strong>Adaptive Attacks:</strong> Customizing attacks to target specific defense mechanisms
                        </Typography>
                        </li>
                        <li>
                        <Typography variant="body2">
                            <strong>Transferability:</strong> Testing robustness against attacks transferred from other models
                        </Typography>
                        </li>
                    </ul>
                    </CardContent>
                </Card>
                </Grid>
            </Grid>
            </Box>
            
            <Box sx={{ mt: 5 }}>
            <Typography variant="h6" gutterBottom className="section-title">
                Future Directions
            </Typography>
            
            <Typography variant="body1" paragraph>
                Adversarial robustness remains an active area of research with several promising directions:
            </Typography>
            
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2, backgroundColor: '#f9f9f9' }}>
                <ul>
                <li>
                    <Typography variant="body2" paragraph>
                    <strong>Robust Architectures:</strong> Developing network architectures inherently more resistant to adversarial attacks.
                    </Typography>
                </li>
                <li>
                    <Typography variant="body2" paragraph>
                    <strong>Efficient Training Methods:</strong> Making adversarial training more computationally efficient.
                    </Typography>
                </li>
                <li>
                    <Typography variant="body2" paragraph>
                    <strong>Improved Certification:</strong> Developing tighter bounds and more efficient methods for robustness certification.
                    </Typography>
                </li>
                <li>
                    <Typography variant="body2" paragraph>
                    <strong>Understanding the Trade-offs:</strong> Better theoretical understanding of the relationship between standard accuracy, robustness, and model complexity.
                    </Typography>
                </li>
                <li>
                    <Typography variant="body2">
                    <strong>Unified Defense Framework:</strong> Developing approaches that combine the strengths of different defense strategies.
                    </Typography>
                </li>
                </ul>
            </Paper>
            </Box>
        </TabPanel>
        </Box>
    );
}

export default DefensesPage;