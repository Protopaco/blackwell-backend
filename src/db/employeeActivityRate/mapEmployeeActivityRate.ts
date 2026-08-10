import EmployeeActivityRate from '#models/EmployeeActivityRate.js';
import { EmployeeActivityPayRateTypeType } from '#models/EmployeeActivityPayRateType.js';

// Converts a raw EmployeeActivityRates sheet row into an EmployeeActivityRate model — called by readEmployeeActivityRates and readPayrollConfig.
const mapEmployeeActivityRate = (row: Record<string, unknown>): EmployeeActivityRate => ({
  id: row['Id'] as string,
  employeeId: row['EmployeeId'] as string,
  employeeName: row['EmployeeName'] as string,
  activityId: row['ActivityId'] as string,
  activityName: row['ActivityName'] as string,
  payRateType: row['PayRateType'] as EmployeeActivityPayRateTypeType,
  payRate: Number(row['PayRate']) || 0,
  holidayPayRate: Number(row['HolidayPayRate']) || 0,
});

export default mapEmployeeActivityRate;
