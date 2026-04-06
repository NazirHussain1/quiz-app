import { connectToDatabase } from './database/connection';
import bcrypt from 'bcryptjs';
import { getDefaultRole } from './rbac';
import { ObjectId } from 'mongodb';

const SALT_ROUNDS = 12; // Increased from 10 for better security

export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export async function createUser(email, password, userName) {
  const { db } = await connectToDatabase();
  const usersCollection = db.collection('users');
  
  const existingUser = await usersCollection.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  const hashedPassword = await hashPassword(password);
  const defaultRole = getDefaultRole();
  
  const result = await usersCollection.insertOne({
    email,
    password: hashedPassword,
    userName,
    role: defaultRole,
    isVerified: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  return {
    id: result.insertedId.toString(),
    email,
    userName,
    role: defaultRole,
    isVerified: false
  };
}

export async function findUserByEmail(email) {
  const { db } = await connectToDatabase();
  const usersCollection = db.collection('users');
  
  const user = await usersCollection.findOne({ email });
  
  if (!user) {
    return null;
  }
  
  const role = user.role || getDefaultRole();
  
  return {
    id: user._id.toString(),
    email: user.email,
    userName: user.userName,
    password: user.password, // Only used for authentication
    role: role,
    isVerified: user.isVerified || false
  };
}

export async function findUserById(id) {
  const { db } = await connectToDatabase();
  const usersCollection = db.collection('users');
  
  let objectId;
  try {
    objectId = new ObjectId(id);
  } catch (error) {
    return null;
  }
  
  const user = await usersCollection.findOne(
    { _id: objectId },
    { 
      projection: { 
        password: 0, // Never expose password
        verificationToken: 0,
        verificationTokenExpiry: 0,
        resetPasswordToken: 0,
        resetPasswordExpiry: 0
      } 
    }
  );
  
  if (!user) {
    return null;
  }
  
  const role = user.role || getDefaultRole();
  
  return {
    id: user._id.toString(),
    email: user.email,
    userName: user.userName,
    role: role,
    isVerified: user.isVerified || false
  };
}
