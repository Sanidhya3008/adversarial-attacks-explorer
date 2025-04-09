// Convert a file to base64
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

// Load an image from a URL and convert to base64
export const urlToBase64 = async (url) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return await fileToBase64(blob);
    } catch (error) {
        console.error('Error loading image from URL:', error);
        throw error;
    }
};

// Convert base64 to Image object (for display or canvas manipulation)
export const base64ToImage = (base64) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (error) => reject(error);
        img.src = base64;
    });
};

// Resize an image to fit within maxWidth and maxHeight while maintaining aspect ratio
export const resizeImage = async (base64, maxWidth = 800, maxHeight = 600) => {
    try {
        const img = await base64ToImage(base64);
        
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
        }
        
        // Create canvas and resize
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert back to base64
        return canvas.toDataURL('image/jpeg', 0.9);
    } catch (error) {
    console.error('Error resizing image:', error);
        throw error;
    }
};

// Download a base64 image
export const downloadBase64Image = (base64, filename = 'image.png') => {
    const link = document.createElement('a');
    link.href = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Download an image from URL
export const downloadImageFromUrl = async (url, filename = 'image.png') => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(objectUrl);
    } catch (error) {
        console.error('Error downloading image:', error);
        throw error;
    }
};

// Check if base64 string is valid
export const isValidBase64Image = (base64) => {
    if (!base64) return false;
    
    // Check if it's a data URL
    if (base64.startsWith('data:image/')) {
        return true;
    }
    
    // Check if it's a raw base64 string
    try {
        atob(base64);
        return true;
    } catch (e) {
        return false;
    }
};

export default {
    fileToBase64,
    urlToBase64,
    base64ToImage,
    resizeImage,
    downloadBase64Image,
    downloadImageFromUrl,
    isValidBase64Image
};