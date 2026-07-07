interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface Cache<T> {
  get: (key: string) => T | null;
  set: (key: string, value: T) => void;
  delete: (key: string) => void;
  clear: () => void;
}

// Creates an in-memory TTL cache keyed by string — used by readClients and readPayrollConfig to avoid repeated API calls.
const createCache = <T>(ttlMs: number): Cache<T> => {
  const store = new Map<string, CacheEntry<T>>();

  return {
    get: (key: string): T | null => {
      const entry = store.get(key);
      if (!entry) return null;
      if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
      }
      return entry.value;
    },

    set: (key: string, value: T): void => {
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
    },

    delete: (key: string): void => {
      store.delete(key);
    },

    clear: (): void => {
      store.clear();
    },
  };
};

export { createCache };
export type { Cache };
