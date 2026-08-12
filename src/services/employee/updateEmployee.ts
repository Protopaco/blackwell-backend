import writeEmployees from '#db/employee/writeEmployees.js';
import getClientById from '#services/client/getClientById.js';
import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import reconcileEmployeeActivityRates from '#services/employee/reconcileEmployeeActivityRates.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import Employee from '#models/Employee.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import { logger } from '#utils/logger.js';
import { NotFoundError, UnprocessableError } from '#utils/errors.js';

// Overwrites an employee record in the client's PayrollConfig and reconciles its activityRates against
// the EmployeeActivityRates bridge tab.
const updateEmployee = async (clientId: string, updatedEmployee: Employee): Promise<void> => {
  logger.info(`updateEmployee clientId=${clientId} employeeId=${updatedEmployee.employeeId}`);

  if (updatedEmployee.status === EmployeeStatus.Active && updatedEmployee.activityRates.length === 0) {
    throw new UnprocessableError(
      `Active employee must have at least one activity: ${updatedEmployee.firstName} ${updatedEmployee.lastName}`,
    );
  }

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const payrollConfig = await readPayrollConfig(client.payrollConfigFileId);

  await reconcileEmployeeActivityRates(
    client.payrollConfigFileId,
    updatedEmployee,
    updatedEmployee.activityRates,
    payrollConfig.activities,
  );

  await writeEmployees(client.payrollConfigFileId, updatedEmployee);
  payrollConfigCache.delete(client.payrollConfigFileId);
};

export default updateEmployee;
