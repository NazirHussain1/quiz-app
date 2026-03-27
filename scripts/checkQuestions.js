const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

(async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('quizapp');
  
  const summary = await db.collection('questions').aggregate([
    { $group: { _id: { category: '$category', difficulty: '$difficulty' }, count: { $sum: 1 } } },
    { $sort: { '_id.category': 1, '_id.difficulty': 1 } }
  ]).toArray();
  
  console.log('\n📊 Current Questions Summary:\n');
  summary.forEach(item => {
    console.log(`   ${item._id.category} (${item._id.difficulty}): ${item.count} questions`);
  });
  
  const total = await db.collection('questions').countDocuments();
  console.log(`\n✅ Total: ${total} questions\n`);
  
  await client.close();
})();
