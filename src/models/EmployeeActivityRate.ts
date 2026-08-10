import Guid from '#models/Guid.js';
import { EmployeeActivityPayRateTypeType } from './EmployeeActivityPayRateType.js';

interface EmployeeActivityRate {
  id: Guid;
  employeeId: Guid;
  employeeName: string;
  activityId: Guid;
  activityName: string;
  payRateType: EmployeeActivityPayRateTypeType;
  payRate: number;
  holidayPayRate: number;
}

export default EmployeeActivityRate;
