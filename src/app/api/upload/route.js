// src/app/api/upload/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

export async function POST(request) {
  console.log('Upload request received (ImgBB implementation)');
  
  try {
    // Check if ImgBB API key is configured
    const imgbbApiKey = process.env.IMGBB_API_KEY;
    if (!imgbbApiKey) {
      console.error('ImgBB API key is not configured');
      return NextResponse.json(
        { error: 'Server configuration error: Image service not properly configured' },
        { status: 500 }
      );
    }

    // Get form data
    const formData = await request.formData();
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
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('Buffer created successfully, size:', buffer.length, 'bytes');
    
    // Convert buffer to base64
    const base64Image = buffer.toString('base64');
    
    // Create timestamp folder name for organization similar to the original code
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 7);
    const folderName = `birthdaylove_${timestamp}_${randomStr}`;
    
    console.log('Uploading to ImgBB with folder name as a name prefix:', folderName);
    
    // Create FormData for ImgBB upload
    const imgbbFormData = new FormData();
    imgbbFormData.append('key', imgbbApiKey);
    imgbbFormData.append('image', base64Image);
    imgbbFormData.append('name', `${folderName}_${file.name}`);
    
    // Upload to ImgBB
    const response = await axios.post('https://api.imgbb.com/1/upload', imgbbFormData, {
      headers: {
        ...imgbbFormData.getHeaders(),
      },
      timeout: 30000, // 30 second timeout
    });
    
    // Handle response
    if (response.data.success) {
      console.log('Upload to ImgBB successful');
      
      return NextResponse.json({
        success: true,
        url: response.data.data.url,           // Direct image URL
        display_url: response.data.data.display_url, // URL to the image display page
        thumb_url: response.data.data.thumb.url,    // Thumbnail URL
        delete_url: response.data.data.delete_url,  // URL to delete the image
        public_id: response.data.data.id           // Image ID on ImgBB
      });
    } else {
      console.error('ImgBB API returned error:', response.data);
      return NextResponse.json(
        { error: 'Image upload failed on ImgBB' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Unexpected error during upload:', error);
    
    // Detailed error logging
    let errorMessage = 'Failed to upload image';
    let errorDetails = '';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      errorMessage += `: Server responded with ${error.response.status}`;
      errorDetails = JSON.stringify(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      errorMessage += ': No response received from server';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      errorMessage += `: ${error.message}`;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}