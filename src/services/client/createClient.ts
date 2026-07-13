import resolveFolder from '#services/client/resolveFolder.js';
import parseDriveLink from '#utils/parseDriveLink.js';
import driveChildExists from '#db/adapter/driveChildExists.js';
import createOAuthWorkbook from '#db/adapter/createOAuthWorkbook.js';
import createTabIfNotExists from '#db/adapter/createTabIfNotExists.js';
import writeSettings from '#db/settings/writeSettings.js';
import appendClient from '#db/client/appendClient.js';
import clientsCache from '#utils/caches/clientsCache.js';
import Client from '#models/Client.js';
import ClientCreateRequest from '#models/ClientCreateRequest.js';
import { ClientStatus } from '#models/ClientStatus.js';
import {
  EMPLOYEE_PAYROLL_FOLDER_NAME,
  PAYROLL_CONFIG_FOLDER_NAME,
  PAYROLL_REPORT_FOLDER_NAME,
  PAYROLL_CONFIG_FILE_NAME,
  PAY_PERIOD_REGISTRY_FILE_NAME,
  EMPLOYEES_TAB,
  SUPERVISORS_TAB,
  FUNDING_SOURCES_TAB,
  ACTIVITIES_TAB,
  SETTINGS_TAB,
  HOLIDAYS_TAB,
} from '#config/constants.js';
import { logger } from '#utils/logger.js';
import { UnprocessableError } from '#utils/errors.js';

const PAYROLL_CONFIG_TABS = [
  EMPLOYEES_TAB,
  SUPERVISORS_TAB,
  FUNDING_SOURCES_TAB,
  ACTIVITIES_TAB,
  SETTINGS_TAB,
  HOLIDAYS_TAB,
];

// Provisions a brand-new client end to end: Drive folder tree, PayrollConfig workbook (all 6 tabs,
// Settings seeded from the request), PayPeriodRegistry workbook, then appends the Clients row. No step
// here rolls back anything already created if a later step fails — see docs/TODO.md's Client CRUD
// section for why (Sheets/Drive isn't a real DB; automatic cleanup risks deleting something a human
// placed there, so failures are surfaced instead of unwound).
const createClient = async (request: ClientCreateRequest): Promise<Client> => {
  logger.info(`createClient clientCode=${request.clientCode}`);

  const clientConfigFileId = process.env.CLIENT_CONFIG_FILE_ID;
  if (!clientConfigFileId) throw new Error('CLIENT_CONFIG_FILE_ID is not set');

  let employeePayrollParentId = '';
  if (request.employeePayrollFolder.createNew) {
    if (!request.employeePayrollFolder.rootFolderLink) {
      throw new UnprocessableError(
        'rootFolderLink is required when creating a new Employee Payroll folder',
      );
    }
    employeePayrollParentId = parseDriveLink(request.employeePayrollFolder.rootFolderLink);
  }

  const employeePayrollFolderId = await resolveFolder(
    request.employeePayrollFolder,
    employeePayrollParentId,
    EMPLOYEE_PAYROLL_FOLDER_NAME,
  );

  const payrollConfigFolderId = await resolveFolder(
    request.payrollConfigFolder ?? { createNew: true },
    employeePayrollFolderId,
    PAYROLL_CONFIG_FOLDER_NAME,
  );

  const payrollReportFolderId = await resolveFolder(
    request.payrollReportFolder ?? { createNew: true },
    employeePayrollFolderId,
    PAYROLL_REPORT_FOLDER_NAME,
  );

  const configFileCollision = await driveChildExists(payrollConfigFolderId, PAYROLL_CONFIG_FILE_NAME);
  if (configFileCollision) {
    throw new UnprocessableError(
      `A file named "${PAYROLL_CONFIG_FILE_NAME}" already exists in the Payroll Config folder`,
    );
  }
  const payrollConfigFileId = await createOAuthWorkbook(PAYROLL_CONFIG_FILE_NAME, payrollConfigFolderId);

  for (const tabName of PAYROLL_CONFIG_TABS) {
    await createTabIfNotExists(payrollConfigFileId, tabName);
  }
  await writeSettings(payrollConfigFileId, request.settings);

  const registryFileCollision = await driveChildExists(
    payrollConfigFolderId,
    PAY_PERIOD_REGISTRY_FILE_NAME,
  );
  if (registryFileCollision) {
    throw new UnprocessableError(
      `A file named "${PAY_PERIOD_REGISTRY_FILE_NAME}" already exists in the Payroll Config folder`,
    );
  }
  const payPeriodRegistryFileId = await createOAuthWorkbook(
    PAY_PERIOD_REGISTRY_FILE_NAME,
    payrollConfigFolderId,
  );

  const client: Client = {
    clientId: crypto.randomUUID(),
    clientName: request.clientName,
    clientCode: request.clientCode,
    status: ClientStatus.Active,
    employeePayrollFolderId,
    payrollConfigFolderId,
    payrollReportFolderId,
    timesheetsFolderId: request.timesheetsFolderId ?? null,
    payrollConfigFileId,
    payPeriodRegistryFileId,
  };

  await appendClient(clientConfigFileId, client);
  clientsCache.delete(clientConfigFileId);

  return client;
};

export default createClient;
