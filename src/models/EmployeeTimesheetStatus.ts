import Guid from './Guid.js';

interface EmployeeTimesheetStatus {
  employeeId: Guid;
  employeeName: string;
  timesheetFileId: string;
  timesheetFileLink: string;
  totalHours: number | null;
  employeeSigned: boolean;
  supervisorSigned: boolean;
}

export default EmployeeTimesheetStatus;
