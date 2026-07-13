import appendEmployee from '#db/employee/appendEmployee.js';
import getClientById from '#services/client/getClientById.js';
import createOAuthWorkbook from '#db/adapter/createOAuthWorkbook.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import Employee from '#models/Employee.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Assigns a new UUID and appends an employee to the client's PayrollConfig. If timesheetFileId isn't
// supplied, provisions a new timesheet workbook for the employee (same pattern as generateTimesheets.ts's
// lazy-creation fallback).
const createEmployee = async (
  clientId: string,
  employee: Omit<Employee, 'employeeId'>,
): Promise<void> => {
  logger.info(`createEmployee clientId=${clientId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  let timesheetFileId = employee.timesheetFileId;
  if (!timesheetFileId) {
    timesheetFileId = await createOAuthWorkbook(
      `${employee.firstName} ${employee.lastName} Timesheets`,
      client.timesheetsFolderId,
    );
    logger.info(`createEmployee: provisioned timesheet file ${timesheetFileId}`);
  }

  const newEmployee: Employee = {
    ...employee,
    employeeId: crypto.randomUUID(),
    timesheetFileId,
  };

  await appendEmployee(client.payrollConfigFileId, newEmployee);
  payrollConfigCache.delete(client.payrollConfigFileId);
};

export default createEmployee;
