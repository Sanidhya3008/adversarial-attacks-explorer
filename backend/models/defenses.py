import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision
import torchvision.transforms as transforms
import torchvision.models as models
import numpy as np
import matplotlib.pyplot as plt
import base64
import io
import os
from PIL import Image
from tqdm import tqdm

# Import ART components for adversarial examples
from art.attacks.evasion import FastGradientMethod, ProjectedGradientDescent, DeepFool, CarliniL2Method
from art.estimators.classification import PyTorchClassifier

# Device configuration
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# CIFAR-10 classes
CIFAR10_CLASSES = ['airplane', 'automobile', 'bird', 'cat', 'deer', 
                   'dog', 'frog', 'horse', 'ship', 'truck']

def get_model(model_path=None, num_classes=10):
    """Return a ResNet18 model, optionally loaded from a checkpoint"""
    # Create model
    model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    
    # Load weights if specified
    if model_path:
        model_path = os.path.join('pretrained', model_path)
        if os.path.exists(model_path):
            model.load_state_dict(torch.load(model_path, map_location=device))
            print(f"Loaded model from {model_path}")
        else:
            print(f"Model file not found: {model_path}")
    
    model = model.to(device)
    model.eval()
    
    return model

def get_dataset(batch_size=128, subset_size=1000):
    """Get CIFAR-10 test dataset"""
    # Standard normalization for CIFAR-10
    transform_test = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2023, 0.1994, 0.2010)),
    ])
    
    # Load test dataset
    test_dataset = torchvision.datasets.CIFAR10(
        root='./data', train=False, download=True, transform=transform_test)
    
    # Create subset for faster evaluation
    if subset_size and subset_size < len(test_dataset):
        # Use fixed indices for deterministic results
        np.random.seed(42)
        indices = np.random.choice(len(test_dataset), subset_size, replace=False)
        test_dataset = torch.utils.data.Subset(test_dataset, indices)
    
    # Create data loader
    test_loader = torch.utils.data.DataLoader(
        test_dataset, batch_size=batch_size, shuffle=False, num_workers=2)
    
    # Calculate clip values for normalized images
    mean = np.array([0.4914, 0.4822, 0.4465])
    std = np.array([0.2023, 0.1994, 0.2010])
    
    min_pixel_value = np.min((0 - mean) / std)
    max_pixel_value = np.max((1 - mean) / std)
    
    return test_loader, (min_pixel_value, max_pixel_value)

def create_art_classifier(model, clip_values):
    """Create an ART classifier from PyTorch model"""
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.SGD(model.parameters(), lr=0.01)
    
    classifier = PyTorchClassifier(
        model=model,
        loss=criterion,
        optimizer=optimizer,
        input_shape=(3, 32, 32),
        nb_classes=10,
        clip_values=clip_values,
        preprocessing=(np.array([0, 0, 0]), np.array([1, 1, 1]))
    )
    
    return classifier

def generate_adversarial_examples(classifier, inputs, targets, attack_type='pgd', eps=0.03):
    """Generate adversarial examples using specified attack"""
    if attack_type == 'fgsm':
        attack = FastGradientMethod(
            estimator=classifier,
            eps=eps,
            batch_size=inputs.shape[0]
        )
    elif attack_type == 'pgd':
        attack = ProjectedGradientDescent(
            estimator=classifier,
            eps=eps,
            eps_step=eps/10,
            max_iter=10,
            batch_size=inputs.shape[0]
        )
    elif attack_type == 'deepfool':
        attack = DeepFool(
            classifier=classifier,
            epsilon=eps,
            max_iter=50,
            batch_size=inputs.shape[0]
        )
    elif attack_type == 'cw':
        attack = CarliniL2Method(
            classifier=classifier,
            confidence=0.1,
            max_iter=50,
            batch_size=inputs.shape[0]
        )
    else:
        raise ValueError(f"Unknown attack type: {attack_type}")
    
    # Convert inputs to numpy for ART
    x_np = inputs.cpu().numpy()
    
    # Generate adversarial examples
    x_adv = attack.generate(x=x_np)
    
    # Convert back to PyTorch tensor
    x_adv_tensor = torch.tensor(x_adv, dtype=torch.float).to(device)
    
    return x_adv_tensor

def evaluate_model_robustness(model_name, attack_type='pgd', epsilon=0.03, num_examples=10):
    """
    Evaluate model robustness against adversarial attacks
    Returns accuracy and example images
    """
    # Load model
    model = get_model(model_name)
    
    # Get test dataset
    test_loader, clip_values = get_dataset(batch_size=100, subset_size=1000)
    
    # Create ART classifier
    art_classifier = create_art_classifier(model, clip_values)
    
    # Initialize counters
    clean_correct = 0
    adv_correct = 0
    total = 0
    
    # Store examples for visualization
    examples = []
    
    # Evaluate model
    model.eval()
    for inputs, targets in test_loader:
        inputs, targets = inputs.to(device), targets.to(device)
        batch_size = inputs.size(0)
        
        # Evaluate on clean examples
        with torch.no_grad():
            outputs = model(inputs)
            _, predicted = outputs.max(1)
            clean_correct += predicted.eq(targets).sum().item()
        
        # Generate adversarial examples
        adv_inputs = generate_adversarial_examples(
            art_classifier, inputs, targets,
            attack_type=attack_type, eps=epsilon
        )
        
        # Evaluate on adversarial examples
        with torch.no_grad():
            adv_outputs = model(adv_inputs)
            _, adv_predicted = adv_outputs.max(1)
            adv_correct += adv_predicted.eq(targets).sum().item()
        
        # Store examples for visualization
        if len(examples) < num_examples:
            for i in range(min(batch_size, num_examples - len(examples))):
                # Get prediction information
                clean_pred = CIFAR10_CLASSES[predicted[i].item()]
                adv_pred = CIFAR10_CLASSES[adv_predicted[i].item()]
                true_label = CIFAR10_CLASSES[targets[i].item()]
                
                # Calculate perturbation
                perturbation = adv_inputs[i] - inputs[i]
                
                # Calculate metrics
                l2_dist = torch.norm(perturbation).item()
                linf_dist = torch.max(torch.abs(perturbation)).item()
                
                # Add to examples
                examples.append({
                    'clean_image': inputs[i].cpu(),
                    'adv_image': adv_inputs[i].cpu(),
                    'perturbation': perturbation.cpu(),
                    'true_label': true_label,
                    'clean_pred': clean_pred,
                    'adv_pred': adv_pred,
                    'l2_dist': l2_dist,
                    'linf_dist': linf_dist
                })
        
        total += batch_size
    
    # Calculate accuracy
    clean_accuracy = clean_correct / total
    adv_accuracy = adv_correct / total
    
    # Generate example images as base64
    example_images = []
    example_plots = []
    
    for example in examples:
        # Convert tensors to numpy
        clean_np = example['clean_image'].numpy().transpose((1, 2, 0))
        adv_np = example['adv_image'].numpy().transpose((1, 2, 0))
        pert_np = example['perturbation'].numpy().transpose((1, 2, 0))
        
        # Denormalize images
        mean = np.array([0.4914, 0.4822, 0.4465])
        std = np.array([0.2023, 0.1994, 0.2010])
        
        clean_np = std * clean_np + mean
        clean_np = np.clip(clean_np, 0, 1)
        
        adv_np = std * adv_np + mean
        adv_np = np.clip(adv_np, 0, 1)
        
        # For perturbation visualization
        pert_np = np.abs(pert_np)  # Use absolute values
        if np.max(pert_np) > 0:
            pert_np = pert_np / np.max(pert_np)  # Normalize to [0,1]
        
        # Convert to base64
        def array_to_base64(img_array):
            img_array = (img_array * 255).astype(np.uint8)
            img = Image.fromarray(img_array)
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
            return img_base64
        
        # Create visualization plot
        fig, axs = plt.subplots(1, 3, figsize=(15, 5))
        
        # Plot original image
        axs[0].imshow(clean_np)
        axs[0].set_title(f"Clean: {example['clean_pred']}\nTrue: {example['true_label']}")
        axs[0].axis('off')
        
        # Plot adversarial image
        axs[1].imshow(adv_np)
        axs[1].set_title(f"Adversarial: {example['adv_pred']}")
        axs[1].axis('off')
        
        # Plot perturbation
        axs[2].imshow(pert_np, cmap='viridis')
        axs[2].set_title(f"Perturbation\nL2: {example['l2_dist']:.4f}")
        axs[2].axis('off')
        
        # Convert plot to base64
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        plot_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.close(fig)
        
        # Add to lists
        example_images.append({
            'clean': array_to_base64(clean_np),
            'adversarial': array_to_base64(adv_np),
            'perturbation': array_to_base64(pert_np),
            'true_label': example['true_label'],
            'clean_pred': example['clean_pred'],
            'adv_pred': example['adv_pred'],
            'l2_dist': example['l2_dist'],
            'linf_dist': example['linf_dist']
        })
        
        example_plots.append(plot_base64)
    
    # Return results
    return {
        'clean_accuracy': clean_accuracy,
        'adv_accuracy': adv_accuracy,
        'example_images': example_images,
        'example_plots': example_plots
    }

def visualize_robustness_comparison(model_names, attack_type='pgd', epsilon=0.03):
    """
    Compare and visualize robustness of different defense models
    """
    # Store results for each model
    model_results = {}
    
    # Evaluate each model
    for model_name in model_names:
        results = evaluate_model_robustness(model_name, attack_type, epsilon, num_examples=5)
        
        # Get model display name (remove prefix/suffix)
        display_name = model_name.replace('best_', '').replace('.pth', '').replace('_', ' ').title()
        
        model_results[display_name] = {
            'clean_accuracy': results['clean_accuracy'],
            'adv_accuracy': results['adv_accuracy'],
            'robustness_ratio': results['adv_accuracy'] / results['clean_accuracy'] if results['clean_accuracy'] > 0 else 0,
            'examples': results['example_images'][:3]  # Limit to 3 examples
        }
    
    # Generate bar chart comparing robustness
    model_names_display = list(model_results.keys())
    clean_accuracies = [model_results[name]['clean_accuracy'] for name in model_names_display]
    adv_accuracies = [model_results[name]['adv_accuracy'] for name in model_names_display]
    robustness_ratios = [model_results[name]['robustness_ratio'] for name in model_names_display]
    
    # Create bar chart
    fig, ax = plt.subplots(figsize=(12, 6))
    
    width = 0.3
    x = np.arange(len(model_names_display))
    
    ax.bar(x - width, clean_accuracies, width, label='Clean Accuracy')
    ax.bar(x, adv_accuracies, width, label='Adversarial Accuracy')
    ax.bar(x + width, robustness_ratios, width, label='Robustness Ratio')
    
    ax.set_xticks(x)
    ax.set_xticklabels(model_names_display)
    ax.set_ylabel('Accuracy / Ratio')
    ax.set_title(f'Model Robustness Comparison ({attack_type.upper()}, ε={epsilon})')
    ax.legend()
    ax.grid(True, axis='y', alpha=0.3)
    
    # Convert to base64
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    robustness_bar_chart = base64.b64encode(buf.getvalue()).decode('utf-8')
    plt.close(fig)
    
    # Use precomputed visualizations for more complex analysis
    robustness_by_class = 'robustness_by_class.png'
    feature_maps = 'feature_maps_layer3.png'
    
    # Return results
    return {
        'robustness_bar_chart': robustness_bar_chart,
        'robustness_by_class': robustness_by_class,
        'feature_maps': feature_maps,
        'model_results': model_results
    }