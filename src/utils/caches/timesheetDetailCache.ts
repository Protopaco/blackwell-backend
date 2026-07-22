import { createCache } from '#utils/cache.js';
import { CACHE_TTL_DAY_MS } from '#config/constants.js';
import TimesheetDetail from '#models/TimesheetDetail.js';

interface CachedTimesheetDetail {
  modifiedTime: string;
  detail: TimesheetDetail;
}

// Shared cache instance for readTimesheetDetail, keyed by `${timesheetFileId}:${tabName}`. Staleness is
// primarily decided by comparing the stored modifiedTime against a fresh Drive lookup, not by this TTL —
// the TTL here is just a safety-net ceiling so entries for timesheets that stop being read eventually fall out.
const timesheetDetailCache = createCache<CachedTimesheetDetail>(CACHE_TTL_DAY_MS);

export default timesheetDetailCache;
export type { CachedTimesheetDetail };
