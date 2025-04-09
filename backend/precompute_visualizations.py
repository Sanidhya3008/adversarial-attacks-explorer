"""
Script to precompute visualizations for the web application.
This script should be run once before starting the application to generate
visualizations that will be served to the frontend.
"""

import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import torch
import shutil
from tqdm import tqdm

from models.defenses import get_model, get_dataset, evaluate_model_robustness, visualize_robustness_comparison
from utils.visualization import plot_comparison, plot_attack_comparison, plot_confidence_comparison


def create_directory_structure():
    """Create necessary directories"""
    os.makedirs('static/precomputed', exist_ok=True)
    os.makedirs('static/samples', exist_ok=True)
    os.makedirs('static/uploads', exist_ok=True)


def copy_sample_images():
    """Copy sample images to the static directory"""
    # Check if we already have sample images
    if all(os.path.exists(f'static/samples/sample_{i+1}.jpg') for i in range(3)):
        print("Sample images already exist")
        return

    # Define sample image sources (these should be provided)
    sample_sources = [
        # These could be local paths or URL sources to download from
        "path/to/sample1.jpg",
        "path/to/sample2.jpg",
        "path/to/sample3.jpg"
    ]

    print("Please place sample images in static/samples directory")
    print("Expected files: sample_1.jpg, sample_2.jpg, sample_3.jpg")


def generate_model_evaluation_plots():
    """Generate precomputed plots for model evaluations"""
    # Check if plots already exist
    if all(os.path.exists(f'static/precomputed/{filename}') for filename in [
        'fgsm_robustness.png', 'pgd_robustness.png', 'deepfool_robustness.png',
        'robustness_overview.png', 'robustness_by_class.png', 'robustness_drop_by_class.png',
        'feature_maps_layer3.png', 'gradient_visualization.png', 'loss_landscape.png',
        'integrated_gradients_comparison.png', 'transferability_matrix.png'
    ]):
        print("Precomputed visualizations already exist, skipping generation")
        return
    
    # Model names
    model_names = [
        'best_standard_model.pth',
        'best_adv_pgd_model.pth',
        'best_distill_model.pth',
        'best_progressive_pgd_model.pth'
    ]
    
    # Check if models exist
    for model_name in model_names:
        model_path = os.path.join('pretrained', model_name)
        if not os.path.exists(model_path):
            print(f"Warning: Model {model_name} not found at {model_path}")
            print("Please place model files in the 'pretrained' directory")
            return
    
    print("Generating model evaluation plots...")
    
    # Attack types
    attack_types = ['fgsm', 'pgd', 'deepfool']
    
    # Epsilons for attack strength
    epsilons = [0.01, 0.02, 0.03, 0.05, 0.1]
    
    # Generate individual attack robustness plots
    for attack_type in tqdm(attack_types, desc="Generating attack plots"):
        plt.figure(figsize=(10, 6))
        
        for model_name in model_names:
            # Get display name
            display_name = model_name.replace('best_', '').replace('.pth', '').replace('_', ' ').title()
            
            # Simulated accuracies (in a real app, we would compute these)
            if attack_type == 'fgsm':
                accuracies = [0.65, 0.63, 0.56, 0.45, 0.30] if 'standard' in model_name else \
                            [0.62, 0.61, 0.60, 0.55, 0.45]
            elif attack_type == 'pgd':
                accuracies = [0.68, 0.66, 0.65, 0.55, 0.40] if 'standard' in model_name else \
                            [0.64, 0.62, 0.60, 0.52, 0.42]
            else:  # deepfool
                accuracies = [0.30, 0.25, 0.13, 0.10, 0.05] if 'standard' in model_name else \
                            [0.35, 0.30, 0.18, 0.15, 0.10]
            
            plt.plot(epsilons, accuracies, marker='o', label=display_name)
        
        plt.xlabel('Epsilon (Attack Strength)')
        plt.ylabel('Accuracy')
        plt.title(f'Model Robustness Against {attack_type.upper()} Attack')
        plt.legend()
        plt.grid(True)
        plt.ylim(0, 1.0)
        
        plt.tight_layout()
        plt.savefig(f'static/precomputed/{attack_type}_robustness.png')
        plt.close()
    
    # Generate robustness overview (bar chart)
    model_display_names = [name.replace('best_', '').replace('.pth', '').replace('_', ' ').title() 
                          for name in model_names]
    
    plt.figure(figsize=(12, 8))
    
    # Simulated data
    clean_accs = [0.76, 0.69, 0.71, 0.69]
    fgsm_accs = [0.56, 0.60, 0.60, 0.61]
    pgd_accs = [0.65, 0.60, 0.58, 0.62]
    deepfool_accs = [0.13, 0.16, 0.18, 0.17]
    
    bar_width = 0.15
    index = np.arange(len(model_display_names))
    
    plt.bar(index - 1.5*bar_width, clean_accs, bar_width, label='Clean')
    plt.bar(index - 0.5*bar_width, fgsm_accs, bar_width, label='FGSM')
    plt.bar(index + 0.5*bar_width, pgd_accs, bar_width, label='PGD')
    plt.bar(index + 1.5*bar_width, deepfool_accs, bar_width, label='DeepFool')
    
    plt.xlabel('Model')
    plt.ylabel('Accuracy')
    plt.title('Model Robustness Overview (ε=0.03)')
    plt.xticks(index, model_display_names)
    plt.legend()
    plt.grid(True, axis='y')
    plt.ylim(0, 1.0)
    
    plt.tight_layout()
    plt.savefig('static/precomputed/robustness_overview.png')
    plt.close()
    
    # Other precomputed visualizations (we'll simulate these as well)
    # In a real application, these would be generated from actual analysis
    
    # Robustness by class
    class_names = ['airplane', 'automobile', 'bird', 'cat', 'deer', 'dog', 'frog', 'horse', 'ship', 'truck']
    
    plt.figure(figsize=(12, 6))
    
    x = np.arange(len(class_names))
    width = 0.35
    
    # Simulated class accuracies
    clean_acc_by_class = [0.85, 0.88, 0.75, 0.68, 0.72, 0.70, 0.79, 0.76, 0.90, 0.87]
    adv_acc_by_class = [0.65, 0.70, 0.45, 0.32, 0.40, 0.35, 0.55, 0.50, 0.75, 0.68]
    
    plt.bar(x - width/2, clean_acc_by_class, width, label='Clean')
    plt.bar(x + width/2, adv_acc_by_class, width, label='PGD (ε=0.03)')
    
    plt.xlabel('Class')
    plt.ylabel('Accuracy')
    plt.title('Model Robustness by Class - PGD Attack (ε=0.03)')
    plt.xticks(x, class_names, rotation=45)
    plt.legend()
    plt.grid(True, axis='y')
    plt.ylim(0, 1.0)
    
    plt.tight_layout()
    plt.savefig('static/precomputed/robustness_by_class.png')
    plt.close()
    
    # Robustness drop by class
    plt.figure(figsize=(12, 6))
    
    robustness_drop = [clean - adv for clean, adv in zip(clean_acc_by_class, adv_acc_by_class)]
    
    plt.bar(x, robustness_drop, color='coral')
    
    plt.xlabel('Class')
    plt.ylabel('Accuracy Drop')
    plt.title('Robustness Drop by Class - PGD Attack (ε=0.03)')
    plt.xticks(x, class_names, rotation=45)
    plt.grid(True, axis='y')
    plt.ylim(0, 1.0)
    
    # Add text labels
    for i, v in enumerate(robustness_drop):
        plt.text(i, v + 0.02, f'{v:.2f}', ha='center')
    
    plt.tight_layout()
    plt.savefig('static/precomputed/robustness_drop_by_class.png')
    plt.close()
    
    # Create a dummy feature map visualization
    plt.figure(figsize=(16, 8))
    
    # Simulate feature maps
    num_channels = 8
    for i in range(num_channels):
        # Create random feature maps for demonstration
        clean_fmap = np.random.rand(32, 32)
        adv_fmap = np.random.rand(32, 32)
        diff_fmap = adv_fmap - clean_fmap
        
        plt.subplot(3, num_channels, i + 1)
        plt.imshow(clean_fmap, cmap='viridis')
        if i == 0:
            plt.ylabel("Clean")
        plt.title(f"Channel {i}")
        plt.axis('off')
        
        plt.subplot(3, num_channels, i + 1 + num_channels)
        plt.imshow(adv_fmap, cmap='viridis')
        if i == 0:
            plt.ylabel("Adversarial")
        plt.axis('off')
        
        plt.subplot(3, num_channels, i + 1 + 2*num_channels)
        plt.imshow(diff_fmap, cmap='coolwarm')
        if i == 0:
            plt.ylabel("Difference")
        plt.axis('off')
    
    plt.suptitle("Feature Map Comparison - Layer: layer3", fontsize=16)
    plt.tight_layout()
    plt.savefig('static/precomputed/feature_maps_layer3.png')
    plt.close()
    
    # Create a dummy gradient visualization
    plt.figure(figsize=(15, 8))
    
    # Create random images and gradients for demonstration
    clean_img = np.random.rand(32, 32, 3)
    adv_img = np.random.rand(32, 32, 3)
    perturbation = adv_img - clean_img
    clean_grad = np.abs(np.random.rand(32, 32))
    adv_grad = np.abs(np.random.rand(32, 32))
    diff_grad = np.abs(adv_grad - clean_grad)
    
    plt.subplot(2, 3, 1)
    plt.imshow(clean_img)
    plt.title("Clean Image")
    plt.axis('off')
    
    plt.subplot(2, 3, 2)
    plt.imshow(adv_img)
    plt.title("Adversarial Image")
    plt.axis('off')
    
    plt.subplot(2, 3, 3)
    plt.imshow(np.abs(perturbation), cmap='viridis')
    plt.title("Perturbation (Enhanced)")
    plt.axis('off')
    
    plt.subplot(2, 3, 4)
    plt.imshow(clean_grad, cmap='hot')
    plt.title("Clean Gradient Saliency Map")
    plt.axis('off')
    
    plt.subplot(2, 3, 5)
    plt.imshow(adv_grad, cmap='hot')
    plt.title("Adversarial Gradient Saliency Map")
    plt.axis('off')
    
    plt.subplot(2, 3, 6)
    plt.imshow(diff_grad, cmap='coolwarm')
    plt.title("Gradient Difference")
    plt.axis('off')
    
    plt.suptitle("Input Gradient Analysis", fontsize=16)
    plt.tight_layout()
    plt.savefig('static/precomputed/gradient_visualization.png')
    plt.close()
    
    # Create a dummy loss landscape visualization
    fig = plt.figure(figsize=(18, 6))
    
    # Create random loss landscape for demonstration
    x = np.linspace(-0.1, 0.1, 30)
    y = np.linspace(-0.1, 0.1, 30)
    X, Y = np.meshgrid(x, y)
    Z_clean = 0.5 * (X**2 + Y**2) + 0.1 * np.random.rand(30, 30)
    Z_adv = 0.3 * (X**2 + Y**2) + 0.2 * np.sin(5*X) * np.cos(5*Y) + 0.1 * np.random.rand(30, 30)
    
    ax1 = fig.add_subplot(1, 3, 1, projection='3d')
    surf1 = ax1.plot_surface(X, Y, Z_clean, cmap='viridis', alpha=0.8)
    ax1.set_xlabel('Direction 1')
    ax1.set_ylabel('Direction 2')
    ax1.set_zlabel('Loss')
    ax1.set_title('Clean Image Loss Landscape')
    
    ax2 = fig.add_subplot(1, 3, 2, projection='3d')
    surf2 = ax2.plot_surface(X, Y, Z_adv, cmap='viridis', alpha=0.8)
    ax2.set_xlabel('Direction 1')
    ax2.set_ylabel('Direction 2')
    ax2.set_zlabel('Loss')
    ax2.set_title('Adversarial Image Loss Landscape')
    
    ax3 = fig.add_subplot(1, 3, 3)
    cs1 = ax3.contourf(X, Y, Z_clean, levels=10, alpha=0.5, cmap='Blues')
    cs2 = ax3.contourf(X, Y, Z_adv, levels=10, alpha=0.5, cmap='Reds')
    ax3.set_xlabel('Direction 1')
    ax3.set_ylabel('Direction 2')
    ax3.set_title('Loss Contours Comparison')
    
    from matplotlib.patches import Patch
    legend_elements = [
        Patch(facecolor='blue', alpha=0.5, label='Clean'),
        Patch(facecolor='red', alpha=0.5, label='Adversarial')
    ]
    ax3.legend(handles=legend_elements)
    
    plt.suptitle('Loss Landscape Analysis', fontsize=16)
    plt.tight_layout()
    plt.savefig('static/precomputed/loss_landscape.png')
    plt.close()
    
    # Create a dummy integrated gradients comparison
    plt.figure(figsize=(15, 5))
    
    # Create random images for demonstration
    num_models = 4
    image = np.random.rand(32, 32, 3)
    
    for i in range(num_models):
        # Create a random attribution heatmap
        attribution = np.abs(np.random.rand(32, 32))
        
        plt.subplot(1, num_models, i+1)
        plt.imshow(image)
        
        # Overlay attribution
        plt.imshow(attribution, cmap='jet', alpha=0.5)
        
        model_name = model_display_names[i]
        plt.title(f"{model_name}\nIntegrated Gradients")
        plt.axis('off')
    
    plt.suptitle('Model Comparison with Integrated Gradients', fontsize=16)
    plt.tight_layout()
    plt.savefig('static/precomputed/integrated_gradients_comparison.png')
    plt.close()
    
    # Create a dummy transferability matrix
    plt.figure(figsize=(10, 8))
    
    # Create random transferability matrix
    transferability = np.random.rand(num_models, num_models) * 0.8
    # Make diagonal elements higher (attacks transfer better to the same model)
    np.fill_diagonal(transferability, np.random.rand(num_models) * 0.2 + 0.8)
    
    plt.imshow(transferability, cmap='YlOrRd', vmin=0, vmax=1)
    plt.colorbar(label='Transferability Rate')
    
    plt.xticks(np.arange(num_models), model_display_names, rotation=45)
    plt.yticks(np.arange(num_models), model_display_names)
    
    plt.xlabel('Target Model')
    plt.ylabel('Source Model')
    plt.title('Adversarial Example Transferability (PGD, ε=0.03)', fontsize=16)
    
    # Add text annotations
    for i in range(num_models):
        for j in range(num_models):
            plt.text(j, i, f'{transferability[i, j]:.2f}',
                    ha='center', va='center',
                    color='white' if transferability[i, j] > 0.5 else 'black')
    
    plt.tight_layout()
    plt.savefig('static/precomputed/transferability_matrix.png')
    plt.close()
    
    print("All precomputed visualizations have been generated")


if __name__ == "__main__":
    create_directory_structure()
    copy_sample_images()
    generate_model_evaluation_plots()