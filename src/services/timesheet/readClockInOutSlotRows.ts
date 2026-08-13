import Activity from '#models/Activity.js';
import Employee from '#models/Employee.js';
import Guid from '#models/Guid.js';
import TimesheetEntry from '#models/TimesheetEntry.js';
import { formatDateHeader } from '#utils/dateUtils.js';
import { UnprocessableError } from '#utils/errors.js';
import {
  CLOCK_IN_OUT_ACTIVITY_COLUMN_OFFSET,
  CLOCK_IN_OUT_IN_COLUMN_OFFSET,
  CLOCK_IN_OUT_OUT_COLUMN_OFFSET,
} from '#config/constants.js';
import calculateClockInOutHours from './calculateClockInOutHours.js';
import parseClockTimeCell from './parseClockTimeCell.js';

// Reads one ClockInOut day's Hourly slot rows, validating each per the rules decided in [079], and
// appends a TimesheetEntry for every slot with a recognized activity and a nonzero elapsed duration.
// Throws UnprocessableError (with employee name + date) for any slot whose data can't be trusted rather
// than silently dropping or miscounting it — called once per day by readClockInOutEntries.
const readClockInOutSlotRows = (
  employee: Employee,
  employeeName: string,
  activityByName: Map<string, Activity>,
  payRateTypeByActivityId: Map<Guid, TimesheetEntry['payRateType']>,
  tabValues: unknown[][],
  labelColumnIndex: number,
  slotRows: { row: number }[],
  date: string,
  isHoliday: boolean,
): TimesheetEntry[] => {
  const formattedDate = formatDateHeader(new Date(date));
  const entries: TimesheetEntry[] = [];

  for (const slotRow of slotRows) {
    const rowValues = tabValues[slotRow.row - 1] ?? [];
    const activityName = String(rowValues[labelColumnIndex + CLOCK_IN_OUT_ACTIVITY_COLUMN_OFFSET] ?? '').trim();
    const inCellValue = rowValues[labelColumnIndex + CLOCK_IN_OUT_IN_COLUMN_OFFSET];
    const outCellValue = rowValues[labelColumnIndex + CLOCK_IN_OUT_OUT_COLUMN_OFFSET];
    const inPresent = inCellValue !== undefined && inCellValue !== '';
    const outPresent = outCellValue !== undefined && outCellValue !== '';

    if (activityName === '') {
      if (!inPresent && !outPresent) continue; // rule 1: skip, not an entry
      throw new UnprocessableError(
        `${employeeName}'s ${formattedDate} timesheet entry has a clock-in or clock-out time recorded with no activity selected — resolve before generating a payroll report.`,
      ); // rule 2
    }

    const activity = activityByName.get(activityName);
    const payRateType = activity ? payRateTypeByActivityId.get(activity.activityId) : undefined;
    if (!activity || !payRateType) {
      if (!inPresent && !outPresent) continue; // no hours attached — safe to drop
      throw new UnprocessableError(
        `${employeeName}'s ${formattedDate} timesheet entry references an activity that's no longer assigned to them — resolve before generating a payroll report.`,
      );
    }

    if (!inPresent && !outPresent) continue; // rule 3: 0 hours, skip

    if (inPresent !== outPresent) {
      throw new UnprocessableError(
        `${employeeName}'s ${formattedDate} timesheet entry is missing a clock-in or clock-out time — resolve before generating a payroll report.`,
      ); // rule 4
    }

    const inHours = parseClockTimeCell(inCellValue);
    const outHours = parseClockTimeCell(outCellValue);
    if (inHours === null || Number.isNaN(inHours) || outHours === null || Number.isNaN(outHours)) {
      throw new UnprocessableError(
        `${employeeName}'s ${formattedDate} timesheet entry has a clock-in or clock-out time that isn't a valid time — resolve before generating a payroll report.`,
      ); // rule 7
    }

    if (outHours < inHours) {
      throw new UnprocessableError(
        `${employeeName}'s ${formattedDate} timesheet entry has a clock-out time before the clock-in time — resolve before generating a payroll report.`,
      ); // rule 5
    }

    const hours = calculateClockInOutHours(inHours, outHours);
    if (hours === 0) continue; // valid, but nothing to report

    entries.push({
      employeeId: employee.employeeId,
      employeeName,
      activityId: activity.activityId,
      activityName: activity.activityName,
      payrollCategory: activity.payrollCategory,
      payRateType,
      date,
      isHoliday,
      hours,
    });
  }

  return entries;
};

export default readClockInOutSlotRows;
