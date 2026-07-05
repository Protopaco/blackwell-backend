import { createCache } from '#utils/cache.js';
import PayrollReportHoursRow from '#models/PayrollReportHoursRow.js';

// Shared cache instance for readCurrentHoursTab, keyed by workbookId. Invalidated by generatePayrollReport after it renames pending_hours into current_hours.
const currentHoursCache = createCache<PayrollReportHoursRow[]>(5 * 60 * 1000);

export default currentHoursCache;
