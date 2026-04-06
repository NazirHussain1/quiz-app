/**
 * Shared Database Utilities
 * Reusable database operations across services
 */

import { connectToDatabase } from '@/app/lib/database/connection';
import { validateObjectId } from '@/app/lib/validation';
import { ObjectId } from 'mongodb';
import { AppError } from '@/app/lib/errorHandler';

/**
 * Get collection with connection
 */
export async function getCollection(collectionName) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}

/**
 * Validate and convert ObjectId
 */
export function validateAndConvertId(id) {
  const idValidation = validateObjectId(id);
  if (!idValidation.valid) {
    throw new AppError(idValidation.error, 400);
  }
  return new ObjectId(idValidation.value);
}

/**
 * Find document by ID
 */
export async function findById(collectionName, id) {
  const collection = await getCollection(collectionName);
  const objectId = validateAndConvertId(id);
  
  const document = await collection.findOne({ _id: objectId });
  
  if (!document) {
    throw new AppError(`${collectionName.slice(0, -1)} not found`, 404);
  }
  
  return document;
}

/**
 * Update document by ID
 */
export async function updateById(collectionName, id, updates) {
  const collection = await getCollection(collectionName);
  const objectId = validateAndConvertId(id);
  
  const result = await collection.updateOne(
    { _id: objectId },
    { $set: { ...updates, updatedAt: new Date() } }
  );
  
  if (result.matchedCount === 0) {
    throw new AppError(`${collectionName.slice(0, -1)} not found`, 404);
  }
  
  return result;
}

/**
 * Delete document by ID
 */
export async function deleteById(collectionName, id) {
  const collection = await getCollection(collectionName);
  const objectId = validateAndConvertId(id);
  
  const result = await collection.deleteOne({ _id: objectId });
  
  if (result.deletedCount === 0) {
    throw new AppError(`${collectionName.slice(0, -1)} not found`, 404);
  }
  
  return result;
}

/**
 * Build MongoDB filter from query params
 */
export function buildFilter(params) {
  const filter = {};
  
  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== 'all') {
      filter[key] = value;
    }
  });
  
  return filter;
}

/**
 * Paginate query results
 */
export async function paginateQuery(collection, filter, options = {}) {
  const {
    page = 1,
    limit = 20,
    sort = { createdAt: -1 },
    projection = {}
  } = options;
  
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit)));
  const safePage = Math.max(1, parseInt(page));
  const skip = (safePage - 1) * safeLimit;
  
  const totalCount = await collection.countDocuments(filter);
  const totalPages = Math.ceil(totalCount / safeLimit);
  
  const documents = await collection
    .find(filter, projection ? { projection } : {})
    .sort(sort)
    .skip(skip)
    .limit(safeLimit)
    .toArray();
  
  return {
    documents,
    totalCount,
    totalPages,
    currentPage: safePage,
    count: documents.length
  };
}
