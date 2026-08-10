import Guid from '#models/Guid.js';
import { PayrollCategoryType } from './PayrollCategory.js';
import { EmployeeActivityPayRateTypeType } from './EmployeeActivityPayRateType.js';

interface TimesheetEntry {
  employeeId: Guid;
  employeeName: string;
  activityId: Guid;
  activityName: string;
  payrollCategory: PayrollCategoryType;
  payRateType: EmployeeActivityPayRateTypeType;
  date: string;
  isHoliday: boolean;
  hours: number;
}

export default TimesheetEntry;
