import Guid from "./Guid.js";
import { EmployeeStatusType } from "./EmployeeStatus.js";

interface Employee {
  employeeId: Guid;
  firstName: string;
  lastName: string;
  position: string;
  hourlyPayRate1: number;
  hourlyPayRate2: number;
  holidayPayRate: number;
  email: string;
  status: EmployeeStatusType;
  timesheetFileLink: string;
  timesheetFileId: string;
}

export default Employee;
