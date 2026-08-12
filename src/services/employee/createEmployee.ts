import appendEmployee from '#db/employee/appendEmployee.js';
import appendEmployeeActivityRate from '#db/employeeActivityRate/appendEmployeeActivityRate.js';
import getClientById from '#services/client/getClientById.js';
import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import createOAuthWorkbook from '#db/adapter/createOAuthWorkbook.js';
import workbookExists from '#db/adapter/workbookExists.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import Employee from '#models/Employee.js';
import EmployeeCreateRequest from '#models/EmployeeCreateRequest.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import { TimesheetFolderStatus } from '#models/TimesheetFolderStatus.js';
import parseDriveLink from '#utils/parseDriveLink.js';
import { logger } from '#utils/logger.js';
import { NotFoundError, UnprocessableError } from '#utils/errors.js';

// Assigns a new UUID and appends an employee to the client's PayrollConfig. Existing timesheets are
// accepted as pasted file links, parsed/verified, and stored as TimesheetFileId; otherwise an Active
// TimesheetFolder is used to provision a new timesheet workbook. Each of the request's activityRates is
// then appended as its own row to the EmployeeActivityRates bridge tab.
const createEmployee = async (
  clientId: string,
  request: EmployeeCreateRequest,
): Promise<void> => {
  logger.info(`createEmployee clientId=${clientId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  if (request.timesheetFileLink && request.timesheetFolderId) {
    throw new UnprocessableError('Provide either timesheetFileLink or timesheetFolderId, not both');
  }
  if (!request.timesheetFileLink && !request.timesheetFolderId) {
    throw new UnprocessableError('Either timesheetFileLink or timesheetFolderId is required');
  }

  if (request.status === EmployeeStatus.Active && request.activityRates.length === 0) {
    throw new UnprocessableError(
      `Active employee must have at least one activity: ${request.firstName} ${request.lastName}`,
    );
  }

  const payrollConfig = await readPayrollConfig(client.payrollConfigFileId);

  const activityIds = new Set<string>();
  for (const activityRate of request.activityRates) {
    if (activityIds.has(activityRate.activityId)) {
      throw new UnprocessableError(`Duplicate activityId in activityRates: ${activityRate.activityId}`);
    }
    activityIds.add(activityRate.activityId);
    if (!payrollConfig.activities.some((activity) => activity.activityId === activityRate.activityId)) {
      throw new NotFoundError(`Activity not found: ${activityRate.activityId}`);
    }
  }

  let timesheetFileId: string;
  if (request.timesheetFileLink) {
    timesheetFileId = parseDriveLink(request.timesheetFileLink);
    const exists = await workbookExists(timesheetFileId);
    if (!exists) throw new NotFoundError(`Workbook not found or inaccessible: ${request.timesheetFileLink}`);
  } else {
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
    salaryAmount: request.salaryAmount,
    activityRates: [],
    email: request.email,
    status: request.status,
    timesheetFileId,
  };

  await appendEmployee(client.payrollConfigFileId, newEmployee);

  for (const activityRate of request.activityRates) {
    const activity = payrollConfig.activities.find((candidate) => candidate.activityId === activityRate.activityId)!;
    await appendEmployeeActivityRate(client.payrollConfigFileId, {
      id: crypto.randomUUID(),
      employeeId: newEmployee.employeeId,
      employeeName: `${newEmployee.firstName} ${newEmployee.lastName}`,
      activityId: activityRate.activityId,
      activityName: activity.activityName,
      payRateType: activityRate.payRateType,
      payRate: activityRate.payRate,
      holidayPayRate: activityRate.holidayPayRate,
    });
  }

  payrollConfigCache.delete(client.payrollConfigFileId);
};

export default createEmployee;
