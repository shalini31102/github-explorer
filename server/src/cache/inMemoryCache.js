/**
 * inMemoryCache.js
 *
 * A simple in-memory cache using a JavaScript Map.
 * Stores data with a timestamp and automatically
 * invalidates entries older than the TTL (time-to-live).
 *
 * Why a Map? Unlike a plain object, Map is optimized
 * for frequent additions and lookups — perfect for caching.
 */

const cache = new Map();

/**
 * TTL = Time To Live
 * How long a cached entry stays valid (in milliseconds)
 * 60 * 1000 = 60,000ms = 60 seconds
 */
const CACHE_TTL = 60 * 1000;

/**
 * Retrieves a value from cache by key.
 * Returns null if the key doesn't exist or has expired.
 *
 * @param {string} key - The cache key to look up
 * @returns {any|null} - The cached data or null
 */
function get(key) {
  // If key doesn't exist at all, return null immediately
  if (!cache.has(key)) return null;

  const { data, timestamp } = cache.get(key);

  // Check if the entry has expired
  const ageInMs = Date.now() - timestamp;
  const isExpired = ageInMs > CACHE_TTL;

  if (isExpired) {
    // Clean up the expired entry and return null
    cache.delete(key);
    return null;
  }

  return data;
}

/**
 * Stores a value in cache with the current timestamp.
 *
 * @param {string} key - The cache key
 * @param {any} data - The data to store
 */
function set(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

/**
 * Clears all entries from the cache.
 * Useful for testing.
 */
function clear() {
  cache.clear();
}

/**
 * Returns the number of entries currently in cache.
 * Useful for debugging.
 */
function size() {
  return cache.size;
}

module.exports = { get, set, clear, size };