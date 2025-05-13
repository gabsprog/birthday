// Replace your existing mongodb.js file with this one

import mongoose from 'mongoose';

// Global connection state
let globalMongoConnection = {
  conn: null,
  promise: null,
  isConnecting: false,
  connectionAttempts: 0,
  lastConnectionTime: null
};

/**
 * Connect to MongoDB with reliable error handling
 */
async function connectToDatabase(options = {}) {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
  
  const {
    maxRetries = 3,
    retryDelayMs = 1000,
    forceNewConnection = false,
    maxConnectionAge = 60000 // 1 minute
  } = options;
  
  // If we already have a valid connection, use it
  if (!forceNewConnection && 
      globalMongoConnection.conn && 
      mongoose.connection.readyState === 1 &&
      globalMongoConnection.lastConnectionTime && 
      (Date.now() - globalMongoConnection.lastConnectionTime < maxConnectionAge)) {
    
    console.log('Using existing MongoDB connection');
    return globalMongoConnection.conn;
  }
  
  // If a connection is pending, wait for it
  if (globalMongoConnection.promise && globalMongoConnection.isConnecting) {
    console.log('Waiting for pending MongoDB connection...');
    try {
      await globalMongoConnection.promise;
      console.log('Pending connection completed successfully');
      return globalMongoConnection.conn;
    } catch (error) {
      console.error('Pending connection failed, trying again:', error.message);
    }
  }
  
  // Close existing connection if needed
  if (mongoose.connection.readyState !== 0) {
    try {
      console.log(`Closing previous MongoDB connection (state: ${mongoose.connection.readyState})`);
      await mongoose.disconnect();
      console.log('Previous connection closed successfully');
    } catch (disconnectError) {
      console.error('Error closing previous connection:', disconnectError.message);
    }
  }
  
  // Set up new connection
  globalMongoConnection.isConnecting = true;
  globalMongoConnection.connectionAttempts += 1;
  
  // IMPORTANT: Only use MongoDB options that are supported
  const mongooseOptions = {
    bufferCommands: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    family: 4,
    maxPoolSize: 10,
    minPoolSize: 1
  };
  
  console.log(`Starting new MongoDB connection (attempt ${globalMongoConnection.connectionAttempts})...`);
  
  async function attemptConnection(retriesLeft) {
    try {
      console.log(`Connection attempt ${maxRetries - retriesLeft + 1}/${maxRetries}`);
      const connection = await mongoose.connect(MONGODB_URI, mongooseOptions);
      
      // Check if connection is ready
      if (mongoose.connection.readyState !== 1) {
        throw new Error(`Connection not ready. Current state: ${mongoose.connection.readyState}`);
      }
      
      // Test connection with a ping
      await mongoose.connection.db.admin().ping();
      
      console.log('MongoDB connection established successfully!');
      globalMongoConnection.conn = connection;
      globalMongoConnection.lastConnectionTime = Date.now();
      
      // Set up event listeners
      setupConnectionMonitoring();
      
      return connection;
    } catch (error) {
      if (retriesLeft > 0) {
        console.log(`Connection failed: ${error.message}. Retrying in ${retryDelayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        return attemptConnection(retriesLeft - 1);
      } else {
        throw new Error(`Failed to connect to MongoDB after ${maxRetries} attempts: ${error.message}`);
      }
    }
  }
  
  try {
    globalMongoConnection.promise = attemptConnection(maxRetries);
    const connection = await globalMongoConnection.promise;
    return connection;
  } catch (error) {
    console.error('All connection attempts failed:', error.message);
    globalMongoConnection.isConnecting = false;
    globalMongoConnection.promise = null;
    throw error;
  } finally {
    globalMongoConnection.isConnecting = false;
  }
}

/**
 * Set up connection monitoring
 */
function setupConnectionMonitoring() {
  // Remove existing listeners
  mongoose.connection.removeAllListeners('disconnected');
  mongoose.connection.removeAllListeners('error');
  mongoose.connection.removeAllListeners('connected');
  
  // When disconnected
  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Will reconnect on next operation.');
    globalMongoConnection.conn = null;
    globalMongoConnection.promise = null;
  });
  
  // When error occurs
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
    if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
      globalMongoConnection.conn = null;
      globalMongoConnection.promise = null;
    }
  });
  
  // When reconnected
  mongoose.connection.on('connected', () => {
    console.log('MongoDB reconnected after previous failure');
    globalMongoConnection.lastConnectionTime = Date.now();
  });
}

export default connectToDatabase;
