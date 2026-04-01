import { connectToDatabase } from './mongodb';
import bcrypt from 'bcryptjs';
import { getDefaultRole } from './rbac';

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
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
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  return {
    id: result.insertedId.toString(),
    email,
    userName,
    role: defaultRole
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
    password: user.password,
    role: role,
    isVerified: user.isVerified
  };
}

export async function findUserById(id) {
  const { db } = await connectToDatabase();
  const usersCollection = db.collection('users');
  const { ObjectId } = require('mongodb');
  
  const user = await usersCollection.findOne({ _id: new ObjectId(id) });
  
  if (!user) {
    return null;
  }
  
  const role = user.role || getDefaultRole();
  
  return {
    id: user._id.toString(),
    email: user.email,
    userName: user.userName,
    role: role
  };
}
