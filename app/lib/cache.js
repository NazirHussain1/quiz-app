import Redis from 'ioredis';

// Redis client instance
let redisClient = null;
let isRedisAvailable = false;

// Cache TTL configurations (in seconds)
export const CACHE_TTL = {
  LEADERBOARD: 5 * 60, // 5 minutes
  QUESTIONS: 10 * 60, // 10 minutes
  ANALYTICS: 5 * 60, // 5 minutes
  ADMIN_ANALYTICS: 5 * 60, // 5 minutes
  SUBJECTS: 10 * 60, // 10 minutes
  CATEGORIES: 10 * 60, // 10 minutes
};

// Cache key prefixes
export const CACHE_KEYS = {
  LEADERBOARD: 'leaderboard',
  QUESTIONS: 'questions',
  ANALYTICS: 'analytics',
  ADMIN_ANALYTICS: 'admin_analytics',
  SUBJECTS: 'subjects',
  CATEGORIES: 'categories',
};

/**
 * Initialize Redis client
 */
function initRedis() {
  if (redisClient) return redisClient;

  try {
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI;
    
    if (!redisUrl) {
      console.warn('⚠️  Redis URL not configured. Caching disabled.');
      isRedisAvailable = false;
      return null;
    }

    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
      isRedisAvailable = true;
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
      isRedisAvailable = false;
    });

    redisClient.on('close', () => {
      console.warn('⚠️  Redis connection closed');
      isRedisAvailable = false;
    });

    return redisClient;
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error.message);
    isRedisAvailable = false;
    return null;
  }
}

/**
 * Get Redis client instance
 */
export function getRedisClient() {
  if (!redisClient) {
    return initRedis();
  }
  return redisClient;
}

/**
 * Check if Redis is available
 */
export function isRedisConnected() {
  return isRedisAvailable && redisClient && redisClient.status === 'ready';
}

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} - Cached data or null
 */
export async function getCache(key) {
  try {
    const client = getRedisClient();
    if (!client || !isRedisConnected()) {
      return null;
    }

    const data = await client.get(key);
    if (!data) return null;

    return JSON.parse(data);
  } catch (error) {
    console.error(`Cache GET error for key "${key}":`, error.message);
    return null;
  }
}

/**
 * Set data in cache
 * @param {string} key - Cache key
 * @param {any} value - Data to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} - Success status
 */
export async function setCache(key, value, ttl = 300) {
  try {
    const client = getRedisClient();
    if (!client || !isRedisConnected()) {
      return false;
    }

    const serialized = JSON.stringify(value);
    await client.setex(key, ttl, serialized);
    return true;
  } catch (error) {
    console.error(`Cache SET error for key "${key}":`, error.message);
    return false;
  }
}

/**
 * Delete data from cache
 * @param {string} key - Cache key or pattern
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteCache(key) {
  try {
    const client = getRedisClient();
    if (!client || !isRedisConnected()) {
      return false;
    }

    await client.del(key);
    return true;
  } catch (error) {
    console.error(`Cache DELETE error for key "${key}":`, error.message);
    return false;
  }
}

/**
 * Delete multiple keys matching a pattern
 * @param {string} pattern - Key pattern (e.g., "leaderboard:*")
 * @returns {Promise<number>} - Number of keys deleted
 */
export async function deleteCachePattern(pattern) {
  try {
    const client = getRedisClient();
    if (!client || !isRedisConnected()) {
      return 0;
    }

    const keys = await client.keys(pattern);
    if (keys.length === 0) return 0;

    const deleted = await client.del(...keys);
    return deleted;
  } catch (error) {
    console.error(`Cache DELETE PATTERN error for pattern "${pattern}":`, error.message);
    return 0;
  }
}

/**
 * Invalidate cache for a specific prefix
 * @param {string} prefix - Cache key prefix
 * @returns {Promise<number>} - Number of keys deleted
 */
export async function invalidateCache(prefix) {
  return await deleteCachePattern(`${prefix}:*`);
}

/**
 * Get or set cache (cache-aside pattern)
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function to fetch data if not cached
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<any>} - Cached or fresh data
 */
export async function getCacheOrFetch(key, fetchFn, ttl = 300) {
  try {
    // Try to get from cache first
    const cached = await getCache(key);
    if (cached !== null) {
      console.log(`✅ Cache HIT: ${key}`);
      return cached;
    }

    console.log(`⚠️  Cache MISS: ${key}`);
    
    // Fetch fresh data
    const freshData = await fetchFn();
    
    // Store in cache (don't await to avoid blocking)
    setCache(key, freshData, ttl).catch(err => {
      console.error(`Failed to cache data for key "${key}":`, err.message);
    });

    return freshData;
  } catch (error) {
    console.error(`getCacheOrFetch error for key "${key}":`, error.message);
    // Fallback: fetch fresh data
    return await fetchFn();
  }
}

/**
 * Build cache key from parameters
 * @param {string} prefix - Key prefix
 * @param {Object} params - Parameters to include in key
 * @returns {string} - Cache key
 */
export function buildCacheKey(prefix, params = {}) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join(':');
  
  return sortedParams ? `${prefix}:${sortedParams}` : prefix;
}

/**
 * Warm up cache with initial data
 * @param {string} key - Cache key
 * @param {any} data - Initial data
 * @param {number} ttl - Time to live in seconds
 */
export async function warmCache(key, data, ttl = 300) {
  try {
    await setCache(key, data, ttl);
    console.log(`🔥 Cache warmed: ${key}`);
  } catch (error) {
    console.error(`Failed to warm cache for key "${key}":`, error.message);
  }
}

/**
 * Get cache statistics
 * @returns {Promise<Object>} - Cache stats
 */
export async function getCacheStats() {
  try {
    const client = getRedisClient();
    if (!client || !isRedisConnected()) {
      return {
        connected: false,
        keys: 0,
        memory: 0,
      };
    }

    const info = await client.info('stats');
    const dbSize = await client.dbsize();
    
    return {
      connected: true,
      keys: dbSize,
      info: info,
    };
  } catch (error) {
    console.error('Failed to get cache stats:', error.message);
    return {
      connected: false,
      keys: 0,
      error: error.message,
    };
  }
}

/**
 * Flush all cache
 * @returns {Promise<boolean>} - Success status
 */
export async function flushCache() {
  try {
    const client = getRedisClient();
    if (!client || !isRedisConnected()) {
      return false;
    }

    await client.flushdb();
    console.log('🗑️  Cache flushed');
    return true;
  } catch (error) {
    console.error('Failed to flush cache:', error.message);
    return false;
  }
}

// Initialize Redis on module load
initRedis();
