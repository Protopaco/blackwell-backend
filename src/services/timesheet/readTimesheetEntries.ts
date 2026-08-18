import readTabValues from '#db/adapter/readTabValues.js';
import readManifest from '#db/manifest/readManifest.js';
import Activity from '#models/Activity.js';
import Employee from '#models/Employee.js';
import Guid from '#models/Guid.js';
import Holiday from '#models/Holiday.js';
import TimesheetEntry from '#models/TimesheetEntry.js';
import { logger } from '#utils/logger.js';
import readClockInOutEntries from './readClockInOutEntries.js';
import readTotalHoursEntries from './readTotalHoursEntries.js';

// Reads raw daily time entries from one employee's timesheet tab using the manifest for row/column
// coordinates. Branches on whether the manifest is ClockInOut- or TotalHours-shaped (see
// TimesheetManifest.clockInOutWeeks) and delegates the actual row reading to readClockInOutEntries or
// readTotalHoursEntries respectively. Called once per Complete employee by generatePayrollReport.
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
  const employeeName = `${employee.firstName} ${employee.lastName}`;

  const payRateTypeByActivityId = new Map(
    employee.activityRates.map((activityRate) => [activityRate.activityId, activityRate.payRateType]),
  );

  const entries = manifest.clockInOutWeeks && manifest.clockInOutWeeks.length > 0
    ? readClockInOutEntries(
        employee,
        employeeName,
        activityMap,
        payRateTypeByActivityId,
        tabValues,
        manifest.clockInOutWeeks,
        holidays,
      )
    : readTotalHoursEntries(
        employee,
        employeeName,
        activityMap,
        payRateTypeByActivityId,
        tabValues,
        manifest.weeks,
        holidays,
      );

  logger.debug(`readTimesheetEntries found ${entries.length} entries for ${employeeName}`);
  return entries;
};

export default readTimesheetEntries;
