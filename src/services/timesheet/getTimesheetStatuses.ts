import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import getEmployees from '#services/employee/getEmployees.js';
import readTimesheetDetail from '#services/timesheet/readTimesheetDetail.js';
import deriveTimesheetStatus from '#services/timesheet/deriveTimesheetStatus.js';
import readCurrentHoursTab from '#db/payrollReport/readCurrentHoursTab.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import EmployeeTimesheetStatus from '#models/EmployeeTimesheetStatus.js';
import { logger } from '#utils/logger.js';

// Returns a status entry for every active employee showing hours entered, signature state, and a derived
// five-state TimesheetStatus (NotGenerated/Generated/Submitted/Approved/Complete).
const getTimesheetStatuses = async (
  clientId: string,
  payPeriodId: string,
): Promise<EmployeeTimesheetStatus[]> => {
  logger.info(`getTimesheetStatuses clientId=${clientId} payPeriodId=${payPeriodId}`);

  const payPeriod = await getPayPeriodById(clientId, payPeriodId);

  const employees = await getEmployees(clientId);
  const activeEmployees = employees.filter((employee) => employee.status === EmployeeStatus.Active);

  const currentHoursRows = payPeriod.payrollReportFileId
    ? await readCurrentHoursTab(payPeriod.payrollReportFileId)
    : [];
  const employeeIdsInCurrentHours = new Set((currentHoursRows ?? []).map((row) => row.EmployeeId));

  return Promise.all(
    activeEmployees.map(async (employee) => {
      const detail = await readTimesheetDetail(employee.timesheetFileId, payPeriod.payPeriodName);
      const status = deriveTimesheetStatus({
        totalHours: detail.totalHours,
        employeeSigned: detail.employeeSigned,
        supervisorSigned: detail.supervisorSigned,
        includedInCurrentHours: employeeIdsInCurrentHours.has(employee.employeeId),
      });
      return {
        employeeId: employee.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        timesheetFileId: employee.timesheetFileId,
        totalHours: detail.totalHours,
        flatRateQuantity: detail.flatRateQuantity,
        employeeSigned: detail.employeeSigned,
        supervisorSigned: detail.supervisorSigned,
        status,
      };
    }),
  );
};

export default getTimesheetStatuses;
