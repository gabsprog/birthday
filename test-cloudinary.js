// test-cloudinary.js
// Save this file to your project root and run with: node test-cloudinary.js

const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

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

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinaryUpload() {
  console.log('\n=== TESTING CLOUDINARY CONFIGURATION ===');
  try {
    // Test Account Info
    console.log('Fetching account info...');
    const accountInfo = await new Promise((resolve, reject) => {
      cloudinary.api.account((error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
    
    console.log('✅ Cloudinary account info retrieved successfully');
    console.log(`   - Plan: ${accountInfo.plan}`);
    
    // Test Upload
    console.log('\n=== TESTING FILE UPLOAD ===');
    
    // Create a test image if none exists
    const testImagePath = './test-upload.jpg';
    if (!fs.existsSync(testImagePath)) {
      console.log('Creating a test image...');
      
      // Create a simple 100x100 black square image
      const canvas = require('canvas');
      const { createCanvas } = canvas;
      const c = createCanvas(100, 100);
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, 100, 100);
      
      // Save as JPEG
      const out = fs.createWriteStream(testImagePath);
      const stream = c.createJPEGStream({
        quality: 0.95,
        chromaSubsampling: false
      });
      stream.pipe(out);
      
      await new Promise((resolve) => {
        out.on('finish', resolve);
      });
      
      console.log('Test image created successfully');
    }
    
    console.log('Uploading test image to Cloudinary...');
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
    
    console.log('✅ Upload successful!');
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
    console.log('\n✅ All Cloudinary tests passed! Your Cloudinary configuration is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Cloudinary test failed:', error.message);
    if (error.name === 'Error' && error.message.includes('auth')) {
      console.error('   This is likely due to incorrect Cloudinary credentials. Check your environment variables.');
    } else {
      console.error('   Error details:', error);
    }
  }
}

testCloudinaryUpload().catch(console.error);