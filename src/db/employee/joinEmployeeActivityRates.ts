import Employee from '#models/Employee.js';
import EmployeeActivityRate from '#models/EmployeeActivityRate.js';

// Embeds each employee's EmployeeActivityRates bridge rows into its activityRates field, matched by
// employeeId — called by readPayrollConfig once both tabs are read, so every employee read path gets it for free.
const joinEmployeeActivityRates = (employees: Employee[], employeeActivityRates: EmployeeActivityRate[]): Employee[] => {
  const activityRatesByEmployeeId = new Map<string, EmployeeActivityRate[]>();
  employeeActivityRates.forEach((employeeActivityRate) => {
    const existingRates = activityRatesByEmployeeId.get(employeeActivityRate.employeeId) ?? [];
    existingRates.push(employeeActivityRate);
    activityRatesByEmployeeId.set(employeeActivityRate.employeeId, existingRates);
  });

  return employees.map((employee) => ({
    ...employee,
    activityRates: (activityRatesByEmployeeId.get(employee.employeeId) ?? []).map((employeeActivityRate) => ({
      id: employeeActivityRate.id,
      activityId: employeeActivityRate.activityId,
      payRateType: employeeActivityRate.payRateType,
      payRate: employeeActivityRate.payRate,
      holidayPayRate: employeeActivityRate.holidayPayRate,
    })),
  }));
};

export default joinEmployeeActivityRates;
