// src/app/api/cloudinary-signature/route.js
// This endpoint generates a signature for client-side Cloudinary uploads
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request) {
  try {
    // Get Cloudinary credentials
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary credentials not configured' },
        { status: 500 }
      );
    }
    
    // Generate a timestamp
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Create a folder name based on timestamp and random string
    const randomStr = Math.random().toString(36).substring(2, 7);
    const folderName = `birthdaylove/${timestamp}_${randomStr}`;
    
    // Create parameters for the signature
    const params = {
      timestamp: timestamp,
      folder: folderName,
      upload_preset: 'ml_default', // Change this to your unsigned upload preset name if you have one
      api_key: apiKey
    };
    
    // Generate the signature
    const signature = generateSignature(params, apiSecret);
    
    // Return the signature, timestamp, and other necessary info
    return NextResponse.json({
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder: folderName
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    return NextResponse.json(
      { error: 'Failed to generate signature' },
      { status: 500 }
    );
  }
}

// Function to generate a signature for Cloudinary upload
function generateSignature(params, apiSecret) {
  // Sort the params by key
  const sortedParams = {};
  Object.keys(params).sort().forEach(key => {
    sortedParams[key] = params[key];
  });
  
  // Create the string to sign
  let signatureString = '';
  for (const key in sortedParams) {
    signatureString += `${key}=${sortedParams[key]}&`;
  }
  
  // Remove the last & and add the API secret
  signatureString = signatureString.slice(0, -1) + apiSecret;
  
  // Generate the SHA-1 hash
  return crypto.createHash('sha1').update(signatureString).digest('hex');
}
