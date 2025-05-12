// Save this file as fix-db.js
// Run with: node fix-db.js

// This script uses ES Modules syntax. If your project is set up with CommonJS, 
// you may need to adjust the import statements.

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check for .env.local file
const envPath = join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('Loaded environment variables from .env.local');
} else {
  dotenv.config();
  console.log('No .env.local found, using default env vars');
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

async function fixDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB!');

    // Get the sites collection
    const db = mongoose.connection.db;
    const sitesCollection = db.collection('sites');

    // Check if the uniqueHash index exists
    const indexes = await sitesCollection.indexes();
    console.log('Current indexes:', indexes);
    
    // Fix uniqueHash
    const uniqueHashIndex = indexes.find(index => 
      index.name === 'uniqueHash_1' || 
      (index.key && index.key.uniqueHash !== undefined)
    );

    if (uniqueHashIndex) {
      console.log('Found uniqueHash index:', uniqueHashIndex);
      
      // Drop the uniqueHash index
      console.log('Dropping uniqueHash index...');
      await sitesCollection.dropIndex(uniqueHashIndex.name);
      console.log('Successfully dropped uniqueHash index');
    } else {
      console.log('No uniqueHash index found');
    }
    
    // Fix editHash
    const editHashIndex = indexes.find(index => 
      index.name === 'editHash_1' || 
      (index.key && index.key.editHash !== undefined)
    );
    
    if (editHashIndex) {
      console.log('Found editHash index:', editHashIndex);
      
      // Drop the editHash index
      console.log('Dropping editHash index...');
      await sitesCollection.dropIndex(editHashIndex.name);
      console.log('Successfully dropped editHash index');
    } else {
      console.log('No editHash index found');
    }

    // Update documents with null uniqueHash
    console.log('Updating documents with null uniqueHash...');
    const uniqueHashResult = await sitesCollection.updateMany(
      { $or: [{ uniqueHash: null }, { uniqueHash: { $exists: false } }] },
      { $set: { uniqueHash: uuidv4() } }
    );
    console.log(`Updated ${uniqueHashResult.modifiedCount} documents for uniqueHash`);
    
    // Update documents with null editHash
    console.log('Updating documents with null editHash...');
    const editHashResult = await sitesCollection.updateMany(
      { $or: [{ editHash: null }, { editHash: { $exists: false } }] },
      { $set: { editHash: uuidv4() } }
    );
    console.log(`Updated ${editHashResult.modifiedCount} documents for editHash`);

    // Create new unique indexes
    console.log('Creating new unique indexes...');
    await sitesCollection.createIndex({ uniqueHash: 1 }, { unique: true });
    await sitesCollection.createIndex({ editHash: 1 }, { unique: true });
    console.log('Successfully created new indexes');

    // Verify all documents have uniqueHash and editHash values
    const nullHashDocs = await sitesCollection.countDocuments({
      $or: [
        { uniqueHash: null },
        { uniqueHash: { $exists: false } },
        { editHash: null },
        { editHash: { $exists: false } }
      ]
    });
    
    if (nullHashDocs > 0) {
      console.warn(`Warning: ${nullHashDocs} documents still have null/missing hash values`);
    } else {
      console.log('All documents have uniqueHash and editHash values');
    }

    console.log('Database fix completed successfully!');
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

fixDatabase();