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
import { PayPeriodStatus } from "#models/PayPeriodStatus.js";
import { PayrollCategory } from "#models/PayrollCategory.js";
import { TimeInputMethod } from "#models/TimeInputMethod.js";
import TimesheetManifest, { ClockInOutWeekManifest, WeekManifest } from "#models/TimesheetManifest.js";
import {
  chunkDatesByWeek,
  getDatesBetween,
  getHolidayName,
} from "#utils/dateUtils.js";
import { CLOCK_IN_OUT_ACTIVITY_COLUMN_OFFSET, CLOCK_IN_OUT_TOTAL_COLUMN_OFFSET } from "#config/constants.js";
import { logger } from "#utils/logger.js";
import buildWeek from "./buildWeek.js";
import buildClockInOutTimesheet from "./buildClockInOutTimesheet.js";
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

// Builds a =SUM() formula over an explicit list of cell references (e.g. "C42") — used for ClockInOut
// timesheets, where an activity's hours per day live at a cell specific to that one day's block rather
// than a row shared across the whole pay period the way sumRows assumes.
const sumCellReferences = (cellReferences: string[]): string => {
  if (cellReferences.length === 0) return "0";
  return `=SUM(${cellReferences.join(",")})`;
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

  // An employee with no EmployeeActivityRates bridge rows has nothing to build a timesheet for — this is
  // a data error to fix via Employee update, not something generation should silently skip.
  const employeesMissingActivityRates = activeEmployees.filter((employee) => employee.activityRates.length === 0);
  if (employeesMissingActivityRates.length > 0) {
    const names = employeesMissingActivityRates.map((employee) => `${employee.firstName} ${employee.lastName}`);
    throw new UnprocessableError(
      `Active employees have no activities assigned — fix via Employee update before generating: ${names.join(', ')}`,
    );
  }

  logger.info(`Generating timesheets for ${activeEmployees.length} employees`);

  const dates = getDatesBetween(payPeriod.startDate, payPeriod.endDate);
  const weeks = chunkDatesByWeek(dates);
  const maxDays = Math.max(...weeks.map((week) => week.length));

  const activityMap = new Map<Guid, Activity>(
    payrollConfig.activities.map((activity) => [activity.activityId, activity]),
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

    // Each employee only sees the activities they have a bridge row for — no more "every employee gets
    // every activity" (see [048] epic background).
    const employeeActivityIds = new Set(employee.activityRates.map((activityRate) => activityRate.activityId));
    const employeeActivities = payrollConfig.activities.filter((activity) => employeeActivityIds.has(activity.activityId));
    const sortedActivities = sortActivities(employeeActivities, employee.activityRates);
    const { timeOffActivities, flatRateActivities } = sortedActivities;
    const hasFlatRate = flatRateActivities.length > 0;
    const presentTimeOffCategories = TIME_OFF_CATEGORIES.filter((category) =>
      timeOffActivities.some((activity) => activity.payrollCategory === category),
    );

    const allRows: unknown[][] = [];
    const weekManifests: WeekManifest[] = [];

    allRows.push(buildEmployeeNameRow(employee.firstName, employee.lastName));
    allRows.push(buildPositionRow(employee.position));
    allRows.push(buildPayPeriodLabelRow());
    allRows.push(buildPayPeriodValueRow(payPeriod.payPeriodName));
    allRows.push(buildDividerRow());

    const isClockInOut = payrollConfig.settings.timeInputMethod === TimeInputMethod.ClockInOut;
    const hourlyActivityNames = [...sortedActivities.workActivities, ...sortedActivities.timeOffActivities].map(
      (activity) => activity.activityName,
    );

    let currentRow = allRows.length + 1; // 1-based; starts after the header section
    let clockInOutWeeks: ClockInOutWeekManifest[] = [];

    if (isClockInOut) {
      // ClockInOut weeks sit side by side sharing row numbers rather than stacking, so this is one call
      // for the whole pay period instead of a per-week loop — see buildClockInOutTimesheet.
      const result = buildClockInOutTimesheet(weeks, sortedActivities, currentRow);
      allRows.push(...result.rows);
      clockInOutWeeks = result.clockInOutWeeks;
      currentRow += result.rows.length;
      allRows.push(buildDividerRow());
      currentRow += 1;
    } else {
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

    // weekManifest.activityRows already excludes flat-rate rows (those live in flatRateRows), so every
    // row here is hourly/salary and counts toward holiday hours. Empty for ClockInOut timesheets, whose
    // equivalent totals are collected separately below (activity hours live in per-day cells, not rows
    // shared across the whole pay period).
    const holidayHoursCells: string[] = [];
    for (const weekManifest of weekManifests) {
      const weekHourlyRowNumbers = weekManifest.activityRows.map((activityRow) => activityRow.row);

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

    // ClockInOut equivalent of the collections above. There's no per-activity daily summary cell to lean
    // on anymore (removed as noise per the 2026-08-12 mockup) — an entry slot's activity is chosen freely
    // via dropdown at data-entry time, not fixed per row, so each day's own slot-row range is summed (or
    // SUMIF-matched, for the per-category breakdown) directly instead.
    const clockInOutDayRanges = clockInOutWeeks.flatMap((week) => {
      const totalColumn = colLetter(week.labelColumnIndex + CLOCK_IN_OUT_TOTAL_COLUMN_OFFSET);
      const activityColumn = colLetter(week.labelColumnIndex + CLOCK_IN_OUT_ACTIVITY_COLUMN_OFFSET);
      return week.days.map((day) => {
        const firstSlotRow = day.slotRows[0].row;
        const lastSlotRow = day.slotRows[day.slotRows.length - 1].row;
        return {
          date: day.date,
          totalRange: `${totalColumn}${firstSlotRow}:${totalColumn}${lastSlotRow}`,
          activityRange: `${activityColumn}${firstSlotRow}:${activityColumn}${lastSlotRow}`,
        };
      });
    });

    const totalHoursCellReferencesClockInOut = clockInOutDayRanges.map((dayRange) => dayRange.totalRange);

    const holidayHoursCellReferencesClockInOut = clockInOutDayRanges
      .filter((dayRange) => getHolidayName(new Date(dayRange.date), payrollConfig.holidays) !== null)
      .map((dayRange) => dayRange.totalRange);

    // Builds a =SUM() of SUMIF terms, one per (day, activity-in-category) pair, matching that day's slot
    // rows' chosen activity against the category's activity names — the ClockInOut equivalent of
    // sumRows(categoryRowNums), since there's no fixed row per activity to sum directly.
    const buildCategorySumFormulaClockInOut = (categoryActivityNames: string[]): string => {
      if (categoryActivityNames.length === 0 || clockInOutDayRanges.length === 0) return "0";
      const sumIfTerms = clockInOutDayRanges.flatMap((dayRange) =>
        categoryActivityNames.map(
          (activityName) => `SUMIF(${dayRange.activityRange},"${activityName}",${dayRange.totalRange})`,
        ),
      );
      return `=${sumIfTerms.join("+")}`;
    };

    const flatRateCellReferencesClockInOut = clockInOutWeeks.flatMap((week) => {
      const totalColumn = colLetter(week.labelColumnIndex + CLOCK_IN_OUT_TOTAL_COLUMN_OFFSET);
      return week.days.flatMap((day) => day.flatRateRows.map((flatRateRow) => `${totalColumn}${flatRateRow.row}`));
    });

    const summaryRows: { label: string; row: number }[] = [];

    const pushSummary = (label: string, formula: string) => {
      summaryRows.push({ label, row: allRows.length + 1 });
      allRows.push(buildSummaryRow(label, formula));
    };

    pushSummary(
      "Total Hours Worked",
      isClockInOut ? sumCellReferences(totalHoursCellReferencesClockInOut) : sumRows(hourlyRowNums, maxDays),
    );
    pushSummary(
      "Holiday Hours",
      isClockInOut
        ? sumCellReferences(holidayHoursCellReferencesClockInOut)
        : holidayHoursCells.length > 0
          ? `=SUM(${holidayHoursCells.join(",")})`
          : "0",
    );

    for (const category of presentTimeOffCategories) {
      const categoryActivityNames = timeOffActivities
        .filter((activity) => activity.payrollCategory === category)
        .map((activity) => activity.activityName);
      pushSummary(
        category,
        isClockInOut ? buildCategorySumFormulaClockInOut(categoryActivityNames) : sumRows(categoryRowNums.get(category) ?? [], maxDays),
      );
    }

    if (hasFlatRate) {
      pushSummary(
        "Flat Rate Shifts",
        isClockInOut ? sumCellReferences(flatRateCellReferencesClockInOut) : sumRows(flatRateRowNums, maxDays),
      );
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
      clockInOutWeeks: isClockInOut ? clockInOutWeeks : undefined,
    };

    await applyTimesheetFormatting(
      employee.timesheetFileId,
      payPeriod.payPeriodName,
      manifest,
      payrollConfig.holidays,
      maxDays,
      isClockInOut ? hourlyActivityNames : [],
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
