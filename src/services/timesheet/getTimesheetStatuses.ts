import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import getEmployees from '#services/employee/getEmployees.js';
import readTimesheetDetail from '#services/timesheet/readTimesheetDetail.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import EmployeeTimesheetStatus from '#models/EmployeeTimesheetStatus.js';
import { logger } from '#utils/logger.js';

// Returns a status entry for every active employee showing hours entered and whether each signature cell is filled.
const getTimesheetStatuses = async (
  clientId: string,
  payPeriodId: string,
): Promise<EmployeeTimesheetStatus[]> => {
  logger.info(`getTimesheetStatuses clientId=${clientId} payPeriodId=${payPeriodId}`);

  const payPeriod = await getPayPeriodById(clientId, payPeriodId);

  const employees = await getEmployees(clientId);
  const activeEmployees = employees.filter((employee) => employee.status === EmployeeStatus.Active);

  return Promise.all(
    activeEmployees.map(async (employee) => {
      const detail = await readTimesheetDetail(employee.timesheetFileId, payPeriod.payPeriodName);
      return {
        employeeId: employee.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        timesheetFileId: employee.timesheetFileId,
        timesheetFileLink: employee.timesheetFileLink,
        totalHours: detail.totalHours,
        employeeSigned: detail.employeeSigned,
        supervisorSigned: detail.supervisorSigned,
      };
    }),
  );
};

export default getTimesheetStatuses;
