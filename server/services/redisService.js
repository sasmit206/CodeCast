import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
let client = null;
let isRedisAvailable = false;

const memoryCache = new Map();
const memoryCacheExpirations = new Map();

async function initRedis() {
  console.log(`[Redis Connection] Attempting to connect to ${REDIS_URL}...`);
  client = createClient({
    url: REDIS_URL,
    socket: {
      connectTimeout: 5000,
      reconnectStrategy: (retries) => {
        
        if (retries > 5) {
          console.log('[Redis Connection] Max retries reached. Caching falling back to Local Memory.');
          isRedisAvailable = false;
          return new Error('Max retries reached');
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

initRedis();

export async function getCached(key) {
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

  const expiration = memoryCacheExpirations.get(key);
  if (expiration && Date.now() > expiration) {
    
    memoryCache.delete(key);
    memoryCacheExpirations.delete(key);
    return null;
  }

  const memoryValue = memoryCache.get(key);
  return memoryValue ? JSON.parse(memoryValue) : null;
}

export async function setCached(key, value, ttlSeconds = 86400) {
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

  memoryCache.set(key, serialized);
  memoryCacheExpirations.set(key, Date.now() + (ttlSeconds * 1000));
}

export async function deleteCached(key) {
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
