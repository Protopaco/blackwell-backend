import createOAuthWorkbook from '#db/adapter/createOAuthWorkbook.js';
import renameTab from '#db/adapter/renameTab.js';
import readClientById from '#db/client/readClientById.js';
import archivePayrollReportTab from '#db/payrollReport/archivePayrollReportTab.js';
import writePayrollReportTab from '#db/payrollReport/writePayrollReportTab.js';
import readPayPeriodById from '#db/payPeriod/readPayPeriodById.js';
import writePayPeriod from '#db/payPeriod/writePayPeriod.js';
import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import Activity from '#models/Activity.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import Guid from '#models/Guid.js';
import PayrollReportHoursRow from '#models/PayrollReportHoursRow.js';
import PayrollReportSummaryRow from '#models/PayrollReportSummaryRow.js';
import readTimesheetDetail from '#services/timesheet/readTimesheetDetail.js';
import readTimesheetEntries from '#services/timesheet/readTimesheetEntries.js';
import buildArchiveTimestamp from './buildArchiveTimestamp.js';
import buildHoursRows from './buildHoursRows.js';
import buildSheetValues from './buildSheetValues.js';
import buildSummaryRows from './buildSummaryRows.js';
import { logger } from '#utils/logger.js';

const CURRENT_HOURS_TAB = 'current_hours';
const CURRENT_ADP_SUMMARY_TAB = 'current_adp_summary';
const PENDING_HOURS_TAB = 'pending_hours';
const PENDING_ADP_SUMMARY_TAB = 'pending_adp_summary';

const HOURS_HEADERS: (keyof PayrollReportHoursRow)[] = [
  'GeneratedAt', 'EmployeeId', 'EmployeeName', 'ActivityName',
  'PayrollCategory', 'Date', 'IsHoliday', 'Hours',
];

const SUMMARY_HEADERS: (keyof PayrollReportSummaryRow)[] = [
  'GeneratedAt', 'EmployeeId', 'EmployeeName',
  'PayrollCategory', 'TotalHours', 'HolidayHours',
];

// Generates or regenerates the payroll report for a pay period.
// Only processes employees whose timesheets are Complete (both signatures present).
// Archives existing current_hours and current_adp_summary tabs before writing fresh data.
// Creates the report file via OAuth if it does not yet exist.
const generatePayrollReport = async (clientId: Guid, payPeriodId: Guid): Promise<void> => {
  logger.info(`generatePayrollReport clientId=${clientId} payPeriodId=${payPeriodId}`);

  const client = await readClientById(clientId);
  if (!client) throw new Error(`Client not found: ${clientId}`);

  const payPeriod = await readPayPeriodById(client.payPeriodRegistryFileId, payPeriodId);
  if (!payPeriod) throw new Error(`Pay period not found: ${payPeriodId}`);

  const payrollConfig = await readPayrollConfig(client.payrollConfigFileId);

  const activityMap = new Map<Guid, Activity>(
    payrollConfig.activities.map((activity) => [activity.activityId, activity]),
  );

  const activeEmployees = payrollConfig.employees.filter(
    (employee) => employee.status === EmployeeStatus.Active,
  );

  const allEntries = [];
  for (const employee of activeEmployees) {
    const detail = await readTimesheetDetail(employee.timesheetFileId, payPeriod.payPeriodName);
    if (!detail.employeeSigned || !detail.supervisorSigned) {
      logger.info(`Skipping ${employee.firstName} ${employee.lastName} — timesheet not Complete`);
      continue;
    }
    const entries = await readTimesheetEntries(employee, payPeriod.payPeriodName, activityMap, payrollConfig.holidays);
    allEntries.push(...entries);
  }

  if (allEntries.length === 0) {
    throw new Error('No Complete timesheets found — at least one timesheet must be signed by both employee and supervisor before generating a payroll report');
  }

  logger.info(`generatePayrollReport: ${allEntries.length} entries from Complete timesheets`);

  let reportFileId = payPeriod.payrollReportFileId;
  if (!reportFileId) {
    logger.info(`generatePayrollReport: creating report file for ${payPeriod.payPeriodName}`);
    reportFileId = await createOAuthWorkbook(payPeriod.payPeriodName, client.payrollReportFolderId);
    await writePayPeriod(client.payPeriodRegistryFileId, { ...payPeriod, payrollReportFileId: reportFileId });
    logger.info(`generatePayrollReport: report file created ${reportFileId}`);
  }

  const generatedAt = new Date().toISOString();
  const archiveTimestamp = buildArchiveTimestamp();

  const hoursValues = buildSheetValues(buildHoursRows(allEntries, generatedAt) as unknown as Record<string, unknown>[], HOURS_HEADERS as string[]);
  const summaryValues = buildSheetValues(buildSummaryRows(allEntries, generatedAt) as unknown as Record<string, unknown>[], SUMMARY_HEADERS as string[]);

  await writePayrollReportTab(reportFileId, PENDING_HOURS_TAB, hoursValues);
  await writePayrollReportTab(reportFileId, PENDING_ADP_SUMMARY_TAB, summaryValues);

  await archivePayrollReportTab(reportFileId, CURRENT_HOURS_TAB, `hrs_${archiveTimestamp}`);
  await archivePayrollReportTab(reportFileId, CURRENT_ADP_SUMMARY_TAB, `adp_${archiveTimestamp}`);

  await renameTab(reportFileId, PENDING_HOURS_TAB, CURRENT_HOURS_TAB);
  await renameTab(reportFileId, PENDING_ADP_SUMMARY_TAB, CURRENT_ADP_SUMMARY_TAB);

  logger.info(`generatePayrollReport: complete for pay period ${payPeriod.payPeriodName}`);
};

export default generatePayrollReport;
