const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const email = process.argv[2];
const newUsername = process.argv[3];

if (!email || !newUsername) {
  console.error('Usage: node scripts/updateUsername.js <email> <newUsername>');
  process.exit(1);
}

(async () => {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('quizapp');
    const result = await db.collection('users').updateOne(
      { email },
      { $set: { userName: newUsername, updatedAt: new Date() } }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Username updated to "${newUsername}" for ${email}`);
    } else {
      console.log('ℹ️  No changes made');
    }
    
    await client.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
