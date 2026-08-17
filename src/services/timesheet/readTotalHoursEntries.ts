import Activity from '#models/Activity.js';
import Employee from '#models/Employee.js';
import Guid from '#models/Guid.js';
import Holiday from '#models/Holiday.js';
import TimesheetEntry from '#models/TimesheetEntry.js';
import { WeekManifest } from '#models/TimesheetManifest.js';
import { getHolidayName } from '#utils/dateUtils.js';

// Reads every TimesheetEntry out of a TotalHours-shaped timesheet: each week's activity rows (work, time
// off, and flat-rate all combined into one block) hold one hours cell per day column directly, so no
// per-slot validation is needed — just a numeric read per (row, date) pair, skipping zero and empty
// cells. Called by readTimesheetEntries when the manifest isn't ClockInOut-shaped.
const readTotalHoursEntries = (
  employee: Employee,
  employeeName: string,
  activityMap: Map<Guid, Activity>,
  payRateTypeByActivityId: Map<Guid, TimesheetEntry['payRateType']>,
  tabValues: unknown[][],
  weeks: WeekManifest[],
  holidays: Holiday[],
): TimesheetEntry[] => {
  const entries: TimesheetEntry[] = [];

  for (const weekManifest of weeks) {
    for (const activityRow of weekManifest.activityRows) {
      const activity = activityMap.get(activityRow.activityId);
      const payRateType = payRateTypeByActivityId.get(activityRow.activityId);
      if (!activity || !payRateType) continue;

      for (const dateEntry of weekManifest.dates) {
        const cellValue = tabValues[activityRow.row - 1]?.[dateEntry.column - 1];
        const hours = cellValue !== undefined && cellValue !== '' ? Number(cellValue) : 0;
        if (hours === 0) continue;

        const isHoliday = getHolidayName(new Date(dateEntry.date), holidays) !== null;

        entries.push({
          employeeId: employee.employeeId,
          employeeName,
          activityId: activity.activityId,
          activityName: activity.activityName,
          payrollCategory: activity.payrollCategory,
          payRateType,
          date: dateEntry.date,
          isHoliday,
          hours,
        });
      }
    }
  }

  return entries;
};

export default readTotalHoursEntries;
