// Use ES Module syntax for imports since Node is treating this as an ES module
import mongoose from 'mongoose';
import Stripe from 'stripe';

async function testConnections() {
  console.log('\n=== ENVIRONMENT VARIABLE CHECK ===');
  
  // Check for essential environment variables
  const requiredVars = [
    'MONGODB_URI',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  ];
  
  let missingVars = [];
  let stripeError = null; // Define this variable to fix the reference error
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
      console.error(`❌ Missing required environment variable: ${varName}`);
    } else {
      const value = process.env[varName];
      // Mask sensitive values
      const maskedValue = varName.includes('SECRET') || varName.includes('KEY') 
        ? `${value.substr(0, 4)}...${value.substr(-4)}`
        : varName.includes('URI') 
          ? value.replace(/:\/\/([^:]+):([^@]+)@/, '://**:**@') 
          : value;
      console.log(`✅ ${varName} is set: ${maskedValue}`);
    }
  });
  
  if (missingVars.length > 0) {
    console.error(`\n❌ Missing ${missingVars.length} required environment variables. Check your .env.local file.`);
  } else {
    console.log(`\n✅ All required environment variables are set!`);
  }
  
  // Test MongoDB connection
  console.log('\n=== TESTING MONGODB CONNECTION ===');
  let mongoConnected = false;
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds
      connectTimeoutMS: 10000 // 10 seconds
    });
    
    console.log(`✅ MongoDB connected successfully!`);
    console.log(`   - Database name: ${conn.connection.db.databaseName}`);
    console.log(`   - Host: ${conn.connection.host}:${conn.connection.port}`);
    
    // Test a simple query
    console.log('Testing a simple query...');
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`✅ Database has ${collections.length} collections: ${collections.map(c => c.name).join(', ')}`);
    
    // Close connection
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
    mongoConnected = true;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    if (error.name === 'MongoServerSelectionError') {
      console.error('   This may be due to incorrect MongoDB URI, network issues, or the MongoDB server being unreachable.');
    }
  }
  
  // Test Stripe integration
  console.log('\n=== TESTING STRIPE INTEGRATION ===');
  try {
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    
    console.log('Initializing Stripe...');
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    
    // Test a simple API call to verify the key works
    console.log('Testing Stripe API with a simple call...');
    const balance = await stripe.balance.retrieve();
    console.log(`✅ Stripe API call successful!`);
    console.log(`   - Available balance: ${balance.available.map(b => `${b.amount/100} ${b.currency.toUpperCase()}`).join(', ') || '0 USD'}`);
    
    // Test creating a payment intent
    console.log('Testing payment intent creation...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100, // $4.00
      currency: 'brl',
      payment_method_options: {
        card: {
          request_three_d_secure: 'any' // Solicita 3DS quando disponível
        }
      },
      metadata: {
        test: 'true',
        timestamp: Date.now().toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    console.log(`✅ Payment Intent created successfully!`);
    console.log(`   - Payment Intent ID: ${paymentIntent.id}`);
    console.log(`   - Client Secret (first 10 chars): ${paymentIntent.client_secret.substring(0, 10)}...`);
    
    // Immediately cancel the test payment intent
    console.log('Cancelling test payment intent...');
    await stripe.paymentIntents.cancel(paymentIntent.id);
    console.log(`✅ Test payment intent cancelled`);
    stripeError = null; // Clear any errors if successful
    
  } catch (error) {
    stripeError = error; // Store the error
    console.error(`❌ Stripe API test failed: ${error.message}`);
    if (error.type === 'StripeAuthenticationError') {
      console.error('   This is likely due to an invalid API key. Check your STRIPE_SECRET_KEY.');
    } else if (error.type === 'StripeConnectionError') {
      console.error('   Could not connect to Stripe. Check your internet connection.');
    } else {
      console.error(`   Error type: ${error.type}`);
      console.error(`   Error details: ${JSON.stringify(error, null, 2)}`);
    }
  }
  
  console.log('\n=== TEST SUMMARY ===');
  console.log('1. Environment Variables: ' + (missingVars.length === 0 ? '✅ OK' : '❌ Missing variables'));
  console.log('2. MongoDB Connection: ' + (mongoConnected ? '✅ OK' : '❌ Failed'));
  console.log('3. Stripe Integration: ' + (stripeError ? '❌ Failed' : '✅ OK'));
  
  // Final instructions
  if (missingVars.length === 0 && mongoConnected && !stripeError) {
    console.log('\n✅ All tests passed! Your environment is properly configured.');
    console.log('\nNext steps:');
    console.log('1. Run your application with `npm run dev`');
    console.log('2. Try to create a site and complete the payment process');
    console.log('3. Check browser console for any JavaScript errors during the process');
  } else {
    console.log('\n❌ Some tests failed. Please fix the issues before running your application.');
    console.log('\nTroubleshooting steps:');
    if (missingVars.length > 0) {
      console.log(`- Add the missing environment variables to your .env.local file: ${missingVars.join(', ')}`);
    }
    if (!mongoConnected) {
      console.log('- Check your MongoDB connection string and ensure your database is accessible');
    }
    if (stripeError) {
      console.log('- Verify your Stripe API keys and check if your account is properly set up');
    }
  }
}

// Run the tests
testConnections()
  .catch(error => {
    console.error('\nUnexpected error running tests:', error);
  })
  .finally(() => {
    // Ensure we exit the process even if mongoose connection is still open
    setTimeout(() => process.exit(0), 1000);
  });