import torch
import numpy as np
import matplotlib.pyplot as plt
import io
import base64
from PIL import Image

def tensor_to_numpy(tensor, denormalize=True):
    """Convert a tensor to a numpy array with optional denormalization"""
    img = tensor.cpu().numpy().transpose((1, 2, 0))
    
    if denormalize:
        # Undo ImageNet normalization
        mean = np.array([0.485, 0.456, 0.406])
        std = np.array([0.229, 0.224, 0.225])
        img = std * img + mean
        img = np.clip(img, 0, 1)
    
    return img

def plot_to_base64(fig):
    """Convert a matplotlib figure to base64 encoded string"""
    buf = io.BytesIO()
    fig.savefig(buf, format='png', dpi=100, bbox_inches='tight')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    plt.close(fig)
    return img_base64

def plot_comparison(original, adversarial, original_pred, adversarial_pred, perturbation=None, method=""):
    """
    Plot original and adversarial images side by side with perturbation
    
    Args:
        original: Original image tensor
        adversarial: Adversarial image tensor
        original_pred: Original prediction label
        adversarial_pred: Adversarial prediction label
        perturbation: Perturbation tensor
        method: Attack method name
    
    Returns:
        Base64 encoded image of the plot
    """
    # Convert tensors to numpy arrays
    original_np = tensor_to_numpy(original)
    adversarial_np = tensor_to_numpy(adversarial)
    
    # Determine number of subplots
    n_plots = 3 if perturbation is not None else 2
    
    # Create figure
    fig, axs = plt.subplots(1, n_plots, figsize=(5*n_plots, 5))
    
    # Plot original image
    axs[0].imshow(original_np)
    axs[0].set_title(f"Original\nPrediction: {original_pred}")
    axs[0].axis('off')
    
    # Plot adversarial image
    axs[1].imshow(adversarial_np)
    axs[1].set_title(f"Adversarial ({method})\nPrediction: {adversarial_pred}")
    axs[1].axis('off')
    
    # Plot perturbation if provided
    if perturbation is not None:
        pert_np = tensor_to_numpy(perturbation, denormalize=False)
        
        # Enhance perturbation for visibility
        pert_np = np.abs(pert_np)
        pert_max = np.max(pert_np)
        if pert_max > 0:
            pert_np = pert_np / pert_max
        
        axs[2].imshow(pert_np, cmap='viridis')
        axs[2].set_title(f"Perturbation\n(enhanced for visibility)")
        axs[2].axis('off')
    
    plt.suptitle(f"Adversarial Attack Demonstration: {method}", fontsize=16)
    plt.tight_layout()
    
    # Convert to base64
    img_base64 = plot_to_base64(fig)
    
    return img_base64

def plot_attack_comparison(attack_results):
    """
    Create a comparison visualization of different attack methods
    
    Args:
        attack_results: Dictionary of attack results keyed by attack name
    
    Returns:
        Base64 encoded image of the plot
    """
    attack_names = list(attack_results.keys())
    n_attacks = len(attack_names)
    
    # Get original image (same for all attacks)
    original = next(iter(attack_results.values()))['original_image']
    original_pred = next(iter(attack_results.values()))['original_pred']
    
    # Create figure with 2 rows: top for images, bottom for perturbations
    fig, axs = plt.subplots(2, n_attacks + 1, figsize=((n_attacks + 1) * 4, 8))
    
    # Plot original image in first column
    original_np = tensor_to_numpy(original)
    axs[0, 0].imshow(original_np)
    axs[0, 0].set_title(f"Original\n{original_pred}")
    axs[0, 0].axis('off')
    
    # Create empty subplot in the second row, first column
    axs[1, 0].axis('off')
    
    # Plot each attack result
    for i, attack_name in enumerate(attack_names):
        result = attack_results[attack_name]
        adversarial = result['adversarial_image']
        adv_pred = result['adv_pred']
        perturbation = result['perturbation']
        success = result['original_pred'] != result['adv_pred']
        success_marker = "✓" if success else "✗"
        
        # Convert to numpy
        adv_np = tensor_to_numpy(adversarial)
        
        # Plot adversarial image
        axs[0, i + 1].imshow(adv_np)
        axs[0, i + 1].set_title(f"{attack_name.upper()} {success_marker}\n{adv_pred}")
        axs[0, i + 1].axis('off')
        
        # Plot perturbation
        pert_np = tensor_to_numpy(perturbation, denormalize=False)
        pert_np = np.abs(pert_np)
        pert_max = np.max(pert_np)
        if pert_max > 0:
            pert_np = pert_np / pert_max
        
        axs[1, i + 1].imshow(pert_np, cmap='viridis')
        axs[1, i + 1].set_title(f"L2: {result['l2_dist']:.4f}\nL∞: {result['linf_dist']:.4f}")
        axs[1, i + 1].axis('off')
    
    plt.suptitle("Comparison of Different Adversarial Attacks", fontsize=16)
    plt.tight_layout()
    
    # Convert to base64
    img_base64 = plot_to_base64(fig)
    
    return img_base64

def plot_confidence_comparison(attack_results):
    """
    Create a bar chart comparing confidence scores across different attacks
    
    Args:
        attack_results: Dictionary of attack results keyed by attack name
    
    Returns:
        Base64 encoded image of the plot
    """
    attack_names = list(attack_results.keys())
    
    # Create figure
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Set up bar positions
    x = np.arange(len(attack_names))
    width = 0.35
    
    # Extract confidence values
    adv_confs = [attack_results[name]['adv_conf'] for name in attack_names]
    orig_confs_in_adv = [attack_results[name]['original_conf'] for name in attack_names]
    
    # Create bars
    ax.bar(x - width/2, adv_confs, width, label='Confidence in Adversarial Class')
    ax.bar(x + width/2, orig_confs_in_adv, width, label='Confidence in Original Class')
    
    # Add success indicators
    for i, name in enumerate(attack_names):
        success = attack_results[name]['original_pred'] != attack_results[name]['adv_pred']
        if success:
            ax.annotate('✓',
                         xy=(i, max(adv_confs[i], orig_confs_in_adv[i]) + 0.05),
                         ha='center', va='center',
                         color='green', fontsize=18)
        else:
            ax.annotate('✗',
                         xy=(i, max(adv_confs[i], orig_confs_in_adv[i]) + 0.05),
                         ha='center', va='center',
                         color='red', fontsize=18)
    
    # Format plot
    ax.set_xlabel('Attack Method')
    ax.set_ylabel('Confidence')
    ax.set_title('Confidence Comparison Across Different Attack Methods')
    ax.set_xticks(x)
    ax.set_xticklabels([name.upper() for name in attack_names])
    ax.set_ylim(0, 1.1)
    ax.legend()
    ax.grid(True, axis='y', alpha=0.3)
    
    plt.tight_layout()
    
    # Convert to base64
    img_base64 = plot_to_base64(fig)
    
    return img_base64

def visualize_feature_maps(model, clean_img, adv_img, layer_name):
    """
    Visualize and compare feature maps for clean and adversarial images
    
    Args:
        model: PyTorch model
        clean_img: Clean image tensor
        adv_img: Adversarial image tensor
        layer_name: Name of layer to extract features from
        
    Returns:
        Base64 encoded image of the feature maps
    """
    # Create feature extractor
    features = {}
    
    def hook_fn(name):
        def hook(module, input, output):
            features[name] = output.detach()
        return hook
    
    # Register hook for the specified layer
    for name, module in model.named_modules():
        if name == layer_name:
            handle = module.register_forward_hook(hook_fn(name))
            break
    
    # Get features for clean and adversarial images
    model.eval()
    with torch.no_grad():
        _ = model(clean_img.unsqueeze(0))
        clean_features = features[layer_name].clone()
        
        features.clear()
        _ = model(adv_img.unsqueeze(0))
        adv_features = features[layer_name].clone()
    
    # Remove hook
    handle.remove()
    
    # Get feature maps
    clean_fmap = clean_features.squeeze(0)
    adv_fmap = adv_features.squeeze(0)
    
    # Calculate difference between feature maps
    diff_fmap = adv_fmap - clean_fmap
    
    # Only show a subset of channels for clarity
    num_channels = min(8, clean_fmap.shape[0])
    
    # Create figure
    fig, axes = plt.subplots(3, num_channels, figsize=(num_channels * 2, 6))
    
    # Plot feature maps
    for i in range(num_channels):
        # Clean feature map
        axes[0, i].imshow(clean_fmap[i].cpu().numpy(), cmap='viridis')
        axes[0, i].set_title(f"Channel {i}")
        axes[0, i].axis('off')
        
        # Adversarial feature map
        axes[1, i].imshow(adv_fmap[i].cpu().numpy(), cmap='viridis')
        axes[1, i].axis('off')
        
        # Difference
        axes[2, i].imshow(diff_fmap[i].cpu().numpy(), cmap='coolwarm')
        axes[2, i].axis('off')
    
    # Set titles for rows
    axes[0, 0].set_ylabel("Clean", size='large')
    axes[1, 0].set_ylabel("Adversarial", size='large')
    axes[2, 0].set_ylabel("Difference", size='large')
    
    plt.suptitle(f"Feature Map Comparison - Layer: {layer_name}", fontsize=16)
    plt.tight_layout()
    
    # Convert to base64
    img_base64 = plot_to_base64(fig)
    
    return img_base64