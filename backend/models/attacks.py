import torch
import torch.nn as nn
import torchvision
import torchvision.transforms as transforms
import numpy as np
from PIL import Image
import io
import base64
import matplotlib.pyplot as plt
from art.attacks.evasion import FastGradientMethod, ProjectedGradientDescent, DeepFool, CarliniL2Method
from art.estimators.classification import PyTorchClassifier

# Device configuration
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Class names for ImageNet
IMAGENET_CLASSES_FILE = 'static/imagenet_classes.txt'

# Load ImageNet class names
def load_imagenet_classes():
    try:
        with open(IMAGENET_CLASSES_FILE) as f:
            class_names = [line.strip() for line in f.readlines()]
        return class_names
    except FileNotFoundError:
        # If file doesn't exist, download it
        import requests
        url = "https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt"
        response = requests.get(url)
        response.raise_for_status()
        
        # Ensure directory exists
        import os
        os.makedirs(os.path.dirname(IMAGENET_CLASSES_FILE), exist_ok=True)
        
        # Save the file
        with open(IMAGENET_CLASSES_FILE, 'w', encoding='utf-8') as f:
            f.write(response.text)
        
        # Return class names
        return [line.strip() for line in response.text.splitlines()]

# Global variables for model and class names
MODEL = None
CLASS_NAMES = None

def load_model():
    """Load a pre-trained ResNet50 model"""
    global MODEL, CLASS_NAMES
    
    # Load model if not already loaded
    if MODEL is None:
        MODEL = torchvision.models.resnet50(pretrained=True).to(device)
        MODEL.eval()
    
    # Load class names if not already loaded
    if CLASS_NAMES is None:
        CLASS_NAMES = load_imagenet_classes()
    
    return MODEL

def process_image(image):
    """Preprocess an image for the model"""
    # Define preprocessing for images
    preprocess = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    
    # Apply preprocessing and convert to tensor
    img_tensor = preprocess(image).unsqueeze(0).to(device)
    
    return img_tensor[0]  # Return single image tensor (C, H, W)

def tensor_to_base64(tensor):
    """Convert a tensor to a base64 encoded PNG image"""
    # Convert tensor to numpy
    img = tensor.cpu().numpy().transpose((1, 2, 0))
    
    # Undo normalization
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    img = std * img + mean
    img = np.clip(img, 0, 1)
    
    # Convert to PIL image
    img = (img * 255).astype(np.uint8)
    pil_img = Image.fromarray(img)
    
    # Save to bytes
    buffer = io.BytesIO()
    pil_img.save(buffer, format='PNG')
    buffer.seek(0)
    
    # Encode to base64
    img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    return img_base64

def create_art_classifier(model):
    """Create an ART classifier from a PyTorch model"""
    # Set up criterion and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    
    # Calculate appropriate clip values based on normalization
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    min_clip = np.min((0 - mean) / std)
    max_clip = np.max((1 - mean) / std)
    
    # Create ART classifier
    classifier = PyTorchClassifier(
        model=model,
        loss=criterion,
        optimizer=optimizer,
        input_shape=(3, 224, 224),
        nb_classes=1000,
        clip_values=(min_clip, max_clip),
        preprocessing=(np.array([0, 0, 0]), np.array([1, 1, 1]))
    )
    
    return classifier

def get_prediction(model, img_tensor):
    """Get model prediction and class name for an image tensor"""
    model.eval()
    with torch.no_grad():
        outputs = model(img_tensor.unsqueeze(0).to(device))
        probabilities = torch.softmax(outputs, dim=1)[0]
        
        # Get top prediction
        confidence, predicted_idx = torch.max(probabilities, 0)
    
    # Get class name
    class_name = CLASS_NAMES[predicted_idx.item()]
    
    return {
        'class_name': class_name,
        'confidence': confidence.item(),
        'class_idx': predicted_idx.item(),
        'probabilities': probabilities.cpu().numpy()
    }

def generate_adversarial_example(img_tensor, attack_type='fgsm', epsilon=0.03):
    """Generate an adversarial example using specified attack"""
    # Load model if needed
    model = load_model()
    
    # Create ART classifier
    art_classifier = create_art_classifier(model)
    
    # Get original prediction
    original_prediction = get_prediction(model, img_tensor)
    
    # Convert tensor to numpy for ART (add batch dimension)
    img_np = img_tensor.cpu().numpy()
    img_np = np.expand_dims(img_np, axis=0)
    
    # Choose attack based on attack_type
    if attack_type == 'fgsm':
        attack = FastGradientMethod(
            estimator=art_classifier,
            eps=epsilon,
            batch_size=1
        )
    elif attack_type == 'pgd':
        attack = ProjectedGradientDescent(
            estimator=art_classifier,
            eps=epsilon,
            eps_step=epsilon/10,
            max_iter=10,
            batch_size=1
        )
    elif attack_type == 'deepfool':
        attack = DeepFool(
            classifier=art_classifier,
            epsilon=epsilon,
            max_iter=50,
            batch_size=1
        )
    elif attack_type == 'cw':
        attack = CarliniL2Method(
            classifier=art_classifier,
            confidence=0.1,
            learning_rate=0.01,
            binary_search_steps=10,
            max_iter=100,
            batch_size=1
        )
    else:
        raise ValueError(f"Unknown attack type: {attack_type}")
    
    # Generate adversarial example
    adv_np = attack.generate(x=img_np)
    
    # Convert back to PyTorch tensor
    adv_tensor = torch.from_numpy(adv_np[0]).to(device)
    
    # Get adversarial prediction
    adv_prediction = get_prediction(model, adv_tensor)
    
    # Calculate perturbation
    perturbation = adv_tensor - img_tensor
    
    # Calculate metrics
    l2_dist = torch.norm(perturbation).item()
    linf_dist = torch.max(torch.abs(perturbation)).item()
    
    # Return results
    return {
        'original_image': img_tensor,
        'adversarial_image': adv_tensor,
        'perturbation': perturbation,
        'original_pred': original_prediction['class_name'],
        'original_conf': original_prediction['confidence'],
        'adv_pred': adv_prediction['class_name'],
        'adv_conf': adv_prediction['confidence'],
        'l2_dist': l2_dist,
        'linf_dist': linf_dist,
        'success': original_prediction['class_name'] != adv_prediction['class_name']
    }