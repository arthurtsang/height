const redis = require('redis');
const config = require('../config');
const logger = require('../utils/logger');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.memoryStore = new Map();
    this.isRedisEnabled = config.redis.enabled;
    this.useMemoryFallback = false;
  }

  async connect() {
    // If Redis is disabled, use memory fallback
    if (!this.isRedisEnabled) {
      logger.warn('Redis is disabled via configuration, using in-memory fallback');
      this.useMemoryFallback = true;
      return true;
    }

    try {
      this.client = redis.createClient({
        socket: {
          host: config.redis.host,
          port: config.redis.port
        },
        password: config.redis.password
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error', { error: err.message });
        this.isConnected = false;
        if (!this.useMemoryFallback) {
          logger.warn('Switching to in-memory fallback due to Redis error');
          this.useMemoryFallback = true;
        }
      });

      this.client.on('connect', () => {
        logger.info('Redis Client Connected');
        this.isConnected = true;
        this.useMemoryFallback = false;
      });

      await this.client.connect();
      return true;
    } catch (error) {
      logger.error('Failed to connect to Redis', { error: error.message });
      logger.warn('Using in-memory fallback storage');
      this.useMemoryFallback = true;
      return true; // Return true to allow app to continue
    }
  }

  async set(key, value, ttl = config.redis.ttl) {
    try {
      if (this.useMemoryFallback || !this.isConnected) {
        // In-memory storage with TTL
        const expiresAt = Date.now() + (ttl * 1000);
        this.memoryStore.set(key, { value, expiresAt });
        return true;
      }

      await this.client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Redis SET error, falling back to memory', { key, error: error.message });
      // Fallback to memory on error
      const expiresAt = Date.now() + (ttl * 1000);
      this.memoryStore.set(key, { value, expiresAt });
      return true;
    }
  }

  async get(key, touchTTL = true) {
    try {
      if (this.useMemoryFallback || !this.isConnected) {
        // Get from memory
        const item = this.memoryStore.get(key);
        if (!item) return null;
        
        // Check if expired
        if (Date.now() > item.expiresAt) {
          this.memoryStore.delete(key);
          return null;
        }
        
        // Refresh TTL on access (touch the session to keep it alive)
        if (touchTTL) {
          const newExpiresAt = Date.now() + (config.redis.ttl * 1000);
          this.memoryStore.set(key, { value: item.value, expiresAt: newExpiresAt });
        }
        
        return item.value;
      }

      const value = await this.client.get(key);
      if (!value) return null;
      
      // Refresh TTL on access for Redis too
      if (touchTTL) {
        await this.client.expire(key, config.redis.ttl);
      }
      
      return JSON.parse(value);
    } catch (error) {
      logger.error('Redis GET error, checking memory fallback', { key, error: error.message });
      // Try memory fallback
      const item = this.memoryStore.get(key);
      if (!item) return null;
      if (Date.now() > item.expiresAt) {
        this.memoryStore.delete(key);
        return null;
      }
      return item.value;
    }
  }

  async delete(key) {
    try {
      if (this.useMemoryFallback || !this.isConnected) {
        this.memoryStore.delete(key);
        return true;
      }

      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DELETE error, deleting from memory', { key, error: error.message });
      this.memoryStore.delete(key);
      return true;
    }
  }

  async exists(key) {
    try {
      if (this.useMemoryFallback || !this.isConnected) {
        const item = this.memoryStore.get(key);
        if (!item) return false;
        
        // Check if expired
        if (Date.now() > item.expiresAt) {
          this.memoryStore.delete(key);
          return false;
        }
        
        return true;
      }

      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error, checking memory', { key, error: error.message });
      const item = this.memoryStore.get(key);
      if (!item) return false;
      if (Date.now() > item.expiresAt) {
        this.memoryStore.delete(key);
        return false;
      }
      return true;
    }
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      usingMemoryFallback: this.useMemoryFallback,
      redisEnabled: this.isRedisEnabled
    };
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis Client Disconnected');
    }
    // Clear memory store on disconnect
    this.memoryStore.clear();
  }

  // Cleanup expired items from memory store periodically
  startMemoryCleanup() {
    setInterval(() => {
      if (this.useMemoryFallback) {
        const now = Date.now();
        for (const [key, item] of this.memoryStore.entries()) {
          if (now > item.expiresAt) {
            this.memoryStore.delete(key);
          }
        }
      }
    }, 60000); // Clean up every minute
  }
}

module.exports = new RedisService();

// Made with Bob
