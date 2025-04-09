import axios from 'axios';

const API_BASE_URL = 'https://saninets-adversarial-attacks-backend.hf.space/api';

// API client instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Get available attack types
export const getAttackTypes = async () => {
    try {
        const response = await apiClient.get('/attacks');
        return response.data.attacks;
    } catch (error) {
        console.error('Error fetching attack types:', error);
        throw error;
    }
};

// Get available defense models
export const getDefenseModels = async () => {
    try {
        const response = await apiClient.get('/defenses');
        return response.data.defenses;
    } catch (error) {
        console.error('Error fetching defense models:', error);
        throw error;
    }
};

// Generate an adversarial example
export const generateAdversarialExample = async (imageBase64, attackType, epsilon) => {
    try {
        // Remove data URL prefix if present
        const imageData = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        
        const response = await apiClient.post('/generate_adversarial', {
        image: imageData,
        attack_type: attackType,
        epsilon: epsilon
        });
        
        return response.data;
    } catch (error) {
        console.error('Error generating adversarial example:', error);
        throw error;
    }
};

// Compare different attack methods
export const compareAttacks = async (imageBase64, attackTypes, epsilon) => {
    try {
        // Remove data URL prefix if present
        const imageData = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        
        const response = await apiClient.post('/compare_attacks', {
        image: imageData,
        attacks: attackTypes,
        epsilon: epsilon
        });
        
        return response.data;
    } catch (error) {
        console.error('Error comparing attacks:', error);
        throw error;
    }
};

// Evaluate defense model robustness
export const evaluateDefenseModel = async (modelName, attackType, epsilon) => {
    try {
        const response = await apiClient.post('/evaluate_defense', {
        model_name: modelName,
        attack_type: attackType,
        epsilon: epsilon
        });
        
        return response.data;
    } catch (error) {
        console.error('Error evaluating defense model:', error);
        throw error;
    }
};

// Compare defense models
export const compareDefenseModels = async (modelNames, attackType, epsilon) => {
    try {
        const response = await apiClient.post('/compare_defenses', {
        model_names: modelNames,
        attack_type: attackType,
        epsilon: epsilon
        });
        
        return response.data;
    } catch (error) {
        console.error('Error comparing defense models:', error);
        throw error;
    }
};

// Get precomputed visualization
export const getPrecomputedVisualization = (visualizationType) => {
    return `${API_BASE_URL}/precomputed/${visualizationType}`;
};

export default {
    getAttackTypes,
    getDefenseModels,
    generateAdversarialExample,
    compareAttacks,
    evaluateDefenseModel,
    compareDefenseModels,
    getPrecomputedVisualization
};