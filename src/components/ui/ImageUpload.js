'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { validateImage } from '@/lib/utils';

const ImageUpload = ({
  onImageUpload,
  onImageRemove,
  maxImages = 5,
  uploadedImages = [],
  label = 'Upload Images',
  className = '',
}) => {
  const [error, setError] = useState('');

  const onDrop = useCallback(acceptedFiles => {
    // Reset error
    setError('');
    
    // Check if adding more files would exceed the limit
    if (uploadedImages.length + acceptedFiles.length > maxImages) {
      setError(`You can only upload a maximum of ${maxImages} images`);
      return;
    }
    
    // Validate each file
    const invalidFiles = [];
    const validFiles = [];
    
    acceptedFiles.forEach(file => {
      const validation = validateImage(file);
      if (!validation.isValid) {
        invalidFiles.push({ file, error: validation.error });
      } else {
        validFiles.push(file);
      }
    });
    
    if (invalidFiles.length > 0) {
      setError(`Some files were rejected: ${invalidFiles.map(f => f.error).join(', ')}`);
    }
    
    // Process valid files
    if (validFiles.length > 0) {
      onImageUpload(validFiles);
    }
  }, [uploadedImages, maxImages, onImageUpload]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
      'image/webp': []
    },
    maxFiles: maxImages - uploadedImages.length,
  });
  
  return (
    <div className={className}>
      {label && (
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          {label} <span className="text-xs text-gray-500">({uploadedImages.length}/{maxImages})</span>
        </p>
      )}
      
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'}
          ${uploadedImages.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={uploadedImages.length >= maxImages} />
        
        {isDragActive ? (
          <p className="text-primary-600 dark:text-primary-400">Drop the files here...</p>
        ) : (
          <div>
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              stroke="currentColor" 
              fill="none" 
              viewBox="0 0 48 48" 
              aria-hidden="true"
            >
              <path 
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                strokeWidth={2} 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Drag & drop images, or <span className="text-primary-600 dark:text-primary-400 font-medium">browse</span>
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG, GIF or WEBP up to 5MB
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
      
      {uploadedImages.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {uploadedImages.map((image, index) => (
            <div 
              key={index} 
              className="relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square"
            >
              <img 
                src={typeof image === 'string' ? image : URL.createObjectURL(image)} 
                alt={`Uploaded ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              <button
                type="button"
                onClick={() => onImageRemove(index)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;