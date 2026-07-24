import readTabs from '#db/adapter/readTabs.js';
import PayPeriodConfigSnapshot from '#models/PayPeriodConfigSnapshot.js';
import mapEmployee from '#db/employee/mapEmployee.js';
import mapActivity from '#db/activity/mapActivity.js';
import mapFundingSource from '#db/fundingSource/mapFundingSource.js';
import mapHoliday from '#db/holiday/mapHoliday.js';
import mapSettings from '#db/settings/mapSettings.js';
import {
  EMPLOYEES_TAB,
  ACTIVITIES_TAB,
  FUNDING_SOURCES_TAB,
  HOLIDAYS_TAB,
  SETTINGS_TAB,
} from '#config/constants.js';
import { logger } from '#utils/logger.js';
import payPeriodConfigSnapshotCache from '#utils/caches/payPeriodConfigSnapshotCache.js';

const TAB_NAMES = {
  employees: EMPLOYEES_TAB,
  fundingSources: FUNDING_SOURCES_TAB,
  activities: ACTIVITIES_TAB,
  settings: SETTINGS_TAB,
  holidays: HOLIDAYS_TAB,
};

// Loads a pay period's config snapshot tabs (employees, activities, fundingSources, holidays, settings) in
// one batched call and caches the result for 24 hours. Used by generateTimesheets, generatePayrollReport,
// and getTimesheetStatuses instead of reading client-wide PayrollConfig live.
const readPayPeriodConfigSnapshot = async (
  reportFileId: string,
): Promise<PayPeriodConfigSnapshot> => {
  logger.debug(`Loading pay period config snapshot from workbook: ${reportFileId}`);

  const cached = payPeriodConfigSnapshotCache.get(reportFileId);
  if (cached) return cached;

  const [employeeRows, fundingSourceRows, activityRows, settingsRows, holidayRows] = await readTabs(
    reportFileId,
    Object.values(TAB_NAMES),
  );

  const settings = settingsRows.length > 0 ? mapSettings(settingsRows[0]) : null;
  if (!settings) throw new Error('Settings not found in pay period config snapshot');

  const snapshot: PayPeriodConfigSnapshot = {
    employees: employeeRows.map(mapEmployee),
    activities: activityRows.map(mapActivity),
    fundingSources: fundingSourceRows.map(mapFundingSource),
    holidays: holidayRows.map(mapHoliday),
    settings,
  };

  payPeriodConfigSnapshotCache.set(reportFileId, snapshot);
  return snapshot;
};

export default readPayPeriodConfigSnapshot;
