/**
 * Database Initialization Script
 * Creates collections with schemas and indexes
 * 
 * Usage: node scripts/initializeDatabase.js
 */

const { MongoClient } = require('mongodb');
const { getAllSchemas, getAllIndexes, COLLECTIONS } = require('../app/lib/database/schemas.js');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'quizapp';

async function initializeDatabase() {
  if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db(DB_NAME);
    const schemas = getAllSchemas();
    const indexes = getAllIndexes();

    console.log('📊 Initializing database:', DB_NAME);
    console.log('━'.repeat(60));

    // Get existing collections
    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map(c => c.name);

    // Create collections with schemas
    for (const [collectionName, schema] of Object.entries(schemas)) {
      console.log(`\n📁 Collection: ${collectionName}`);
      
      if (existingNames.includes(collectionName)) {
        console.log('   ℹ️  Collection already exists');
        
        // Update validation schema
        try {
          await db.command({
            collMod: collectionName,
            validator: schema.validator,
            validationLevel: schema.validationLevel,
            validationAction: schema.validationAction,
          });
          console.log('   ✅ Updated validation schema');
        } catch (error) {
          console.log('   ⚠️  Could not update schema:', error.message);
        }
      } else {
        // Create new collection with schema
        await db.createCollection(collectionName, schema);
        console.log('   ✅ Created collection with schema');
      }

      // Create indexes
      const collectionIndexes = indexes[collectionName];
      if (collectionIndexes && collectionIndexes.length > 0) {
        console.log(`   📑 Creating ${collectionIndexes.length} indexes...`);
        
        const collection = db.collection(collectionName);
        
        for (const indexSpec of collectionIndexes) {
          try {
            await collection.createIndex(indexSpec.key, {
              name: indexSpec.name,
              unique: indexSpec.unique || false,
              sparse: indexSpec.sparse || false,
              expireAfterSeconds: indexSpec.expireAfterSeconds,
              weights: indexSpec.weights,
            });
            console.log(`      ✓ ${indexSpec.name}`);
          } catch (error) {
            if (error.code === 85 || error.code === 86) {
              // Index already exists with different options
              console.log(`      ⚠️  ${indexSpec.name} (already exists, skipping)`);
            } else {
              console.log(`      ✗ ${indexSpec.name}: ${error.message}`);
            }
          }
        }
      }
    }

    console.log('\n━'.repeat(60));
    console.log('\n📊 Database Statistics:');
    console.log('━'.repeat(60));

    // Show collection stats
    for (const collectionName of Object.values(COLLECTIONS)) {
      try {
        const stats = await db.collection(collectionName).stats();
        const indexes = await db.collection(collectionName).indexes();
        
        console.log(`\n${collectionName}:`);
        console.log(`   Documents: ${stats.count.toLocaleString()}`);
        console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
        console.log(`   Indexes: ${indexes.length}`);
        console.log(`   Average Document Size: ${stats.avgObjSize ? stats.avgObjSize.toFixed(2) + ' bytes' : 'N/A'}`);
      } catch (error) {
        console.log(`\n${collectionName}: Collection not found or empty`);
      }
    }

    console.log('\n━'.repeat(60));
    console.log('\n✅ Database initialization complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Seed data: node scripts/seed70Questions.js');
    console.log('   2. Create admin: npm run make-admin <email>');
    console.log('   3. Start app: npm run dev\n');

  } catch (error) {
    console.error('\n❌ Error initializing database:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Connection closed\n');
  }
}

// Run initialization
initializeDatabase();
