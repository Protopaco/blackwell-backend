import Guid from '#models/Guid.js';
import { TimesheetStatusType } from '#models/TimesheetStatus.js';

interface EmployeeTimesheetStatus {
  employeeId: Guid;
  employeeName: string;
  timesheetFileId: string;
  timesheetFileLink: string;
  totalHours: number | null;
  employeeSigned: boolean;
  supervisorSigned: boolean;
  status: TimesheetStatusType;
}

export default EmployeeTimesheetStatus;
