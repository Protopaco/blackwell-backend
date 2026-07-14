import { EmployeeStatusType } from '#models/EmployeeStatus.js';

// Exactly one of timesheetFileId (an existing file, used as-is) or timesheetFolderId (creates a new
// file inside that client's configured, Active TimesheetFolder) must be provided.
interface EmployeeCreateRequest {
  firstName: string;
  lastName: string;
  position: string;
  hourlyPayRate1: number;
  hourlyPayRate2: number;
  holidayPayRate: number;
  email: string;
  status: EmployeeStatusType;
  timesheetFileId?: string;
  timesheetFolderId?: string;
}

export default EmployeeCreateRequest;
