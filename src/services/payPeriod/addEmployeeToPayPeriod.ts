import getClientAndPayPeriod from '#services/payPeriod/getClientAndPayPeriod.js';
import readEmployeeById from '#db/employee/readEmployeeById.js';
import appendEmployee from '#db/employee/appendEmployee.js';
import writeEmployees from '#db/employee/writeEmployees.js';
import payPeriodConfigSnapshotCache from '#utils/caches/payPeriodConfigSnapshotCache.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import Guid from '#models/Guid.js';
import { logger } from '#utils/logger.js';
import { NotFoundError, UnprocessableError } from '#utils/errors.js';

// Copies an employee's current PayrollConfig row into a pay period's report workbook snapshot. If the
// employee was previously removed from this pay period (soft-deleted, still present as an Inactive row),
// their row is refreshed and reactivated instead of appending a duplicate.
const addEmployeeToPayPeriod = async (
  clientId: Guid,
  payPeriodId: Guid,
  employeeId: Guid,
): Promise<void> => {
  logger.info(`addEmployeeToPayPeriod clientId=${clientId} payPeriodId=${payPeriodId} employeeId=${employeeId}`);

  const { client, payPeriod } = await getClientAndPayPeriod(clientId, payPeriodId);

  const sourceEmployee = await readEmployeeById(client.payrollConfigFileId, employeeId);
  if (!sourceEmployee) throw new NotFoundError(`Employee not found: ${employeeId}`);
  if (sourceEmployee.status !== EmployeeStatus.Active) {
    throw new UnprocessableError(`Employee is not Active in PayrollConfig: ${employeeId}`);
  }

  const existingSnapshotEmployee = await readEmployeeById(payPeriod.payrollReportFileId, employeeId);
  if (existingSnapshotEmployee?.status === EmployeeStatus.Active) {
    throw new UnprocessableError(`Employee is already on this pay period: ${employeeId}`);
  }

  if (existingSnapshotEmployee) {
    await writeEmployees(payPeriod.payrollReportFileId, sourceEmployee);
  } else {
    await appendEmployee(payPeriod.payrollReportFileId, sourceEmployee);
  }

  payPeriodConfigSnapshotCache.delete(payPeriod.payrollReportFileId);
};

export default addEmployeeToPayPeriod;
