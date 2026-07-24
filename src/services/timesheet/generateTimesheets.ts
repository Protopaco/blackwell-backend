import tabExists from "#db/adapter/tabExists.js";
import createTabIfNotExists from "#db/adapter/createTabIfNotExists.js";
import writeValues from "#db/adapter/writeValues.js";
import listTabNames from "#db/adapter/listTabNames.js";
import reorderTabs from "#db/adapter/reorderTabs.js";
import saveManifest from "#db/manifest/appendManifest.js";
import getManifest from "#db/manifest/readManifest.js";
import getPayPeriods from "#db/payPeriod/readPayPeriods.js";
import writePayPeriod from "#db/payPeriod/writePayPeriod.js";
import getClientAndPayPeriod from "#services/payPeriod/getClientAndPayPeriod.js";
import readPayPeriodConfigSnapshot from "#db/payrollReport/readPayPeriodConfigSnapshot.js";
import { UnprocessableError } from "#utils/errors.js";
import Activity from "#models/Activity.js";
import Guid from "#models/Guid.js";
import { PayRate, isFlatRate } from "#models/PayRate.js";
import { PayPeriodStatus } from "#models/PayPeriodStatus.js";
import { PayrollCategory } from "#models/PayrollCategory.js";
import TimesheetManifest, { WeekManifest } from "#models/TimesheetManifest.js";
import {
  chunkDatesByWeek,
  getDatesBetween,
  getHolidayName,
} from "#utils/dateUtils.js";
import { logger } from "#utils/logger.js";
import buildWeek from "./buildWeek.js";
import applyTimesheetFormatting from "./applyTimesheetFormatting.js";
import sortTimesheetTabs from "./sortTimesheetTabs.js";
import {
  buildDividerRow,
  buildEmployeeNameRow,
  buildPositionRow,
  buildPayPeriodLabelRow,
  buildPayPeriodValueRow,
  buildIncludeInPayrollRow,
  buildSignatureRow,
  buildSummaryRow,
  colLetter,
} from "./rowBuilders.js";
import sortActivities from "./sortActivities.js";

const TIME_OFF_CATEGORIES = [
  PayrollCategory.ETO,
  PayrollCategory.PTO,
  PayrollCategory.STO,
] as const;

// Builds a =SUM() formula that totals each given row across all day columns (B through the last day column).
const sumRows = (rowNums: number[], maxDays: number): string => {
  if (rowNums.length === 0) return "0";
  const lastCol = colLetter(maxDays);
  const ranges = rowNums.map((rowNum) => `B${rowNum}:${lastCol}${rowNum}`);
  return `=SUM(${ranges.join(",")})`;
};

// For each active employee, creates a new timesheet file if needed, writes all week rows and summary formulas,
// and saves a manifest entry so future status checks know what was generated and where signatures belong.
// Skips employees whose timesheet for this pay period already exists.
const generateTimesheets = async (
  clientId: Guid,
  payPeriodId: Guid,
): Promise<void> => {
  const { client, payPeriod } = await getClientAndPayPeriod(clientId, payPeriodId);

  const payrollConfig = await readPayPeriodConfigSnapshot(payPeriod.payrollReportFileId);

  const activeEmployees = payrollConfig.employees;

  // A missing timesheetFileId at generation time is a data error, not something generation should
  // silently patch over — fix it via Employee update (which requires a timesheetFolderId at creation
  // time now, see createEmployee.ts).
  const employeesMissingTimesheetFile = activeEmployees.filter((employee) => !employee.timesheetFileId);
  if (employeesMissingTimesheetFile.length > 0) {
    const names = employeesMissingTimesheetFile.map((employee) => `${employee.firstName} ${employee.lastName}`);
    throw new UnprocessableError(
      `Active employees missing a timesheetFileId — fix via Employee update before generating: ${names.join(', ')}`,
    );
  }

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

  const payPeriods = await getPayPeriods(client.payPeriodRegistryFileId);

  for (const employee of activeEmployees) {
    const tabAlreadyExists = await tabExists(
      employee.timesheetFileId,
      payPeriod.payPeriodName,
    );
    if (tabAlreadyExists) {
      logger.info(
        `Timesheet tab already exists — skipping ${employee.firstName} ${employee.lastName}`,
      );
      continue;
    }

    const existingManifest = await getManifest(
      employee.timesheetFileId,
      payPeriod.payPeriodName,
    );
    if (existingManifest) {
      logger.info(
        `Manifest exists but tab was deleted — regenerating ${employee.firstName} ${employee.lastName}`,
      );
    }

    logger.info(
      `Generating timesheet for ${employee.firstName} ${employee.lastName}`,
    );

    const allRows: unknown[][] = [];
    const weekManifests: WeekManifest[] = [];

    allRows.push(buildEmployeeNameRow(employee.firstName, employee.lastName));
    allRows.push(buildPositionRow(employee.position));
    allRows.push(buildPayPeriodLabelRow());
    allRows.push(buildPayPeriodValueRow(payPeriod.payPeriodName));
    allRows.push(buildDividerRow());

    let currentRow = allRows.length + 1; // 1-based; starts after the header section
    for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
      const result = buildWeek(
        weekIndex,
        weeks[weekIndex],
        sortedActivities,
        payrollConfig.holidays,
        currentRow,
        maxDays,
      );
      allRows.push(...result.rows);
      weekManifests.push(result.weekManifest);
      currentRow += result.rows.length;
      // Add a blank row after each week for visual separation
      allRows.push(buildDividerRow());
      currentRow += 1;
    }

    // One extra blank row before signatures
    allRows.push(buildDividerRow());

    const employeeSignatureCell = { row: allRows.length + 1, column: 2 }; // 1-based; col B
    allRows.push(buildSignatureRow("Employee Signature:"));
    const supervisorSignatureCell = { row: allRows.length + 1, column: 2 };
    allRows.push(buildSignatureRow("Supervisor Signature:"));

    const includeInPayrollCell = { row: allRows.length + 1, column: 2 };
    allRows.push(buildIncludeInPayrollRow("Include in Payroll"));

    // Blank row between signatures and summary totals
    allRows.push(buildDividerRow());

    const hourlyRowNums: number[] = [];
    const flatRateRowNums: number[] = [];
    const categoryRowNums = new Map<string, number[]>(
      TIME_OFF_CATEGORIES.map((category) => [category, []]),
    );

    for (const weekManifest of weekManifests) {
      for (const activityRow of weekManifest.activityRows) {
        hourlyRowNums.push(activityRow.row);
        const activity = activityMap.get(activityRow.activityId);
        if (
          activity &&
          TIME_OFF_CATEGORIES.includes(activity.payrollCategory as any)
        ) {
          categoryRowNums.get(activity.payrollCategory)?.push(activityRow.row);
        }
      }
      for (const flatRateRow of weekManifest.flatRateRows) {
        flatRateRowNums.push(flatRateRow.row);
      }
    }

    const holidayHoursCells: string[] = [];
    for (const weekManifest of weekManifests) {
      const weekHourlyRowNumbers = weekManifest.activityRows
        .filter((activityRow) => {
          const activity = activityMap.get(activityRow.activityId);
          return activity && !isFlatRate(activity.payRate);
        })
        .map((activityRow) => activityRow.row);

      for (const dateEntry of weekManifest.dates) {
        if (
          getHolidayName(new Date(dateEntry.date), payrollConfig.holidays) !==
          null
        ) {
          const columnLetter = colLetter(dateEntry.column - 1);
          for (const rowNumber of weekHourlyRowNumbers) {
            holidayHoursCells.push(`${columnLetter}${rowNumber}`);
          }
        }
      }
    }

    const summaryRows: { label: string; row: number }[] = [];

    const pushSummary = (label: string, formula: string) => {
      summaryRows.push({ label, row: allRows.length + 1 });
      allRows.push(buildSummaryRow(label, formula));
    };

    pushSummary("Total Hours Worked", sumRows(hourlyRowNums, maxDays));
    pushSummary(
      "Holiday Hours",
      holidayHoursCells.length > 0
        ? `=SUM(${holidayHoursCells.join(",")})`
        : "0",
    );

    for (const category of presentTimeOffCategories) {
      pushSummary(
        category,
        sumRows(categoryRowNums.get(category) ?? [], maxDays),
      );
    }

    if (hasFlatRate) {
      pushSummary("Flat Rate Shifts", sumRows(flatRateRowNums, maxDays));
    }

    await createTabIfNotExists(
      employee.timesheetFileId,
      payPeriod.payPeriodName,
    );
    await writeValues(
      employee.timesheetFileId,
      payPeriod.payPeriodName,
      allRows,
    );

    const manifest: TimesheetManifest = {
      payPeriodId,
      employeeId: employee.employeeId,
      generatedAt: new Date().toISOString(),
      tabName: payPeriod.payPeriodName,
      weeks: weekManifests,
      employeeSignatureCell,
      supervisorSignatureCell,
      includeInPayrollCell,
      summaryRows,
    };

    await applyTimesheetFormatting(
      employee.timesheetFileId,
      payPeriod.payPeriodName,
      manifest,
      payrollConfig.holidays,
      maxDays,
    );

    await saveManifest(employee.timesheetFileId, manifest);

    const tabNames = await listTabNames(employee.timesheetFileId);
    await reorderTabs(employee.timesheetFileId, sortTimesheetTabs(tabNames, payPeriods));

    logger.info(
      `Timesheet generated for ${employee.firstName} ${employee.lastName}`,
    );
  }

  if (payPeriod.status === PayPeriodStatus.Pending) {
    await writePayPeriod(client.payPeriodRegistryFileId, { ...payPeriod, status: PayPeriodStatus.Open });
    logger.info(`generateTimesheets: pay period status updated to Open`);
  }
};

export default generateTimesheets;
