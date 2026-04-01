const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function addEmailVerificationFields() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('quizapp');
    const usersCollection = db.collection('users');

    // Add email verification fields to existing users
    const result = await usersCollection.updateMany(
      { isVerified: { $exists: false } },
      {
        $set: {
          isVerified: true, // Set existing users as verified
          verificationToken: null,
          verificationTokenExpiry: null,
          resetPasswordToken: null,
          resetPasswordExpiry: null,
        },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} users with email verification fields`);

    // Create indexes for better performance
    await usersCollection.createIndex({ verificationToken: 1 });
    await usersCollection.createIndex({ resetPasswordToken: 1 });
    await usersCollection.createIndex({ email: 1 }, { unique: true });

    console.log('✅ Created indexes for email verification');

    // Show sample user
    const sampleUser = await usersCollection.findOne({});
    if (sampleUser) {
      console.log('\n📄 Sample user structure:');
      console.log({
        email: sampleUser.email,
        userName: sampleUser.userName,
        isVerified: sampleUser.isVerified,
        hasVerificationToken: !!sampleUser.verificationToken,
        hasResetToken: !!sampleUser.resetPasswordToken,
      });
    }

    console.log('\n✅ Migration completed successfully!\n');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

addEmailVerificationFields();
