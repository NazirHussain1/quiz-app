import { connectToDatabase } from '../mongodb';
import { sampleQuestions } from './sampleQuestions';

export async function seedQuestions() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('questions');
    
    const count = await collection.countDocuments();
    
    if (count === 0) {
      const questionsWithTimestamps = sampleQuestions.map(q => ({
        ...q,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      const result = await collection.insertMany(questionsWithTimestamps);
      console.log(`${result.insertedCount} questions inserted successfully`);
      return result;
    } else {
      console.log('Database already contains questions. Skipping seed.');
      return null;
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
