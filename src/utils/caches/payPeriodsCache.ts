import { createCache } from '#utils/cache.js';
import { CACHE_TTL_MEDIUM_MS } from '#config/constants.js';
import PayPeriod from '#models/PayPeriod.js';

// Shared cache instance for readPayPeriods, keyed by payPeriodRegistryFileId. Invalidated by writePayPeriod after a successful write.
const payPeriodsCache = createCache<PayPeriod[]>(CACHE_TTL_MEDIUM_MS);

export default payPeriodsCache;
