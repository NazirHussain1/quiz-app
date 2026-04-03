/**
 * Base Repository Class
 * Provides common database operations with error handling and logging
 */

import { ObjectId } from 'mongodb';
import { getDatabase } from './connection';
import { logDB, logError } from '../logger';

export class BaseRepository {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  /**
   * Get collection instance
   */
  async getCollection() {
    const db = await getDatabase();
    return db.collection(this.collectionName);
  }

  /**
   * Find one document
   */
  async findOne(filter, options = {}) {
    const startTime = Date.now();
    
    try {
      const collection = await this.getCollection();
      const result = await collection.findOne(filter, options);
      
      const duration = Date.now() - startTime;
      logDB('findOne', this.collectionName, true, duration, {
        filter: this.sanitizeFilter(filter),
        found: !!result,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logDB('findOne', this.collectionName, false, duration, {
        filter: this.sanitizeFilter(filter),
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Find multiple documents
   */
  async find(filter = {}, options = {}) {
    const startTime = Date.now();
    
    try {
      const collection = await this.getCollection();
      const cursor = collection.find(filter, options);
      
      // Apply limit if specified
      if (options.limit) {
        cursor.limit(options.limit);
      }
      
      // Apply sort if specified
      if (options.sort) {
        cursor.sort(options.sort);
      }
      
      // Apply skip if specified
      if (options.skip) {
        cursor.skip(options.skip);
      }
      
      const results = await cursor.toArray();
      
      const duration = Date.now() - startTime;
      logDB('find', this.collectionName, true, duration, {
        filter: this.sanitizeFilter(filter),
        count: results.length,
        limit: options.limit,
      });
      
      return results;
    } catch (error) {
      const duration = Date.now() - startTime;
      logDB('find', this.collectionName, false, duration, {
        filter: this.sanitizeFilter(filter),
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Find with pagination
   */
  async findPaginated(filter = {}, page = 1, limit = 20, sort = { createdAt: -1 }) {
    const startTime = Date.now();
    
    try {
      const collection = await this.getCollection();
      const skip = (page - 1) * limit;
      
      const [results, total] = await Promise.all([
        collection.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
        collection.countDocuments(filter),
      ]);
      
      const duration = Date.now() - startTime;
      logDB('findPaginated', this.collectionName, true, duration, {
        page,
        limit,
        total,
        returned: results.length,
      });
      
      return {
        data: results,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logDB('findPaginated', this.collectionName, false, duration, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Insert one document
   */
  async insertOne(document) {
    const startTime = Date.now();
    
    try {
      const collection = await this.getCollection();
      
      // Add timestamps
      const docWithTimestamps = {
        ...document,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const result = await collection.insertOne(docWithTimestamps);
      
      const duration = Date.now() - startTime;
      logDB('insertOne', this.collectionName, true, duration, {
        insertedId: result.insertedId.toString(),
      });
      
      return {
        ...docWithTimestamps,
        _id: result.insertedId,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logDB('insertOne', this.collectionName, false, duration, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Insert multiple documents
   */
  async insertMany(documents) {
    const startTime = Date.now();
    
    try {
      const collection = await this.getCollection();
      
      // Add timestamps to all documents
      const docsWithTimestamps = documents.map(doc => ({
        ...doc,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      
      const result = await collection.insertMany(docsWithTimestamps);
      
      const duration = Date.now() - startTime;
      logDB('insertMany', this.collectionName, true, duration, {
        count: result.insertedCount,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logDB('insertMany', this.collectionName, false, duration, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update one document
   */
  async updateOne(filter, update, options = {}) {
    const startTime = Date.now();
    
    try {
      const collection = await this.getCollection();
      
      // Add updatedAt timestamp
      const updateWithTimestamp = {
        ...update,
        $set: {
          ...(update.$set || {}),
          updatedAt: new Date(),
        },
      };
      
      const result = await collection.updateOne(filter, updateWithTimestamp, options);
      
      const duration = Date.now() - startTime;
      logDB('updateOne', this.collectionName, true, duration, {
        filter: this.sanitizeFilter(filter),
        matched: result.matchedCount,
        modified: result.modifiedCount,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logDB('updateOne', this.collectionName, false, duration, {
        filter: this.sanitizeFilter(filter),
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update multiple documents
   */
  async updateMany(filter, update, options = {}) {
    const startTime = Date.now();
    
    try {
      const collection = await this.getCollection();
      
      // Add updatedAt timestamp
      const updateWithTimestamp = {
        ...update,
        $set: {
          ...(update.$set || {}),
          updatedAt: new Date(),
        },
      };
      
      const result = await collection.updateMany(filter, updateWithTimestamp, options);
      
      const duration = Date.now() - startTime;
      logDB('updateMany', this.collectionName, true, duration, {
        filter: this.sanitizeFilter(filter),
        matched: result.matchedCount,
        modified: result.modifiedCount,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logDB('updateMany', this.collectionName, false, duration, {
        filter: this.sanitizeFilter(filter),
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete one document
   */
  async deleteOne(filter) {
    const startTime = Date.now();
    
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteOne(filter);
      
      const duration = Date.now() - startTime;
      logDB('deleteOne', this.collectionName, true, duration, {
        filter: this.sanitizeFilter(filter),
        deleted: result.deletedCount,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logDB('deleteOne', this.collectionName, false, duration, {
        filter: this.sanitizeFilter(filter),
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete multiple documents
   */
  async deleteMany(filter) {
    const startTime = Date.now();
    
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteMany(filter);
      
      const duration = Date.now() - startTime;
      logDB('deleteMany', this.collectionName, true, duration, {
        filter: this.sanitizeFilter(filter),
        deleted: result.deletedCount,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logDB('deleteMany', this.collectionName, false, duration, {
        filter: this.sanitizeFilter(filter),
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Count documents
   */
  async count(filter = {}) {
    const startTime = Date.now();
    
    try {
      const collection = await this.getCollection();
      const count = await collection.countDocuments(filter);
      
      const duration = Date.now() - startTime;
      logDB('count', this.collectionName, true, duration, {
        filter: this.sanitizeFilter(filter),
        count,
      });
      
      return count;
    } catch (error) {
      const duration = Date.now() - startTime;
      logDB('count', this.collectionName, false, duration, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Aggregate query
   */
  async aggregate(pipeline, options = {}) {
    const startTime = Date.now();
    
    try {
      const collection = await this.getCollection();
      const results = await collection.aggregate(pipeline, options).toArray();
      
      const duration = Date.now() - startTime;
      logDB('aggregate', this.collectionName, true, duration, {
        stages: pipeline.length,
        count: results.length,
      });
      
      return results;
    } catch (error) {
      const duration = Date.now() - startTime;
      logDB('aggregate', this.collectionName, false, duration, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Find by ID
   */
  async findById(id) {
    try {
      const objectId = typeof id === 'string' ? new ObjectId(id) : id;
      return await this.findOne({ _id: objectId });
    } catch (error) {
      logError(error, {
        operation: 'findById',
        collection: this.collectionName,
        id,
      });
      return null;
    }
  }

  /**
   * Update by ID
   */
  async updateById(id, update) {
    try {
      const objectId = typeof id === 'string' ? new ObjectId(id) : id;
      return await this.updateOne({ _id: objectId }, update);
    } catch (error) {
      logError(error, {
        operation: 'updateById',
        collection: this.collectionName,
        id,
      });
      throw error;
    }
  }

  /**
   * Delete by ID
   */
  async deleteById(id) {
    try {
      const objectId = typeof id === 'string' ? new ObjectId(id) : id;
      return await this.deleteOne({ _id: objectId });
    } catch (error) {
      logError(error, {
        operation: 'deleteById',
        collection: this.collectionName,
        id,
      });
      throw error;
    }
  }

  /**
   * Check if document exists
   */
  async exists(filter) {
    const count = await this.count(filter);
    return count > 0;
  }

  /**
   * Sanitize filter for logging (remove sensitive data)
   */
  sanitizeFilter(filter) {
    const sanitized = { ...filter };
    
    // Remove sensitive fields
    if (sanitized.password) sanitized.password = '[REDACTED]';
    if (sanitized.resetPasswordToken) sanitized.resetPasswordToken = '[REDACTED]';
    if (sanitized.verificationToken) sanitized.verificationToken = '[REDACTED]';
    
    return sanitized;
  }

  /**
   * Transaction support
   */
  async withTransaction(callback) {
    const db = await getDatabase();
    const session = db.client.startSession();
    
    try {
      await session.withTransaction(async () => {
        return await callback(session);
      });
    } finally {
      await session.endSession();
    }
  }
}

export default BaseRepository;
