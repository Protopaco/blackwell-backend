import Guid from './Guid.js';
import { EmployeeStatusType } from './EmployeeStatus.js';

interface Employee {
  employeeId: Guid;
  firstName: string;
  lastName: string;
  position: string;
  basePayRate: number;        // display only — never used in calculations
  secondaryPayRate: number;   // display only — never used in calculations
  holidayPayRate: number;     // display only — never used in calculations
  email: string;
  status: EmployeeStatusType;
  timesheetFileLink: string;
  timesheetFileId: string;
}

export default Employee;
