// src/lib/mongodb.js - With fallback to memory storage
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;
let mockDb = null;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  // If we have a connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If we don't have a valid MongoDB URI, use an in-memory mock
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI not provided, using in-memory mock database');
    return setupMockDatabase();
  }

  // If we don't have a promise yet, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    };

    console.log('Connecting to MongoDB...');
    
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err);
        console.warn('Falling back to in-memory mock database');
        cached.promise = null;
        return setupMockDatabase();
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

// Setup an in-memory mock database for development
function setupMockDatabase() {
  if (mockDb) {
    return mockDb;
  }
  
  console.log('Setting up mock database for development');
  
  // Simple in-memory storage
  const inMemoryStorage = {
    sites: [],
    models: {},
    connection: {
      db: {
        databaseName: 'mock-db',
        listCollections: () => ({ 
          toArray: () => Promise.resolve([{ name: 'sites' }]) 
        })
      },
      host: 'localhost',
      port: 'N/A',
      readyState: 1
    }
  };
  
  // Mock model functions
  class MockModel {
    constructor(data) {
      this._id = 'mock_' + Date.now();
      Object.assign(this, data);
    }
    
    async save() {
      // Add or update in our in-memory storage
      const existingIndex = inMemoryStorage.sites.findIndex(s => s._id === this._id);
      if (existingIndex >= 0) {
        inMemoryStorage.sites[existingIndex] = this;
      } else {
        inMemoryStorage.sites.push(this);
      }
      return this;
    }
    
    static async findOne(query) {
      return inMemoryStorage.sites.find(site => {
        // Match all keys in the query
        return Object.keys(query).every(key => site[key] === query[key]);
      }) || null;
    }
    
    static async findById(id) {
      return inMemoryStorage.sites.find(site => site._id === id) || null;
    }
    
    static async findByIdAndDelete(id) {
      const index = inMemoryStorage.sites.findIndex(site => site._id === id);
      if (index >= 0) {
        inMemoryStorage.sites.splice(index, 1);
        return true;
      }
      return false;
    }
  }
  
  // Mock mongoose
  mockDb = {
    ...inMemoryStorage,
    models: {
      Site: MockModel
    },
    model: (name, schema) => {
      // Return existing model if it exists
      if (inMemoryStorage.models[name]) {
        return inMemoryStorage.models[name];
      }
      
      // Create a new model
      inMemoryStorage.models[name] = MockModel;
      return inMemoryStorage.models[name];
    },
    Schema: class MockSchema {
      constructor() {
        // Just a dummy constructor to make mongoose code work
      }
    }
  };
  
  return mockDb;
}

export default connectToDatabase;