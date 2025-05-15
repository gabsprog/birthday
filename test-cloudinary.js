// fix-cloudinary.js
// Run with: node fix-cloudinary.js

const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const { Readable } = require('stream');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Check environment variables
console.log('\n=== CLOUDINARY ENVIRONMENT VARIABLES ===');
const requiredVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

let missingVars = [];
requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
    console.error(`❌ Missing required environment variable: ${varName}`);
  } else {
    const value = process.env[varName];
    // Mask sensitive values
    const maskedValue = varName.includes('SECRET') || varName.includes('KEY') 
      ? `${value.substr(0, 4)}...${value.substr(-4)}`
      : value;
    console.log(`✅ ${varName} is set: ${maskedValue}`);
  }
});

if (missingVars.length > 0) {
  console.error(`\n❌ Missing ${missingVars.length} required environment variables. Check your .env.local file.`);
  process.exit(1);
}

// Configure Cloudinary with explicit options
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Helper function to create buffer from test image
function createTestImageBuffer() {
  return new Promise((resolve, reject) => {
    try {
      // Check if test image exists
      const testImagePath = './test-upload.jpg';
      if (fs.existsSync(testImagePath)) {
        const buffer = fs.readFileSync(testImagePath);
        resolve(buffer);
        return;
      }
      
      // If not exists, create a simple black 100x100 image
      console.log('Creating a test image buffer...');
      const canvas = require('canvas');
      const { createCanvas } = canvas;
      const c = createCanvas(100, 100);
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, 100, 100);
      
      // Convert to buffer
      const buffer = c.toBuffer('image/jpeg');
      fs.writeFileSync(testImagePath, buffer);
      resolve(buffer);
    } catch (error) {
      reject(error);
    }
  });
}

// Function to convert buffer to stream
function bufferToStream(buffer) {
  const readable = new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    },
  });
  return readable;
}

// Test direct API access
async function testCloudinaryAPI() {
  console.log('\n=== TESTING DIRECT CLOUDINARY API ACCESS ===');
  try {
    // Test Account Info using fetch instead of SDK
    console.log('Fetching account info using direct API call...');
    
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/usage`, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(apiKey + ':' + apiSecret).toString('base64')
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Direct API call successful! Response:', data);
    return true;
  } catch (error) {
    console.error('❌ Direct API call failed:', error.message);
    return false;
  }
}

// Test normal Cloudinary SDK methods
async function testCloudinarySDK() {
  console.log('\n=== TESTING CLOUDINARY SDK ===');
  try {
    // Test Account Info
    console.log('Fetching account info using SDK...');
    const accountInfo = await new Promise((resolve, reject) => {
      cloudinary.api.account((error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
    
    console.log('✅ Cloudinary account info retrieved successfully');
    console.log(`   - Plan: ${accountInfo.plan}`);
    return true;
  } catch (error) {
    console.error('❌ Cloudinary SDK test failed:', error.message);
    return false;
  }
}

// Test upload with simpler method first
async function testSimpleUpload() {
  console.log('\n=== TESTING SIMPLE UPLOAD ===');
  try {
    const testImagePath = './test-upload.jpg';
    if (!fs.existsSync(testImagePath)) {
      await createTestImageBuffer();
    }
    
    console.log('Uploading test image using simple upload method...');
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        testImagePath,
        {
          folder: 'test-upload',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    
    console.log('✅ Simple upload successful!');
    console.log(`   - Public ID: ${uploadResult.public_id}`);
    console.log(`   - URL: ${uploadResult.secure_url}`);
    
    // Delete the test upload
    console.log('Deleting test upload...');
    await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        uploadResult.public_id,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    
    console.log('✅ Test upload deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Simple upload test failed:', error);
    return false;
  }
}

// Test streaming upload (similar to what the app uses)
async function testStreamingUpload() {
  console.log('\n=== TESTING STREAMING UPLOAD (SIMILAR TO APP) ===');
  try {
    const buffer = await createTestImageBuffer();
    
    console.log('Uploading test image using streaming method...');
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'test-upload',
          resource_type: 'image',
          timeout: 60000,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      bufferToStream(buffer).pipe(uploadStream);
    });
    
    console.log('✅ Streaming upload successful!');
    console.log(`   - Public ID: ${uploadResult.public_id}`);
    console.log(`   - URL: ${uploadResult.secure_url}`);
    
    // Delete the test upload
    console.log('Deleting test upload...');
    await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        uploadResult.public_id,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    
    console.log('✅ Test streaming upload deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Streaming upload test failed:', error);
    if (error.message && error.message.includes('<!DOCTYPE')) {
      console.error('   This matches the error you\'re seeing in your app!');
      console.error('   The Cloudinary server is returning HTML instead of JSON.');
    }
    return false;
  }
}

async function checkAndFixCloudinaryConfig() {
  console.log('\n=== RECOMMENDATIONS ===');
  
  // Check if Cloudinary package version matches
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const cloudinaryVersion = packageJson.dependencies.cloudinary;
    console.log(`Current Cloudinary version: ${cloudinaryVersion}`);
    
    if (cloudinaryVersion && cloudinaryVersion !== '^2.6.1') {
      console.log('⚠️ Your Cloudinary version may be different from the one recommended by Vercel.');
      console.log('   Consider updating to version 2.6.1 with: npm install cloudinary@2.6.1');
    }
  } catch (error) {
    console.error('Error checking package version:', error.message);
  }
  
  // Create fixed upload route
  const fixedUploadRoute = `// src/app/api/upload/route.js - FIXED VERSION
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
        { error: \`Invalid file type: \${file.type}. Allowed types: \${validMimeTypes.join(', ')}\` },
        { status: 400 }
      );
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error('File too large:', file.size, 'bytes (max:', maxSize, 'bytes)');
      return NextResponse.json(
        { error: \`File is too large: \${(file.size / (1024 * 1024)).toFixed(2)}MB (max 5MB)\` },
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
    const folderName = \`birthdaylove/\${timestamp}_\${randomStr}\`;
    
    console.log('Uploading to Cloudinary folder:', folderName);
    
    // SIMPLIFIED UPLOAD METHOD - Using simpler upload method that avoids streaming
    try {
      // Create temporary file
      const tempFilePath = \`./temp_\${timestamp}_\${randomStr}.jpg\`;
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
}`;

  // Save fixed upload route
  fs.writeFileSync('./fixed-upload-route.js', fixedUploadRoute);
  console.log('Created fixed-upload-route.js with a simplified upload method');
  
  // Create .env.local example if it doesn't exist
  if (!fs.existsSync('./.env.local')) {
    const envExample = `# Cloudinary configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key  
CLOUDINARY_API_SECRET=your_api_secret

# MongoDB configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/birthdaylove?retryWrites=true&w=majority

# Stripe configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000`;

    fs.writeFileSync('./.env.local.example', envExample);
    console.log('Created .env.local.example file. Rename to .env.local and update with your credentials');
  }
  
  // Final recommendations
  console.log('\n=== FINAL RECOMMENDATIONS ===');
  console.log('1. Verify your Cloudinary credentials are correct in .env.local');
  console.log('2. Replace src/app/api/upload/route.js with the fixed version in fixed-upload-route.js');
  console.log('3. Consider updating the Cloudinary package: npm install cloudinary@2.6.1');
  console.log('4. Ensure your Cloudinary account is active and not suspended');
  console.log('5. Check if you\'re hitting any Cloudinary usage limits that might trigger 500 errors');
}

// Main test function
async function runTests() {
  let apiSuccess = await testCloudinaryAPI();
  let sdkSuccess = await testCloudinarySDK();
  let simpleUploadSuccess = false;
  let streamingUploadSuccess = false;
  
  if (apiSuccess || sdkSuccess) {
    simpleUploadSuccess = await testSimpleUpload();
    
    if (simpleUploadSuccess) {
      streamingUploadSuccess = await testStreamingUpload();
    }
  }
  
  console.log('\n=== TEST SUMMARY ===');
  console.log(`1. Direct API Access: ${apiSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`2. Cloudinary SDK: ${sdkSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`3. Simple Upload: ${simpleUploadSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`4. Streaming Upload: ${streamingUploadSuccess ? '✅ PASS' : '❌ FAIL'}`);
  
  await checkAndFixCloudinaryConfig();
}

runTests().catch(error => {
  console.error('Unhandled error:', error);
});