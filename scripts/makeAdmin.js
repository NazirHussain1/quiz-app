/**
 * Script to make a user an admin
 * Usage: node scripts/makeAdmin.js <email>
 * Example: node scripts/makeAdmin.js admin@example.com
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function makeAdmin(email) {
  if (!email) {
    console.error('❌ Error: Please provide an email address');
    console.log('Usage: node scripts/makeAdmin.js <email>');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('quizapp');
    const usersCollection = db.collection('users');

    // Find user by email
    const user = await usersCollection.findOne({ email });

    if (!user) {
      console.error(`❌ Error: User with email "${email}" not found`);
      process.exit(1);
    }

    // Update user role to admin
    const result = await usersCollection.updateOne(
      { email },
      { 
        $set: { 
          role: 'admin',
          updatedAt: new Date()
        } 
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ Success: User "${email}" is now an admin`);
      console.log(`   User: ${user.userName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: admin`);
    } else {
      console.log(`ℹ️  User "${email}" was already an admin`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('✅ Connection closed');
  }
}

// Get email from command line arguments
const email = process.argv[2];
makeAdmin(email);
