const cache = new Map();

const get = (key) => {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.value;
};

const set = (key, value, ttlMs) => {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
};

const del = (keyPrefix) => {
  for (const key of cache.keys()) {
    if (key.startsWith(keyPrefix)) {
      cache.delete(key);
    }
  }
};

const clear = () => {
  cache.clear();
};

module.exports = {
  get,
  set,
  del,
  clear,
};
