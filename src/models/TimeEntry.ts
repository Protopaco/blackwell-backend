import Guid from '#models/Guid.js';

interface TimeEntry {
  timeEntryId: Guid;
  employeeId: Guid;
  payPeriodId: Guid;
  activityId: Guid;
  date: string;
  hours?: number;
  clockIn?: string;
  clockOut?: string;
  // A TimeEntry must have either hours OR both clockIn and clockOut — never neither.
  // TotalHours timesheets: hours is set.
  // ClockInOut timesheets: clockIn and clockOut are set, hours is also calculated and stored.
  // Clock in/out values will need to be persisted to the database in a future phase.
}

export default TimeEntry;
