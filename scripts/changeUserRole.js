const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  STUDENT: 'student',
};

async function changeUserRole() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('\n📋 Usage: node scripts/changeUserRole.js <email> <role>');
    console.log('\n Available roles:');
    console.log('   - superadmin (full access)');
    console.log('   - admin (manage users + questions)');
    console.log('   - moderator (manage questions only)');
    console.log('   - student (take quizzes only)');
    console.log('\n Example: node scripts/changeUserRole.js user@example.com admin\n');
    process.exit(1);
  }

  const [email, newRole] = args;

  if (!Object.values(ROLES).includes(newRole)) {
    console.error(`\n❌ Invalid role: ${newRole}`);
    console.log(`   Valid roles: ${Object.values(ROLES).join(', ')}\n`);
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('quizapp');
    const usersCollection = db.collection('users');

    // Find user
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`\n❌ User not found: ${email}\n`);
      process.exit(1);
    }

    const oldRole = user.role || 'student';

    if (oldRole === newRole) {
      console.log(`\n⚠️  User ${email} already has role: ${newRole}\n`);
      process.exit(0);
    }

    // Update role
    await usersCollection.updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          role: newRole,
          updatedAt: new Date(),
        },
      }
    );

    console.log('\n✅ Role updated successfully!');
    console.log(`\n   User: ${user.userName} (${email})`);
    console.log(`   Old Role: ${oldRole}`);
    console.log(`   New Role: ${newRole}`);
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message, '\n');
    process.exit(1);
  } finally {
    await client.close();
  }
}

changeUserRole();
