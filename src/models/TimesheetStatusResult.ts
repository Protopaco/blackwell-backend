import Guid from './Guid.js';
import { TimesheetStatusType } from './TimesheetStatus.js';

interface TimesheetStatusResult {
  employeeId: Guid;
  employeeName: string;
  timesheetFileId: string;
  status: TimesheetStatusType;
}

export default TimesheetStatusResult;
