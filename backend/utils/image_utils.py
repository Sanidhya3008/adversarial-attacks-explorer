import base64
import io
from PIL import Image
import numpy as np
import requests
import os

def base64_to_image(base64_str):
    """Convert a base64 encoded image to a PIL Image"""
    if base64_str.startswith('data:image'):
        # Remove the data URL scheme if present
        base64_str = base64_str.split(',')[1]
    
    # Decode base64 string to bytes
    img_bytes = base64.b64decode(base64_str)
    
    # Convert bytes to PIL Image
    img = Image.open(io.BytesIO(img_bytes))
    
    # Convert to RGB if needed
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    return img

def image_to_base64(image, format='PNG'):
    """Convert a PIL Image to a base64 encoded string"""
    buffered = io.BytesIO()
    image.save(buffered, format=format)
    img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
    return img_str

def download_image(url, save_path=None):
    """Download an image from a URL"""
    try:
        response = requests.get(url, stream=True, timeout=10)
        response.raise_for_status()
        
        # Check if the content is an image
        content_type = response.headers.get('Content-Type', '')
        if not content_type.startswith('image'):
            raise ValueError(f"URL does not point to an image (Content-Type: {content_type})")
        
        # Open the image
        img = Image.open(io.BytesIO(response.content))
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Save the image if a path is provided
        if save_path:
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            img.save(save_path)
        
        return img
    except Exception as e:
        raise Exception(f"Error downloading image: {str(e)}")

def resize_image(image, max_size=800):
    """Resize an image while maintaining aspect ratio"""
    # Get original dimensions
    width, height = image.size
    
    # Calculate scaling factor
    scale_factor = min(max_size / width, max_size / height)
    
    # Return original image if it's already smaller than max_size
    if scale_factor >= 1:
        return image
    
    # Calculate new dimensions
    new_width = int(width * scale_factor)
    new_height = int(height * scale_factor)
    
    # Resize image
    resized_image = image.resize((new_width, new_height), Image.LANCZOS)
    
    return resized_image

def precompute_sample_images():
    """
    Download and save sample images for the application
    These will be used as example inputs if no image is uploaded
    """
    sample_urls = [
        # Panda
        "https://upload.wikimedia.org/wikipedia/commons/3/3c/Giant_Panda_2004-03-2.jpg",
        # Cat
        "https://upload.wikimedia.org/wikipedia/commons/4/4d/Cat_November_2010-1a.jpg",
        # Dog
        "https://upload.wikimedia.org/wikipedia/commons/6/6e/Golde33443.jpg"
    ]
    
    os.makedirs('static/samples', exist_ok=True)
    
    sample_images = []
    
    for i, url in enumerate(sample_urls):
        try:
            save_path = f"static/samples/sample_{i+1}.jpg"
            
            # Download image if it doesn't exist
            if not os.path.exists(save_path):
                print(f"Downloading sample image {i+1}...")
                img = download_image(url, save_path)
                print(f"Sample image {i+1} saved to {save_path}")
            else:
                print(f"Sample image {i+1} already exists at {save_path}")
            
            sample_images.append({
                'id': i + 1,
                'path': save_path,
                'url': f"/static/samples/sample_{i+1}.jpg"
            })
        except Exception as e:
            print(f"Error downloading sample image {i+1}: {str(e)}")
    
    return sample_images

def prepare_attack_dataset():
    """
    Prepare a dataset of pre-attacked images for quick demonstration
    """
    # This function would generate and save adversarial examples for sample images
    # For now, we'll assume the examples will be generated on-demand
    pass