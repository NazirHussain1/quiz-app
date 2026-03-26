const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function createAdmin(email, password, userName) {
  if (!email || !password || !userName) {
    console.error('❌ Error: All fields are required');
    console.log('Usage: node scripts/createAdmin.js <email> <password> <userName>');
    console.log('Example: node scripts/createAdmin.js admin@example.com admin123 AdminUser');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('quizapp');
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      console.error(`❌ Error: User with email "${email}" already exists`);
      console.log(`   Current role: ${existingUser.role}`);
      
      if (existingUser.role !== 'admin') {
        console.log('\n💡 Tip: Use makeAdmin.js to upgrade existing user to admin:');
        console.log(`   node scripts/makeAdmin.js ${email}`);
      }
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const result = await usersCollection.insertOne({
      email,
      userName,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    if (result.insertedId) {
      console.log('\n✅ Admin account created successfully!');
      console.log('\n📋 Login Details:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`   Username: ${userName}`);
      console.log(`   Role: admin`);
      console.log('\n🎉 You can now login at: http://localhost:3001/login');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

// Get arguments from command line
const email = process.argv[2];
const password = process.argv[3];
const userName = process.argv[4];

createAdmin(email, password, userName);
