import { connectToDatabase } from '../database/connection';
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
      return result;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
