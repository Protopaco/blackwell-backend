import { EmployeeStatusType } from '#models/EmployeeStatus.js';
import EmployeeActivityRateInput from '#models/EmployeeActivityRateInput.js';

// Exactly one of timesheetFileLink (an existing Google Sheets/Drive file URL) or timesheetFolderId
// (creates a new file inside that client's configured, Active TimesheetFolder) must be provided.
interface EmployeeCreateRequest {
  firstName: string;
  lastName: string;
  position: string;
  salaryAmount: number;
  activityRates: EmployeeActivityRateInput[];
  email: string;
  status: EmployeeStatusType;
  timesheetFileLink?: string;
  timesheetFolderId?: string;
}

export default EmployeeCreateRequest;
