import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import getEmployees from '#services/employee/getEmployees.js';
import checkTimesheetStatus from '#services/timesheet/checkTimesheetStatus.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import TimesheetStatusResult from '#models/TimesheetStatusResult.js';
import { logger } from '#utils/logger.js';

// Returns a status entry for every active employee showing whether their timesheet is generated,
// submitted, approved, or complete — called by the GET /timesheet/status route.
const getTimesheetStatuses = async (
  clientId: string,
  payPeriodId: string,
): Promise<TimesheetStatusResult[] | null> => {
  logger.info(`getTimesheetStatuses clientId=${clientId} payPeriodId=${payPeriodId}`);

  const payPeriod = await getPayPeriodById(clientId, payPeriodId);
  if (!payPeriod) return null;

  const employees = await getEmployees(clientId);
  const activeEmployees = employees.filter((e) => e.status === EmployeeStatus.Active);

  return Promise.all(
    activeEmployees.map(async (employee) => {
      const status = await checkTimesheetStatus(
        employee.timesheetFileId,
        payPeriod.payPeriodName,
      );
      return {
        employeeId: employee.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        timesheetFileId: employee.timesheetFileId,
        status,
      };
    }),
  );
};

export default getTimesheetStatuses;
