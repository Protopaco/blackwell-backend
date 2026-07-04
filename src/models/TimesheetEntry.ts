import Guid from '#models/Guid.js';
import { PayrollCategoryType } from './PayrollCategory.js';
import { PayRateType } from './PayRate.js';

interface TimesheetEntry {
  employeeId: Guid;
  employeeName: string;
  activityId: Guid;
  activityName: string;
  payrollCategory: PayrollCategoryType;
  payRate: PayRateType;
  date: string;
  isHoliday: boolean;
  hours: number;
}

export default TimesheetEntry;
