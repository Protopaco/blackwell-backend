import getClientAndPayPeriod from '#services/payPeriod/getClientAndPayPeriod.js';
import assertPayPeriodNotLocked from '#services/payPeriod/assertPayPeriodNotLocked.js';
import readHolidays from '#db/holiday/readHolidays.js';
import writeHolidaysBulk from '#db/holiday/writeHolidaysBulk.js';
import payPeriodConfigSnapshotCache from '#utils/caches/payPeriodConfigSnapshotCache.js';
import Guid from '#models/Guid.js';
import { logger } from '#utils/logger.js';

// Recomputes a pay period's snapshot Holidays tab from the client's current PayrollConfig, keeping only
// holidays whose holidayDate falls within this pay period's [startDate, endDate]. A holiday's date/name
// is a client-wide fact, not something a pay period customizes — this fully replaces the snapshot's
// Holidays list rather than merging, so a holiday deleted or moved out of range in PayrollConfig drops
// off the snapshot on the next sync. Locked once the first timesheet has been generated for this pay
// period (status !== Pending), same cutoff as Activity/FundingSource presence.
const syncHolidaysOnPayPeriod = async (
  clientId: Guid,
  payPeriodId: Guid,
): Promise<void> => {
  logger.info(`syncHolidaysOnPayPeriod clientId=${clientId} payPeriodId=${payPeriodId}`);

  const { client, payPeriod } = await getClientAndPayPeriod(clientId, payPeriodId);

  assertPayPeriodNotLocked(payPeriod, 'sync holidays on this pay period');

  const payrollConfigHolidays = await readHolidays(client.payrollConfigFileId);
  const validHolidays = payrollConfigHolidays.filter(
    (holiday) => holiday.holidayDate >= payPeriod.startDate && holiday.holidayDate <= payPeriod.endDate,
  );

  await writeHolidaysBulk(payPeriod.payrollReportFileId, validHolidays);

  payPeriodConfigSnapshotCache.delete(payPeriod.payrollReportFileId);
};

export default syncHolidaysOnPayPeriod;
