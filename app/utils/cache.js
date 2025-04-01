const cache = new Map();

export function setCache(key, value, ttl = 60000) {
  const expiry = Date.now() + ttl;
  cache.set(key, { value, expiry });

  // Automatically delete the cache entry after TTL
  setTimeout(() => cache.delete(key), ttl);
}

export function getCache(key) {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expiry) {
    cache.delete(key);
    return null;
  }

  return cached.value;
}