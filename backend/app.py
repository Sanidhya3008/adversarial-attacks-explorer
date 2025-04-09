from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import io
import base64
import torch
import numpy as np
from PIL import Image
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt

# Import our modules
from models.attacks import load_model, process_image, generate_adversarial_example, tensor_to_base64
from models.defenses import evaluate_model_robustness, visualize_robustness_comparison
from utils.visualization import plot_comparison, plot_attack_comparison, plot_confidence_comparison
from utils.image_utils import base64_to_image

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Device configuration
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")

# Ensure directories exist
os.makedirs('static/uploads', exist_ok=True)
os.makedirs('static/precomputed', exist_ok=True)
os.makedirs('pretrained', exist_ok=True)

# Load model at startup to avoid loading delays during first request
print("Loading model...")
model = load_model()
print("Model loaded successfully!")

# Available attack types
attack_types = ['fgsm', 'pgd', 'deepfool', 'cw']

# Available defense models
defense_models = [
    'best_standard_model.pth',
    'best_adv_pgd_model.pth',
    'best_distill_model.pth',
    'best_progressive_pgd_model.pth'
]

# Endpoint to get available attacks
@app.route('/api/attacks', methods=['GET'])
def get_attacks():
    return jsonify({
        'attacks': attack_types
    })

# Endpoint to get available defense models
@app.route('/api/defenses', methods=['GET'])
def get_defenses():
    return jsonify({
        'defenses': defense_models
    })

# Endpoint to generate adversarial example
@app.route('/api/generate_adversarial', methods=['POST'])
def generate_adversarial():
    # Get parameters from request
    data = request.json
    image_base64 = data.get('image')
    attack_type = data.get('attack_type', 'fgsm')
    epsilon = float(data.get('epsilon', 0.03))
    
    try:
        # Convert base64 to image
        image = base64_to_image(image_base64)
        
        # Process image
        img_tensor = process_image(image)
        
        # Generate adversarial example
        result = generate_adversarial_example(img_tensor, attack_type, epsilon)
        
        # Convert tensors to base64 for response
        original_base64 = tensor_to_base64(result['original_image'])
        adversarial_base64 = tensor_to_base64(result['adversarial_image'])
        
        # Generate comparison plot
        comparison_plot = plot_comparison(
            result['original_image'], 
            result['adversarial_image'],
            f"{result['original_pred']} ({result['original_conf']:.2f})",
            f"{result['adv_pred']} ({result['adv_conf']:.2f})",
            result['perturbation'],
            attack_type.upper()
        )
        
        # Prepare response
        response = {
            'original_image': original_base64,
            'adversarial_image': adversarial_base64,
            'original_pred': result['original_pred'],
            'original_conf': result['original_conf'],
            'adv_pred': result['adv_pred'],
            'adv_conf': result['adv_conf'],
            'l2_dist': result['l2_dist'],
            'linf_dist': result['linf_dist'],
            'comparison_plot': comparison_plot,
            'success': result['original_pred'] != result['adv_pred']
        }
        
        return jsonify(response)
    except Exception as e:
        print(f"Error generating adversarial example: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Endpoint to generate comparison of attack methods
@app.route('/api/compare_attacks', methods=['POST'])
def compare_attacks():
    # Get parameters from request
    data = request.json
    image_base64 = data.get('image')
    attacks = data.get('attacks', attack_types)
    epsilon = float(data.get('epsilon', 0.03))
    
    try:
        # Convert base64 to image
        image = base64_to_image(image_base64)
        
        # Process image
        img_tensor = process_image(image)
        
        # Generate adversarial examples for each attack
        attack_results = {}
        for attack_type in attacks:
            result = generate_adversarial_example(img_tensor, attack_type, epsilon)
            attack_results[attack_type] = result
        
        # Generate comparison plot
        comparison_plot = plot_attack_comparison(attack_results)
        
        # Generate confidence comparison plot
        confidence_plot = plot_confidence_comparison(attack_results)
        
        # Prepare response
        response = {
            'comparison_plot': comparison_plot,
            'confidence_plot': confidence_plot,
            'attack_results': {
                attack: {
                    'original_pred': results['original_pred'],
                    'adv_pred': results['adv_pred'],
                    'original_conf': results['original_conf'],
                    'adv_conf': results['adv_conf'],
                    'l2_dist': results['l2_dist'],
                    'linf_dist': results['linf_dist'],
                    'success': results['original_pred'] != results['adv_pred']
                } for attack, results in attack_results.items()
            }
        }
        
        return jsonify(response)
    except Exception as e:
        print(f"Error comparing attacks: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Endpoint to evaluate defense model robustness
@app.route('/api/evaluate_defense', methods=['POST'])
def evaluate_defense():
    # Get parameters from request
    data = request.json
    model_name = data.get('model_name', 'best_standard_model.pth')
    attack_type = data.get('attack_type', 'pgd')
    epsilon = float(data.get('epsilon', 0.03))
    
    try:
        # Evaluate model robustness
        results = evaluate_model_robustness(model_name, attack_type, epsilon)
        
        # Prepare response
        response = {
            'clean_accuracy': results['clean_accuracy'],
            'adv_accuracy': results['adv_accuracy'],
            'example_images': results['example_images'],
            'example_plots': results['example_plots']
        }
        
        return jsonify(response)
    except Exception as e:
        print(f"Error evaluating defense model: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Endpoint to compare defense models
@app.route('/api/compare_defenses', methods=['POST'])
def compare_defenses():
    # Get parameters from request
    data = request.json
    model_names = data.get('model_names', defense_models)
    attack_type = data.get('attack_type', 'pgd')
    epsilon = float(data.get('epsilon', 0.03))
    
    try:
        # Compare defense models
        comparison_results = visualize_robustness_comparison(model_names, attack_type, epsilon)
        
        # Prepare response
        response = {
            'robustness_bar_chart': comparison_results['robustness_bar_chart'],
            'robustness_by_class': comparison_results['robustness_by_class'],
            'feature_maps': comparison_results['feature_maps'],
            'model_results': comparison_results['model_results']
        }
        
        return jsonify(response)
    except Exception as e:
        print(f"Error comparing defense models: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Endpoint to get precomputed visualizations
@app.route('/api/precomputed/<visualization_type>', methods=['GET'])
def get_precomputed(visualization_type):
    # Map visualization type to file path
    precomputed_visualizations = {
        'fgsm_robustness': 'fgsm_robustness.png',
        'pgd_robustness': 'pgd_robustness.png',
        'deepfool_robustness': 'deepfool_robustness.png',
        'robustness_overview': 'robustness_overview.png',
        'robustness_by_class': 'robustness_by_class.png',
        'robustness_drop_by_class': 'robustness_drop_by_class.png',
        'feature_maps': 'feature_maps_layer3.png',
        'gradient_visualization': 'gradient_visualization.png',
        'loss_landscape': 'loss_landscape.png',
        'integrated_gradients': 'integrated_gradients_comparison.png',
        'transferability_matrix': 'transferability_matrix.png'
    }
    
    if visualization_type not in precomputed_visualizations:
        return jsonify({'error': 'Visualization not found'}), 404
    
    file_path = os.path.join('static', 'precomputed', precomputed_visualizations[visualization_type])
    
    # Check if file exists
    if not os.path.exists(file_path):
        return jsonify({'error': 'Visualization file not found'}), 404
    
    # Return the image file
    return send_from_directory('static/precomputed', precomputed_visualizations[visualization_type])

# Serve static files
@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)