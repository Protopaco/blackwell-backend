import { createCache } from '#utils/cache.js';
import { CACHE_TTL_MEDIUM_MS } from '#config/constants.js';
import PayrollReportHoursRow from '#models/PayrollReportHoursRow.js';

// Shared cache instance for readCurrentHoursTab, keyed by workbookId. Invalidated by generatePayrollReport after it renames pending_hours into current_hours.
const currentHoursCache = createCache<PayrollReportHoursRow[]>(CACHE_TTL_MEDIUM_MS);

export default currentHoursCache;
