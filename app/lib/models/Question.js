import { connectToDatabase } from '../database/connection';

const COLLECTION_NAME = 'questions';

export const VALID_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science'
];

export function validateSubject(subject) {
  if (!subject) {
    return { valid: false, error: 'Subject is required' };
  }
  
  if (!VALID_SUBJECTS.includes(subject)) {
    return { 
      valid: false, 
      error: `Invalid subject. Must be one of: ${VALID_SUBJECTS.join(', ')}` 
    };
  }
  
  return { valid: true };
}

export async function getQuestions(filters = {}) {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  const query = {};
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  if (filters.subject) {
    query.subject = filters.subject;
  }
  
  if (filters.difficulty) {
    query.difficulty = filters.difficulty;
  }
  
  const questions = await collection.find(query).toArray();
  return questions;
}

export async function getRandomQuestions(filters = {}, limit = 10) {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  const query = {};
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  if (filters.subject) {
    query.subject = filters.subject;
  }
  
  if (filters.difficulty) {
    query.difficulty = filters.difficulty;
  }
  
  const questions = await collection
    .aggregate([
      { $match: query },
      { $sample: { size: limit } }
    ])
    .toArray();
  
  return questions;
}

export async function getQuestionById(id) {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);
  const { ObjectId } = require('mongodb');
  
  const question = await collection.findOne({ _id: new ObjectId(id) });
  return question;
}

export async function createQuestion(questionData) {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  const result = await collection.insertOne({
    category: questionData.category,
    subject: questionData.subject,
    topic: questionData.topic,
    difficulty: questionData.difficulty,
    question: questionData.question,
    options: questionData.options,
    correctAnswer: questionData.correctAnswer,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  return result;
}

export async function updateQuestion(id, questionData) {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);
  const { ObjectId } = require('mongodb');
  
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { 
      $set: {
        ...questionData,
        updatedAt: new Date()
      }
    }
  );
  
  return result;
}

export async function deleteQuestion(id) {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);
  const { ObjectId } = require('mongodb');
  
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result;
}

export async function getCategories() {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  const categories = await collection.distinct('category');
  return categories;
}

export async function getSubjects(category = null) {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  const query = category ? { category } : {};
  const subjects = await collection.distinct('subject', query);
  return subjects;
}

export async function getDifficulties() {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  const difficulties = await collection.distinct('difficulty');
  return difficulties;
}
