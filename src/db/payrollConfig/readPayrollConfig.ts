import { google } from 'googleapis';
import PayrollConfig from '#models/PayrollConfig.js';
import mapEmployee from '#db/employee/mapEmployee.js';
import mapSupervisor from '#db/supervisor/mapSupervisor.js';
import mapActivity from '#db/activity/mapActivity.js';
import mapFundingSource from '#db/fundingSource/mapFundingSource.js';
import mapHoliday from '#db/holiday/mapHoliday.js';
import mapSettings from '#db/settings/mapSettings.js';
import { logger } from '#utils/logger.js';

const TAB_NAMES = {
  employees: 'Employees',
  supervisors: 'Supervisors',
  fundingSources: 'FundingSources',
  activities: 'Activities',
  settings: 'Settings',
  holidays: 'Holidays',
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

const readPayrollConfig = async (payrollConfigFileId: string): Promise<PayrollConfig> => {
  logger.debug(`Loading payroll config from workbook: ${payrollConfigFileId}`);

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

  return {
    employees: employeeRows.map(mapEmployee),
    supervisors: supervisorRows.map(mapSupervisor),
    activities: activityRows.map(mapActivity),
    fundingSources: fundingSourceRows.map(mapFundingSource),
    holidays: holidayRows.map(mapHoliday),
    settings,
  };
};

export default readPayrollConfig;
