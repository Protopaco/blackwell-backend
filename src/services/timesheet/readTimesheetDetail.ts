import readTimesheetDetailFromSheets from './readTimesheetDetailFromSheets.js';
import getFileModifiedTime from '#db/adapter/getFileModifiedTime.js';
import timesheetDetailCache from '#utils/caches/timesheetDetailCache.js';
import TimesheetDetail from '#models/TimesheetDetail.js';
import { logger } from '#utils/logger.js';

// Reads in flight for a given cache key, so concurrent callers for the same tab share one Sheets read
// instead of each firing their own.
const pendingReadsByCacheKey = new Map<string, Promise<TimesheetDetail>>();

// A workbook has one tab per pay period, so the cache key must include both.
const cacheKeyFor = (timesheetFileId: string, tabName: string): string => `${timesheetFileId}:${tabName}`;

// Returns timesheet detail for one employee's pay-period tab. Checks the workbook's Drive modifiedTime
// first — if it matches what was stored on the last read, returns the cached detail instead of doing a
// full Sheets read. Concurrent calls for the same tab are coalesced onto a single in-flight read.
const readTimesheetDetail = async (
  timesheetFileId: string,
  tabName: string,
): Promise<TimesheetDetail> => {
  if (!timesheetFileId) return readTimesheetDetailFromSheets(timesheetFileId, tabName);

  const cacheKey = cacheKeyFor(timesheetFileId, tabName);

  const pendingRead = pendingReadsByCacheKey.get(cacheKey);
  if (pendingRead) return pendingRead;

  const read = (async (): Promise<TimesheetDetail> => {
    try {
      const cached = timesheetDetailCache.get(cacheKey);
      const modifiedTime = await getFileModifiedTime(timesheetFileId);

      if (cached && modifiedTime && cached.modifiedTime === modifiedTime) {
        logger.debug(`readTimesheetDetail cache hit: ${cacheKey}`);
        return cached.detail;
      }

      const detail = await readTimesheetDetailFromSheets(timesheetFileId, tabName);
      if (modifiedTime) {
        timesheetDetailCache.set(cacheKey, { modifiedTime, detail });
      }
      return detail;
    } finally {
      pendingReadsByCacheKey.delete(cacheKey);
    }
  })();

  pendingReadsByCacheKey.set(cacheKey, read);
  return read;
};

export default readTimesheetDetail;
