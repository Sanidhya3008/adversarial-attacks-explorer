import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function ImageUpload({ onImageUpload, isLoading = false }) {
    const [uploadError, setUploadError] = useState(null);
    
    const onDrop = useCallback((acceptedFiles) => {
        setUploadError(null);
        
        if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        
        // Check file type
        if (!file.type.startsWith('image/')) {
            setUploadError('Please upload an image file (JPEG, PNG, etc.)');
            return;
        }
        
        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('File size exceeds 5MB. Please upload a smaller image.');
            return;
        }
        
        // Convert image to base64
        const reader = new FileReader();
        reader.onload = (event) => {
            onImageUpload(event.target.result);
        };
        reader.readAsDataURL(file);
        }
    }, [onImageUpload]);
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'image/*',
        maxFiles: 1
    });
    
    return (
        <Paper 
        {...getRootProps()} 
        elevation={3}
        className="dropzone"
        sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: isDragActive ? 'rgba(63, 81, 181, 0.1)' : 'white',
            border: isDragActive ? '3px dashed #3f51b5' : '2px dashed #cccccc',
            borderRadius: 2,
            cursor: 'pointer',
            position: 'relative',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.3s ease',
            '&:hover': {
            borderColor: '#3f51b5',
            backgroundColor: 'rgba(63, 81, 181, 0.05)'
            }
        }}
        >
        <input {...getInputProps()} />
        
        {isLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ mt: 2 }}>
                Processing image...
            </Typography>
            </Box>
        ) : (
            <Box>
            <CloudUploadIcon sx={{ fontSize: 48, color: '#3f51b5', mb: 2 }} />
            <Typography variant="h6">
                {isDragActive ? 'Drop the image here' : 'Drag & drop an image here, or click to select'}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                (Supported formats: JPEG, PNG, etc.)
            </Typography>
            
            {uploadError && (
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                {uploadError}
                </Typography>
            )}
            </Box>
        )}
        </Paper>
    );
}

export default ImageUpload;