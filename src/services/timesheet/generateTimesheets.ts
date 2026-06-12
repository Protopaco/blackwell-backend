import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import readClientById from '#db/client/readClientById.js';
import saveManifest from '#db/manifest/appendManifest.js';
import getManifest from '#db/manifest/readManifest.js';
import getPayPeriodById from '#db/payPeriod/readPayPeriodById.js';
import getPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import updateEmployeeTimesheetFile from '#db/employee/updateEmployeeTimesheetFile.js';
import Activity from '#models/Activity.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import Guid from '#models/Guid.js';
import { PayRate } from '#models/PayRate.js';
import { PayrollCategory } from '#models/PayrollCategory.js';
import TimesheetManifest, { WeekManifest } from '#models/TimesheetManifest.js';
import { chunkDatesByWeek, getDatesBetween, getHolidayName } from '#utils/dateUtils.js';
import { logger } from '#utils/logger.js';
import buildWeek from './buildWeek.js';
import {
  buildDividerRow,
  buildEmployeeRow,
  buildHeaderRow,
  buildSignatureRow,
  buildSummaryRow,
  colLetter,
} from './rowBuilders.js';
import sortActivities from './sortActivities.js';

const TIME_OFF_CATEGORIES = [PayrollCategory.ETO, PayrollCategory.PTO, PayrollCategory.STO] as const;

const sumRows = (rowNums: number[], maxDays: number): string => {
  if (rowNums.length === 0) return '0';
  const lastCol = colLetter(maxDays);
  const ranges = rowNums.map((rowNum) => `B${rowNum}:${lastCol}${rowNum}`);
  return `=SUM(${ranges.join(',')})`;
};

// cols is 1-based column numbers
const sumCells = (rowNums: number[], cols: number[]): string => {
  if (rowNums.length === 0 || cols.length === 0) return '0';
  const cells: string[] = [];
  for (const colNum of cols) {
    const colLetterStr = colLetter(colNum - 1);
    for (const rowNum of rowNums) {
      cells.push(`${colLetterStr}${rowNum}`);
    }
  }
  return `=SUM(${cells.join(',')})`;
};

const countaRows = (rowNums: number[], maxDays: number): string => {
  if (rowNums.length === 0) return '0';
  const lastCol = colLetter(maxDays);
  const ranges = rowNums.map((rowNum) => `B${rowNum}:${lastCol}${rowNum}`);
  return `=COUNTA(${ranges.join(',')})`;
};

const generateTimesheets = async (
  clientId: Guid,
  payPeriodId: Guid,
): Promise<void> => {
  const client = await readClientById(clientId);
  if (!client) throw new Error(`Client not found: ${clientId}`);

  const payPeriod = await getPayPeriodById(client.payPeriodRegistryFileId, payPeriodId);
  if (!payPeriod) throw new Error(`Pay period not found: ${payPeriodId}`);

  const payrollConfig = await getPayrollConfig(client.payrollConfigFileId);

  const activeEmployees = payrollConfig.employees.filter(
    (employee) => employee.status === EmployeeStatus.Active,
  );

  logger.info(`Generating timesheets for ${activeEmployees.length} employees`);

  const dates = getDatesBetween(payPeriod.startDate, payPeriod.endDate);
  const weeks = chunkDatesByWeek(dates);
  const sortedActivities = sortActivities(payrollConfig.activities);
  const { timeOffActivities, flatRateActivities } = sortedActivities;
  const hasFlatRate = flatRateActivities.length > 0;
  const maxDays = Math.max(...weeks.map((week) => week.length));

  const activityMap = new Map<Guid, Activity>(
    payrollConfig.activities.map((activity) => [activity.activityId, activity]),
  );

  const presentTimeOffCategories = TIME_OFF_CATEGORIES.filter((category) =>
    timeOffActivities.some((activity) => activity.payrollCategory === category),
  );

  for (const employee of activeEmployees) {
    const existingManifest = await getManifest(employee.timesheetFileId, payPeriod.payPeriodName);
    if (existingManifest) {
      const tabStillExists = await sheetsAdapter.tabExists(employee.timesheetFileId, payPeriod.payPeriodName);
      if (tabStillExists) {
        logger.info(`Timesheet already exists — skipping ${employee.firstName} ${employee.lastName}`);
        continue;
      }
      logger.info(`Manifest exists but tab was deleted — regenerating ${employee.firstName} ${employee.lastName}`);
    }

    if (!employee.timesheetFileId) {
      logger.info(`No timesheet file for ${employee.firstName} ${employee.lastName} — creating`);
      const newFileId = await sheetsAdapter.createWorkbook(
        `${employee.firstName} ${employee.lastName} Timesheets`,
        client.timesheetsFolderId,
      );
      const newFileLink = `https://docs.google.com/spreadsheets/d/${newFileId}/edit`;
      await updateEmployeeTimesheetFile(client.payrollConfigFileId, employee.employeeId, newFileId, newFileLink);
      employee.timesheetFileId = newFileId;
      employee.timesheetFileLink = newFileLink;
      logger.info(`Created timesheet file for ${employee.firstName} ${employee.lastName}: ${newFileId}`);
    }

    logger.info(`Generating timesheet for ${employee.firstName} ${employee.lastName}`);

    const allRows: unknown[][] = [];
    const weekManifests: WeekManifest[] = [];

    allRows.push(buildHeaderRow(payPeriod.payPeriodName));
    allRows.push(buildEmployeeRow(employee.firstName, employee.lastName, employee.position));
    allRows.push(buildDividerRow());

    let currentRow = allRows.length + 1; // 1-based; starts after the header section
    for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
      const result = buildWeek(weekIndex, weeks[weekIndex], sortedActivities, payrollConfig.holidays, currentRow);
      allRows.push(...result.rows);
      weekManifests.push(result.weekManifest);
      currentRow += result.rows.length;
    }

    const employeeSignatureCell = { row: allRows.length + 1, column: 2 }; // 1-based; col B
    allRows.push(buildSignatureRow('Employee Signature:'));
    const supervisorSignatureCell = { row: allRows.length + 1, column: 2 };
    allRows.push(buildSignatureRow('Supervisor Signature:'));

    const hourlyRowNums: number[] = [];
    const flatRateRowNums: number[] = [];
    const categoryRowNums = new Map<string, number[]>(
      TIME_OFF_CATEGORIES.map((category) => [category, []]),
    );

    for (const weekManifest of weekManifests) {
      for (const activityRow of weekManifest.activityRows) {
        const activity = activityMap.get(activityRow.activityId);
        if (!activity) continue;

        if (activity.payRate === PayRate.FlatRate) {
          flatRateRowNums.push(activityRow.row);
        } else {
          hourlyRowNums.push(activityRow.row);
          if (TIME_OFF_CATEGORIES.includes(activity.payrollCategory as any)) {
            categoryRowNums.get(activity.payrollCategory)?.push(activityRow.row);
          }
        }
      }
    }

    const holidayColumns: number[] = [];
    for (const weekManifest of weekManifests) {
      for (const dateEntry of weekManifest.dates) {
        if (getHolidayName(new Date(dateEntry.date), payrollConfig.holidays) !== null) {
          holidayColumns.push(dateEntry.column);
        }
      }
    }

    allRows.push(buildSummaryRow('Total Hours Worked', sumRows(hourlyRowNums, maxDays)));
    allRows.push(buildSummaryRow('Holiday Hours', sumCells(hourlyRowNums, holidayColumns)));

    for (const category of presentTimeOffCategories) {
      allRows.push(buildSummaryRow(category, sumRows(categoryRowNums.get(category) ?? [], maxDays)));
    }

    if (hasFlatRate) {
      allRows.push(buildSummaryRow('Flat Rate Shifts', countaRows(flatRateRowNums, maxDays)));
    }

    await sheetsAdapter.createTabIfNotExists(employee.timesheetFileId, payPeriod.payPeriodName);
    await sheetsAdapter.writeValues(employee.timesheetFileId, payPeriod.payPeriodName, allRows);

    const manifest: TimesheetManifest = {
      payPeriodId,
      employeeId: employee.employeeId,
      generatedAt: new Date().toISOString(),
      tabName: payPeriod.payPeriodName,
      weeks: weekManifests,
      employeeSignatureCell,
      supervisorSignatureCell,
    };

    await saveManifest(employee.timesheetFileId, manifest);

    logger.info(`Timesheet generated for ${employee.firstName} ${employee.lastName}`);
  }
};

export default generateTimesheets;
