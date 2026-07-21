import Guid from '#models/Guid.js';
import { TimesheetStatusType } from '#models/TimesheetStatus.js';

interface EmployeeTimesheetStatus {
  employeeId: Guid;
  employeeName: string;
  timesheetFileId: string;
  totalHours: number | null;
  flatRateQuantity: number | null;
  employeeSigned: boolean;
  supervisorSigned: boolean;
  includeInPayroll: boolean;
  status: TimesheetStatusType;
}

export default EmployeeTimesheetStatus;
