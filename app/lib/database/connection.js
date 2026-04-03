/**
 * Enhanced MongoDB Connection Manager
 * Production-ready with retry logic, health checks, and monitoring
 */

import { MongoClient, ServerApiVersion } from 'mongodb';
import { logDB, logError, logWarning } from '../logger';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'quizapp';

// Connection pool configuration
const options = {
  maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 10,
  minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE) || 5,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4, // Use IPv4
  retryWrites: true,
  retryReads: true,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

class DatabaseConnection {
  constructor() {
    this.client = null;
    this.clientPromise = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Get or create MongoDB client with retry logic
   */
  async getClient() {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // Return existing connection if available
    if (this.clientPromise && this.isConnected) {
      return this.clientPromise;
    }

    // Create new connection with retry logic
    return this.connectWithRetry();
  }

  /**
   * Connect to MongoDB with exponential backoff retry
   */
  async connectWithRetry() {
    const startTime = Date.now();

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logDB('connect', 'mongodb', true, 0, {
          attempt,
          maxRetries: this.maxRetries,
        });

        this.client = new MongoClient(MONGODB_URI, options);
        this.clientPromise = this.client.connect();
        
        await this.clientPromise;
        
        // Verify connection
        await this.client.db(DB_NAME).admin().ping();
        
        this.isConnected = true;
        this.connectionAttempts = 0;

        const duration = Date.now() - startTime;
        logDB('connect', 'mongodb', true, duration, {
          poolSize: options.maxPoolSize,
          database: DB_NAME,
        });

        // Set up connection event listeners
        this.setupEventListeners();

        return this.clientPromise;
      } catch (error) {
        this.connectionAttempts++;
        const duration = Date.now() - startTime;

        logError(error, {
          operation: 'mongodb_connect',
          attempt,
          maxRetries: this.maxRetries,
          duration,
        });

        if (attempt === this.maxRetries) {
          throw new Error(`Failed to connect to MongoDB after ${this.maxRetries} attempts: ${error.message}`);
        }

        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        logWarning(`Retrying MongoDB connection in ${delay}ms...`, { attempt });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Set up connection event listeners for monitoring
   */
  setupEventListeners() {
    if (!this.client) return;

    this.client.on('connectionPoolCreated', () => {
      logDB('pool_created', 'mongodb', true, 0, {
        maxPoolSize: options.maxPoolSize,
        minPoolSize: options.minPoolSize,
      });
    });

    this.client.on('connectionPoolClosed', () => {
      this.isConnected = false;
      logWarning('MongoDB connection pool closed');
    });

    this.client.on('error', (error) => {
      this.isConnected = false;
      logError(error, { event: 'mongodb_error' });
    });

    this.client.on('timeout', () => {
      logWarning('MongoDB connection timeout');
    });
  }

  /**
   * Get database instance
   */
  async getDatabase() {
    const client = await this.getClient();
    return client.db(DB_NAME);
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const db = await this.getDatabase();
      await db.admin().ping();
      return {
        status: 'healthy',
        connected: this.isConnected,
        database: DB_NAME,
        poolSize: options.maxPoolSize,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message,
      };
    }
  }

  /**
   * Graceful shutdown
   */
  async close() {
    if (this.client) {
      try {
        await this.client.close();
        this.isConnected = false;
        this.clientPromise = null;
        logDB('disconnect', 'mongodb', true, 0);
      } catch (error) {
        logError(error, { operation: 'mongodb_close' });
      }
    }
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      isConnected: this.isConnected,
      connectionAttempts: this.connectionAttempts,
      poolSize: options.maxPoolSize,
      database: DB_NAME,
    };
  }
}

// Singleton instance
const dbConnection = new DatabaseConnection();

// Development: Use global to prevent multiple instances during hot reload
if (process.env.NODE_ENV === 'development') {
  if (!global._dbConnection) {
    global._dbConnection = dbConnection;
  }
}

/**
 * Get database connection
 * @returns {Promise<{client: MongoClient, db: Db}>}
 */
export async function connectToDatabase() {
  const connection = process.env.NODE_ENV === 'development' 
    ? global._dbConnection 
    : dbConnection;

  const client = await connection.getClient();
  const db = await connection.getDatabase();

  return { client, db };
}

/**
 * Get database instance directly
 */
export async function getDatabase() {
  const connection = process.env.NODE_ENV === 'development' 
    ? global._dbConnection 
    : dbConnection;

  return connection.getDatabase();
}

/**
 * Health check endpoint
 */
export async function checkDatabaseHealth() {
  const connection = process.env.NODE_ENV === 'development' 
    ? global._dbConnection 
    : dbConnection;

  return connection.healthCheck();
}

/**
 * Graceful shutdown
 */
export async function closeDatabaseConnection() {
  const connection = process.env.NODE_ENV === 'development' 
    ? global._dbConnection 
    : dbConnection;

  await connection.close();
}

/**
 * Get connection statistics
 */
export function getDatabaseStats() {
  const connection = process.env.NODE_ENV === 'development' 
    ? global._dbConnection 
    : dbConnection;

  return connection.getStats();
}

// Handle process termination
if (process.env.NODE_ENV === 'production') {
  process.on('SIGINT', async () => {
    await closeDatabaseConnection();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await closeDatabaseConnection();
    process.exit(0);
  });
}

export default dbConnection;
