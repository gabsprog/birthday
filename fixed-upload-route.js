// src/app/api/upload/route.js - FIXED VERSION
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with more detailed error reporting
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function POST(request) {
  console.log('Upload request received');
  
  try {
    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary environment variables are not configured correctly');
      return NextResponse.json(
        { error: 'Server configuration error: Image service not properly configured' },
        { status: 500 }
      );
    }

    // Get form data with better error handling
    let formData;
    try {
      formData = await request.formData();
    } catch (formError) {
      console.error('Error parsing form data:', formError);
      return NextResponse.json(
        { error: 'Could not parse form data: ' + formError.message },
        { status: 400 }
      );
    }
    
    const file = formData.get('file');
    
    if (!file) {
      console.error('No file provided in request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    console.log('File received:', {
      name: file.name,
      type: file.type,
      size: file.size + ' bytes'
    });
    
    // Validate file type
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validMimeTypes.includes(file.type)) {
      console.error('Invalid file type:', file.type);
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed types: ${validMimeTypes.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error('File too large:', file.size, 'bytes (max:', maxSize, 'bytes)');
      return NextResponse.json(
        { error: `File is too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB (max 5MB)` },
        { status: 400 }
      );
    }
    
    // Convert file to buffer with error handling
    let arrayBuffer, buffer;
    try {
      arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      console.log('Buffer created successfully, size:', buffer.length, 'bytes');
    } catch (bufferError) {
      console.error('Error converting file to buffer:', bufferError);
      return NextResponse.json(
        { error: 'Error processing file: ' + bufferError.message },
        { status: 500 }
      );
    }
    
    // Create a unique folder name based on timestamp and random string
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 7);
    const folderName = `birthdaylove/${timestamp}_${randomStr}`;
    
    console.log('Uploading to Cloudinary folder:', folderName);
    
    // SIMPLIFIED UPLOAD METHOD - Using simpler upload method that avoids streaming
    try {
      // Create temporary file
      const tempFilePath = `./temp_${timestamp}_${randomStr}.jpg`;
      require('fs').writeFileSync(tempFilePath, buffer);
      
      // Upload using simple upload instead of streaming
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          tempFilePath,
          {
            folder: folderName,
            resource_type: 'image',
            transformation: [
              { width: 1200, crop: 'limit' },
              { quality: 'auto:good' },
            ],
            timeout: 60000,
          },
          (error, result) => {
            // Delete temp file
            try {
              require('fs').unlinkSync(tempFilePath);
            } catch (err) {
              console.warn('Could not delete temp file:', err);
            }
            
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              console.log('Upload successful. Public ID:', result.public_id);
              resolve(result);
            }
          }
        );
      });
      
      return NextResponse.json({ 
        success: true, 
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id
      });
      
    } catch (uploadError) {
      console.error('Upload to Cloudinary failed:', uploadError);
      return NextResponse.json(
        { 
          error: 'Image upload failed: ' + uploadError.message,
          details: uploadError.toString()
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Unexpected error during upload:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload image: ' + error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}