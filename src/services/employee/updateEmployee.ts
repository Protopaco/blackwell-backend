import writeEmployees from '#db/employee/writeEmployees.js';
import getClientById from '#services/client/getClientById.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import Employee from '#models/Employee.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Overwrites an employee record in the client's PayrollConfig.
const updateEmployee = async (clientId: string, updatedEmployee: Employee): Promise<void> => {
  logger.info(`updateEmployee clientId=${clientId} employeeId=${updatedEmployee.employeeId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  await writeEmployees(client.payrollConfigFileId, updatedEmployee);
  payrollConfigCache.delete(client.payrollConfigFileId);
};

export default updateEmployee;
