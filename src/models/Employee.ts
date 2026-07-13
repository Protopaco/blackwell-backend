import Guid from '#models/Guid.js';
import { EmployeeStatusType } from "./EmployeeStatus.js";

interface Employee {
  employeeId: Guid;
  firstName: string;
  lastName: string;
  position: string;
  hourlyPayRate1: number;
  hourlyPayRate2: number;
  flatPayRate1: number;
  flatPayRate2: number;
  holidayPayRate: number;
  email: string;
  status: EmployeeStatusType;
  timesheetFileId: string;
}

export default Employee;
