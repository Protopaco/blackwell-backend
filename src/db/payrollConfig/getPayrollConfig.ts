import { google } from 'googleapis';
import PayrollConfig from '#models/PayrollConfig.js';
import Employee from '#models/Employee.js';
import Supervisor from '#models/Supervisor.js';
import Activity, { ActivityFundingSource } from '#models/Activity.js';
import FundingSource from '#models/FundingSource.js';
import Holiday from '#models/Holiday.js';
import Settings from '#models/Settings.js';
import { EmployeeStatusType } from '#models/EmployeeStatus.js';
import { PayrollCategoryType } from '#models/PayrollCategory.js';
import { PayRateType } from '#models/PayRate.js';
import { TimeInputMethodType } from '#models/TimeInputMethod.js';
import { PayPeriodIntervalType } from '#models/PayPeriodInterval.js';
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

const mapToEmployee = (row: Record<string, unknown>): Employee => ({
  employeeId: row['EmployeeId'] as string,
  firstName: row['FirstName'] as string,
  lastName: row['LastName'] as string,
  position: row['Position'] as string,
  basePayRate: Number(row['BasePayRate']) || 0,
  secondaryPayRate: Number(row['SecondaryPayRate']) || 0,
  holidayPayRate: Number(row['HolidayPayRate']) || 0,
  email: row['Email'] as string,
  status: row['Status'] as EmployeeStatusType,
  timesheetFileLink: row['TimesheetFileLink'] as string,
  timesheetFileId: row['TimesheetFileId'] as string,
});

const mapToSupervisor = (row: Record<string, unknown>): Supervisor => ({
  supervisorId: row['SupervisorId'] as string,
  supervisorFirstName: row['SupervisorFirstName'] as string,
  supervisorLastName: row['SupervisorLastName'] as string,
  supervisorEmail: row['SupervisorEmail'] as string,
});

const mapFundingSources = (row: Record<string, unknown>): ActivityFundingSource[] => {
  const fundingSources: ActivityFundingSource[] = [];
  for (let i = 1; i <= 3; i++) {
    const name = row[`FundingSource${i}Name`] as string;
    const percentage = Number(row[`FundingSource${i}Percentage`]);
    if (name) fundingSources.push({ fundingSourceName: name, percentage });
  }
  return fundingSources;
};

const mapToActivity = (row: Record<string, unknown>): Activity => ({
  activityId: row['ActivityId'] as string,
  activityName: row['ActivityName'] as string,
  trackSeparately: row['TrackSeparately'] === true || row['TrackSeparately'] === 'TRUE',
  payrollCategory: row['PayrollCategory'] as PayrollCategoryType,
  fundingSources: mapFundingSources(row),
  payRate: row['PayRate'] as PayRateType,
  flatRateAmount: row['FlatRateAmount'] ? Number(row['FlatRateAmount']) : undefined,
});

const mapToFundingSource = (row: Record<string, unknown>): FundingSource => ({
  fundingSourceId: row['FundingSourceId'] as string,
  fundingSourceName: row['FundingSourceName'] as string,
  fundingSourceCode: (row['FundingSourceCode'] as string) || undefined,
});

const mapToHoliday = (row: Record<string, unknown>): Holiday => ({
  holidayId: row['HolidayId'] as string,
  holidayName: row['HolidayName'] as string,
  holidayDate: row['HolidayDate'] as string,
});

const mapToSettings = (row: Record<string, unknown>): Settings => ({
  timeInputMethod: row['TimesheetTemplate'] as TimeInputMethodType,
  payPeriodInterval: row['PayPeriodInterval'] as PayPeriodIntervalType,
  payPeriodStartDate: row['PayPeriodStartDate'] as string,
});

const getPayrollConfig = async (payrollConfigFileId: string): Promise<PayrollConfig> => {
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

  const settings = settingsRows.length > 0 ? mapToSettings(settingsRows[0]) : null;
  if (!settings) throw new Error('Settings not found in Payroll Config');

  return {
    employees: employeeRows.map(mapToEmployee),
    supervisors: supervisorRows.map(mapToSupervisor),
    activities: activityRows.map(mapToActivity),
    fundingSources: fundingSourceRows.map(mapToFundingSource),
    holidays: holidayRows.map(mapToHoliday),
    settings,
  };
};

export default getPayrollConfig;
