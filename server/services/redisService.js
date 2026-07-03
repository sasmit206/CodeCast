import { createClient } from 'redis';

let REDIS_URL = (process.env.REDIS_URL || '').trim();
const useTls = REDIS_URL.includes('--tls');
const redisMatch = REDIS_URL.match(/(rediss?:\/\/[^\s]+)/);
if (redisMatch) {
  REDIS_URL = redisMatch[1];
  // If the pasted command requested TLS, force rediss:// protocol
  if (useTls && REDIS_URL.startsWith('redis://')) {
    REDIS_URL = REDIS_URL.replace('redis://', 'rediss://');
  }
}
if (!REDIS_URL || REDIS_URL === 'undefined' || REDIS_URL === 'null') {
  REDIS_URL = 'redis://localhost:6379';
}
let client = null;
let isRedisAvailable = false;

const memoryCache = new Map();
const memoryCacheExpirations = new Map();

let isConnecting = false;

/**
 * Initialize and connect the Redis client.
 */
async function initRedis() {
  console.log(`[Redis Connection] Attempting to connect to ${REDIS_URL}...`);
  client = createClient({
    url: REDIS_URL,
    socket: {
      connectTimeout: 5000,
      reconnectStrategy: (retries) => {
        // Under serverless environments, do not reconnect/retry to avoid hanging function context
        if (process.env.VERCEL || retries > 3) {
          isRedisAvailable = false;
          return new Error('Max connection retries exceeded');
        }
        return Math.min(retries * 500, 2000);
      }
    }
  });

  client.on('error', (err) => {
    console.warn(`[Redis Client Warning] ${err.message}`);
    isRedisAvailable = false;
  });

  client.on('connect', () => {
    console.log('[Redis Client] Connected successfully.');
  });

  client.on('ready', () => {
    console.log('[Redis Client] Ready to handle requests.');
    isRedisAvailable = true;
  });

  client.on('end', () => {
    console.log('[Redis Client] Connection closed.');
    isRedisAvailable = false;
  });

  try {
    await client.connect();
  } catch (err) {
    console.warn(`[Redis Connection Error] Failed to connect to Redis. Caching will use Local Memory fallback.`);
    isRedisAvailable = false;
  }
}

/**
 * Ensures the client is connected before running commands.
 * Runs lazily on the first request to prevent blocking the startup thread.
 */
async function ensureConnected() {
  if (!client && !isConnecting) {
    isConnecting = true;
    try {
      await initRedis();
    } catch (err) {
      console.warn(`[Redis Lazy Init Error] ${err.message}`);
    } finally {
      isConnecting = false;
    }
  }
}

/**
 * GET key from cache.
 * Falls back to local memory cache if Redis is down.
 *
 * @param {string} key - Cache lookup key.
 * @returns {Promise<any|null>} Parsed JSON value, or null if key does not exist or expired.
 */
export async function getCached(key) {
  await ensureConnected();

  if (isRedisAvailable && client) {
    try {
      const data = await client.get(key);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (err) {
      console.error(`[Redis Get Error] ${err.message}. Swapping to memory fallback.`);
    }
  }

  // Local Memory Cache Fallback
  const expiration = memoryCacheExpirations.get(key);
  if (expiration && Date.now() > expiration) {
    
    memoryCache.delete(key);
    memoryCacheExpirations.delete(key);
    return null;
  }

  const memoryValue = memoryCache.get(key);
  return memoryValue ? JSON.parse(memoryValue) : null;
}

/**
 * SET key in cache with TTL.
 * Falls back to local memory cache if Redis is down.
 *
 * @param {string} key - Cache storage key.
 * @param {any} value - Object or value to cache.
 * @param {number} ttlSeconds - Expiration time in seconds.
 */
export async function setCached(key, value, ttlSeconds = 86400) {
  await ensureConnected();
  const serialized = JSON.stringify(value);

  if (isRedisAvailable && client) {
    try {
      await client.set(key, serialized, {
        EX: ttlSeconds
      });
      return;
    } catch (err) {
      console.error(`[Redis Set Error] ${err.message}. Swapping to memory fallback.`);
    }
  }

  // Local Memory Cache Fallback
  memoryCache.set(key, serialized);
  memoryCacheExpirations.set(key, Date.now() + (ttlSeconds * 1000));
}

/**
 * DELETE key from cache.
 */
export async function deleteCached(key) {
  await ensureConnected();

  if (isRedisAvailable && client) {
    try {
      await client.del(key);
      return;
    } catch (err) {
      console.error(`[Redis Delete Error] ${err.message}`);
    }
  }

  memoryCache.delete(key);
  memoryCacheExpirations.delete(key);
}
