import readEmployees from '#db/employee/readEmployees.js';
import getClientById from '#services/client/getClientById.js';
import Employee from '#models/Employee.js';
import { logger } from '#utils/logger.js';

// Resolves the client's payrollConfigFileId and returns all employees read fresh from the sheet.
const getEmployees = async (clientId: string): Promise<Employee[]> => {
  logger.info(`getEmployees clientId=${clientId}`);
  const client = await getClientById(clientId);
  if (!client) return [];

  return readEmployees(client.payrollConfigFileId);
};

export default getEmployees;
