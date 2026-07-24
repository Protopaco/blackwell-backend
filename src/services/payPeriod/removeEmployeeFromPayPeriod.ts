import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import readEmployeeById from '#db/employee/readEmployeeById.js';
import writeEmployees from '#db/employee/writeEmployees.js';
import tabExists from '#db/adapter/tabExists.js';
import payPeriodConfigSnapshotCache from '#utils/caches/payPeriodConfigSnapshotCache.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import Guid from '#models/Guid.js';
import { logger } from '#utils/logger.js';
import { NotFoundError, UnprocessableError } from '#utils/errors.js';

// Soft-removes an employee from a pay period's snapshot (flips their snapshot row to Inactive — no hard
// delete, matching the codebase's Employee convention). Blocked once a timesheet has been generated for
// that employee this pay period; use the includeInPayroll checkbox on their timesheet instead.
const removeEmployeeFromPayPeriod = async (
  clientId: Guid,
  payPeriodId: Guid,
  employeeId: Guid,
): Promise<void> => {
  logger.info(`removeEmployeeFromPayPeriod clientId=${clientId} payPeriodId=${payPeriodId} employeeId=${employeeId}`);

  const payPeriod = await getPayPeriodById(clientId, payPeriodId);

  const snapshotEmployee = await readEmployeeById(payPeriod.payrollReportFileId, employeeId);
  if (!snapshotEmployee || snapshotEmployee.status !== EmployeeStatus.Active) {
    throw new NotFoundError(`Employee not found on this pay period: ${employeeId}`);
  }

  const timesheetGenerated = await tabExists(snapshotEmployee.timesheetFileId, payPeriod.payPeriodName);
  if (timesheetGenerated) {
    throw new UnprocessableError(
      `Cannot remove ${snapshotEmployee.firstName} ${snapshotEmployee.lastName} — a timesheet has already been generated for this pay period. Use the includeInPayroll checkbox on their timesheet instead.`,
    );
  }

  await writeEmployees(payPeriod.payrollReportFileId, { ...snapshotEmployee, status: EmployeeStatus.Inactive });

  payPeriodConfigSnapshotCache.delete(payPeriod.payrollReportFileId);
};

export default removeEmployeeFromPayPeriod;
