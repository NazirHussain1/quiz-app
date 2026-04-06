/**
 * Database Indexing Script for Performance Optimization
 * 
 * This script creates optimized indexes on all collections
 * to improve query performance across the application.
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
    
    // ========== RESULTS COLLECTION ==========
    console.log('\n📊 Creating indexes for results collection...\n');
    const resultsCollection = db.collection('results');
    
    await resultsCollection.createIndex(
      { score: -1, createdAt: 1 },
      { name: 'leaderboard_score_date', background: true }
    );
    console.log('✅ Created: leaderboard_score_date (score: -1, createdAt: 1)');
    
    await resultsCollection.createIndex(
      { subject: 1 },
      { name: 'subject_1', background: true }
    );
    console.log('✅ Created: subject_1');
    
    await resultsCollection.createIndex(
      { difficulty: 1 },
      { name: 'difficulty_1', background: true }
    );
    console.log('✅ Created: difficulty_1');
    
    await resultsCollection.createIndex(
      { category: 1 },
      { name: 'category_1', background: true }
    );
    console.log('✅ Created: category_1');
    
    await resultsCollection.createIndex(
      { subject: 1, difficulty: 1, score: -1, createdAt: 1 },
      { name: 'filtered_leaderboard', background: true }
    );
    console.log('✅ Created: filtered_leaderboard (subject: 1, difficulty: 1, score: -1, createdAt: 1)');
    
    await resultsCollection.createIndex(
      { createdAt: -1 },
      { name: 'createdAt_desc', background: true }
    );
    console.log('✅ Created: createdAt_desc (for recent activity)');
    
    // ========== QUESTIONS COLLECTION ==========
    console.log('\n📚 Creating indexes for questions collection...\n');
    const questionsCollection = db.collection('questions');
    
    await questionsCollection.createIndex(
      { subject: 1 },
      { name: 'subject_1', background: true }
    );
    console.log('✅ Created: subject_1');
    
    await questionsCollection.createIndex(
      { category: 1 },
      { name: 'category_1', background: true }
    );
    console.log('✅ Created: category_1');
    
    await questionsCollection.createIndex(
      { difficulty: 1 },
      { name: 'difficulty_1', background: true }
    );
    console.log('✅ Created: difficulty_1');
    
    await questionsCollection.createIndex(
      { category: 1, subject: 1, difficulty: 1 },
      { name: 'filtered_questions', background: true }
    );
    console.log('✅ Created: filtered_questions (category: 1, subject: 1, difficulty: 1)');
    
    await questionsCollection.createIndex(
      { question: 'text' },
      { name: 'question_text', background: true }
    );
    console.log('✅ Created: question_text (text search)');
    
    // ========== USERS COLLECTION ==========
    console.log('\n👥 Creating indexes for users collection...\n');
    const usersCollection = db.collection('users');
    
    await usersCollection.createIndex(
      { email: 1 },
      { name: 'email_unique', unique: true, background: true }
    );
    console.log('✅ Created: email_unique (unique)');
    
    await usersCollection.createIndex(
      { userName: 1 },
      { name: 'userName_1', background: true }
    );
    console.log('✅ Created: userName_1');
    
    await usersCollection.createIndex(
      { role: 1 },
      { name: 'role_1', background: true }
    );
    console.log('✅ Created: role_1');
    
    await usersCollection.createIndex(
      { createdAt: -1 },
      { name: 'createdAt_desc', background: true }
    );
    console.log('✅ Created: createdAt_desc');
    
    await usersCollection.createIndex(
      { verificationToken: 1 },
      { name: 'verificationToken_1', sparse: true, background: true }
    );
    console.log('✅ Created: verificationToken_1 (sparse)');
    
    await usersCollection.createIndex(
      { resetPasswordToken: 1 },
      { name: 'resetPasswordToken_1', sparse: true, background: true }
    );
    console.log('✅ Created: resetPasswordToken_1 (sparse)');
    
    // ========== CUSTOM QUIZZES COLLECTION ==========
    console.log('\n📝 Creating indexes for customQuizzes collection...\n');
    const customQuizzesCollection = db.collection('customQuizzes');
    
    await customQuizzesCollection.createIndex(
      { userId: 1, createdAt: -1 },
      { name: 'userId_createdAt', background: true }
    );
    console.log('✅ Created: userId_createdAt (userId: 1, createdAt: -1)');
    
    await customQuizzesCollection.createIndex(
      { createdAt: -1 },
      { name: 'createdAt_desc', background: true }
    );
    console.log('✅ Created: createdAt_desc');
    
    // ========== SUMMARY ==========
    console.log('\n📋 Index Summary:');
    
    const collections = [
      { name: 'results', collection: resultsCollection },
      { name: 'questions', collection: questionsCollection },
      { name: 'users', collection: usersCollection },
      { name: 'customQuizzes', collection: customQuizzesCollection }
    ];
    
    for (const { name, collection } of collections) {
      const indexes = await collection.indexes();
      console.log(`\n${name} collection (${indexes.length} indexes):`);
      indexes.forEach(index => {
        console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
      });
    }
    
    // ========== STATISTICS ==========
    console.log('\n📈 Collection Statistics:');
    for (const { name } of collections) {
      try {
        const stats = await db.command({ collStats: name });
        console.log(`\n${name}:`);
        console.log(`  - Documents: ${stats.count}`);
        console.log(`  - Storage: ${(stats.size / 1024).toFixed(2)} KB`);
        console.log(`  - Index size: ${(stats.totalIndexSize / 1024).toFixed(2)} KB`);
      } catch (err) {
        console.log(`\n${name}: Collection not found (will be created on first use)`);
      }
    }
    
    console.log('\n✅ All indexes created successfully!');
    console.log('\n💡 Performance Tips:');
    console.log('  - Indexes are created in background mode to avoid blocking');
    console.log('  - Compound indexes support multiple filter combinations');
    console.log('  - Text indexes enable full-text search on questions');
    console.log('  - Sparse indexes save space for optional fields');
    console.log('  - Query performance should improve significantly');
    
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
