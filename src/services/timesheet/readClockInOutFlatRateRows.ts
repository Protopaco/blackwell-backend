import Activity from '#models/Activity.js';
import Employee from '#models/Employee.js';
import Guid from '#models/Guid.js';
import TimesheetEntry from '#models/TimesheetEntry.js';
import { CLOCK_IN_OUT_IN_COLUMN_OFFSET } from '#config/constants.js';

// Reads one ClockInOut day's Flat Rate rows — each has a single Shifts quantity cell (no time parsing),
// read the same way TotalHours-mode flat-rate rows are read today (Number(cellValue), no NaN guard — see
// [077] for the shared pre-existing gap that applies equally to both modes). Called once per day by
// readClockInOutEntries.
const readClockInOutFlatRateRows = (
  employee: Employee,
  employeeName: string,
  activityMap: Map<Guid, Activity>,
  payRateTypeByActivityId: Map<Guid, TimesheetEntry['payRateType']>,
  tabValues: unknown[][],
  labelColumnIndex: number,
  flatRateRows: { activityId: Guid; activityName: string; row: number }[],
  date: string,
  isHoliday: boolean,
): TimesheetEntry[] => {
  const entries: TimesheetEntry[] = [];

  for (const flatRateRow of flatRateRows) {
    const rowValues = tabValues[flatRateRow.row - 1] ?? [];
    const shiftsCellValue = rowValues[labelColumnIndex + CLOCK_IN_OUT_IN_COLUMN_OFFSET];
    const shiftsQuantity = shiftsCellValue !== undefined && shiftsCellValue !== '' ? Number(shiftsCellValue) : 0;
    if (shiftsQuantity === 0) continue;

    const activity = activityMap.get(flatRateRow.activityId);
    const payRateType = payRateTypeByActivityId.get(flatRateRow.activityId);
    if (!activity || !payRateType) continue;

    entries.push({
      employeeId: employee.employeeId,
      employeeName,
      activityId: activity.activityId,
      activityName: activity.activityName,
      payrollCategory: activity.payrollCategory,
      payRateType,
      date,
      isHoliday,
      hours: shiftsQuantity,
    });
  }

  return entries;
};

export default readClockInOutFlatRateRows;
