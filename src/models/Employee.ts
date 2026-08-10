import Guid from '#models/Guid.js';
import { EmployeeStatusType } from "./EmployeeStatus.js";
import EmployeeActivityRateInput from './EmployeeActivityRateInput.js';

interface Employee {
  employeeId: Guid;
  firstName: string;
  lastName: string;
  position: string;
  salaryAmount: number;
  activityRates: EmployeeActivityRateInput[];
  email: string;
  status: EmployeeStatusType;
  timesheetFileId: string;
}

export default Employee;
