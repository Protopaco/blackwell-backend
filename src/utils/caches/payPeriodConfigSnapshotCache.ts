import { createCache } from '#utils/cache.js';
import { CACHE_TTL_DAY_MS } from '#config/constants.js';
import PayPeriodConfigSnapshot from '#models/PayPeriodConfigSnapshot.js';

// Shared cache instance for readPayPeriodConfigSnapshot, keyed by the report workbook's file ID. TTL is
// long (a day) because the snapshot tabs are write-once at pay period creation — nothing currently writes
// to them afterward. Whichever ticket adds editing of the snapshot (027/028/029) must invalidate this
// cache on write, the same way updateSettings.ts invalidates payrollConfigCache.
const payPeriodConfigSnapshotCache = createCache<PayPeriodConfigSnapshot>(CACHE_TTL_DAY_MS);

export default payPeriodConfigSnapshotCache;
