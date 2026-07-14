import resolveFolder from '#services/client/resolveFolder.js';
import parseDriveLink from '#utils/parseDriveLink.js';
import driveChildExists from '#db/adapter/driveChildExists.js';
import createOAuthWorkbook from '#db/adapter/createOAuthWorkbook.js';
import createTabIfNotExists from '#db/adapter/createTabIfNotExists.js';
import writeHeaderRow from '#db/adapter/writeHeaderRow.js';
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
  PAYROLL_CONFIG_FILE_LABEL,
  PAY_PERIOD_REGISTRY_FILE_LABEL,
  EMPLOYEES_TAB,
  EMPLOYEES_HEADERS,
  SUPERVISORS_TAB,
  SUPERVISORS_HEADERS,
  FUNDING_SOURCES_TAB,
  FUNDING_SOURCES_HEADERS,
  ACTIVITIES_TAB,
  ACTIVITIES_HEADERS,
  SETTINGS_TAB,
  HOLIDAYS_TAB,
  HOLIDAYS_HEADERS,
  TIMESHEET_FOLDERS_TAB,
  TIMESHEET_FOLDERS_HEADERS,
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
  TIMESHEET_FOLDERS_TAB,
];

const PAYROLL_CONFIG_HEADER_ROWS = [
  { tabName: EMPLOYEES_TAB, headers: EMPLOYEES_HEADERS },
  { tabName: SUPERVISORS_TAB, headers: SUPERVISORS_HEADERS },
  { tabName: FUNDING_SOURCES_TAB, headers: FUNDING_SOURCES_HEADERS },
  { tabName: ACTIVITIES_TAB, headers: ACTIVITIES_HEADERS },
  { tabName: HOLIDAYS_TAB, headers: HOLIDAYS_HEADERS },
  { tabName: TIMESHEET_FOLDERS_TAB, headers: TIMESHEET_FOLDERS_HEADERS },
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

  const payrollConfigFileName = `${request.clientCode} ${PAYROLL_CONFIG_FILE_LABEL}`;
  const configFileCollision = await driveChildExists(payrollConfigFolderId, payrollConfigFileName);
  if (configFileCollision) {
    throw new UnprocessableError(
      `A file named "${payrollConfigFileName}" already exists in the Payroll Config folder`,
    );
  }
  const payrollConfigFileId = await createOAuthWorkbook(
    payrollConfigFileName,
    payrollConfigFolderId,
  );

  for (const { tabName, headers } of PAYROLL_CONFIG_HEADER_ROWS) {
    await createTabIfNotExists(payrollConfigFileId, tabName);
    await writeHeaderRow(payrollConfigFileId, tabName, headers);
  }
  await writeSettings(payrollConfigFileId, request.settings);

  const payPeriodRegistryFileName = `${request.clientCode} ${PAY_PERIOD_REGISTRY_FILE_LABEL}`;
  const registryFileCollision = await driveChildExists(
    payrollConfigFolderId,
    payPeriodRegistryFileName,
  );
  if (registryFileCollision) {
    throw new UnprocessableError(
      `A file named "${payPeriodRegistryFileName}" already exists in the Payroll Config folder`,
    );
  }
  const payPeriodRegistryFileId = await createOAuthWorkbook(
    payPeriodRegistryFileName,
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
    payrollConfigFileId,
    payPeriodRegistryFileId,
  };

  await appendClient(clientConfigFileId, client);
  clientsCache.delete(clientConfigFileId);

  return client;
};

export default createClient;
