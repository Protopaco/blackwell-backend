import EmployeeActivityRate from '#models/EmployeeActivityRate.js';

// Maps an EmployeeActivityRate back to a sheet-row object keyed by EMPLOYEE_ACTIVITY_RATES_HEADERS — the write-side inverse of mapEmployeeActivityRate.ts.
const mapEmployeeActivityRateRow = (employeeActivityRate: EmployeeActivityRate): Record<string, unknown> => ({
  Id: employeeActivityRate.id,
  EmployeeId: employeeActivityRate.employeeId,
  EmployeeName: employeeActivityRate.employeeName,
  ActivityId: employeeActivityRate.activityId,
  ActivityName: employeeActivityRate.activityName,
  PayRateType: employeeActivityRate.payRateType,
  PayRate: employeeActivityRate.payRate,
  HolidayPayRate: employeeActivityRate.holidayPayRate,
});

export default mapEmployeeActivityRateRow;
