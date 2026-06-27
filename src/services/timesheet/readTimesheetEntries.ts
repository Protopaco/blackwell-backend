import readTabValues from '#db/adapter/readTabValues.js';
import readManifest from '#db/manifest/readManifest.js';
import Activity from '#models/Activity.js';
import Employee from '#models/Employee.js';
import Guid from '#models/Guid.js';
import Holiday from '#models/Holiday.js';
import TimesheetEntry from '#models/TimesheetEntry.js';
import { getHolidayName } from '#utils/dateUtils.js';
import { logger } from '#utils/logger.js';

// Reads raw daily time entries from one employee's timesheet tab using the manifest for row/column coordinates.
// Returns one entry per activity per day where hours > 0 — skips empty cells.
// Called once per Complete employee by generatePayrollReport.
const readTimesheetEntries = async (
  employee: Employee,
  tabName: string,
  activityMap: Map<Guid, Activity>,
  holidays: Holiday[],
): Promise<TimesheetEntry[]> => {
  logger.debug(`readTimesheetEntries employee=${employee.employeeId} tab=${tabName}`);

  const manifest = await readManifest(employee.timesheetFileId, tabName);
  if (!manifest) return [];

  const tabValues = await readTabValues(employee.timesheetFileId, tabName);
  const entries: TimesheetEntry[] = [];

  for (const weekManifest of manifest.weeks) {
    const allActivityRows = [...weekManifest.activityRows, ...weekManifest.flatRateRows];

    for (const activityRow of allActivityRows) {
      const activity = activityMap.get(activityRow.activityId);
      if (!activity) continue;

      for (const dateEntry of weekManifest.dates) {
        const cellValue = tabValues[activityRow.row - 1]?.[dateEntry.column - 1];
        const hours = cellValue !== undefined && cellValue !== '' ? Number(cellValue) : 0;
        if (hours === 0) continue;

        const isHoliday = getHolidayName(new Date(dateEntry.date), holidays) !== null;

        entries.push({
          employeeId: employee.employeeId,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          activityId: activity.activityId,
          activityName: activity.activityName,
          payrollCategory: activity.payrollCategory,
          payRate: activity.payRate,
          date: dateEntry.date,
          isHoliday,
          hours,
        });
      }
    }
  }

  logger.debug(`readTimesheetEntries found ${entries.length} entries for ${employee.firstName} ${employee.lastName}`);
  return entries;
};

export default readTimesheetEntries;
