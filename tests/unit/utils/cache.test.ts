import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createCache } from '#utils/cache.js';

describe('createCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null for a key that was never set', () => {
    const cache = createCache<string>(1000);
    expect(cache.get('missing')).toBeNull();
  });

  it('returns the value immediately after set', () => {
    const cache = createCache<string>(1000);
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });

  it('still returns the value at the exact TTL boundary', () => {
    const cache = createCache<string>(1000);
    cache.set('key', 'value');
    vi.setSystemTime(1000);
    expect(cache.get('key')).toBe('value');
  });

  it('returns null once past the TTL boundary', () => {
    const cache = createCache<string>(1000);
    cache.set('key', 'value');
    vi.setSystemTime(1001);
    expect(cache.get('key')).toBeNull();
  });

  it('overwriting a key updates the value and resets the TTL', () => {
    const cache = createCache<string>(1000);
    cache.set('key', 'first');
    vi.setSystemTime(900);
    cache.set('key', 'second');
    vi.setSystemTime(1800); // 900ms after the second set — expired relative to the first, not the second
    expect(cache.get('key')).toBe('second');
  });

  it('keeps keys independent of each other', () => {
    const cache = createCache<string>(1000);
    cache.set('a', 'valueA');
    cache.set('b', 'valueB');
    expect(cache.get('a')).toBe('valueA');
    expect(cache.get('b')).toBe('valueB');
  });

  it('delete removes only the given key', () => {
    const cache = createCache<string>(1000);
    cache.set('a', 'valueA');
    cache.set('b', 'valueB');
    cache.delete('a');
    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBe('valueB');
  });

  it('clear removes every key', () => {
    const cache = createCache<string>(1000);
    cache.set('a', 'valueA');
    cache.set('b', 'valueB');
    cache.clear();
    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBeNull();
  });

  it('separate cache instances do not share state', () => {
    const cacheOne = createCache<string>(1000);
    const cacheTwo = createCache<string>(1000);
    cacheOne.set('key', 'fromCacheOne');
    expect(cacheTwo.get('key')).toBeNull();
  });
});
