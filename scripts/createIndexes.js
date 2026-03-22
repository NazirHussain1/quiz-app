/**
 * Database Indexing Script for Leaderboard Optimization
 * 
 * This script creates optimized indexes on the results collection
 * to improve leaderboard query performance.
 * 
 * Run with: node scripts/createIndexes.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function createIndexes() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('results');
    
    console.log('\n📊 Creating indexes for leaderboard optimization...\n');
    
    // 1. Compound index for main leaderboard query (score DESC, createdAt ASC)
    console.log('Creating index: leaderboard_score_date');
    await collection.createIndex(
      { score: -1, createdAt: 1 },
      { 
        name: 'leaderboard_score_date',
        background: true 
      }
    );
    console.log('✅ Created: leaderboard_score_date (score: -1, createdAt: 1)');
    
    // 2. Index for subject filtering
    console.log('\nCreating index: subject_1');
    await collection.createIndex(
      { subject: 1 },
      { 
        name: 'subject_1',
        background: true 
      }
    );
    console.log('✅ Created: subject_1');
    
    // 3. Index for difficulty filtering
    console.log('\nCreating index: difficulty_1');
    await collection.createIndex(
      { difficulty: 1 },
      { 
        name: 'difficulty_1',
        background: true 
      }
    );
    console.log('✅ Created: difficulty_1');
    
    // 4. Index for category filtering
    console.log('\nCreating index: category_1');
    await collection.createIndex(
      { category: 1 },
      { 
        name: 'category_1',
        background: true 
      }
    );
    console.log('✅ Created: category_1');
    
    // 5. Compound index for filtered leaderboard queries
    console.log('\nCreating index: filtered_leaderboard');
    await collection.createIndex(
      { subject: 1, difficulty: 1, score: -1, createdAt: 1 },
      { 
        name: 'filtered_leaderboard',
        background: true 
      }
    );
    console.log('✅ Created: filtered_leaderboard (subject: 1, difficulty: 1, score: -1, createdAt: 1)');
    
    // 6. Index for user name lookups (for rank calculation)
    console.log('\nCreating index: name_1');
    await collection.createIndex(
      { name: 1 },
      { 
        name: 'name_1',
        background: true 
      }
    );
    console.log('✅ Created: name_1');
    
    // List all indexes
    console.log('\n📋 All indexes on results collection:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    // Get collection stats
    console.log('\n📈 Collection Statistics:');
    const stats = await db.command({ collStats: 'results' });
    console.log(`  - Total documents: ${stats.count}`);
    console.log(`  - Storage size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`  - Total index size: ${(stats.totalIndexSize / 1024).toFixed(2)} KB`);
    console.log(`  - Number of indexes: ${stats.nindexes}`);
    
    console.log('\n✅ All indexes created successfully!');
    console.log('\n💡 Performance Tips:');
    console.log('  - Indexes are created in background mode to avoid blocking');
    console.log('  - Compound indexes support multiple filter combinations');
    console.log('  - Query performance should improve significantly for leaderboard');
    
  } catch (error) {
    console.error('\n❌ Error creating indexes:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
createIndexes().catch(console.error);
