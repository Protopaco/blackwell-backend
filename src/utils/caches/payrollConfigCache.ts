import { createCache } from '#utils/cache.js';
import { CACHE_TTL_MEDIUM_MS } from '#config/constants.js';
import PayrollConfig from '#models/PayrollConfig.js';

// Shared cache instance for readPayrollConfig, keyed by payrollConfigFileId. Invalidated by updateEmployeeTimesheetFile after a successful write.
const payrollConfigCache = createCache<PayrollConfig>(CACHE_TTL_MEDIUM_MS);

export default payrollConfigCache;
