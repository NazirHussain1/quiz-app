/**
 * Script to list all users with their roles
 * Usage: node scripts/listUsers.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function listUsers() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('quizapp');
    const usersCollection = db.collection('users');

    // Get all users
    const users = await usersCollection
      .find({})
      .project({ password: 0 }) // Exclude password field
      .sort({ createdAt: -1 })
      .toArray();

    if (users.length === 0) {
      console.log('ℹ️  No users found in database');
      return;
    }

    console.log(`📋 Total Users: ${users.length}\n`);
    console.log('─'.repeat(80));
    
    users.forEach((user, index) => {
      const role = user.role || 'student';
      const roleIcon = role === 'admin' ? '👑' : '👤';
      
      console.log(`${index + 1}. ${roleIcon} ${user.userName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${role}`);
      console.log(`   Created: ${user.createdAt?.toLocaleDateString() || 'N/A'}`);
      console.log('─'.repeat(80));
    });

    // Count by role
    const adminCount = users.filter(u => u.role === 'admin').length;
    const studentCount = users.length - adminCount;
    
    console.log(`\n📊 Summary:`);
    console.log(`   👑 Admins: ${adminCount}`);
    console.log(`   👤 Students: ${studentCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

listUsers();
