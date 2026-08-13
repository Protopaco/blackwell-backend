import Activity from '#models/Activity.js';
import Employee from '#models/Employee.js';
import Guid from '#models/Guid.js';
import Holiday from '#models/Holiday.js';
import TimesheetEntry from '#models/TimesheetEntry.js';
import { ClockInOutWeekManifest } from '#models/TimesheetManifest.js';
import { getHolidayName } from '#utils/dateUtils.js';
import readClockInOutSlotRows from './readClockInOutSlotRows.js';
import readClockInOutFlatRateRows from './readClockInOutFlatRateRows.js';

// Reads every TimesheetEntry out of a ClockInOut-shaped timesheet: walks each week's days, reading that
// day's Hourly slot rows and Flat Rate rows into one combined list — called by readTimesheetEntries when
// manifest.clockInOutWeeks is populated.
const readClockInOutEntries = (
  employee: Employee,
  employeeName: string,
  activityMap: Map<Guid, Activity>,
  payRateTypeByActivityId: Map<Guid, TimesheetEntry['payRateType']>,
  tabValues: unknown[][],
  clockInOutWeeks: ClockInOutWeekManifest[],
  holidays: Holiday[],
): TimesheetEntry[] => {
  const activityByName = new Map(
    Array.from(activityMap.values()).map((activity) => [activity.activityName, activity]),
  );

  const entries: TimesheetEntry[] = [];

  for (const week of clockInOutWeeks) {
    for (const day of week.days) {
      const isHoliday = getHolidayName(new Date(day.date), holidays) !== null;

      entries.push(
        ...readClockInOutSlotRows(
          employee,
          employeeName,
          activityByName,
          payRateTypeByActivityId,
          tabValues,
          week.labelColumnIndex,
          day.slotRows,
          day.date,
          isHoliday,
        ),
        ...readClockInOutFlatRateRows(
          employee,
          employeeName,
          activityMap,
          payRateTypeByActivityId,
          tabValues,
          week.labelColumnIndex,
          day.flatRateRows,
          day.date,
          isHoliday,
        ),
      );
    }
  }

  return entries;
};

export default readClockInOutEntries;
