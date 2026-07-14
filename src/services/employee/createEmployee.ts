import appendEmployee from '#db/employee/appendEmployee.js';
import getClientById from '#services/client/getClientById.js';
import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import createOAuthWorkbook from '#db/adapter/createOAuthWorkbook.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import Employee from '#models/Employee.js';
import EmployeeCreateRequest from '#models/EmployeeCreateRequest.js';
import { TimesheetFolderStatus } from '#models/TimesheetFolderStatus.js';
import { logger } from '#utils/logger.js';
import { NotFoundError, UnprocessableError } from '#utils/errors.js';

// Assigns a new UUID and appends an employee to the client's PayrollConfig. If timesheetFileId isn't
// supplied, timesheetFolderId must be — looked up against this client's configured TimesheetFolders
// (must exist and be Active) and used to provision a new timesheet workbook there.
const createEmployee = async (
  clientId: string,
  request: EmployeeCreateRequest,
): Promise<void> => {
  logger.info(`createEmployee clientId=${clientId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  let timesheetFileId = request.timesheetFileId;
  if (!timesheetFileId) {
    if (!request.timesheetFolderId) {
      throw new UnprocessableError('Either timesheetFileId or timesheetFolderId is required');
    }

    const payrollConfig = await readPayrollConfig(client.payrollConfigFileId);
    const timesheetFolder = payrollConfig.timesheetFolders.find(
      (folder) => folder.timesheetFolderId === request.timesheetFolderId,
    );
    if (!timesheetFolder || timesheetFolder.status !== TimesheetFolderStatus.Active) {
      throw new NotFoundError(`Active timesheet folder not found: ${request.timesheetFolderId}`);
    }

    timesheetFileId = await createOAuthWorkbook(
      `${request.firstName} ${request.lastName} Timesheets`,
      timesheetFolder.driveFolderId,
    );
    logger.info(`createEmployee: provisioned timesheet file ${timesheetFileId}`);
  }

  const newEmployee: Employee = {
    employeeId: crypto.randomUUID(),
    firstName: request.firstName,
    lastName: request.lastName,
    position: request.position,
    hourlyPayRate1: request.hourlyPayRate1,
    hourlyPayRate2: request.hourlyPayRate2,
    holidayPayRate: request.holidayPayRate,
    email: request.email,
    status: request.status,
    timesheetFileId,
  };

  await appendEmployee(client.payrollConfigFileId, newEmployee);
  payrollConfigCache.delete(client.payrollConfigFileId);
};

export default createEmployee;
