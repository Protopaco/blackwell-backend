import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import getClientById from '#services/client/getClientById.js';
import Employee from '#models/Employee.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Resolves the client's payrollConfigFileId and returns all employees via the cached PayrollConfig bundle.
const getEmployees = async (clientId: string): Promise<Employee[]> => {
  logger.info(`getEmployees clientId=${clientId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const payrollConfig = await readPayrollConfig(client.payrollConfigFileId);
  return payrollConfig.employees;
};

export default getEmployees;
