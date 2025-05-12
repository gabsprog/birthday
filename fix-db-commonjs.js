// Save this file as fix-db-commonjs.js
// Run with: node fix-db-commonjs.js

// This version uses CommonJS syntax which is easier to run in most environments

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

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

    // Check if the uniqueHash and editHash indexes exist
    const indexes = await sitesCollection.indexes();
    console.log('Current indexes:', indexes);
    
    // Handle each index that might need to be fixed
    for (const indexName of ['uniqueHash_1', 'editHash_1']) {
      const index = indexes.find(idx => idx.name === indexName);
      
      if (index) {
        console.log(`Found index: ${indexName}`);
        
        // Drop the index
        console.log(`Dropping index ${indexName}...`);
        try {
          await sitesCollection.dropIndex(indexName);
          console.log(`Successfully dropped index ${indexName}`);
        } catch (err) {
          console.error(`Error dropping index ${indexName}:`, err.message);
        }
      } else {
        console.log(`No index found with name: ${indexName}`);
      }
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

    // Ensure each document has unique values
    console.log('Making sure all documents have unique hash values...');
    
    // Get all documents to process them
    const allDocs = await sitesCollection.find({}).toArray();
    console.log(`Found ${allDocs.length} total documents`);
    
    // Track used hashes to ensure uniqueness
    const usedUniqueHashes = new Set();
    const usedEditHashes = new Set();
    let updatedCount = 0;
    
    for (const doc of allDocs) {
      let needsUpdate = false;
      
      // Check uniqueHash
      if (!doc.uniqueHash || usedUniqueHashes.has(doc.uniqueHash)) {
        doc.uniqueHash = uuidv4();
        needsUpdate = true;
      }
      usedUniqueHashes.add(doc.uniqueHash);
      
      // Check editHash
      if (!doc.editHash || usedEditHashes.has(doc.editHash)) {
        doc.editHash = uuidv4();
        needsUpdate = true;
      }
      usedEditHashes.add(doc.editHash);
      
      // Update document if needed
      if (needsUpdate) {
        await sitesCollection.updateOne(
          { _id: doc._id },
          { $set: { uniqueHash: doc.uniqueHash, editHash: doc.editHash } }
        );
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} documents to ensure unique hash values`);

    // Create new unique indexes
    console.log('Creating new unique indexes...');
    await sitesCollection.createIndex({ uniqueHash: 1 }, { unique: true });
    await sitesCollection.createIndex({ editHash: 1 }, { unique: true });
    console.log('Successfully created new indexes');

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