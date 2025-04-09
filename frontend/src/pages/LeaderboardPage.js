import React, { useState } from 'react';
import {
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    Grid,
    Tooltip,
    Chip,
    IconButton
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import DownloadIcon from '@mui/icons-material/Download';

// Tab panel component
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
        role="tabpanel"
        hidden={value !== index}
        id={`leaderboard-tabpanel-${index}`}
        aria-labelledby={`leaderboard-tab-${index}`}
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
        clean_accuracy: 0.7571,
        fgsm_accuracy: 0.5600,
        pgd_accuracy: 0.6500,
        deepfool_accuracy: 0.1300,
        cw_accuracy: 0.2800,
        avg_robustness: 0.4050,
        robustness_ratio: 0.5350,
        computation_time: 1.0,
        parameters: '11.2M'
    },
    {
        id: 'adversarial',
        name: 'Adversarial Training',
        file: 'best_adv_pgd_model.pth',
        description: 'Model trained with adversarial examples generated using PGD attack during training.',
        clean_accuracy: 0.6887,
        fgsm_accuracy: 0.6000,
        pgd_accuracy: 0.6000,
        deepfool_accuracy: 0.1550,
        cw_accuracy: 0.3200,
        avg_robustness: 0.4187,
        robustness_ratio: 0.6081,
        computation_time: 7.5,
        parameters: '11.2M'
    },
    {
        id: 'distillation',
        name: 'Defensive Distillation',
        file: 'best_distill_model.pth',
        description: 'Model trained using knowledge distillation with soft labels and high temperature to smooth decision boundaries.',
        clean_accuracy: 0.7114,
        fgsm_accuracy: 0.5950,
        pgd_accuracy: 0.5800,
        deepfool_accuracy: 0.1800,
        cw_accuracy: 0.2900,
        avg_robustness: 0.4112,
        robustness_ratio: 0.5784,
        computation_time: 5.0,
        parameters: '11.2M'
    },
    {
        id: 'progressive',
        name: 'Progressive Training',
        file: 'best_progressive_pgd_model.pth',
        description: 'Model trained with progressively stronger adversarial examples, gradually increasing attack strength.',
        clean_accuracy: 0.6891,
        fgsm_accuracy: 0.6100,
        pgd_accuracy: 0.6200,
        deepfool_accuracy: 0.1650,
        cw_accuracy: 0.3300,
        avg_robustness: 0.4312,
        robustness_ratio: 0.6257,
        computation_time: 9.0,
        parameters: '11.2M'
    }
];

function LeaderboardPage() {
    // State for the active tab
    const [activeTab, setActiveTab] = useState(0);
    
    // Calculate rank for each metric
    const rankModels = (models, metric) => {
        const sortedModels = [...models].sort((a, b) => b[metric] - a[metric]);
        return sortedModels.map((model, index) => ({
        ...model,
        rank: index + 1
        }));
    };
    
    // Get ranking for a specific metric
    const getModelRank = (modelId, metric) => {
        const rankedModels = rankModels(defenseModels, metric);
        const model = rankedModels.find(m => m.id === modelId);
        return model ? model.rank : '-';
    };
    
    // Get ranking style based on rank
    const getRankStyle = (rank) => {
        if (rank === 1) return { color: '#FFD700', fontWeight: 'bold' };
        if (rank === 2) return { color: '#C0C0C0', fontWeight: 'bold' };
        if (rank === 3) return { color: '#CD7F32', fontWeight: 'bold' };
        return {};
    };
    
    // Get color for accuracy value
    const getAccuracyColor = (value) => {
        if (value >= 0.7) return 'success';
        if (value >= 0.5) return 'warning';
        return 'error';
    };
    
    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };
    
    // Handle download click (this would be implemented to download CSV data in a real app)
    const handleDownload = () => {
        alert('This would download the leaderboard data as a CSV file in a real application.');
    };
    
    return (
        <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">
            Defense Leaderboard
            </Typography>
            
            <Tooltip title="Download leaderboard data (CSV)">
            <IconButton color="primary" onClick={handleDownload}>
                <DownloadIcon />
            </IconButton>
            </Tooltip>
        </Box>
        
        <Typography variant="body1" paragraph>
            This leaderboard compares the performance of different adversarial defense strategies against various attack methods. All models were evaluated on the CIFAR-10 dataset using the same test set and attack parameters (ε=0.03).
        </Typography>
        
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Overall Rankings" />
            <Tab label="Attack Comparison" />
            <Tab label="Analysis" />
        </Tabs>
        
        {/* Overall Rankings Tab */}
        <TabPanel value={activeTab} index={0}>
            <TableContainer component={Paper} elevation={2}>
            <Table aria-label="defense leaderboard">
                <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Rank</strong></TableCell>
                    <TableCell><strong>Model</strong></TableCell>
                    <TableCell align="center"><strong>Clean Accuracy</strong></TableCell>
                    <TableCell align="center"><strong>Avg. Robustness</strong></TableCell>
                    <TableCell align="center"><strong>Robustness Ratio</strong> <Tooltip title="Ratio of average adversarial accuracy to clean accuracy. Higher is better."><InfoIcon fontSize="small" /></Tooltip></TableCell>
                    <TableCell align="center"><strong>Computation</strong> <Tooltip title="Relative training time compared to standard training"><InfoIcon fontSize="small" /></Tooltip></TableCell>
                    <TableCell align="center"><strong>Parameters</strong></TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {rankModels(defenseModels, 'robustness_ratio').map((model, index) => (
                    <TableRow 
                    key={model.id}
                    sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                        '&:hover': { backgroundColor: '#f0f7ff' }
                    }}
                    >
                    <TableCell sx={getRankStyle(index + 1)}>
                        {index + 1}
                    </TableCell>
                    <TableCell>
                        <Typography variant="body1"><strong>{model.name}</strong></Typography>
                        <Typography variant="caption" color="text.secondary">{model.description}</Typography>
                    </TableCell>
                    <TableCell align="center">
                        <Chip 
                        label={`${(model.clean_accuracy * 100).toFixed(1)}%`} 
                        size="small"
                        color={getAccuracyColor(model.clean_accuracy)}
                        variant="outlined"
                        />
                    </TableCell>
                    <TableCell align="center">
                        <Chip 
                        label={`${(model.avg_robustness * 100).toFixed(1)}%`} 
                        size="small"
                        color={getAccuracyColor(model.avg_robustness)}
                        variant="outlined"
                        />
                    </TableCell>
                    <TableCell align="center">
                        <Chip 
                        label={`${(model.robustness_ratio * 100).toFixed(1)}%`} 
                        size="small"
                        color={getAccuracyColor(model.robustness_ratio)}
                        variant="outlined"
                        />
                    </TableCell>
                    <TableCell align="center">
                        {model.computation_time}x
                    </TableCell>
                    <TableCell align="center">
                        {model.parameters}
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </TableContainer>
            
            <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                Comparison Across Attacks
            </Typography>
            
            <Grid container spacing={1}>
                {/* Clean Accuracy */}
                <Grid item xs={12}>
                <TableContainer component={Paper} elevation={1}>
                    <Table size="small" aria-label="attack comparison">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell><strong>Model</strong></TableCell>
                        <TableCell align="center"><strong>Clean Accuracy</strong></TableCell>
                        <TableCell align="center"><strong>FGSM</strong></TableCell>
                        <TableCell align="center"><strong>PGD</strong></TableCell>
                        <TableCell align="center"><strong>DeepFool</strong></TableCell>
                        <TableCell align="center"><strong>C&W</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {defenseModels.map((model) => (
                        <TableRow 
                            key={model.id}
                            sx={{ 
                            '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                            '&:hover': { backgroundColor: '#f0f7ff' }
                            }}
                        >
                            <TableCell>{model.name}</TableCell>
                            <TableCell align="center">
                            <Typography variant="body2" sx={getRankStyle(getModelRank(model.id, 'clean_accuracy'))}>
                                {(model.clean_accuracy * 100).toFixed(1)}%
                            </Typography>
                            </TableCell>
                            <TableCell align="center">
                            <Typography variant="body2" sx={getRankStyle(getModelRank(model.id, 'fgsm_accuracy'))}>
                                {(model.fgsm_accuracy * 100).toFixed(1)}%
                            </Typography>
                            </TableCell>
                            <TableCell align="center">
                            <Typography variant="body2" sx={getRankStyle(getModelRank(model.id, 'pgd_accuracy'))}>
                                {(model.pgd_accuracy * 100).toFixed(1)}%
                            </Typography>
                            </TableCell>
                            <TableCell align="center">
                            <Typography variant="body2" sx={getRankStyle(getModelRank(model.id, 'deepfool_accuracy'))}>
                                {(model.deepfool_accuracy * 100).toFixed(1)}%
                            </Typography>
                            </TableCell>
                            <TableCell align="center">
                            <Typography variant="body2" sx={getRankStyle(getModelRank(model.id, 'cw_accuracy'))}>
                                {(model.cw_accuracy * 100).toFixed(1)}%
                            </Typography>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </TableContainer>
                </Grid>
            </Grid>
            </Box>
            
            <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                Rankings Visualization
            </Typography>
            <img 
                src="/api/precomputed/robustness_overview" 
                alt="Model robustness overview" 
                style={{ maxWidth: '100%', borderRadius: '8px' }}
            />
            </Box>
        </TabPanel>
        
        {/* Attack Comparison Tab */}
        <TabPanel value={activeTab} index={1}>
            <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                Attack Effectiveness
                </Typography>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="body1" paragraph>
                    Different attack methods have varying effectiveness against the defense models:
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                    Average Accuracy Across Models
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ width: '120px' }}>Clean:</Typography>
                    <Box sx={{ flexGrow: 1, backgroundColor: '#e3f2fd', borderRadius: 1, p: 0.5 }}>
                        <Box sx={{ width: '71.2%', backgroundColor: '#2196f3', height: '20px', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" color="white">71.2%</Typography>
                        </Box>
                    </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ width: '120px' }}>FGSM:</Typography>
                    <Box sx={{ flexGrow: 1, backgroundColor: '#e3f2fd', borderRadius: 1, p: 0.5 }}>
                        <Box sx={{ width: '59.1%', backgroundColor: '#42a5f5', height: '20px', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" color="white">59.1%</Typography>
                        </Box>
                    </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ width: '120px' }}>PGD:</Typography>
                    <Box sx={{ flexGrow: 1, backgroundColor: '#e3f2fd', borderRadius: 1, p: 0.5 }}>
                        <Box sx={{ width: '61.3%', backgroundColor: '#64b5f6', height: '20px', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" color="white">61.3%</Typography>
                        </Box>
                    </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ width: '120px' }}>DeepFool:</Typography>
                    <Box sx={{ flexGrow: 1, backgroundColor: '#e3f2fd', borderRadius: 1, p: 0.5 }}>
                        <Box sx={{ width: '15.8%', backgroundColor: '#f44336', height: '20px', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" color="white">15.8%</Typography>
                        </Box>
                    </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ width: '120px' }}>C&W:</Typography>
                    <Box sx={{ flexGrow: 1, backgroundColor: '#e3f2fd', borderRadius: 1, p: 0.5 }}>
                        <Box sx={{ width: '30.1%', backgroundColor: '#ff7043', height: '20px', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" color="white">30.1%</Typography>
                        </Box>
                    </Box>
                    </Box>
                </Box>
                
                <Typography variant="body2" paragraph>
                    <strong>Analysis:</strong> DeepFool is the most effective attack across all models, reducing average accuracy to just 15.8%. PGD and FGSM have similar effectiveness, while C&W falls in between.
                </Typography>
                </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                Defense Effectiveness
                </Typography>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                    Model Performance by Attack Type
                </Typography>
                <img 
                    src="/api/precomputed/pgd_robustness" 
                    alt="PGD Attack Robustness" 
                    style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '16px' }}
                />
                
                <Typography variant="body2" paragraph>
                    <strong>Key Findings:</strong>
                </Typography>
                <ul>
                    <li>
                    <Typography variant="body2" paragraph>
                        Progressive training shows the best overall robustness across different attacks.
                    </Typography>
                    </li>
                    <li>
                    <Typography variant="body2" paragraph>
                        Standard training has the highest clean accuracy but drops significantly under attack.
                    </Typography>
                    </li>
                    <li>
                    <Typography variant="body2" paragraph>
                        Adversarial training provides consistent performance across different attack types.
                    </Typography>
                    </li>
                    <li>
                    <Typography variant="body2">
                        All models struggle with DeepFool attacks, showing the effectiveness of this attack method.
                    </Typography>
                    </li>
                </ul>
                </Paper>
            </Grid>
            </Grid>
            
            <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                Transferability Analysis
            </Typography>
            <img 
                src="/static/precomputed/transferability_matrix.png" 
                alt="Attack transferability matrix" 
                style={{ maxWidth: '100%', borderRadius: '8px' }}
            />
            
            <Typography variant="body2" sx={{ mt: 2 }}>
                This matrix shows how well adversarial examples transfer between models. Darker colors indicate higher transferability (attacks generated for the source model are more effective against the target model).
            </Typography>
            </Box>
        </TabPanel>
        
        {/* Analysis Tab */}
        <TabPanel value={activeTab} index={2}>
        <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
                Robustness vs. Accuracy Trade-off
            </Typography>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <img 
                src="/static/precomputed/robustness_drop_by_class.png" 
                alt="Robustness drop by class" 
                style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '16px' }}
                />
                
                <Typography variant="body2" paragraph>
                The traditional trade-off between standard accuracy and robustness is evident in our results. Models with higher adversarial robustness tend to have lower clean accuracy, while the standard model achieves the highest clean accuracy but is more vulnerable to attacks.
                </Typography>
            </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
                Class-wise Robustness
            </Typography>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <img 
                src="/static/precomputed/robustness_by_class.png" 
                alt="Robustness by class" 
                style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '16px' }}
                />
                
                <Typography variant="body2" paragraph>
                Robustness varies significantly across different classes. Some classes like 'ship' and 'automobile' are inherently more robust, while others like 'cat' and 'dog' are more vulnerable to adversarial attacks.
                </Typography>
            </Paper>
            </Grid>
        </Grid>
        
        <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
                Feature Visualization
            </Typography>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <img 
                src="/static/precomputed/feature_maps_layer3.png" 
                alt="Feature maps" 
                style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '16px' }}
                />
                
                <Typography variant="body2">
                Visualizing intermediate feature maps reveals how different defense models process adversarial examples. More robust models show less disruption in feature activations when presented with adversarial inputs.
                </Typography>
            </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
                Loss Landscape Analysis
            </Typography>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <img 
                src="/static/precomputed/loss_landscape.png" 
                alt="Loss landscape" 
                style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '16px' }}
                />
                
                <Typography variant="body2">
                The loss landscape around clean and adversarial examples provides insights into model robustness. Adversarially trained models tend to have smoother loss landscapes with fewer sharp valleys and peaks.
                </Typography>
            </Paper>
            </Grid>
        </Grid>
        
        <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
                Gradient Analysis
            </Typography>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <img 
                src="/static/precomputed/gradient_visualization.png" 
                alt="Gradient visualization" 
                style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '16px' }}
                />
                
                <Typography variant="body2">
                Input gradient analysis shows how each pixel influences the model's predictions. For adversarial examples, the gradients often highlight different regions compared to clean images.
                </Typography>
            </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
                Integrated Gradients
            </Typography>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <img 
                src="/static/precomputed/integrated_gradients_comparison.png" 
                alt="Integrated gradients" 
                style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '16px' }}
                />
                
                <Typography variant="body2">
                Integrated gradients help visualize which features different models focus on when making predictions. The robust models tend to focus on more semantically relevant features.
                </Typography>
            </Paper>
            </Grid>
        </Grid>
        </TabPanel>
        </Box>
    );
}

export default LeaderboardPage;