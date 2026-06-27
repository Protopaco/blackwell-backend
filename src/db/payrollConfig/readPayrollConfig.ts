import { google } from 'googleapis';
import PayrollConfig from '#models/PayrollConfig.js';
import mapEmployee from '#db/employee/mapEmployee.js';
import mapSupervisor from '#db/supervisor/mapSupervisor.js';
import mapActivity from '#db/activity/mapActivity.js';
import mapFundingSource from '#db/fundingSource/mapFundingSource.js';
import mapHoliday from '#db/holiday/mapHoliday.js';
import mapSettings from '#db/settings/mapSettings.js';
import {
  EMPLOYEES_TAB,
  ACTIVITIES_TAB,
  FUNDING_SOURCES_TAB,
  HOLIDAYS_TAB,
  SUPERVISORS_TAB,
  SETTINGS_TAB,
} from '#config/constants.js';
import { logger } from '#utils/logger.js';
import { createCache } from '#utils/cache.js';

const cache = createCache<PayrollConfig>(5 * 60 * 1000);

const TAB_NAMES = {
  employees: EMPLOYEES_TAB,
  supervisors: SUPERVISORS_TAB,
  fundingSources: FUNDING_SOURCES_TAB,
  activities: ACTIVITIES_TAB,
  settings: SETTINGS_TAB,
  holidays: HOLIDAYS_TAB,
};

const parseRows = (values: unknown[][]): Record<string, unknown>[] => {
  if (!values || values.length <= 1) return [];
  const headers = values[0] as string[];
  return values.slice(1).map((row) => {
    const record: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      record[header] = (row as unknown[])[index] ?? '';
    });
    return record;
  });
};

// Loads all config tabs (employees, activities, settings, etc.) in one batchGet call and caches the result for 5 minutes.
// Used by generateTimesheets and other services that need full client config in a single read.
const readPayrollConfig = async (payrollConfigFileId: string): Promise<PayrollConfig> => {
  logger.debug(`Loading payroll config from workbook: ${payrollConfigFileId}`);

  const cached = cache.get(payrollConfigFileId);
  if (cached) return cached;

  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not set');

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(serviceAccountJson),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const ranges = Object.values(TAB_NAMES);

  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: payrollConfigFileId,
    ranges,
  });

  const valueRanges = response.data.valueRanges ?? [];

  const [
    employeeRows,
    supervisorRows,
    fundingSourceRows,
    activityRows,
    settingsRows,
    holidayRows,
  ] = valueRanges.map((vr) => parseRows((vr.values as unknown[][]) ?? []));

  const settings = settingsRows.length > 0 ? mapSettings(settingsRows[0]) : null;
  if (!settings) throw new Error('Settings not found in Payroll Config');

  const config: PayrollConfig = {
    employees: employeeRows.map(mapEmployee),
    supervisors: supervisorRows.map(mapSupervisor),
    activities: activityRows.map(mapActivity),
    fundingSources: fundingSourceRows.map(mapFundingSource),
    holidays: holidayRows.map(mapHoliday),
    settings,
  };

  cache.set(payrollConfigFileId, config);
  return config;
};

// Clears cached config for all clients — called by the admin clear-cache endpoint.
const clearPayrollConfigCache = (): void => cache.clear();
// Removes the cached config for one client — called after updateEmployeeTimesheetFile so the next read is fresh.
const invalidatePayrollConfigCache = (payrollConfigFileId: string): void => cache.delete(payrollConfigFileId);

export { clearPayrollConfigCache, invalidatePayrollConfigCache };
export default readPayrollConfig;
