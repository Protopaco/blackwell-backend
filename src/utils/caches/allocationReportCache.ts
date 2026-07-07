import { createCache } from '#utils/cache.js';
import { CACHE_TTL_MEDIUM_MS } from '#config/constants.js';
import AllocationReportRow from '#models/AllocationReportRow.js';

// Shared cache instance for readAllocationReportTab, keyed by workbookId. Invalidated by writeAllocationReportTab after a successful write.
const allocationReportCache = createCache<AllocationReportRow[]>(CACHE_TTL_MEDIUM_MS);

export default allocationReportCache;
