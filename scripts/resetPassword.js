const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('Usage: node scripts/resetPassword.js <email> <newPassword>');
  process.exit(1);
}

(async () => {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('quizapp');
    const usersCollection = db.collection('users');
    
    // Find user
    const user = await usersCollection.findOne({ email });
    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      process.exit(1);
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    const result = await usersCollection.updateOne(
      { email },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Password updated successfully for ${email}`);
      console.log(`   New password: ${newPassword}`);
    } else {
      console.log('ℹ️  No changes made');
    }
    
    await client.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
