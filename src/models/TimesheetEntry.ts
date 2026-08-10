import Guid from '#models/Guid.js';
import { PayrollCategoryType } from './PayrollCategory.js';

interface TimesheetEntry {
  employeeId: Guid;
  employeeName: string;
  activityId: Guid;
  activityName: string;
  payrollCategory: PayrollCategoryType;
  date: string;
  isHoliday: boolean;
  hours: number;
}

export default TimesheetEntry;
