import { MongoClient } from 'mongodb';

const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
};

let client;
let clientPromise;

function getMongoClient() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production') {
      throw new Error('Please add your MongoDB URI to environment variables');
    }
    console.warn('MongoDB URI not found - database operations will fail at runtime');
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      client = new MongoClient(uri, options);
      clientPromise = client.connect();
    }
    return clientPromise;
  }
}

export async function connectToDatabase() {
  const clientPromise = getMongoClient();
  
  if (!clientPromise) {
    throw new Error('MongoDB connection not configured. Please add MONGODB_URI to environment variables.');
  }
  
  const client = await clientPromise;
  const db = client.db();
  return { client, db };
}

export default function getClientPromise() {
  return getMongoClient();
}
